import { DurableObject, WorkerEntrypoint, WorkflowEntrypoint } from "cloudflare:workers";
import { ModuleRunner, ssrDynamicImportKey, ssrModuleExportsKey } from "vite/module-runner";

//#region src/shared.ts
const UNKNOWN_HOST = "http://localhost";
const INIT_PATH = "/__vite_plugin_cloudflare_init__";
const GET_EXPORT_TYPES_PATH = "/__vite_plugin_cloudflare_get_export_types__";
const WORKER_ENTRY_PATH_HEADER = "__VITE_WORKER_ENTRY_PATH__";
const IS_ENTRY_WORKER_HEADER = "__VITE_IS_ENTRY_WORKER__";
const ENVIRONMENT_NAME_HEADER = "__VITE_ENVIRONMENT_NAME__";
const IS_PARENT_ENVIRONMENT_HEADER = "__VITE_IS_PARENT_ENVIRONMENT__";
const virtualPrefix = "virtual:cloudflare/";
const VIRTUAL_WORKER_ENTRY = `${virtualPrefix}worker-entry`;
const VIRTUAL_EXPORT_TYPES = `${virtualPrefix}export-types`;

//#endregion
//#region src/workers/runner-worker/env.ts
/**
* Strips internal properties from the `env` object, returning only the user-defined properties.
* @param internalEnv - The full wrapper env, including internal properties
* @returns The user-defined env
*/
function stripInternalEnv(internalEnv) {
	const { __VITE_RUNNER_OBJECT__: __VITE_RUNNER_OBJECT__$1, __VITE_INVOKE_MODULE__, __VITE_UNSAFE_EVAL__,...userEnv } = internalEnv;
	return userEnv;
}

//#endregion
//#region src/workers/runner-worker/errors.ts
/**
* Converts an error to an object that can be be serialized and revived by Miniflare.
* Copied from `packages/wrangler/templates/middleware/middleware-miniflare3-json-error.ts`
*/
function reduceError(e) {
	const errorObj = e ?? {};
	return {
		name: errorObj.name,
		message: errorObj.message ?? String(e),
		stack: errorObj.stack,
		cause: errorObj.cause === void 0 ? void 0 : reduceError(errorObj.cause)
	};
}
/**
* Captures errors in the `fetch` handler of the default export of the entry Worker.
* These are returned as a JSON response that is revived by Miniflare.
* See comment in `/packages/wrangler/src/deployment-bundle/bundle.ts` for more info.
*/
async function maybeCaptureError(options, fn) {
	if (!options.isEntryWorker || options.exportName !== "default" || options.key !== "fetch") return fn();
	try {
		return await fn();
	} catch (error) {
		return Response.json(reduceError(error), {
			status: 500,
			headers: { "MF-Experimental-Error-Stack": "true" }
		});
	}
}

//#endregion
//#region src/workers/runner-worker/keys.ts
/** Keys that should be ignored during RPC property access */
const IGNORED_KEYS = ["self"];
/** Available methods for `WorkerEntrypoint` class */
const WORKER_ENTRYPOINT_KEYS = [
	"connect",
	"email",
	"fetch",
	"queue",
	"tail",
	"tailStream",
	"test",
	"trace",
	"scheduled"
];
/** Available methods for `DurableObject` class */
const DURABLE_OBJECT_KEYS = [
	"alarm",
	"connect",
	"fetch",
	"webSocketClose",
	"webSocketError",
	"webSocketMessage"
];
/** Available methods for `WorkflowEntrypoint` classes */
const WORKFLOW_ENTRYPOINT_KEYS = ["run"];

//#endregion
//#region src/workers/runner-worker/module-runner.ts
/** Module runner instances keyed by environment name */
const moduleRunners = /* @__PURE__ */ new Map();
/** The parent environment name (set explicitly via IS_PARENT_ENVIRONMENT_HEADER) */
let parentEnvironmentName;
let nextCallbackId = 0;
const pendingCallbacks = /* @__PURE__ */ new Map();
const callbackResults = /* @__PURE__ */ new Map();
/**
* Executes a callback in the runner Durable Object's IoContext via RPC + shared memory.
* The callback function is stored in a module-scope map (shared with the DO
* since both run in the same V8 isolate). Only a numeric ID crosses the RPC
* boundary.
*/
async function runInRunnerObject(env, callback) {
	const id = nextCallbackId++;
	pendingCallbacks.set(id, callback);
	try {
		await env.__VITE_RUNNER_OBJECT__.get("singleton").executeCallback(id);
		return callbackResults.get(id);
	} finally {
		pendingCallbacks.delete(id);
		callbackResults.delete(id);
	}
}
/**
* Durable Object that provides an IoContext for module evaluation and handles
* WebSocket communication with the Vite dev server.
*
* In workerd, a Durable Object has a single shared IoContext across all
* incoming events, so promises are freely shareable within the DO without
* cross-context issues.
*/
var __VITE_RUNNER_OBJECT__ = class extends DurableObject {
	/** Per-environment WebSockets */
	#webSockets = /* @__PURE__ */ new Map();
	/**
	* Creates a WebSocket pair for communication with the Vite dev server and initializes the ModuleRunner.
	*/
	async fetch(request) {
		const { pathname } = new URL(request.url);
		if (pathname !== INIT_PATH) throw new Error(`__VITE_RUNNER_OBJECT__ received invalid pathname: "${pathname}"`);
		const environmentName = request.headers.get(ENVIRONMENT_NAME_HEADER);
		if (!environmentName) throw new Error(`__VITE_RUNNER_OBJECT__ received request without "${ENVIRONMENT_NAME_HEADER}" header`);
		if (moduleRunners.has(environmentName)) throw new Error(`Module runner already initialized for environment: "${environmentName}"`);
		if (request.headers.get(IS_PARENT_ENVIRONMENT_HEADER) === "true") {
			parentEnvironmentName = environmentName;
			globalThis.__VITE_ENVIRONMENT_RUNNER_IMPORT__ = async (envName, id) => {
				const runner = moduleRunners.get(envName);
				if (!runner) throw new Error(`Module runner not initialized for environment: "${envName}". Do you need to set \`childEnvironments: ["${envName}"]\` in the plugin config?`);
				return runInRunnerObject(this.env, () => runner.import(id));
			};
		}
		const { 0: client, 1: server } = new WebSocketPair();
		server.accept();
		const moduleRunner = await createModuleRunner(this.env, server, environmentName);
		moduleRunners.set(environmentName, moduleRunner);
		this.#webSockets.set(environmentName, server);
		return new Response(null, {
			status: 101,
			webSocket: client
		});
	}
	/**
	* Sends data to the Vite dev server via the WebSocket for a specific environment.
	*/
	send(environmentName, data) {
		const webSocket = this.#webSockets.get(environmentName);
		if (!webSocket) throw new Error(`Module runner not initialized for environment: "${environmentName}"`);
		webSocket.send(data);
	}
	/**
	* Executes a callback stored in the module-scope `pendingCallbacks` map.
	* The callback runs in the DO's IoContext, ensuring all promises created
	* during execution belong to the DO's shared context.
	*/
	async executeCallback(id) {
		const callback = pendingCallbacks.get(id);
		if (!callback) throw new Error(`No pending callback with id ${id}`);
		const result = await callback();
		callbackResults.set(id, result);
	}
};
/**
* Creates a new module runner instance with a WebSocket transport.
* @param env - The wrapper env
* @param webSocket - WebSocket connection for communication with Vite dev server
* @param environmentName - The name of the environment this runner is for
* @returns Configured module runner instance
*/
async function createModuleRunner(env, webSocket, environmentName) {
	return new ModuleRunner({
		sourcemapInterceptor: "prepareStackTrace",
		transport: {
			connect({ onMessage }) {
				webSocket.addEventListener("message", async ({ data }) => {
					onMessage(JSON.parse(data.toString()));
				});
				onMessage({
					type: "custom",
					event: "vite:ws:connect",
					data: { webSocket }
				});
			},
			disconnect() {
				webSocket.close();
			},
			send(data) {
				env.__VITE_RUNNER_OBJECT__.get("singleton").send(environmentName, JSON.stringify(data));
			},
			async invoke(data) {
				return await (await env.__VITE_INVOKE_MODULE__.fetch(new Request(UNKNOWN_HOST, {
					method: "POST",
					headers: { [ENVIRONMENT_NAME_HEADER]: environmentName },
					body: JSON.stringify(data)
				}))).json();
			}
		},
		hmr: true
	}, {
		async runInlinedModule(context, transformed, module) {
			const originalDynamicImport = context[ssrDynamicImportKey];
			context[ssrDynamicImportKey] = (dep) => {
				return runInRunnerObject(env, () => originalDynamicImport(dep));
			};
			const code = `"use strict";async (${Object.keys(context).join(",")})=>{${transformed}\n}`;
			await env.__VITE_UNSAFE_EVAL__.eval(code, module.id)(...Object.values(context));
			Object.seal(context[ssrModuleExportsKey]);
		},
		async runExternalModule(filepath) {
			if (filepath === "cloudflare:workers") {
				const originalCloudflareWorkersModule = await import("cloudflare:workers");
				return Object.seal({
					...originalCloudflareWorkersModule,
					env: stripInternalEnv(originalCloudflareWorkersModule.env)
				});
			}
			return import(filepath);
		}
	});
}
/**
* Retrieves a specific export from a Worker entry module using the module runner.
*/
async function getWorkerEntryExport(workerEntryPath$1, exportName) {
	if (!parentEnvironmentName) throw new Error(`Parent environment not initialized`);
	const module = await globalThis.__VITE_ENVIRONMENT_RUNNER_IMPORT__(parentEnvironmentName, VIRTUAL_WORKER_ENTRY);
	const exportValue = typeof module === "object" && module !== null && exportName in module && module[exportName];
	if (!exportValue) throw new Error(`"${workerEntryPath$1}" does not define a "${exportName}" export.`);
	return exportValue;
}
/**
* Retrieves the export types of the Worker entry module.
*/
async function getWorkerEntryExportTypes() {
	if (!parentEnvironmentName) throw new Error(`Parent environment not initialized`);
	const { getExportTypes } = await globalThis.__VITE_ENVIRONMENT_RUNNER_IMPORT__(parentEnvironmentName, VIRTUAL_EXPORT_TYPES);
	return getExportTypes(await globalThis.__VITE_ENVIRONMENT_RUNNER_IMPORT__(parentEnvironmentName, VIRTUAL_WORKER_ENTRY));
}

//#endregion
//#region src/workers/runner-worker/index.ts
/** The path to the Worker entry file. We store it in the module scope so that it is easily accessible in error messages etc.. */
let workerEntryPath = "";
let isEntryWorker = false;
/**
* Creates a callable thenable that is used to access the properties of an RPC target.
* It can be both awaited and invoked as a function.
* This enables RPC properties to be used both as promises and callable functions.
* @param key - The property key name used for error messages
* @param property - The promise that resolves to the property value
* @returns A callable thenable that implements both Promise and function interfaces
*/
function getRpcPropertyCallableThenable(key, property) {
	const fn = async function(...args) {
		const maybeFn = await property;
		if (typeof maybeFn !== "function") throw new TypeError(`"${key}" is not a function.`);
		return maybeFn(...args);
	};
	fn.then = (onFulfilled, onRejected) => property.then(onFulfilled, onRejected);
	fn.catch = (onRejected) => property.catch(onRejected);
	fn.finally = (onFinally) => property.finally(onFinally);
	return fn;
}
/**
* Retrieves an RPC property from a constructor prototype, ensuring it exists on the prototype rather than the instance to maintain RPC compatibility.
* @param ctor - The constructor function (`WorkerEntrypoint` or `DurableObject`)
* @param instance - The instance to bind methods to
* @param key - The property key to retrieve
* @returns The property value from the prototype
* @throws TypeError if the property doesn't exist on the prototype
*/
function getRpcProperty(ctor, instance, key) {
	if (!Reflect.has(ctor.prototype, key)) {
		if (Reflect.has(instance, key)) throw new TypeError([
			`The RPC receiver's prototype does not implement "${key}", but the receiver instance does.`,
			"Only properties and methods defined on the prototype can be accessed over RPC.",
			`Ensure properties are declared as \`get ${key}() { ... }\` instead of \`${key} = ...\`,`,
			`and methods are declared as \`${key}() { ... }\` instead of \`${key} = () => { ... }\`.`
		].join("\n"));
		throw new TypeError(`The RPC receiver does not implement "${key}".`);
	}
	return Reflect.get(ctor.prototype, key, instance);
}
/**
* Retrieves an RPC property from a `WorkerEntrypoint` export, creating an instance and returning the bound method or property value.
* @param exportName - The name of the `WorkerEntrypoint` export
* @param key - The property key to access on the `WorkerEntrypoint` instance
* @returns The property value, with methods bound to the instance
* @throws TypeError if the export is not a `WorkerEntrypoint` subclass
*/
async function getWorkerEntrypointRpcProperty(exportName, key) {
	const ctor = await getWorkerEntryExport(workerEntryPath, exportName);
	const userEnv = stripInternalEnv(this.env);
	const expectedWorkerEntrypointMessage = `Expected "${exportName}" export of "${workerEntryPath}" to be a subclass of \`WorkerEntrypoint\` for RPC.`;
	if (typeof ctor !== "function") throw new TypeError(expectedWorkerEntrypointMessage);
	const instance = new ctor(this.ctx, userEnv);
	if (!(instance instanceof WorkerEntrypoint)) throw new TypeError(expectedWorkerEntrypointMessage);
	const value = getRpcProperty(ctor, instance, key);
	if (typeof value === "function") return value.bind(instance);
	return value;
}
/**
* Creates a proxy wrapper for `WorkerEntrypoint` classes that enables RPC functionality.
* The wrapper intercepts property access and delegates to the user code, handling both direct method calls and RPC property access.
* @param exportName - The name of the `WorkerEntrypoint` export to wrap
* @returns A `WorkerEntrypoint` constructor that acts as a proxy to the user code
*/
function createWorkerEntrypointWrapper(exportName) {
	class Wrapper extends WorkerEntrypoint {
		constructor(ctx, env) {
			super(ctx, env);
			return new Proxy(this, { get(target, key, receiver) {
				const value = Reflect.get(target, key, receiver);
				if (value !== void 0) return value;
				if (typeof key === "symbol" || IGNORED_KEYS.includes(key) || DURABLE_OBJECT_KEYS.includes(key)) return;
				return getRpcPropertyCallableThenable(key, getWorkerEntrypointRpcProperty.call(receiver, exportName, key));
			} });
		}
	}
	for (const key of WORKER_ENTRYPOINT_KEYS) Wrapper.prototype[key] = async function(arg) {
		return maybeCaptureError({
			isEntryWorker,
			exportName,
			key
		}, async () => {
			if (key === "fetch") {
				const request = arg;
				const url = new URL(request.url);
				if (url.pathname === INIT_PATH) {
					if (request.headers.get(IS_PARENT_ENVIRONMENT_HEADER) === "true") {
						const workerEntryPathHeader = request.headers.get(WORKER_ENTRY_PATH_HEADER);
						if (!workerEntryPathHeader) throw new Error(`Unexpected error: "${WORKER_ENTRY_PATH_HEADER}" header not set.`);
						const isEntryWorkerHeader = request.headers.get(IS_ENTRY_WORKER_HEADER);
						if (!isEntryWorkerHeader) throw new Error(`Unexpected error: "${IS_ENTRY_WORKER_HEADER}" header not set.`);
						workerEntryPath = decodeURIComponent(workerEntryPathHeader);
						isEntryWorker = isEntryWorkerHeader === "true";
					}
					return this.env.__VITE_RUNNER_OBJECT__.get("singleton").fetch(request);
				}
				if (url.pathname === GET_EXPORT_TYPES_PATH) {
					const workerEntryExportTypes = await getWorkerEntryExportTypes();
					return Response.json(workerEntryExportTypes);
				}
			}
			const exportValue = await getWorkerEntryExport(workerEntryPath, exportName);
			const userEnv = stripInternalEnv(this.env);
			if (typeof exportValue === "object" && exportValue !== null) {
				const maybeFn = exportValue[key];
				if (typeof maybeFn !== "function") throw new TypeError(`Expected "${exportName}" export of "${workerEntryPath}" to define a \`${key}()\` function.`);
				return maybeFn.call(exportValue, arg, userEnv, this.ctx);
			} else if (typeof exportValue === "function") {
				const instance = new exportValue(this.ctx, userEnv);
				if (!(instance instanceof WorkerEntrypoint)) throw new TypeError(`Expected "${exportName}" export of "${workerEntryPath}" to be a subclass of \`WorkerEntrypoint\`.`);
				const maybeFn = instance[key];
				if (typeof maybeFn !== "function") throw new TypeError(`Expected "${exportName}" export of "${workerEntryPath}" to define a \`${key}()\` method.`);
				return maybeFn.call(instance, arg);
			} else return /* @__PURE__ */ new TypeError(`Expected "${exportName}" export of "${workerEntryPath}" to be an object or a class.`);
		});
	};
	return Wrapper;
}
/** Symbol key for storing the `DurableObject` instance */
const kInstance = Symbol("kInstance");
/** Symbol key for the instance initialization method */
const kEnsureInstance = Symbol("kEnsureInstance");
/**
* Retrieves an RPC property from a `DurableObject` export, ensuring an instance is properly initialized and returning the bound method or property value.
* @param exportName - The name of the `DurableObject` export
* @param key - The property key to access on the `DurableObject` instance
* @returns The property value, with methods bound to the instance
* @throws TypeError if the export is not a `DurableObject` subclass
*/
async function getDurableObjectRpcProperty(exportName, key) {
	const { ctor, instance } = await this[kEnsureInstance]();
	if (!(instance instanceof DurableObject)) throw new TypeError(`Expected "${exportName}" export of "${workerEntryPath}" to be a subclass of \`DurableObject\` for RPC.`);
	const value = getRpcProperty(ctor, instance, key);
	if (typeof value === "function") return value.bind(instance);
	return value;
}
/**
* Creates a proxy wrapper for `DurableObject` classes that enables RPC functionality.
* The wrapper manages instance lifecycle and delegates method calls to the user code, handling both direct method calls and RPC property access.
* @param exportName - The name of the `DurableObject` export to wrap
* @returns A `DurableObject` constructor that acts as a proxy to the user code
*/
function createDurableObjectWrapper(exportName) {
	class Wrapper extends DurableObject {
		[kInstance];
		constructor(ctx, env) {
			super(ctx, env);
			return new Proxy(this, { get(target, key, receiver) {
				const value = Reflect.get(target, key, receiver);
				if (value !== void 0) return value;
				if (typeof key === "symbol" || IGNORED_KEYS.includes(key) || WORKER_ENTRYPOINT_KEYS.includes(key)) return;
				return getRpcPropertyCallableThenable(key, getDurableObjectRpcProperty.call(receiver, exportName, key));
			} });
		}
		async [kEnsureInstance]() {
			const ctor = await getWorkerEntryExport(workerEntryPath, exportName);
			if (typeof ctor !== "function") throw new TypeError(`Expected "${exportName}" export of "${workerEntryPath}" to be a subclass of \`DurableObject\`.`);
			if (!this[kInstance] || this[kInstance].ctor !== ctor) {
				const userEnv = stripInternalEnv(this.env);
				this[kInstance] = {
					ctor,
					instance: new ctor(this.ctx, userEnv)
				};
				await this.ctx.blockConcurrencyWhile(async () => {});
			}
			return this[kInstance];
		}
	}
	for (const key of DURABLE_OBJECT_KEYS) Wrapper.prototype[key] = async function(...args) {
		const { instance } = await this[kEnsureInstance]();
		const maybeFn = instance[key];
		if (typeof maybeFn !== "function") throw new TypeError(`Expected "${exportName}" export of "${workerEntryPath}" to define a \`${key}()\` function.`);
		return maybeFn.apply(instance, args);
	};
	return Wrapper;
}
/**
* Creates a proxy wrapper for `WorkflowEntrypoint` classes.
* The wrapper delegates method calls to the user code.
* @param exportName - The name of the `WorkflowEntrypoint` export to wrap
* @returns A `WorkflowEntrypoint` constructor that acts as a proxy to the user code
*/
function createWorkflowEntrypointWrapper(exportName) {
	class Wrapper extends WorkflowEntrypoint {}
	for (const key of WORKFLOW_ENTRYPOINT_KEYS) Wrapper.prototype[key] = async function(...args) {
		const ctor = await getWorkerEntryExport(workerEntryPath, exportName);
		const userEnv = stripInternalEnv(this.env);
		const instance = new ctor(this.ctx, userEnv);
		if (!(instance instanceof WorkflowEntrypoint)) throw new TypeError(`Expected "${exportName}" export of "${workerEntryPath}" to be a subclass of \`WorkflowEntrypoint\`.`);
		const maybeFn = instance[key];
		if (typeof maybeFn !== "function") throw new TypeError(`Expected "${exportName}" export of "${workerEntryPath}" to define a \`${key}()\` function.`);
		return maybeFn.apply(instance, args);
	};
	return Wrapper;
}

//#endregion
export { __VITE_RUNNER_OBJECT__, createDurableObjectWrapper, createWorkerEntrypointWrapper, createWorkflowEntrypointWrapper };