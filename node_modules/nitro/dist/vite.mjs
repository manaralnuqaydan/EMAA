import { D as copyPublicAssets, E as prepare, F as prettyPath, H as m, U as v, at as basename$1, ct as isAbsolute$1, d as libChunkName, f as baseBuildConfig, ft as resolve$1, h as writeBuildInfo, l as NODE_MODULES_RE, lt as join$1, n as baseBuildPlugins, ot as dirname$1, rt as resolveModulePath, u as getChunkName } from "./_build/common.mjs";
import { t as formatCompatibilityDate } from "./_libs/compatx.mjs";
import { i as createNitro, r as prerender } from "./_chunks/nitro.mjs";
import { n as scanHandlers } from "./_chunks/nitro2.mjs";
import { n as watch$1 } from "./_libs/readdirp+chokidar.mjs";
import { t as debounce } from "./_libs/perfect-debounce.mjs";
import { r as NitroDevApp } from "./_dev.mjs";
import { t as startPreview } from "./_chunks/nitro4.mjs";
import { n as assetsPlugin } from "./_libs/pluginutils.mjs";
import { runtimeDependencies, runtimeDir } from "nitro/meta";
import { existsSync, watch } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { defu } from "defu";
import { withBase } from "ufo";
import { colors } from "consola/utils";
import { RunnerManager, loadRunner } from "env-runner";
import { NodeRequest, sendNodeResponse } from "srvx/node";
import "node:http";
import { DevEnvironment } from "vite";
import { createViteHotChannel } from "env-runner/vite";
const getBundlerConfig = async (ctx) => {
	const nitro = ctx.nitro;
	const base = baseBuildConfig(nitro);
	const commonConfig = {
		input: nitro.options.entry,
		external: [...base.env.external],
		plugins: [...await baseBuildPlugins(nitro, base)].filter(Boolean),
		onwarn(warning, warn) {
			if (!base.ignoreWarningCodes.has(warning.code || "")) warn(warning);
		},
		output: {
			dir: nitro.options.output.serverDir,
			format: "esm",
			entryFileNames: "index.mjs",
			chunkFileNames: (chunk) => getChunkName(chunk, nitro),
			inlineDynamicImports: nitro.options.inlineDynamicImports,
			sourcemapIgnoreList: (id) => id.includes("node_modules")
		}
	};
	if (ctx._isRolldown) {
		const rolldownConfig = defu({
			transform: { inject: base.env.inject },
			output: { codeSplitting: { groups: [{
				test: NODE_MODULES_RE,
				name: (id) => libChunkName(id)
			}] } }
		}, nitro.options.rolldownConfig, nitro.options.rollupConfig, commonConfig);
		const outputConfig = rolldownConfig.output;
		if (outputConfig.inlineDynamicImports || outputConfig.format === "iife") {
			delete outputConfig.inlineDynamicImports;
			outputConfig.codeSplitting = false;
		}
		return {
			base,
			rolldownConfig
		};
	} else {
		const inject = (await import("./_libs/plugin-inject.mjs").then((n) => n.t)).default;
		const alias = (await import("./_libs/plugin-alias.mjs").then((n) => n.n)).default;
		const rollupConfig = defu({
			plugins: [inject(base.env.inject), alias({ entries: base.aliases })],
			output: {
				sourcemapExcludeSources: true,
				generatedCode: { constBindings: true },
				manualChunks(id) {
					if (NODE_MODULES_RE.test(id)) return libChunkName(id);
				}
			}
		}, nitro.options.rolldownConfig, nitro.options.rollupConfig, commonConfig);
		const outputConfig = rollupConfig.output;
		if (outputConfig.inlineDynamicImports || outputConfig.format === "iife") delete outputConfig.manualChunks;
		return {
			base,
			rollupConfig
		};
	}
};
const BuilderNames = {
	nitro: colors.magenta("Nitro"),
	client: colors.green("Client"),
	ssr: colors.blue("SSR")
};
async function buildEnvironments(ctx, builder) {
	const nitro = ctx.nitro;
	for (const [envName, env] of Object.entries(builder.environments)) {
		const fmtName = BuilderNames[envName] || (envName.length <= 3 ? envName.toUpperCase() : envName[0].toUpperCase() + envName.slice(1));
		if (envName === "nitro" || !env.config.build.rollupOptions.input || env.isBuilt) {
			if (![
				"nitro",
				"ssr",
				"client"
			].includes(envName)) nitro.logger.info(env.isBuilt ? `Skipping ${fmtName} (already built)` : `Skipping ${fmtName} (no input defined)`);
			continue;
		}
		if (!v && !m) console.log();
		nitro.logger.start(`Building [${fmtName}]`);
		await builder.build(env);
	}
	const nitroOptions = ctx.nitro.options;
	const clientInput = builder.environments.client?.config?.build?.rollupOptions?.input;
	if (nitroOptions.renderer?.template && nitroOptions.renderer?.template === clientInput) {
		const outputPath = resolve$1(nitroOptions.output.publicDir, basename$1(clientInput));
		if (existsSync(outputPath)) {
			const html = await readFile(outputPath, "utf8").then((r) => r.replace("<!--ssr-outlet-->", `{{{ globalThis.__nitro_vite_envs__?.["ssr"]?.fetch($REQUEST) || "" }}}`));
			await rm(outputPath);
			const tmp = resolve$1(nitroOptions.buildDir, "vite/index.html");
			await mkdir(dirname$1(tmp), { recursive: true });
			await writeFile(tmp, html, "utf8");
			nitroOptions.renderer.template = tmp;
		}
	}
	await builder.writeAssetsManifest?.();
	if (!v && !m) console.log();
	const buildInfo = [["preset", nitro.options.preset], ["compatibility", formatCompatibilityDate(nitro.options.compatibilityDate)]].filter((e) => e[1]);
	nitro.logger.start(`Building [${BuilderNames.nitro}] ${colors.dim(`(${buildInfo.map(([k, v]) => `${k}: \`${v}\``).join(", ")})`)}`);
	await copyPublicAssets(nitro);
	const assetDirs = new Set(Object.values(builder.environments).filter((env) => env.config.consumer === "client").map((env) => env.config.build.assetsDir).filter(Boolean));
	for (const assetsDir of assetDirs) {
		if (!existsSync(resolve$1(nitro.options.output.publicDir, assetsDir))) continue;
		const rule = ctx.nitro.options.routeRules[`/${assetsDir}/**`] ??= {};
		if (!rule.headers?.["cache-control"]) rule.headers = {
			...rule.headers,
			"cache-control": `public, max-age=31536000, immutable`
		};
	}
	ctx.nitro.routing.sync();
	await prerender(nitro);
	const output = await builder.build(builder.environments.nitro);
	await nitro.close();
	await nitro.hooks.callHook("compiled", nitro);
	await writeBuildInfo(nitro, output);
	if (!v && !m) console.log();
	nitro.logger.success("You can preview this build using `npx vite preview`");
	if (nitro.options.commands.deploy) nitro.logger.success("You can deploy this build using `npx nitro deploy --prebuilt`");
}
function prodSetup(ctx) {
	return `
function lazyService(loader) {
  let promise, mod
  return {
    fetch(req) {
      if (mod) { return mod.fetch(req) }
      if (!promise) {
        promise = loader().then(_mod => (mod = _mod.default || _mod))
      }
      return promise.then(mod => mod.fetch(req))
    }
  }
}

const services = {
${Object.keys(ctx.services).map((name) => {
		return [name, resolve$1(ctx.nitro.options.buildDir, "vite/services", name, ctx._entryPoints[name])];
	}).map(([name, entry]) => `[${JSON.stringify(name)}]: lazyService(() => import(${JSON.stringify(entry)}))`).join(",\n")}
};

globalThis.__nitro_vite_envs__ = services;
  `;
}
const ASSET_EXT_RE = /^(?:[jt]sx?|mjs|cjs|css|s[ac]ss|less|styl|vue|svelte|astro|mdx?|map|wasm|png|jpe?g|gif|svg|webp|avif|ico|bmp|woff2?|ttf|otf|eot|mp[34]|webm|wav|ogg|m4a)$/i;
function createFetchableDevEnvironment(name, config, devServer, entry, opts) {
	return new FetchableDevEnvironment(name, config, {
		hot: true,
		transport: createViteHotChannel(devServer, name)
	}, devServer, entry, opts);
}
var FetchableDevEnvironment = class extends DevEnvironment {
	devServer;
	#entry;
	#preventExternalize;
	constructor(name, config, context, devServer, entry, opts) {
		super(name, config, context);
		this.devServer = devServer;
		this.#entry = entry;
		this.#preventExternalize = opts?.preventExternalize ?? false;
	}
	async fetchModule(id, importer, options) {
		if (this.#preventExternalize && !id.startsWith("file://") && importer && id[0] !== "." && id[0] !== "/") {
			const resolved = await this.pluginContainer.resolveId(id, importer);
			if (resolved && !resolved.external) return super.fetchModule(resolved.id, importer, options);
		}
		return super.fetchModule(id, importer, options);
	}
	async dispatchFetch(request) {
		return this.devServer.fetch(request);
	}
	async init(...args) {
		await this.devServer.init?.();
		await super.init(...args);
		this.devServer.sendMessage({
			type: "custom",
			event: "nitro:vite-env",
			data: {
				name: this.name,
				entry: this.#entry
			}
		});
	}
};
async function configureViteDevServer(ctx, server) {
	const nitro = ctx.nitro;
	const nitroEnv = server.environments.nitro;
	const nitroConfigFile = nitro.options._c12.configFile;
	if (nitroConfigFile) server.config.configFileDependencies.push(nitroConfigFile);
	if (nitro.options.features.websocket ?? nitro.options.experimental.websocket) server.httpServer.on("upgrade", (req, socket, head) => {
		if (req.headers["sec-websocket-protocol"]?.startsWith("vite-")) return;
		getEnvRunner(ctx).upgrade?.({ node: {
			req,
			socket,
			head
		} });
	});
	const reload = debounce(async () => {
		await scanHandlers(nitro);
		nitro.routing.sync();
		nitroEnv.moduleGraph.invalidateAll();
		nitroEnv.hot.send({ type: "full-reload" });
	});
	const scanDirs = nitro.options.scanDirs.flatMap((dir) => [
		join$1(dir, nitro.options.apiDir || "api"),
		join$1(dir, nitro.options.routesDir || "routes"),
		join$1(dir, "middleware"),
		join$1(dir, "plugins"),
		join$1(dir, "modules")
	]);
	const watchReloadEvents = new Set([
		"add",
		"addDir",
		"unlink",
		"unlinkDir"
	]);
	const scanDirsWatcher = watch$1(scanDirs, { ignoreInitial: true }).on("all", (event, path, stat) => {
		if (watchReloadEvents.has(event)) reload();
	});
	const rootDirWatcher = watch(nitro.options.rootDir, { persistent: false }, (_event, filename) => {
		if (filename && /^server\.[mc]?[jt]sx?$/.test(filename)) reload();
	});
	nitro.hooks.hook("close", () => {
		scanDirsWatcher.close();
		rootDirWatcher.close();
	});
	nitroEnv.devServer.onMessage(async (message) => {
		if (message?.__rpc === "transformHTML") try {
			const html = (await server.transformIndexHtml("/", message.data)).replace("<!--ssr-outlet-->", `{{{ globalThis.__nitro_vite_envs__?.["ssr"]?.fetch($REQUEST) || "" }}}`);
			nitroEnv.devServer.sendMessage({
				__rpc_id: message.__rpc_id,
				data: html
			});
		} catch (error) {
			nitroEnv.devServer.sendMessage({
				__rpc_id: message.__rpc_id,
				error: error instanceof Error ? error.message : String(error)
			});
		}
	});
	const nitroDevMiddleware = async (nodeReq, nodeRes, next) => {
		if (!nodeReq.url || /^\/@(?:vite|fs|id)\//.test(nodeReq.url) || nodeReq._nitroHandled || server.middlewares.stack.map((mw) => mw.route).some((base) => base && nodeReq.url.startsWith(base))) return next();
		nodeReq._nitroHandled = true;
		const baseURL = nitro.options.baseURL || "/";
		const originalURL = nodeReq.url;
		if (baseURL !== "/") nodeReq.url = withBase(nodeReq.url, baseURL);
		try {
			const req = new NodeRequest({
				req: nodeReq,
				res: nodeRes
			});
			const devAppRes = await ctx.devApp.fetch(req);
			if (nodeRes.writableEnded || nodeRes.headersSent) return;
			if (devAppRes.status !== 404) return await sendNodeResponse(nodeRes, devAppRes);
			const envRes = await nitroEnv.dispatchFetch(req);
			if (nodeRes.writableEnded || nodeRes.headersSent) return;
			return await sendNodeResponse(nodeRes, envRes);
		} catch (error) {
			return next(error);
		} finally {
			if (baseURL !== "/") nodeReq.url = originalURL;
		}
	};
	server.middlewares.use(function nitroDevMiddlewarePre(req, res, next) {
		const fetchDest = req.headers["sec-fetch-dest"];
		const accept = req.headers["accept"];
		const ext = req.url.match(/\.([a-z0-9]+)(?:[?#]|$)/i)?.[1];
		const isNitroRoute = ext ? !!nitro.routing.routes.match(req.method || "", new URL(withBase(req.url, nitro.options.baseURL), "http://localhost").pathname) : false;
		const isDocumentLike = fetchDest ? /^(document|iframe|frame|empty)$/.test(fetchDest) : !(ext && ASSET_EXT_RE.test(ext) && !(typeof accept === "string" && /\btext\/html\b/.test(accept)));
		res.setHeader("vary", "sec-fetch-dest, accept");
		if (isDocumentLike && (!ext || isNitroRoute) && !/^\/(?:__|@)/.test(req.url)) nitroDevMiddleware(req, res, next);
		else {
			if (!isDocumentLike) req._nitroHandled = true;
			next();
		}
	});
	return () => {
		server.middlewares.use(nitroDevMiddleware);
	};
}
function createNitroEnvironment(ctx) {
	const isWorkerdRunner = _isWorkerdRunner(ctx);
	return {
		consumer: "server",
		build: {
			rollupOptions: ctx.bundlerConfig.rollupConfig,
			rolldownOptions: ctx.bundlerConfig.rolldownConfig,
			minify: ctx.nitro.options.minify,
			emptyOutDir: false,
			sourcemap: ctx.nitro.options.sourcemap,
			commonjsOptions: ctx.nitro.options.commonJS,
			copyPublicDir: false
		},
		resolve: {
			noExternal: ctx.nitro.options.dev ? isWorkerdRunner ? true : [
				/^nitro$/,
				new RegExp(`^(${runtimeDependencies.join("|")})$`),
				...ctx.bundlerConfig.base.noExternal
			] : true,
			conditions: isWorkerdRunner ? [
				"workerd",
				"worker",
				...ctx.nitro.options.exportConditions.filter((c) => c !== "node")
			] : ctx.nitro.options.exportConditions,
			externalConditions: ctx.nitro.options.exportConditions?.filter((c) => !/browser|wasm|module/.test(c))
		},
		define: { "process.env.NODE_ENV": JSON.stringify(ctx.nitro.options.dev ? "development" : "production") },
		dev: { createEnvironment: (envName, envConfig) => {
			const entry = resolve(runtimeDir, "internal/vite/dev-entry.mjs");
			const env = createFetchableDevEnvironment(envName, envConfig, getEnvRunner(ctx), entry, { preventExternalize: isWorkerdRunner });
			ctx._transformRequest = (id) => env.transformRequest(id);
			(ctx._viteEnvs ??= /* @__PURE__ */ new Map()).set(envName, entry);
			return env;
		} }
	};
}
function createServiceEnvironment(ctx, name, serviceConfig) {
	const isWorkerdRunner = _isWorkerdRunner(ctx);
	return {
		consumer: "server",
		build: {
			rollupOptions: {
				input: { index: serviceConfig.entry },
				external: [/^nitro(\/|$)/]
			},
			minify: ctx.nitro.options.minify,
			sourcemap: ctx.nitro.options.sourcemap,
			outDir: join(ctx.nitro.options.buildDir, "vite/services", name),
			emptyOutDir: true,
			copyPublicDir: false
		},
		resolve: {
			...isWorkerdRunner ? { noExternal: true } : {},
			conditions: isWorkerdRunner ? [
				"workerd",
				"worker",
				...ctx.nitro.options.exportConditions.filter((c) => c !== "node")
			] : ctx.nitro.options.exportConditions,
			externalConditions: ctx.nitro.options.exportConditions?.filter((c) => !/browser|wasm|module/.test(c))
		},
		dev: { createEnvironment: (envName, envConfig) => {
			const entry = tryResolve(serviceConfig.entry);
			(ctx._viteEnvs ??= /* @__PURE__ */ new Map()).set(envName, entry);
			return createFetchableDevEnvironment(envName, envConfig, getEnvRunner(ctx), entry, { preventExternalize: isWorkerdRunner });
		} }
	};
}
function createServiceEnvironments(ctx) {
	return Object.fromEntries(Object.entries(ctx.services).map(([name, config]) => [name, createServiceEnvironment(ctx, name, config)]));
}
async function initEnvRunner(ctx) {
	if (ctx._envRunner) return ctx._envRunner;
	if (!ctx._initPromise) ctx._initPromise = (async () => {
		const manager = new RunnerManager();
		let _retries = 0;
		manager.onClose((_runner, cause) => {
			if (_retries++ < 3) {
				ctx.nitro.logger.info("Restarting env runner...", cause ? `Cause: ${cause}` : "");
				_loadRunner(ctx, manager);
			} else ctx.nitro.logger.error("Env runner failed after 3 retries.", cause ? `Last cause: ${cause}` : "");
		});
		manager.onReady(() => {
			_retries = 0;
			if (ctx._viteEnvs) for (const [name, entry] of ctx._viteEnvs) manager.sendMessage({
				type: "custom",
				event: "nitro:vite-env",
				data: {
					name,
					entry
				}
			});
		});
		await _loadRunner(ctx, manager);
		ctx._envRunner = manager;
		return manager;
	})();
	return await ctx._initPromise;
}
function getEnvRunner(ctx) {
	if (!ctx._envRunner) throw new Error("Env runner not initialized. Call initEnvRunner() first.");
	return ctx._envRunner;
}
async function _loadRunner(ctx, manager) {
	const runnerName = ctx.nitro.options.devServer.runner || process.env.NITRO_DEV_RUNNER || "node-worker";
	const entry = resolve(runtimeDir, "internal/vite/dev-worker.mjs");
	let runner;
	if (runnerName === "miniflare") {
		const { MiniflareEnvRunner } = await import("env-runner/runners/miniflare");
		runner = new MiniflareEnvRunner({
			name: "nitro-vite",
			data: { entry }
		});
	} else runner = await loadRunner(runnerName, {
		name: "nitro-vite",
		data: { entry }
	});
	await manager.reload(runner);
}
const NITRO_PROXY_PREFIX = "\0nitro-env-proxy:";
function nitroServiceProxy() {
	return {
		name: "nitro:service-proxy",
		enforce: "pre",
		applyToEnvironment: (env) => env.name !== "nitro" && env.config.consumer === "server",
		apply: (_config, configEnv) => configEnv.command === "serve",
		resolveId: {
			filter: { id: /^nitro(\/|$)/ },
			handler(id) {
				if (id === "nitro" || id.startsWith("nitro/")) return {
					id: NITRO_PROXY_PREFIX + id,
					moduleSideEffects: false
				};
			}
		},
		load: {
			filter: { id: /^\0nitro-env-proxy:/ },
			handler(id) {
				if (!id.startsWith(NITRO_PROXY_PREFIX)) return;
				const originalId = id.slice(17);
				return {
					code: [
						`const _mod = await globalThis.__VITE_ENVIRONMENT_RUNNER_IMPORT__("nitro", ${JSON.stringify(originalId)});`,
						`__vite_ssr_exportAll__(_mod);`,
						`export default _mod.default;`
					].join("\n"),
					map: null
				};
			}
		}
	};
}
function _isWorkerdRunner(ctx) {
	return (ctx.nitro.options.devServer.runner || process.env.NITRO_DEV_RUNNER || "node-worker") === "miniflare";
}
function tryResolve(id) {
	if (/^[~#/\0]/.test(id) || isAbsolute$1(id)) return id;
	return resolveModulePath(id, {
		suffixes: ["", "/index"],
		extensions: [
			"",
			".ts",
			".mjs",
			".cjs",
			".js",
			".mts",
			".cts"
		],
		try: true
	}) || id;
}
function nitroPreviewPlugin(ctx) {
	return {
		name: "nitro:preview",
		apply: (_config, configEnv) => !!configEnv.isPreview,
		config(config) {
			return { preview: { port: config.preview?.port || 3e3 } };
		},
		async configurePreviewServer(server) {
			const preview = await startPreview({
				rootDir: server.config.root,
				loader: { nodeServer: server.httpServer }
			});
			server.httpServer.once("close", async () => {
				await preview.close();
			});
			const { NodeRequest, sendNodeResponse } = await import("srvx/node");
			server.middlewares.use(async (req, res, next) => {
				const nodeReq = new NodeRequest({
					req,
					res
				});
				await sendNodeResponse(res, await preview.fetch(nodeReq)).catch(next);
			});
			if (preview.upgrade) server.httpServer.on("upgrade", (req, socket, head) => {
				preview.upgrade(req, socket, head);
			});
		}
	};
}
const DEFAULT_EXTENSIONS = [
	".ts",
	".js",
	".mts",
	".mjs",
	".tsx",
	".jsx"
];
const debug = process.env.NITRO_DEBUG ? (...args) => console.log("[nitro]", ...args) : () => {};
function nitro(pluginConfig = {}) {
	if (globalThis.__nitro_build__) return [];
	const ctx = createContext(pluginConfig);
	return [
		nitroInit(ctx),
		nitroEnv(ctx),
		nitroMain(ctx),
		nitroPrepare(ctx),
		nitroService(ctx),
		nitroServiceProxy(),
		nitroPreviewPlugin(ctx),
		pluginConfig.experimental?.vite?.assetsImport !== false && assetsPlugin({ experimental: { clientBuildFallback: false } })
	].filter(Boolean);
}
function nitroInit(ctx) {
	return {
		name: "nitro:init",
		sharedDuringBuild: true,
		apply: (_config, configEnv) => !configEnv.isPreview,
		async config(config, configEnv) {
			ctx._isRolldown = !!this.meta.rolldownVersion;
			if (!ctx._initialized) {
				debug("[init] Initializing nitro");
				ctx._initialized = true;
				await setupNitroContext(ctx, configEnv, config);
			}
		},
		applyToEnvironment(env) {
			if (env.name === "nitro" && ctx.nitro?.options.dev) {
				debug("[init] Adding rollup plugins for dev");
				return [...ctx.bundlerConfig?.rolldownConfig?.plugins || ctx.bundlerConfig?.rollupConfig?.plugins || []];
			}
		}
	};
}
function nitroEnv(ctx) {
	return {
		name: "nitro:env",
		sharedDuringBuild: true,
		apply: (_config, configEnv) => !configEnv.isPreview,
		async config(userConfig, _configEnv) {
			debug("[env]  Extending config (environments)");
			const environments = {
				...createServiceEnvironments(ctx),
				nitro: createNitroEnvironment(ctx)
			};
			environments.client = {
				consumer: userConfig.environments?.client?.consumer ?? "client",
				build: { rollupOptions: { input: userConfig.environments?.client?.build?.rollupOptions?.input ?? useNitro(ctx).options.renderer?.template } }
			};
			debug("[env]  Environments:", Object.keys(environments).join(", "));
			return { environments };
		},
		configEnvironment(name, config) {
			if (config.consumer === "client") {
				debug("[env]  Configuring client environment", name === "client" ? "" : ` (${name})`);
				config.build.emptyOutDir = false;
				config.build.outDir = useNitro(ctx).options.output.publicDir;
				config.build.copyPublicDir ??= false;
				return;
			}
			if (name === "nitro" || ctx.services[name]) return;
			const entry = getEntry(config.build?.rolldownOptions?.input || config.build?.rollupOptions?.input);
			if (typeof entry !== "string") return;
			const resolvedEntry = resolveModulePath(entry, {
				from: [ctx.nitro.options.rootDir, ...ctx.nitro.options.scanDirs],
				extensions: DEFAULT_EXTENSIONS,
				suffixes: ["", "/index"],
				try: true
			}) || entry;
			ctx.services[name] = { entry: resolvedEntry };
			debug(`[env]  Auto-detected service "${name}" with entry: ${resolvedEntry}`);
			return createServiceEnvironment(ctx, name, { entry: resolvedEntry });
		},
		configResolved() {
			if (!ctx.nitro.options.renderer?.handler && !ctx.nitro.options.renderer?.template && ctx.services.ssr?.entry) {
				ctx.nitro.options.renderer ??= {};
				ctx.nitro.options.renderer.handler = resolve$1(runtimeDir, "internal/vite/ssr-renderer");
				ctx.nitro.routing.sync();
			}
		}
	};
}
function nitroMain(ctx) {
	return {
		name: "nitro:main",
		sharedDuringBuild: true,
		apply: (_config, configEnv) => !configEnv.isPreview,
		async config(userConfig, _configEnv) {
			debug("[main] Extending config (appType, resolve, server)");
			if (!ctx.bundlerConfig) throw new Error("Bundler config is not initialized yet!");
			return {
				appType: userConfig.appType || "custom",
				resolve: { alias: ctx.bundlerConfig.base.aliases },
				builder: { sharedConfigBuild: true },
				server: {
					port: Number.parseInt(process.env.PORT || "") || userConfig.server?.port || useNitro(ctx).options.devServer?.port || 3e3,
					cors: false
				}
			};
		},
		buildApp: {
			order: "post",
			handler(builder) {
				debug("[main] Building environments");
				return buildEnvironments(ctx, builder);
			}
		},
		generateBundle: { handler(_options, bundle) {
			const environment = this.environment;
			debug("[main] Generating manifest and entry points for environment:", environment.name);
			const isRegisteredService = Object.keys(ctx.services).includes(environment.name);
			let entryFile;
			const serviceEntry = isRegisteredService && ctx.services[environment.name]?.entry ? resolve$1(ctx.services[environment.name].entry) : void 0;
			for (const [_name, file] of Object.entries(bundle)) if (file.type === "chunk" && isRegisteredService && file.isEntry) {
				if (serviceEntry && file.facadeModuleId && resolve$1(file.facadeModuleId) === serviceEntry) {
					entryFile = file.fileName;
					break;
				}
				if (entryFile === void 0) entryFile = file.fileName;
			}
			if (isRegisteredService) {
				if (entryFile === void 0) this.error(`No entry point found for service "${this.environment.name}".`);
				ctx._entryPoints[this.environment.name] = entryFile;
			}
		} },
		configureServer: (server) => {
			debug("[main] Configuring dev server");
			return configureViteDevServer(ctx, server);
		},
		async hotUpdate({ server, modules, timestamp }) {
			if (ctx.pluginConfig.experimental?.vite?.serverReload === false) return;
			const env = this.environment;
			if (env.config.consumer === "client") return;
			const clientEnvs = Object.values(server.environments).filter((env) => env.config.consumer === "client");
			const serverOnlyModules = [];
			const sharedModules = [];
			const invalidated = /* @__PURE__ */ new Set();
			for (const mod of modules) if (mod.id && !clientEnvs.some((env) => env.moduleGraph.getModuleById(mod.id))) {
				serverOnlyModules.push(mod);
				env.moduleGraph.invalidateModule(mod, invalidated, timestamp, false);
			} else sharedModules.push(mod);
			if (serverOnlyModules.length > 0) {
				env.hot.send({ type: "full-reload" });
				if (sharedModules.length === 0 && serverOnlyModules.some((m) => m.environment !== "ssr")) server.ws.send({ type: "full-reload" });
				return sharedModules;
			}
		}
	};
}
function nitroPrepare(ctx) {
	return {
		name: "nitro:prepare",
		sharedDuringBuild: true,
		applyToEnvironment: (env) => env.name === "nitro",
		buildApp: {
			order: "pre",
			async handler() {
				debug("[prepare] Preparing output directory");
				const nitro = ctx.nitro;
				await prepare(nitro);
			}
		}
	};
}
function nitroService(ctx) {
	return {
		name: "nitro:service",
		enforce: "pre",
		sharedDuringBuild: true,
		applyToEnvironment: (env) => env.name === "nitro",
		resolveId: {
			filter: { id: /^#nitro-vite-setup$/ },
			async handler(id) {
				if (id === "#nitro-vite-setup") return {
					id,
					moduleSideEffects: true
				};
			}
		},
		load: {
			filter: { id: /^#nitro-vite-setup$/ },
			async handler(id) {
				if (id === "#nitro-vite-setup") return prodSetup(ctx);
			}
		}
	};
}
function createContext(pluginConfig) {
	return {
		pluginConfig,
		services: { ...pluginConfig.experimental?.vite?.services },
		_entryPoints: {}
	};
}
function useNitro(ctx) {
	if (!ctx.nitro) throw new Error("Nitro instance is not initialized yet.");
	return ctx.nitro;
}
async function setupNitroContext(ctx, configEnv, userConfig) {
	const nitroConfig = {
		dev: configEnv.command === "serve",
		builder: "vite",
		rootDir: userConfig.root,
		...defu(ctx.pluginConfig, ctx.pluginConfig.config, userConfig.nitro)
	};
	nitroConfig.modules ??= [];
	for (const plugin of flattenPlugins(userConfig.plugins || [])) if (plugin.nitro) nitroConfig.modules.push(plugin.nitro);
	const dotenvFileNames = [".env", ".env.local"];
	if (configEnv.mode) dotenvFileNames.push(`.env.${configEnv.mode}`, `.env.${configEnv.mode}.local`);
	ctx.nitro = ctx.pluginConfig._nitro || await createNitro(nitroConfig, { dotenv: { fileName: dotenvFileNames } });
	if (!ctx.services?.ssr) if (userConfig.environments?.ssr === void 0) {
		const ssrEntry = resolveModulePath("./entry-server", {
			from: [
				"app",
				"src",
				""
			].flatMap((d) => [ctx.nitro.options.rootDir, ...ctx.nitro.options.scanDirs].map((s) => join$1(s, d) + "/")),
			extensions: DEFAULT_EXTENSIONS,
			try: true
		});
		if (ssrEntry) {
			ctx.services.ssr = { entry: ssrEntry };
			ctx.nitro.logger.info(`Using \`${prettyPath(ssrEntry)}\` as vite ssr entry.`);
		}
	} else {
		let ssrEntry = getEntry(userConfig.environments.ssr.build?.rollupOptions?.input);
		if (typeof ssrEntry === "string") {
			ssrEntry = resolveModulePath(ssrEntry, {
				from: [ctx.nitro.options.rootDir, ...ctx.nitro.options.scanDirs],
				extensions: DEFAULT_EXTENSIONS,
				suffixes: ["", "/index"],
				try: true
			}) || ssrEntry;
			ctx.services.ssr = { entry: ssrEntry };
		}
	}
	if (ctx.nitro.options.serverEntry && ctx.nitro.options.serverEntry.handler === ctx.services.ssr?.entry) {
		ctx.nitro.logger.warn(`Nitro server entry and Vite SSR both set to ${prettyPath(ctx.services.ssr.entry)}. Use a separate SSR entry (e.g. \`src/server.ts\`).`);
		ctx.nitro.options.serverEntry = false;
	}
	const publicDistDir = ctx._publicDistDir = userConfig.build?.outDir || resolve$1(ctx.nitro.options.buildDir, "vite/public");
	ctx.nitro.options.publicAssets.push({
		dir: publicDistDir,
		maxAge: 0,
		baseURL: "/",
		fallthrough: true
	});
	if (!ctx.nitro.options.dev) ctx.nitro.options.unenv.push({
		meta: { name: "nitro-vite" },
		polyfill: ["#nitro-vite-setup"]
	});
	await ctx.nitro.hooks.callHook("build:before", ctx.nitro);
	ctx.bundlerConfig = await getBundlerConfig(ctx);
	await ctx.nitro.hooks.callHook("rollup:before", ctx.nitro, ctx.bundlerConfig.rollupConfig || ctx.bundlerConfig.rolldownConfig);
	if (ctx.nitro.options.dev) await initEnvRunner(ctx);
	ctx.nitro.fetch = (req) => getEnvRunner(ctx).fetch(req);
	if (ctx.nitro.options.dev && !ctx.devApp) ctx.devApp = new NitroDevApp(ctx.nitro);
	ctx.nitro.hooks.hook("close", async () => {
		if (ctx._envRunner) await ctx._envRunner.close();
	});
}
function getEntry(input) {
	if (typeof input === "string") return input;
	else if (Array.isArray(input) && input.length > 0) return input[0];
	else if (input && "index" in input) return input.index;
}
function flattenPlugins(plugins) {
	return plugins.flatMap((plugin) => Array.isArray(plugin) ? flattenPlugins(plugin) : [plugin]).filter((p) => p && !(p instanceof Promise));
}
export { nitro };
