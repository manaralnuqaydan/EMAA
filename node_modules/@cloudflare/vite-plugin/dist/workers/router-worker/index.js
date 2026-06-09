import { WorkerEntrypoint } from "cloudflare:workers";

//#region ../workers-shared/utils/responses.ts
var TemporaryRedirectResponse = class TemporaryRedirectResponse extends Response {
	static status = 307;
	constructor(location, init) {
		super(null, {
			...init,
			status: TemporaryRedirectResponse.status,
			statusText: "Temporary Redirect",
			headers: {
				...init?.headers,
				Location: location
			}
		});
	}
};

//#endregion
//#region ../workers-shared/utils/tracing.ts
function mockJaegerBindingSpan() {
	return {
		addLogs: () => {},
		setTags: () => {},
		end: () => {},
		isRecording: true
	};
}
function mockJaegerBinding() {
	return {
		enterSpan: (_, span, ...args) => {
			return span(mockJaegerBindingSpan(), ...args);
		},
		getSpanContext: () => ({
			traceId: "test-trace",
			spanId: "test-span",
			parentSpanId: "test-parent-span",
			traceFlags: 0
		}),
		runWithSpanContext: (_, callback, ...args) => {
			return callback(...args);
		},
		traceId: "test-trace",
		spanId: "test-span",
		parentSpanId: "test-parent-span",
		cfTraceIdHeader: "test-trace:test-span:0"
	};
}

//#endregion
//#region ../workers-shared/asset-worker/src/utils/rules-engine.ts
const ESCAPE_REGEX_CHARACTERS = /[-/\\^$*+?.()|[\]{}]/g;
const escapeRegex = (str) => {
	return str.replace(ESCAPE_REGEX_CHARACTERS, "\\$&");
};
const generateGlobOnlyRuleRegExp = (rule) => {
	rule = rule.split("*").map(escapeRegex).join(".*");
	rule = "^" + rule + "$";
	return RegExp(rule);
};
const generateStaticRoutingRuleMatcher = (rules) => ({ request }) => {
	const { pathname } = new URL(request.url);
	for (const rule of rules) try {
		if (generateGlobOnlyRuleRegExp(rule).test(pathname)) return true;
	} catch {}
	return false;
};

//#endregion
//#region ../workers-shared/utils/performance.ts
var PerformanceTimer = class {
	performanceTimer;
	constructor(performanceTimer) {
		this.performanceTimer = performanceTimer;
	}
	now() {
		if (this.performanceTimer) return this.performanceTimer.timeOrigin + this.performanceTimer.now();
		return Date.now();
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/is.js
const objectToString = Object.prototype.toString;
/**
* Checks whether given value's type is one of a few Error or Error-like
* {@link isError}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isError(wat) {
	switch (objectToString.call(wat)) {
		case "[object Error]":
		case "[object Exception]":
		case "[object DOMException]": return true;
		default: return isInstanceOf(wat, Error);
	}
}
/**
* Checks whether given value is an instance of the given built-in class.
*
* @param wat The value to be checked
* @param className
* @returns A boolean representing the result.
*/
function isBuiltin(wat, className) {
	return objectToString.call(wat) === `[object ${className}]`;
}
/**
* Checks whether given value's type is ErrorEvent
* {@link isErrorEvent}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isErrorEvent$1(wat) {
	return isBuiltin(wat, "ErrorEvent");
}
/**
* Checks whether given value's type is a string
* {@link isString}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isString(wat) {
	return isBuiltin(wat, "String");
}
/**
* Checks whether given string is parameterized
* {@link isParameterizedString}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isParameterizedString(wat) {
	return typeof wat === "object" && wat !== null && "__sentry_template_string__" in wat && "__sentry_template_values__" in wat;
}
/**
* Checks whether given value is a primitive (undefined, null, number, boolean, string, bigint, symbol)
* {@link isPrimitive}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isPrimitive(wat) {
	return wat === null || isParameterizedString(wat) || typeof wat !== "object" && typeof wat !== "function";
}
/**
* Checks whether given value's type is an object literal, or a class instance.
* {@link isPlainObject}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isPlainObject(wat) {
	return isBuiltin(wat, "Object");
}
/**
* Checks whether given value's type is an Event instance
* {@link isEvent}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isEvent(wat) {
	return typeof Event !== "undefined" && isInstanceOf(wat, Event);
}
/**
* Checks whether given value's type is an Element instance
* {@link isElement}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isElement(wat) {
	return typeof Element !== "undefined" && isInstanceOf(wat, Element);
}
/**
* Checks whether given value has a then function.
* @param wat A value to be checked.
*/
function isThenable(wat) {
	return Boolean(wat && wat.then && typeof wat.then === "function");
}
/**
* Checks whether given value's type is a SyntheticEvent
* {@link isSyntheticEvent}.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isSyntheticEvent(wat) {
	return isPlainObject(wat) && "nativeEvent" in wat && "preventDefault" in wat && "stopPropagation" in wat;
}
/**
* Checks whether given value's type is an instance of provided constructor.
* {@link isInstanceOf}.
*
* @param wat A value to be checked.
* @param base A constructor to be used in a check.
* @returns A boolean representing the result.
*/
function isInstanceOf(wat, base) {
	try {
		return wat instanceof base;
	} catch (_e) {
		return false;
	}
}
/**
* Checks whether given value's type is a Vue ViewModel.
*
* @param wat A value to be checked.
* @returns A boolean representing the result.
*/
function isVueViewModel(wat) {
	return !!(typeof wat === "object" && wat !== null && (wat.__isVue || wat._isVue));
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/string.js
/**
* Truncates given string to the maximum characters count
*
* @param str An object that contains serializable values
* @param max Maximum number of characters in truncated string (0 = unlimited)
* @returns string Encoded
*/
function truncate(str, max = 0) {
	if (typeof str !== "string" || max === 0) return str;
	return str.length <= max ? str : `${str.slice(0, max)}...`;
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/version.js
const SDK_VERSION = "8.9.2";

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/worldwide.js
/** Get's the global object for the current JavaScript runtime */
const GLOBAL_OBJ = globalThis;
/**
* Returns a global singleton contained in the global `__SENTRY__[]` object.
*
* If the singleton doesn't already exist in `__SENTRY__`, it will be created using the given factory
* function and added to the `__SENTRY__` object.
*
* @param name name of the global singleton on __SENTRY__
* @param creator creator Factory function to create the singleton if it doesn't already exist on `__SENTRY__`
* @param obj (Optional) The global object on which to look for `__SENTRY__`, if not `GLOBAL_OBJ`'s return value
* @returns the singleton
*/
function getGlobalSingleton(name, creator, obj) {
	const gbl = obj || GLOBAL_OBJ;
	const __SENTRY__ = gbl.__SENTRY__ = gbl.__SENTRY__ || {};
	const versionedCarrier = __SENTRY__[SDK_VERSION] = __SENTRY__[SDK_VERSION] || {};
	return versionedCarrier[name] || (versionedCarrier[name] = creator());
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/browser.js
const WINDOW = GLOBAL_OBJ;
const DEFAULT_MAX_STRING_LENGTH = 80;
/**
* Given a child DOM element, returns a query-selector statement describing that
* and its ancestors
* e.g. [HTMLElement] => body > div > input#foo.btn[name=baz]
* @returns generated DOM path
*/
function htmlTreeAsString(elem, options = {}) {
	if (!elem) return "<unknown>";
	try {
		let currentElem = elem;
		const MAX_TRAVERSE_HEIGHT = 5;
		const out = [];
		let height = 0;
		let len = 0;
		const separator = " > ";
		const sepLength = 3;
		let nextStr;
		const keyAttrs = Array.isArray(options) ? options : options.keyAttrs;
		const maxStringLength = !Array.isArray(options) && options.maxStringLength || DEFAULT_MAX_STRING_LENGTH;
		while (currentElem && height++ < MAX_TRAVERSE_HEIGHT) {
			nextStr = _htmlElementAsString(currentElem, keyAttrs);
			if (nextStr === "html" || height > 1 && len + out.length * sepLength + nextStr.length >= maxStringLength) break;
			out.push(nextStr);
			len += nextStr.length;
			currentElem = currentElem.parentNode;
		}
		return out.reverse().join(separator);
	} catch (_oO) {
		return "<unknown>";
	}
}
/**
* Returns a simple, query-selector representation of a DOM element
* e.g. [HTMLElement] => input#foo.btn[name=baz]
* @returns generated DOM path
*/
function _htmlElementAsString(el, keyAttrs) {
	const elem = el;
	const out = [];
	let className;
	let classes;
	let key;
	let attr;
	let i;
	if (!elem || !elem.tagName) return "";
	if (WINDOW.HTMLElement) {
		if (elem instanceof HTMLElement && elem.dataset) {
			if (elem.dataset["sentryComponent"]) return elem.dataset["sentryComponent"];
			if (elem.dataset["sentryElement"]) return elem.dataset["sentryElement"];
		}
	}
	out.push(elem.tagName.toLowerCase());
	const keyAttrPairs = keyAttrs && keyAttrs.length ? keyAttrs.filter((keyAttr) => elem.getAttribute(keyAttr)).map((keyAttr) => [keyAttr, elem.getAttribute(keyAttr)]) : null;
	if (keyAttrPairs && keyAttrPairs.length) keyAttrPairs.forEach((keyAttrPair) => {
		out.push(`[${keyAttrPair[0]}="${keyAttrPair[1]}"]`);
	});
	else {
		if (elem.id) out.push(`#${elem.id}`);
		className = elem.className;
		if (className && isString(className)) {
			classes = className.split(/\s+/);
			for (i = 0; i < classes.length; i++) out.push(`.${classes[i]}`);
		}
	}
	const allowedAttrs = [
		"aria-label",
		"type",
		"name",
		"title",
		"alt"
	];
	for (i = 0; i < allowedAttrs.length; i++) {
		key = allowedAttrs[i];
		attr = elem.getAttribute(key);
		if (attr) out.push(`[${key}="${attr}"]`);
	}
	return out.join("");
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/debug-build.js
/**
* This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
*
* ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
*/
const DEBUG_BUILD$1 = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/logger.js
/** Prefix for logging strings */
const PREFIX = "Sentry Logger ";
const CONSOLE_LEVELS = [
	"debug",
	"info",
	"warn",
	"error",
	"log",
	"assert",
	"trace"
];
/** This may be mutated by the console instrumentation. */
const originalConsoleMethods = {};
/** JSDoc */
/**
* Temporarily disable sentry console instrumentations.
*
* @param callback The function to run against the original `console` messages
* @returns The results of the callback
*/
function consoleSandbox(callback) {
	if (!("console" in GLOBAL_OBJ)) return callback();
	const console$1 = GLOBAL_OBJ.console;
	const wrappedFuncs = {};
	const wrappedLevels = Object.keys(originalConsoleMethods);
	wrappedLevels.forEach((level) => {
		const originalConsoleMethod = originalConsoleMethods[level];
		wrappedFuncs[level] = console$1[level];
		console$1[level] = originalConsoleMethod;
	});
	try {
		return callback();
	} finally {
		wrappedLevels.forEach((level) => {
			console$1[level] = wrappedFuncs[level];
		});
	}
}
function makeLogger() {
	let enabled = false;
	const logger$1 = {
		enable: () => {
			enabled = true;
		},
		disable: () => {
			enabled = false;
		},
		isEnabled: () => enabled
	};
	if (DEBUG_BUILD$1) CONSOLE_LEVELS.forEach((name) => {
		logger$1[name] = (...args) => {
			if (enabled) consoleSandbox(() => {
				GLOBAL_OBJ.console[name](`${PREFIX}[${name}]:`, ...args);
			});
		};
	});
	else CONSOLE_LEVELS.forEach((name) => {
		logger$1[name] = () => void 0;
	});
	return logger$1;
}
const logger = makeLogger();

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/dsn.js
/** Regular expression used to parse a Dsn. */
const DSN_REGEX = /^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;
function isValidProtocol(protocol) {
	return protocol === "http" || protocol === "https";
}
/**
* Renders the string representation of this Dsn.
*
* By default, this will render the public representation without the password
* component. To get the deprecated private representation, set `withPassword`
* to true.
*
* @param withPassword When set to true, the password will be included.
*/
function dsnToString(dsn, withPassword = false) {
	const { host, path, pass, port, projectId, protocol, publicKey } = dsn;
	return `${protocol}://${publicKey}${withPassword && pass ? `:${pass}` : ""}@${host}${port ? `:${port}` : ""}/${path ? `${path}/` : path}${projectId}`;
}
/**
* Parses a Dsn from a given string.
*
* @param str A Dsn as string
* @returns Dsn as DsnComponents or undefined if @param str is not a valid DSN string
*/
function dsnFromString(str) {
	const match = DSN_REGEX.exec(str);
	if (!match) {
		consoleSandbox(() => {
			console.error(`Invalid Sentry Dsn: ${str}`);
		});
		return;
	}
	const [protocol, publicKey, pass = "", host, port = "", lastPath] = match.slice(1);
	let path = "";
	let projectId = lastPath;
	const split = projectId.split("/");
	if (split.length > 1) {
		path = split.slice(0, -1).join("/");
		projectId = split.pop();
	}
	if (projectId) {
		const projectMatch = projectId.match(/^\d+/);
		if (projectMatch) projectId = projectMatch[0];
	}
	return dsnFromComponents({
		host,
		pass,
		path,
		projectId,
		port,
		protocol,
		publicKey
	});
}
function dsnFromComponents(components) {
	return {
		protocol: components.protocol,
		publicKey: components.publicKey || "",
		pass: components.pass || "",
		host: components.host,
		port: components.port || "",
		path: components.path || "",
		projectId: components.projectId
	};
}
function validateDsn(dsn) {
	if (!DEBUG_BUILD$1) return true;
	const { port, projectId, protocol } = dsn;
	if ([
		"protocol",
		"publicKey",
		"host",
		"projectId"
	].find((component) => {
		if (!dsn[component]) {
			logger.error(`Invalid Sentry Dsn: ${component} missing`);
			return true;
		}
		return false;
	})) return false;
	if (!projectId.match(/^\d+$/)) {
		logger.error(`Invalid Sentry Dsn: Invalid projectId ${projectId}`);
		return false;
	}
	if (!isValidProtocol(protocol)) {
		logger.error(`Invalid Sentry Dsn: Invalid protocol ${protocol}`);
		return false;
	}
	if (port && isNaN(parseInt(port, 10))) {
		logger.error(`Invalid Sentry Dsn: Invalid port ${port}`);
		return false;
	}
	return true;
}
/**
* Creates a valid Sentry Dsn object, identifying a Sentry instance and project.
* @returns a valid DsnComponents object or `undefined` if @param from is an invalid DSN source
*/
function makeDsn(from) {
	const components = typeof from === "string" ? dsnFromString(from) : dsnFromComponents(from);
	if (!components || !validateDsn(components)) return;
	return components;
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/error.js
/** An error emitted by Sentry SDKs and related utilities. */
var SentryError = class extends Error {
	/** Display name of this error instance. */
	constructor(message, logLevel = "warn") {
		super(message);
		this.message = message;
		this.name = new.target.prototype.constructor.name;
		Object.setPrototypeOf(this, new.target.prototype);
		this.logLevel = logLevel;
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/object.js
/**
* Defines a non-enumerable property on the given object.
*
* @param obj The object on which to set the property
* @param name The name of the property to be set
* @param value The value to which to set the property
*/
function addNonEnumerableProperty(obj, name, value) {
	try {
		Object.defineProperty(obj, name, {
			value,
			writable: true,
			configurable: true
		});
	} catch (o_O) {
		DEBUG_BUILD$1 && logger.log(`Failed to add non-enumerable property "${name}" to object`, obj);
	}
}
/**
* Encodes given object into url-friendly format
*
* @param object An object that contains serializable values
* @returns string Encoded
*/
function urlEncode(object) {
	return Object.keys(object).map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(object[key])}`).join("&");
}
/**
* Transforms any `Error` or `Event` into a plain object with all of their enumerable properties, and some of their
* non-enumerable properties attached.
*
* @param value Initial source that we have to transform in order for it to be usable by the serializer
* @returns An Event or Error turned into an object - or the value argurment itself, when value is neither an Event nor
*  an Error.
*/
function convertToPlainObject(value) {
	if (isError(value)) return {
		message: value.message,
		name: value.name,
		stack: value.stack,
		...getOwnProperties(value)
	};
	else if (isEvent(value)) {
		const newObj = {
			type: value.type,
			target: serializeEventTarget(value.target),
			currentTarget: serializeEventTarget(value.currentTarget),
			...getOwnProperties(value)
		};
		if (typeof CustomEvent !== "undefined" && isInstanceOf(value, CustomEvent)) newObj.detail = value.detail;
		return newObj;
	} else return value;
}
/** Creates a string representation of the target of an `Event` object */
function serializeEventTarget(target) {
	try {
		return isElement(target) ? htmlTreeAsString(target) : Object.prototype.toString.call(target);
	} catch (_oO) {
		return "<unknown>";
	}
}
/** Filters out all but an object's own properties */
function getOwnProperties(obj) {
	if (typeof obj === "object" && obj !== null) {
		const extractedProps = {};
		for (const property in obj) if (Object.prototype.hasOwnProperty.call(obj, property)) extractedProps[property] = obj[property];
		return extractedProps;
	} else return {};
}
/**
* Given any captured exception, extract its keys and create a sorted
* and truncated list that will be used inside the event message.
* eg. `Non-error exception captured with keys: foo, bar, baz`
*/
function extractExceptionKeysForMessage(exception, maxLength = 40) {
	const keys = Object.keys(convertToPlainObject(exception));
	keys.sort();
	if (!keys.length) return "[object has no keys]";
	if (keys[0].length >= maxLength) return truncate(keys[0], maxLength);
	for (let includedKeys = keys.length; includedKeys > 0; includedKeys--) {
		const serialized = keys.slice(0, includedKeys).join(", ");
		if (serialized.length > maxLength) continue;
		if (includedKeys === keys.length) return serialized;
		return truncate(serialized, maxLength);
	}
	return "";
}
/**
* Given any object, return a new object having removed all fields whose value was `undefined`.
* Works recursively on objects and arrays.
*
* Attention: This function keeps circular references in the returned object.
*/
function dropUndefinedKeys(inputValue) {
	return _dropUndefinedKeys(inputValue, /* @__PURE__ */ new Map());
}
function _dropUndefinedKeys(inputValue, memoizationMap) {
	if (isPojo(inputValue)) {
		const memoVal = memoizationMap.get(inputValue);
		if (memoVal !== void 0) return memoVal;
		const returnValue = {};
		memoizationMap.set(inputValue, returnValue);
		for (const key of Object.keys(inputValue)) if (typeof inputValue[key] !== "undefined") returnValue[key] = _dropUndefinedKeys(inputValue[key], memoizationMap);
		return returnValue;
	}
	if (Array.isArray(inputValue)) {
		const memoVal = memoizationMap.get(inputValue);
		if (memoVal !== void 0) return memoVal;
		const returnValue = [];
		memoizationMap.set(inputValue, returnValue);
		inputValue.forEach((item) => {
			returnValue.push(_dropUndefinedKeys(item, memoizationMap));
		});
		return returnValue;
	}
	return inputValue;
}
function isPojo(input) {
	if (!isPlainObject(input)) return false;
	try {
		const name = Object.getPrototypeOf(input).constructor.name;
		return !name || name === "Object";
	} catch (e) {
		return true;
	}
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/stacktrace.js
const STACKTRACE_FRAME_LIMIT = 50;
const UNKNOWN_FUNCTION = "?";
const WEBPACK_ERROR_REGEXP = /\(error: (.*)\)/;
const STRIP_FRAME_REGEXP = /captureMessage|captureException/;
/**
* Creates a stack parser with the supplied line parsers
*
* StackFrames are returned in the correct order for Sentry Exception
* frames and with Sentry SDK internal frames removed from the top and bottom
*
*/
function createStackParser(...parsers) {
	const sortedParsers = parsers.sort((a, b) => a[0] - b[0]).map((p) => p[1]);
	return (stack, skipFirstLines = 0, framesToPop = 0) => {
		const frames = [];
		const lines = stack.split("\n");
		for (let i = skipFirstLines; i < lines.length; i++) {
			const line = lines[i];
			if (line.length > 1024) continue;
			const cleanedLine = WEBPACK_ERROR_REGEXP.test(line) ? line.replace(WEBPACK_ERROR_REGEXP, "$1") : line;
			if (cleanedLine.match(/\S*Error: /)) continue;
			for (const parser of sortedParsers) {
				const frame = parser(cleanedLine);
				if (frame) {
					frames.push(frame);
					break;
				}
			}
			if (frames.length >= STACKTRACE_FRAME_LIMIT + framesToPop) break;
		}
		return stripSentryFramesAndReverse(frames.slice(framesToPop));
	};
}
/**
* Gets a stack parser implementation from Options.stackParser
* @see Options
*
* If options contains an array of line parsers, it is converted into a parser
*/
function stackParserFromStackParserOptions(stackParser) {
	if (Array.isArray(stackParser)) return createStackParser(...stackParser);
	return stackParser;
}
/**
* Removes Sentry frames from the top and bottom of the stack if present and enforces a limit of max number of frames.
* Assumes stack input is ordered from top to bottom and returns the reverse representation so call site of the
* function that caused the crash is the last frame in the array.
* @hidden
*/
function stripSentryFramesAndReverse(stack) {
	if (!stack.length) return [];
	const localStack = Array.from(stack);
	if (/sentryWrapped/.test(localStack[localStack.length - 1].function || "")) localStack.pop();
	localStack.reverse();
	if (STRIP_FRAME_REGEXP.test(localStack[localStack.length - 1].function || "")) {
		localStack.pop();
		if (STRIP_FRAME_REGEXP.test(localStack[localStack.length - 1].function || "")) localStack.pop();
	}
	return localStack.slice(0, STACKTRACE_FRAME_LIMIT).map((frame) => ({
		...frame,
		filename: frame.filename || localStack[localStack.length - 1].filename,
		function: frame.function || UNKNOWN_FUNCTION
	}));
}
const defaultFunctionName = "<anonymous>";
/**
* Safely extract function name from itself
*/
function getFunctionName(fn) {
	try {
		if (!fn || typeof fn !== "function") return defaultFunctionName;
		return fn.name || defaultFunctionName;
	} catch (e) {
		return defaultFunctionName;
	}
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/instrument/handlers.js
const handlers = {};
const instrumented = {};
/** Add a handler function. */
function addHandler(type, handler$1) {
	handlers[type] = handlers[type] || [];
	handlers[type].push(handler$1);
}
/** Maybe run an instrumentation function, unless it was already called. */
function maybeInstrument(type, instrumentFn) {
	if (!instrumented[type]) {
		instrumentFn();
		instrumented[type] = true;
	}
}
/** Trigger handlers for a given instrumentation type. */
function triggerHandlers(type, data) {
	const typeHandlers = type && handlers[type];
	if (!typeHandlers) return;
	for (const handler$1 of typeHandlers) try {
		handler$1(data);
	} catch (e) {
		DEBUG_BUILD$1 && logger.error(`Error while triggering instrumentation handler.\nType: ${type}\nName: ${getFunctionName(handler$1)}\nError:`, e);
	}
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/time.js
const ONE_SECOND_IN_MS = 1e3;
/**
* A partial definition of the [Performance Web API]{@link https://developer.mozilla.org/en-US/docs/Web/API/Performance}
* for accessing a high-resolution monotonic clock.
*/
/**
* Returns a timestamp in seconds since the UNIX epoch using the Date API.
*
* TODO(v8): Return type should be rounded.
*/
function dateTimestampInSeconds() {
	return Date.now() / ONE_SECOND_IN_MS;
}
/**
* Returns a wrapper around the native Performance API browser implementation, or undefined for browsers that do not
* support the API.
*
* Wrapping the native API works around differences in behavior from different browsers.
*/
function createUnixTimestampInSecondsFunc() {
	const { performance } = GLOBAL_OBJ;
	if (!performance || !performance.now) return dateTimestampInSeconds;
	const approxStartingTimeOrigin = Date.now() - performance.now();
	const timeOrigin = performance.timeOrigin == void 0 ? approxStartingTimeOrigin : performance.timeOrigin;
	return () => {
		return (timeOrigin + performance.now()) / ONE_SECOND_IN_MS;
	};
}
/**
* Returns a timestamp in seconds since the UNIX epoch using either the Performance or Date APIs, depending on the
* availability of the Performance API.
*
* BUG: Note that because of how browsers implement the Performance API, the clock might stop when the computer is
* asleep. This creates a skew between `dateTimestampInSeconds` and `timestampInSeconds`. The
* skew can grow to arbitrary amounts like days, weeks or months.
* See https://github.com/getsentry/sentry-javascript/issues/2590.
*/
const timestampInSeconds = createUnixTimestampInSecondsFunc();
/**
* Internal helper to store what is the source of browserPerformanceTimeOrigin below. For debugging only.
*/
let _browserPerformanceTimeOriginMode;
/**
* The number of milliseconds since the UNIX epoch. This value is only usable in a browser, and only when the
* performance API is available.
*/
const browserPerformanceTimeOrigin = (() => {
	const { performance } = GLOBAL_OBJ;
	if (!performance || !performance.now) {
		_browserPerformanceTimeOriginMode = "none";
		return;
	}
	const threshold = 3600 * 1e3;
	const performanceNow = performance.now();
	const dateNow = Date.now();
	const timeOriginDelta = performance.timeOrigin ? Math.abs(performance.timeOrigin + performanceNow - dateNow) : threshold;
	const timeOriginIsReliable = timeOriginDelta < threshold;
	const navigationStart = performance.timing && performance.timing.navigationStart;
	const navigationStartDelta = typeof navigationStart === "number" ? Math.abs(navigationStart + performanceNow - dateNow) : threshold;
	if (timeOriginIsReliable || navigationStartDelta < threshold) if (timeOriginDelta <= navigationStartDelta) {
		_browserPerformanceTimeOriginMode = "timeOrigin";
		return performance.timeOrigin;
	} else {
		_browserPerformanceTimeOriginMode = "navigationStart";
		return navigationStart;
	}
	_browserPerformanceTimeOriginMode = "dateNow";
	return dateNow;
})();

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/instrument/globalError.js
let _oldOnErrorHandler = null;
/**
* Add an instrumentation handler for when an error is captured by the global error handler.
*
* Use at your own risk, this might break without changelog notice, only used internally.
* @hidden
*/
function addGlobalErrorInstrumentationHandler(handler$1) {
	const type = "error";
	addHandler(type, handler$1);
	maybeInstrument(type, instrumentError);
}
function instrumentError() {
	_oldOnErrorHandler = GLOBAL_OBJ.onerror;
	GLOBAL_OBJ.onerror = function(msg, url, line, column, error) {
		triggerHandlers("error", {
			column,
			error,
			line,
			msg,
			url
		});
		if (_oldOnErrorHandler && !_oldOnErrorHandler.__SENTRY_LOADER__) return _oldOnErrorHandler.apply(this, arguments);
		return false;
	};
	GLOBAL_OBJ.onerror.__SENTRY_INSTRUMENTED__ = true;
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/instrument/globalUnhandledRejection.js
let _oldOnUnhandledRejectionHandler = null;
/**
* Add an instrumentation handler for when an unhandled promise rejection is captured.
*
* Use at your own risk, this might break without changelog notice, only used internally.
* @hidden
*/
function addGlobalUnhandledRejectionInstrumentationHandler(handler$1) {
	const type = "unhandledrejection";
	addHandler(type, handler$1);
	maybeInstrument(type, instrumentUnhandledRejection);
}
function instrumentUnhandledRejection() {
	_oldOnUnhandledRejectionHandler = GLOBAL_OBJ.onunhandledrejection;
	GLOBAL_OBJ.onunhandledrejection = function(e) {
		triggerHandlers("unhandledrejection", e);
		if (_oldOnUnhandledRejectionHandler && !_oldOnUnhandledRejectionHandler.__SENTRY_LOADER__) return _oldOnUnhandledRejectionHandler.apply(this, arguments);
		return true;
	};
	GLOBAL_OBJ.onunhandledrejection.__SENTRY_INSTRUMENTED__ = true;
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/memo.js
/**
* Helper to decycle json objects
*/
function memoBuilder() {
	const hasWeakSet = typeof WeakSet === "function";
	const inner = hasWeakSet ? /* @__PURE__ */ new WeakSet() : [];
	function memoize(obj) {
		if (hasWeakSet) {
			if (inner.has(obj)) return true;
			inner.add(obj);
			return false;
		}
		for (let i = 0; i < inner.length; i++) if (inner[i] === obj) return true;
		inner.push(obj);
		return false;
	}
	function unmemoize(obj) {
		if (hasWeakSet) inner.delete(obj);
		else for (let i = 0; i < inner.length; i++) if (inner[i] === obj) {
			inner.splice(i, 1);
			break;
		}
	}
	return [memoize, unmemoize];
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/misc.js
/**
* UUID4 generator
*
* @returns string Generated UUID4.
*/
function uuid4() {
	const gbl = GLOBAL_OBJ;
	const crypto = gbl.crypto || gbl.msCrypto;
	let getRandomByte = () => Math.random() * 16;
	try {
		if (crypto && crypto.randomUUID) return crypto.randomUUID().replace(/-/g, "");
		if (crypto && crypto.getRandomValues) getRandomByte = () => {
			const typedArray = new Uint8Array(1);
			crypto.getRandomValues(typedArray);
			return typedArray[0];
		};
	} catch (_) {}
	return "10000000100040008000100000000000".replace(/[018]/g, (c) => (c ^ (getRandomByte() & 15) >> c / 4).toString(16));
}
function getFirstException(event) {
	return event.exception && event.exception.values ? event.exception.values[0] : void 0;
}
/**
* Adds exception values, type and value to an synthetic Exception.
* @param event The event to modify.
* @param value Value of the exception.
* @param type Type of the exception.
* @hidden
*/
function addExceptionTypeValue(event, value, type) {
	const exception = event.exception = event.exception || {};
	const values = exception.values = exception.values || [];
	const firstException = values[0] = values[0] || {};
	if (!firstException.value) firstException.value = value || "";
	if (!firstException.type) firstException.type = type || "Error";
}
/**
* Adds exception mechanism data to a given event. Uses defaults if the second parameter is not passed.
*
* @param event The event to modify.
* @param newMechanism Mechanism data to add to the event.
* @hidden
*/
function addExceptionMechanism(event, newMechanism) {
	const firstException = getFirstException(event);
	if (!firstException) return;
	const defaultMechanism = {
		type: "generic",
		handled: true
	};
	const currentMechanism = firstException.mechanism;
	firstException.mechanism = {
		...defaultMechanism,
		...currentMechanism,
		...newMechanism
	};
	if (newMechanism && "data" in newMechanism) {
		const mergedData = {
			...currentMechanism && currentMechanism.data,
			...newMechanism.data
		};
		firstException.mechanism.data = mergedData;
	}
}
/**
* Checks whether or not we've already captured the given exception (note: not an identical exception - the very object
* in question), and marks it captured if not.
*
* This is useful because it's possible for an error to get captured by more than one mechanism. After we intercept and
* record an error, we rethrow it (assuming we've intercepted it before it's reached the top-level global handlers), so
* that we don't interfere with whatever effects the error might have had were the SDK not there. At that point, because
* the error has been rethrown, it's possible for it to bubble up to some other code we've instrumented. If it's not
* caught after that, it will bubble all the way up to the global handlers (which of course we also instrument). This
* function helps us ensure that even if we encounter the same error more than once, we only record it the first time we
* see it.
*
* Note: It will ignore primitives (always return `false` and not mark them as seen), as properties can't be set on
* them. {@link: Object.objectify} can be used on exceptions to convert any that are primitives into their equivalent
* object wrapper forms so that this check will always work. However, because we need to flag the exact object which
* will get rethrown, and because that rethrowing happens outside of the event processing pipeline, the objectification
* must be done before the exception captured.
*
* @param A thrown exception to check or flag as having been seen
* @returns `true` if the exception has already been captured, `false` if not (with the side effect of marking it seen)
*/
function checkOrSetAlreadyCaught(exception) {
	if (exception && exception.__sentry_captured__) return true;
	try {
		addNonEnumerableProperty(exception, "__sentry_captured__", true);
	} catch (err) {}
	return false;
}
/**
* Checks whether the given input is already an array, and if it isn't, wraps it in one.
*
* @param maybeArray Input to turn into an array, if necessary
* @returns The input, if already an array, or an array with the input as the only element, if not
*/
function arrayify(maybeArray) {
	return Array.isArray(maybeArray) ? maybeArray : [maybeArray];
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/normalize.js
/**
* Recursively normalizes the given object.
*
* - Creates a copy to prevent original input mutation
* - Skips non-enumerable properties
* - When stringifying, calls `toJSON` if implemented
* - Removes circular references
* - Translates non-serializable values (`undefined`/`NaN`/functions) to serializable format
* - Translates known global objects/classes to a string representations
* - Takes care of `Error` object serialization
* - Optionally limits depth of final output
* - Optionally limits number of properties/elements included in any single object/array
*
* @param input The object to be normalized.
* @param depth The max depth to which to normalize the object. (Anything deeper stringified whole.)
* @param maxProperties The max number of elements or properties to be included in any single array or
* object in the normallized output.
* @returns A normalized version of the object, or `"**non-serializable**"` if any errors are thrown during normalization.
*/
function normalize(input, depth = 100, maxProperties = Infinity) {
	try {
		return visit("", input, depth, maxProperties);
	} catch (err) {
		return { ERROR: `**non-serializable** (${err})` };
	}
}
/** JSDoc */
function normalizeToSize(object, depth = 3, maxSize = 100 * 1024) {
	const normalized = normalize(object, depth);
	if (jsonSize(normalized) > maxSize) return normalizeToSize(object, depth - 1, maxSize);
	return normalized;
}
/**
* Visits a node to perform normalization on it
*
* @param key The key corresponding to the given node
* @param value The node to be visited
* @param depth Optional number indicating the maximum recursion depth
* @param maxProperties Optional maximum number of properties/elements included in any single object/array
* @param memo Optional Memo class handling decycling
*/
function visit(key, value, depth = Infinity, maxProperties = Infinity, memo = memoBuilder()) {
	const [memoize, unmemoize] = memo;
	if (value == null || [
		"number",
		"boolean",
		"string"
	].includes(typeof value) && !Number.isNaN(value)) return value;
	const stringified = stringifyValue(key, value);
	if (!stringified.startsWith("[object ")) return stringified;
	if (value["__sentry_skip_normalization__"]) return value;
	const remainingDepth = typeof value["__sentry_override_normalization_depth__"] === "number" ? value["__sentry_override_normalization_depth__"] : depth;
	if (remainingDepth === 0) return stringified.replace("object ", "");
	if (memoize(value)) return "[Circular ~]";
	const valueWithToJSON = value;
	if (valueWithToJSON && typeof valueWithToJSON.toJSON === "function") try {
		return visit("", valueWithToJSON.toJSON(), remainingDepth - 1, maxProperties, memo);
	} catch (err) {}
	const normalized = Array.isArray(value) ? [] : {};
	let numAdded = 0;
	const visitable = convertToPlainObject(value);
	for (const visitKey in visitable) {
		if (!Object.prototype.hasOwnProperty.call(visitable, visitKey)) continue;
		if (numAdded >= maxProperties) {
			normalized[visitKey] = "[MaxProperties ~]";
			break;
		}
		const visitValue = visitable[visitKey];
		normalized[visitKey] = visit(visitKey, visitValue, remainingDepth - 1, maxProperties, memo);
		numAdded++;
	}
	unmemoize(value);
	return normalized;
}
/**
* Stringify the given value. Handles various known special values and types.
*
* Not meant to be used on simple primitives which already have a string representation, as it will, for example, turn
* the number 1231 into "[Object Number]", nor on `null`, as it will throw.
*
* @param value The value to stringify
* @returns A stringified representation of the given value
*/
function stringifyValue(key, value) {
	try {
		if (key === "domain" && value && typeof value === "object" && value._events) return "[Domain]";
		if (key === "domainEmitter") return "[DomainEmitter]";
		if (typeof global !== "undefined" && value === global) return "[Global]";
		if (typeof window !== "undefined" && value === window) return "[Window]";
		if (typeof document !== "undefined" && value === document) return "[Document]";
		if (isVueViewModel(value)) return "[VueViewModel]";
		if (isSyntheticEvent(value)) return "[SyntheticEvent]";
		if (typeof value === "number" && value !== value) return "[NaN]";
		if (typeof value === "function") return `[Function: ${getFunctionName(value)}]`;
		if (typeof value === "symbol") return `[${String(value)}]`;
		if (typeof value === "bigint") return `[BigInt: ${String(value)}]`;
		const objName = getConstructorName(value);
		if (/^HTML(\w*)Element$/.test(objName)) return `[HTMLElement: ${objName}]`;
		return `[object ${objName}]`;
	} catch (err) {
		return `**non-serializable** (${err})`;
	}
}
function getConstructorName(value) {
	const prototype = Object.getPrototypeOf(value);
	return prototype ? prototype.constructor.name : "null prototype";
}
/** Calculates bytes size of input string */
function utf8Length(value) {
	return ~-encodeURI(value).split(/%..|./).length;
}
/** Calculates bytes size of input object */
function jsonSize(value) {
	return utf8Length(JSON.stringify(value));
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/path.js
/** JSDoc */
function normalizeArray(parts, allowAboveRoot) {
	let up = 0;
	for (let i = parts.length - 1; i >= 0; i--) {
		const last = parts[i];
		if (last === ".") parts.splice(i, 1);
		else if (last === "..") {
			parts.splice(i, 1);
			up++;
		} else if (up) {
			parts.splice(i, 1);
			up--;
		}
	}
	if (allowAboveRoot) for (; up--;) parts.unshift("..");
	return parts;
}
const splitPathRe = /^(\S+:\\|\/?)([\s\S]*?)((?:\.{1,2}|[^/\\]+?|)(\.[^./\\]*|))(?:[/\\]*)$/;
/** JSDoc */
function splitPath(filename) {
	const truncated = filename.length > 1024 ? `<truncated>${filename.slice(-1024)}` : filename;
	const parts = splitPathRe.exec(truncated);
	return parts ? parts.slice(1) : [];
}
/** JSDoc */
function resolve(...args) {
	let resolvedPath = "";
	let resolvedAbsolute = false;
	for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
		const path = i >= 0 ? args[i] : "/";
		if (!path) continue;
		resolvedPath = `${path}/${resolvedPath}`;
		resolvedAbsolute = path.charAt(0) === "/";
	}
	resolvedPath = normalizeArray(resolvedPath.split("/").filter((p) => !!p), !resolvedAbsolute).join("/");
	return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
}
/** JSDoc */
function trim(arr) {
	let start = 0;
	for (; start < arr.length; start++) if (arr[start] !== "") break;
	let end = arr.length - 1;
	for (; end >= 0; end--) if (arr[end] !== "") break;
	if (start > end) return [];
	return arr.slice(start, end - start + 1);
}
/** JSDoc */
function relative(from, to) {
	from = resolve(from).slice(1);
	to = resolve(to).slice(1);
	const fromParts = trim(from.split("/"));
	const toParts = trim(to.split("/"));
	const length = Math.min(fromParts.length, toParts.length);
	let samePartsLength = length;
	for (let i = 0; i < length; i++) if (fromParts[i] !== toParts[i]) {
		samePartsLength = i;
		break;
	}
	let outputParts = [];
	for (let i = samePartsLength; i < fromParts.length; i++) outputParts.push("..");
	outputParts = outputParts.concat(toParts.slice(samePartsLength));
	return outputParts.join("/");
}
/** JSDoc */
function basename(path, ext) {
	let f = splitPath(path)[2];
	if (ext && f.slice(ext.length * -1) === ext) f = f.slice(0, f.length - ext.length);
	return f;
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/syncpromise.js
/** SyncPromise internal states */
var States;
(function(States$1) {
	/** Pending */
	const PENDING = 0;
	States$1[States$1["PENDING"] = PENDING] = "PENDING";
	/** Resolved / OK */
	const RESOLVED = 1;
	States$1[States$1["RESOLVED"] = RESOLVED] = "RESOLVED";
	/** Rejected / Error */
	const REJECTED = 2;
	States$1[States$1["REJECTED"] = REJECTED] = "REJECTED";
})(States || (States = {}));
/**
* Creates a resolved sync promise.
*
* @param value the value to resolve the promise with
* @returns the resolved sync promise
*/
function resolvedSyncPromise(value) {
	return new SyncPromise((resolve$1) => {
		resolve$1(value);
	});
}
/**
* Creates a rejected sync promise.
*
* @param value the value to reject the promise with
* @returns the rejected sync promise
*/
function rejectedSyncPromise(reason) {
	return new SyncPromise((_, reject) => {
		reject(reason);
	});
}
/**
* Thenable class that behaves like a Promise and follows it's interface
* but is not async internally
*/
var SyncPromise = class SyncPromise {
	constructor(executor) {
		SyncPromise.prototype.__init.call(this);
		SyncPromise.prototype.__init2.call(this);
		SyncPromise.prototype.__init3.call(this);
		SyncPromise.prototype.__init4.call(this);
		this._state = States.PENDING;
		this._handlers = [];
		try {
			executor(this._resolve, this._reject);
		} catch (e) {
			this._reject(e);
		}
	}
	/** JSDoc */
	then(onfulfilled, onrejected) {
		return new SyncPromise((resolve$1, reject) => {
			this._handlers.push([
				false,
				(result) => {
					if (!onfulfilled) resolve$1(result);
					else try {
						resolve$1(onfulfilled(result));
					} catch (e) {
						reject(e);
					}
				},
				(reason) => {
					if (!onrejected) reject(reason);
					else try {
						resolve$1(onrejected(reason));
					} catch (e) {
						reject(e);
					}
				}
			]);
			this._executeHandlers();
		});
	}
	/** JSDoc */
	catch(onrejected) {
		return this.then((val) => val, onrejected);
	}
	/** JSDoc */
	finally(onfinally) {
		return new SyncPromise((resolve$1, reject) => {
			let val;
			let isRejected;
			return this.then((value) => {
				isRejected = false;
				val = value;
				if (onfinally) onfinally();
			}, (reason) => {
				isRejected = true;
				val = reason;
				if (onfinally) onfinally();
			}).then(() => {
				if (isRejected) {
					reject(val);
					return;
				}
				resolve$1(val);
			});
		});
	}
	/** JSDoc */
	__init() {
		this._resolve = (value) => {
			this._setResult(States.RESOLVED, value);
		};
	}
	/** JSDoc */
	__init2() {
		this._reject = (reason) => {
			this._setResult(States.REJECTED, reason);
		};
	}
	/** JSDoc */
	__init3() {
		this._setResult = (state, value) => {
			if (this._state !== States.PENDING) return;
			if (isThenable(value)) {
				value.then(this._resolve, this._reject);
				return;
			}
			this._state = state;
			this._value = value;
			this._executeHandlers();
		};
	}
	/** JSDoc */
	__init4() {
		this._executeHandlers = () => {
			if (this._state === States.PENDING) return;
			const cachedHandlers = this._handlers.slice();
			this._handlers = [];
			cachedHandlers.forEach((handler$1) => {
				if (handler$1[0]) return;
				if (this._state === States.RESOLVED) handler$1[1](this._value);
				if (this._state === States.REJECTED) handler$1[2](this._value);
				handler$1[0] = true;
			});
		};
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/promisebuffer.js
/**
* Creates an new PromiseBuffer object with the specified limit
* @param limit max number of promises that can be stored in the buffer
*/
function makePromiseBuffer(limit) {
	const buffer = [];
	function isReady() {
		return limit === void 0 || buffer.length < limit;
	}
	/**
	* Remove a promise from the queue.
	*
	* @param task Can be any PromiseLike<T>
	* @returns Removed promise.
	*/
	function remove(task) {
		return buffer.splice(buffer.indexOf(task), 1)[0];
	}
	/**
	* Add a promise (representing an in-flight action) to the queue, and set it to remove itself on fulfillment.
	*
	* @param taskProducer A function producing any PromiseLike<T>; In previous versions this used to be `task:
	*        PromiseLike<T>`, but under that model, Promises were instantly created on the call-site and their executor
	*        functions therefore ran immediately. Thus, even if the buffer was full, the action still happened. By
	*        requiring the promise to be wrapped in a function, we can defer promise creation until after the buffer
	*        limit check.
	* @returns The original promise.
	*/
	function add(taskProducer) {
		if (!isReady()) return rejectedSyncPromise(new SentryError("Not adding Promise because buffer limit was reached."));
		const task = taskProducer();
		if (buffer.indexOf(task) === -1) buffer.push(task);
		task.then(() => remove(task)).then(null, () => remove(task).then(null, () => {}));
		return task;
	}
	/**
	* Wait for all promises in the queue to resolve or for timeout to expire, whichever comes first.
	*
	* @param timeout The time, in ms, after which to resolve to `false` if the queue is still non-empty. Passing `0` (or
	* not passing anything) will make the promise wait as long as it takes for the queue to drain before resolving to
	* `true`.
	* @returns A promise which will resolve to `true` if the queue is already empty or drains before the timeout, and
	* `false` otherwise
	*/
	function drain(timeout) {
		return new SyncPromise((resolve$1, reject) => {
			let counter = buffer.length;
			if (!counter) return resolve$1(true);
			const capturedSetTimeout = setTimeout(() => {
				if (timeout && timeout > 0) resolve$1(false);
			}, timeout);
			buffer.forEach((item) => {
				resolvedSyncPromise(item).then(() => {
					if (!--counter) {
						clearTimeout(capturedSetTimeout);
						resolve$1(true);
					}
				}, reject);
			});
		});
	}
	return {
		$: buffer,
		add,
		drain
	};
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/node-stack-trace.js
/**
* Does this filename look like it's part of the app code?
*/
function filenameIsInApp(filename, isNative = false) {
	return !(isNative || filename && !filename.startsWith("/") && !filename.match(/^[A-Z]:/) && !filename.startsWith(".") && !filename.match(/^[a-zA-Z]([a-zA-Z0-9.\-+])*:\/\//)) && filename !== void 0 && !filename.includes("node_modules/");
}
/** Node Stack line parser */
function node(getModule$1) {
	const FILENAME_MATCH = /^\s*[-]{4,}$/;
	const FULL_MATCH = /at (?:async )?(?:(.+?)\s+\()?(?:(.+):(\d+):(\d+)?|([^)]+))\)?/;
	return (line) => {
		const lineMatch = line.match(FULL_MATCH);
		if (lineMatch) {
			let object;
			let method;
			let functionName;
			let typeName;
			let methodName;
			if (lineMatch[1]) {
				functionName = lineMatch[1];
				let methodStart = functionName.lastIndexOf(".");
				if (functionName[methodStart - 1] === ".") methodStart--;
				if (methodStart > 0) {
					object = functionName.slice(0, methodStart);
					method = functionName.slice(methodStart + 1);
					const objectEnd = object.indexOf(".Module");
					if (objectEnd > 0) {
						functionName = functionName.slice(objectEnd + 1);
						object = object.slice(0, objectEnd);
					}
				}
				typeName = void 0;
			}
			if (method) {
				typeName = object;
				methodName = method;
			}
			if (method === "<anonymous>") {
				methodName = void 0;
				functionName = void 0;
			}
			if (functionName === void 0) {
				methodName = methodName || UNKNOWN_FUNCTION;
				functionName = typeName ? `${typeName}.${methodName}` : methodName;
			}
			let filename = lineMatch[2] && lineMatch[2].startsWith("file://") ? lineMatch[2].slice(7) : lineMatch[2];
			const isNative = lineMatch[5] === "native";
			if (filename && filename.match(/\/[A-Z]:/)) filename = filename.slice(1);
			if (!filename && lineMatch[5] && !isNative) filename = lineMatch[5];
			return {
				filename,
				module: getModule$1 ? getModule$1(filename) : void 0,
				function: functionName,
				lineno: parseInt(lineMatch[3], 10) || void 0,
				colno: parseInt(lineMatch[4], 10) || void 0,
				in_app: filenameIsInApp(filename, isNative)
			};
		}
		if (line.match(FILENAME_MATCH)) return { filename: line };
	};
}
/**
* Node.js stack line parser
*
* This is in @sentry/utils so it can be used from the Electron SDK in the browser for when `nodeIntegration == true`.
* This allows it to be used without referencing or importing any node specific code which causes bundlers to complain
*/
function nodeStackLineParser(getModule$1) {
	return [90, node(getModule$1)];
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/envelope.js
/**
* Creates an envelope.
* Make sure to always explicitly provide the generic to this function
* so that the envelope types resolve correctly.
*/
function createEnvelope(headers, items = []) {
	return [headers, items];
}
/**
* Add an item to an envelope.
* Make sure to always explicitly provide the generic to this function
* so that the envelope types resolve correctly.
*/
function addItemToEnvelope(envelope, newItem) {
	const [headers, items] = envelope;
	return [headers, [...items, newItem]];
}
/**
* Convenience function to loop through the items and item types of an envelope.
* (This function was mostly created because working with envelope types is painful at the moment)
*
* If the callback returns true, the rest of the items will be skipped.
*/
function forEachEnvelopeItem(envelope, callback) {
	const envelopeItems = envelope[1];
	for (const envelopeItem of envelopeItems) {
		const envelopeItemType = envelopeItem[0].type;
		if (callback(envelopeItem, envelopeItemType)) return true;
	}
	return false;
}
/**
* Encode a string to UTF8 array.
*/
function encodeUTF8(input) {
	return GLOBAL_OBJ.__SENTRY__ && GLOBAL_OBJ.__SENTRY__.encodePolyfill ? GLOBAL_OBJ.__SENTRY__.encodePolyfill(input) : new TextEncoder().encode(input);
}
/**
* Serializes an envelope.
*/
function serializeEnvelope(envelope) {
	const [envHeaders, items] = envelope;
	let parts = JSON.stringify(envHeaders);
	function append(next) {
		if (typeof parts === "string") parts = typeof next === "string" ? parts + next : [encodeUTF8(parts), next];
		else parts.push(typeof next === "string" ? encodeUTF8(next) : next);
	}
	for (const item of items) {
		const [itemHeaders, payload] = item;
		append(`\n${JSON.stringify(itemHeaders)}\n`);
		if (typeof payload === "string" || payload instanceof Uint8Array) append(payload);
		else {
			let stringifiedPayload;
			try {
				stringifiedPayload = JSON.stringify(payload);
			} catch (e) {
				stringifiedPayload = JSON.stringify(normalize(payload));
			}
			append(stringifiedPayload);
		}
	}
	return typeof parts === "string" ? parts : concatBuffers(parts);
}
function concatBuffers(buffers) {
	const totalLength = buffers.reduce((acc, buf) => acc + buf.length, 0);
	const merged = new Uint8Array(totalLength);
	let offset = 0;
	for (const buffer of buffers) {
		merged.set(buffer, offset);
		offset += buffer.length;
	}
	return merged;
}
/**
* Creates attachment envelope items
*/
function createAttachmentEnvelopeItem(attachment) {
	const buffer = typeof attachment.data === "string" ? encodeUTF8(attachment.data) : attachment.data;
	return [dropUndefinedKeys({
		type: "attachment",
		length: buffer.length,
		filename: attachment.filename,
		content_type: attachment.contentType,
		attachment_type: attachment.attachmentType
	}), buffer];
}
const ITEM_TYPE_TO_DATA_CATEGORY_MAP = {
	session: "session",
	sessions: "session",
	attachment: "attachment",
	transaction: "transaction",
	event: "error",
	client_report: "internal",
	user_report: "default",
	profile: "profile",
	profile_chunk: "profile",
	replay_event: "replay",
	replay_recording: "replay",
	check_in: "monitor",
	feedback: "feedback",
	span: "span",
	statsd: "metric_bucket"
};
/**
* Maps the type of an envelope item to a data category.
*/
function envelopeItemTypeToDataCategory(type) {
	return ITEM_TYPE_TO_DATA_CATEGORY_MAP[type];
}
/** Extracts the minimal SDK info from the metadata or an events */
function getSdkMetadataForEnvelopeHeader(metadataOrEvent) {
	if (!metadataOrEvent || !metadataOrEvent.sdk) return;
	const { name, version } = metadataOrEvent.sdk;
	return {
		name,
		version
	};
}
/**
* Creates event envelope headers, based on event, sdk info and tunnel
* Note: This function was extracted from the core package to make it available in Replay
*/
function createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn) {
	const dynamicSamplingContext = event.sdkProcessingMetadata && event.sdkProcessingMetadata.dynamicSamplingContext;
	return {
		event_id: event.event_id,
		sent_at: (/* @__PURE__ */ new Date()).toISOString(),
		...sdkInfo && { sdk: sdkInfo },
		...!!tunnel && dsn && { dsn: dsnToString(dsn) },
		...dynamicSamplingContext && { trace: dropUndefinedKeys({ ...dynamicSamplingContext }) }
	};
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/ratelimit.js
const DEFAULT_RETRY_AFTER = 60 * 1e3;
/**
* Extracts Retry-After value from the request header or returns default value
* @param header string representation of 'Retry-After' header
* @param now current unix timestamp
*
*/
function parseRetryAfterHeader(header, now = Date.now()) {
	const headerDelay = parseInt(`${header}`, 10);
	if (!isNaN(headerDelay)) return headerDelay * 1e3;
	const headerDate = Date.parse(`${header}`);
	if (!isNaN(headerDate)) return headerDate - now;
	return DEFAULT_RETRY_AFTER;
}
/**
* Gets the time that the given category is disabled until for rate limiting.
* In case no category-specific limit is set but a general rate limit across all categories is active,
* that time is returned.
*
* @return the time in ms that the category is disabled until or 0 if there's no active rate limit.
*/
function disabledUntil(limits, dataCategory) {
	return limits[dataCategory] || limits.all || 0;
}
/**
* Checks if a category is rate limited
*/
function isRateLimited(limits, dataCategory, now = Date.now()) {
	return disabledUntil(limits, dataCategory) > now;
}
/**
* Update ratelimits from incoming headers.
*
* @return the updated RateLimits object.
*/
function updateRateLimits(limits, { statusCode, headers }, now = Date.now()) {
	const updatedRateLimits = { ...limits };
	const rateLimitHeader = headers && headers["x-sentry-rate-limits"];
	const retryAfterHeader = headers && headers["retry-after"];
	if (rateLimitHeader)
 /**
	* rate limit headers are of the form
	*     <header>,<header>,..
	* where each <header> is of the form
	*     <retry_after>: <categories>: <scope>: <reason_code>: <namespaces>
	* where
	*     <retry_after> is a delay in seconds
	*     <categories> is the event type(s) (error, transaction, etc) being rate limited and is of the form
	*         <category>;<category>;...
	*     <scope> is what's being limited (org, project, or key) - ignored by SDK
	*     <reason_code> is an arbitrary string like "org_quota" - ignored by SDK
	*     <namespaces> Semicolon-separated list of metric namespace identifiers. Defines which namespace(s) will be affected.
	*         Only present if rate limit applies to the metric_bucket data category.
	*/
	for (const limit of rateLimitHeader.trim().split(",")) {
		const [retryAfter, categories, , , namespaces] = limit.split(":", 5);
		const headerDelay = parseInt(retryAfter, 10);
		const delay = (!isNaN(headerDelay) ? headerDelay : 60) * 1e3;
		if (!categories) updatedRateLimits.all = now + delay;
		else for (const category of categories.split(";")) if (category === "metric_bucket") {
			if (!namespaces || namespaces.split(";").includes("custom")) updatedRateLimits[category] = now + delay;
		} else updatedRateLimits[category] = now + delay;
	}
	else if (retryAfterHeader) updatedRateLimits.all = now + parseRetryAfterHeader(retryAfterHeader, now);
	else if (statusCode === 429) updatedRateLimits.all = now + 60 * 1e3;
	return updatedRateLimits;
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/eventbuilder.js
/**
* Extracts stack frames from the error.stack string
*/
function parseStackFrames$1(stackParser, error) {
	return stackParser(error.stack || "", 1);
}
/**
* Extracts stack frames from the error and builds a Sentry Exception
*/
function exceptionFromError$1(stackParser, error) {
	const exception = {
		type: error.name || error.constructor.name,
		value: error.message
	};
	const frames = parseStackFrames$1(stackParser, error);
	if (frames.length) exception.stacktrace = { frames };
	return exception;
}
/** If a plain object has a property that is an `Error`, return this error. */
function getErrorPropertyFromObject(obj) {
	for (const prop in obj) if (Object.prototype.hasOwnProperty.call(obj, prop)) {
		const value = obj[prop];
		if (value instanceof Error) return value;
	}
}
function getMessageForObject(exception) {
	if ("name" in exception && typeof exception.name === "string") {
		let message = `'${exception.name}' captured as exception`;
		if ("message" in exception && typeof exception.message === "string") message += ` with message '${exception.message}'`;
		return message;
	} else if ("message" in exception && typeof exception.message === "string") return exception.message;
	const keys = extractExceptionKeysForMessage(exception);
	if (isErrorEvent$1(exception)) return `Event \`ErrorEvent\` captured as exception with message \`${exception.message}\``;
	const className = getObjectClassName(exception);
	return `${className && className !== "Object" ? `'${className}'` : "Object"} captured as exception with keys: ${keys}`;
}
function getObjectClassName(obj) {
	try {
		const prototype = Object.getPrototypeOf(obj);
		return prototype ? prototype.constructor.name : void 0;
	} catch (e) {}
}
function getException(client, mechanism, exception, hint) {
	if (isError(exception)) return [exception, void 0];
	mechanism.synthetic = true;
	if (isPlainObject(exception)) {
		const normalizeDepth = client && client.getOptions().normalizeDepth;
		const extras = { ["__serialized__"]: normalizeToSize(exception, normalizeDepth) };
		const errorFromProp = getErrorPropertyFromObject(exception);
		if (errorFromProp) return [errorFromProp, extras];
		const message = getMessageForObject(exception);
		const ex$1 = hint && hint.syntheticException || new Error(message);
		ex$1.message = message;
		return [ex$1, extras];
	}
	const ex = hint && hint.syntheticException || new Error(exception);
	ex.message = `${exception}`;
	return [ex, void 0];
}
/**
* Builds and Event from a Exception
* @hidden
*/
function eventFromUnknownInput$1(client, stackParser, exception, hint) {
	const mechanism = hint && hint.data && hint.data.mechanism || {
		handled: true,
		type: "generic"
	};
	const [ex, extras] = getException(client, mechanism, exception, hint);
	const event = { exception: { values: [exceptionFromError$1(stackParser, ex)] } };
	if (extras) event.extra = extras;
	addExceptionTypeValue(event, void 0, void 0);
	addExceptionMechanism(event, mechanism);
	return {
		...event,
		event_id: hint && hint.event_id
	};
}
/**
* Builds and Event from a Message
* @hidden
*/
function eventFromMessage$1(stackParser, message, level = "info", hint, attachStacktrace) {
	const event = {
		event_id: hint && hint.event_id,
		level
	};
	if (attachStacktrace && hint && hint.syntheticException) {
		const frames = parseStackFrames$1(stackParser, hint.syntheticException);
		if (frames.length) event.exception = { values: [{
			value: message,
			stacktrace: { frames }
		}] };
	}
	if (isParameterizedString(message)) {
		const { __sentry_template_string__, __sentry_template_values__ } = message;
		event.logentry = {
			message: __sentry_template_string__,
			params: __sentry_template_values__
		};
		return event;
	}
	event.message = message;
	return event;
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+utils@8.9.2/node_modules/@sentry/utils/esm/propagationContext.js
/**
* Returns a new minimal propagation context
*/
function generatePropagationContext() {
	return {
		traceId: uuid4(),
		spanId: uuid4().substring(16)
	};
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/debug-build.js
/**
* This serves as a build time flag that will be true by default, but false in non-debug builds or if users replace `__SENTRY_DEBUG__` in their generated code.
*
* ATTENTION: This constant must never cross package boundaries (i.e. be exported) to guarantee that it can be used for tree shaking.
*/
const DEBUG_BUILD = typeof __SENTRY_DEBUG__ === "undefined" || __SENTRY_DEBUG__;

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/carrier.js
/**
* An object that contains globally accessible properties and maintains a scope stack.
* @hidden
*/
/**
* Returns the global shim registry.
*
* FIXME: This function is problematic, because despite always returning a valid Carrier,
* it has an optional `__SENTRY__` property, which then in turn requires us to always perform an unnecessary check
* at the call-site. We always access the carrier through this function, so we can guarantee that `__SENTRY__` is there.
**/
function getMainCarrier() {
	getSentryCarrier(GLOBAL_OBJ);
	return GLOBAL_OBJ;
}
/** Will either get the existing sentry carrier, or create a new one. */
function getSentryCarrier(carrier) {
	const __SENTRY__ = carrier.__SENTRY__ = carrier.__SENTRY__ || {};
	__SENTRY__.version = __SENTRY__.version || SDK_VERSION;
	return __SENTRY__[SDK_VERSION] = __SENTRY__[SDK_VERSION] || {};
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/session.js
/**
* Updates a session object with the properties passed in the context.
*
* Note that this function mutates the passed object and returns void.
* (Had to do this instead of returning a new and updated session because closing and sending a session
* makes an update to the session after it was passed to the sending logic.
* @see BaseClient.captureSession )
*
* @param session the `Session` to update
* @param context the `SessionContext` holding the properties that should be updated in @param session
*/
function updateSession(session, context = {}) {
	if (context.user) {
		if (!session.ipAddress && context.user.ip_address) session.ipAddress = context.user.ip_address;
		if (!session.did && !context.did) session.did = context.user.id || context.user.email || context.user.username;
	}
	session.timestamp = context.timestamp || timestampInSeconds();
	if (context.abnormal_mechanism) session.abnormal_mechanism = context.abnormal_mechanism;
	if (context.ignoreDuration) session.ignoreDuration = context.ignoreDuration;
	if (context.sid) session.sid = context.sid.length === 32 ? context.sid : uuid4();
	if (context.init !== void 0) session.init = context.init;
	if (!session.did && context.did) session.did = `${context.did}`;
	if (typeof context.started === "number") session.started = context.started;
	if (session.ignoreDuration) session.duration = void 0;
	else if (typeof context.duration === "number") session.duration = context.duration;
	else {
		const duration = session.timestamp - session.started;
		session.duration = duration >= 0 ? duration : 0;
	}
	if (context.release) session.release = context.release;
	if (context.environment) session.environment = context.environment;
	if (!session.ipAddress && context.ipAddress) session.ipAddress = context.ipAddress;
	if (!session.userAgent && context.userAgent) session.userAgent = context.userAgent;
	if (typeof context.errors === "number") session.errors = context.errors;
	if (context.status) session.status = context.status;
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/utils/spanOnScope.js
const SCOPE_SPAN_FIELD = "_sentrySpan";
/**
* Set the active span for a given scope.
* NOTE: This should NOT be used directly, but is only used internally by the trace methods.
*/
function _setSpanForScope(scope, span) {
	if (span) addNonEnumerableProperty(scope, SCOPE_SPAN_FIELD, span);
	else delete scope[SCOPE_SPAN_FIELD];
}
/**
* Get the active span for a given scope.
* NOTE: This should NOT be used directly, but is only used internally by the trace methods.
*/
function _getSpanForScope(scope) {
	return scope[SCOPE_SPAN_FIELD];
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/scope.js
/**
* Default value for maximum number of breadcrumbs added to an event.
*/
const DEFAULT_MAX_BREADCRUMBS = 100;
/**
* Holds additional event information.
*/
var ScopeClass = class ScopeClass {
	/** Flag if notifying is happening. */
	/** Callback for client to receive scope changes. */
	/** Callback list that will be called during event processing. */
	/** Array of breadcrumbs. */
	/** User */
	/** Tags */
	/** Extra */
	/** Contexts */
	/** Attachments */
	/** Propagation Context for distributed tracing */
	/**
	* A place to stash data which is needed at some point in the SDK's event processing pipeline but which shouldn't get
	* sent to Sentry
	*/
	/** Fingerprint */
	/** Severity */
	/**
	* Transaction Name
	*
	* IMPORTANT: The transaction name on the scope has nothing to do with root spans/transaction objects.
	* It's purpose is to assign a transaction to the scope that's added to non-transaction events.
	*/
	/** Session */
	/** Request Mode Session Status */
	/** The client on this scope */
	/** Contains the last event id of a captured event.  */
	constructor() {
		this._notifyingListeners = false;
		this._scopeListeners = [];
		this._eventProcessors = [];
		this._breadcrumbs = [];
		this._attachments = [];
		this._user = {};
		this._tags = {};
		this._extra = {};
		this._contexts = {};
		this._sdkProcessingMetadata = {};
		this._propagationContext = generatePropagationContext();
	}
	/**
	* @inheritDoc
	*/
	clone() {
		const newScope = new ScopeClass();
		newScope._breadcrumbs = [...this._breadcrumbs];
		newScope._tags = { ...this._tags };
		newScope._extra = { ...this._extra };
		newScope._contexts = { ...this._contexts };
		newScope._user = this._user;
		newScope._level = this._level;
		newScope._session = this._session;
		newScope._transactionName = this._transactionName;
		newScope._fingerprint = this._fingerprint;
		newScope._eventProcessors = [...this._eventProcessors];
		newScope._requestSession = this._requestSession;
		newScope._attachments = [...this._attachments];
		newScope._sdkProcessingMetadata = { ...this._sdkProcessingMetadata };
		newScope._propagationContext = { ...this._propagationContext };
		newScope._client = this._client;
		newScope._lastEventId = this._lastEventId;
		_setSpanForScope(newScope, _getSpanForScope(this));
		return newScope;
	}
	/**
	* @inheritDoc
	*/
	setClient(client) {
		this._client = client;
	}
	/**
	* @inheritDoc
	*/
	setLastEventId(lastEventId) {
		this._lastEventId = lastEventId;
	}
	/**
	* @inheritDoc
	*/
	getClient() {
		return this._client;
	}
	/**
	* @inheritDoc
	*/
	lastEventId() {
		return this._lastEventId;
	}
	/**
	* @inheritDoc
	*/
	addScopeListener(callback) {
		this._scopeListeners.push(callback);
	}
	/**
	* @inheritDoc
	*/
	addEventProcessor(callback) {
		this._eventProcessors.push(callback);
		return this;
	}
	/**
	* @inheritDoc
	*/
	setUser(user) {
		this._user = user || {
			email: void 0,
			id: void 0,
			ip_address: void 0,
			username: void 0
		};
		if (this._session) updateSession(this._session, { user });
		this._notifyScopeListeners();
		return this;
	}
	/**
	* @inheritDoc
	*/
	getUser() {
		return this._user;
	}
	/**
	* @inheritDoc
	*/
	getRequestSession() {
		return this._requestSession;
	}
	/**
	* @inheritDoc
	*/
	setRequestSession(requestSession) {
		this._requestSession = requestSession;
		return this;
	}
	/**
	* @inheritDoc
	*/
	setTags(tags) {
		this._tags = {
			...this._tags,
			...tags
		};
		this._notifyScopeListeners();
		return this;
	}
	/**
	* @inheritDoc
	*/
	setTag(key, value) {
		this._tags = {
			...this._tags,
			[key]: value
		};
		this._notifyScopeListeners();
		return this;
	}
	/**
	* @inheritDoc
	*/
	setExtras(extras) {
		this._extra = {
			...this._extra,
			...extras
		};
		this._notifyScopeListeners();
		return this;
	}
	/**
	* @inheritDoc
	*/
	setExtra(key, extra) {
		this._extra = {
			...this._extra,
			[key]: extra
		};
		this._notifyScopeListeners();
		return this;
	}
	/**
	* @inheritDoc
	*/
	setFingerprint(fingerprint) {
		this._fingerprint = fingerprint;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* @inheritDoc
	*/
	setLevel(level) {
		this._level = level;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* @inheritDoc
	*/
	setTransactionName(name) {
		this._transactionName = name;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* @inheritDoc
	*/
	setContext(key, context) {
		if (context === null) delete this._contexts[key];
		else this._contexts[key] = context;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* @inheritDoc
	*/
	setSession(session) {
		if (!session) delete this._session;
		else this._session = session;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* @inheritDoc
	*/
	getSession() {
		return this._session;
	}
	/**
	* @inheritDoc
	*/
	update(captureContext) {
		if (!captureContext) return this;
		const scopeToMerge = typeof captureContext === "function" ? captureContext(this) : captureContext;
		const [scopeInstance, requestSession] = scopeToMerge instanceof Scope ? [scopeToMerge.getScopeData(), scopeToMerge.getRequestSession()] : isPlainObject(scopeToMerge) ? [captureContext, captureContext.requestSession] : [];
		const { tags, extra, user, contexts, level, fingerprint = [], propagationContext } = scopeInstance || {};
		this._tags = {
			...this._tags,
			...tags
		};
		this._extra = {
			...this._extra,
			...extra
		};
		this._contexts = {
			...this._contexts,
			...contexts
		};
		if (user && Object.keys(user).length) this._user = user;
		if (level) this._level = level;
		if (fingerprint.length) this._fingerprint = fingerprint;
		if (propagationContext) this._propagationContext = propagationContext;
		if (requestSession) this._requestSession = requestSession;
		return this;
	}
	/**
	* @inheritDoc
	*/
	clear() {
		this._breadcrumbs = [];
		this._tags = {};
		this._extra = {};
		this._user = {};
		this._contexts = {};
		this._level = void 0;
		this._transactionName = void 0;
		this._fingerprint = void 0;
		this._requestSession = void 0;
		this._session = void 0;
		_setSpanForScope(this, void 0);
		this._attachments = [];
		this._propagationContext = generatePropagationContext();
		this._notifyScopeListeners();
		return this;
	}
	/**
	* @inheritDoc
	*/
	addBreadcrumb(breadcrumb, maxBreadcrumbs) {
		const maxCrumbs = typeof maxBreadcrumbs === "number" ? maxBreadcrumbs : DEFAULT_MAX_BREADCRUMBS;
		if (maxCrumbs <= 0) return this;
		const mergedBreadcrumb = {
			timestamp: dateTimestampInSeconds(),
			...breadcrumb
		};
		const breadcrumbs = this._breadcrumbs;
		breadcrumbs.push(mergedBreadcrumb);
		this._breadcrumbs = breadcrumbs.length > maxCrumbs ? breadcrumbs.slice(-maxCrumbs) : breadcrumbs;
		this._notifyScopeListeners();
		return this;
	}
	/**
	* @inheritDoc
	*/
	getLastBreadcrumb() {
		return this._breadcrumbs[this._breadcrumbs.length - 1];
	}
	/**
	* @inheritDoc
	*/
	clearBreadcrumbs() {
		this._breadcrumbs = [];
		this._notifyScopeListeners();
		return this;
	}
	/**
	* @inheritDoc
	*/
	addAttachment(attachment) {
		this._attachments.push(attachment);
		return this;
	}
	/**
	* @inheritDoc
	*/
	clearAttachments() {
		this._attachments = [];
		return this;
	}
	/** @inheritDoc */
	getScopeData() {
		return {
			breadcrumbs: this._breadcrumbs,
			attachments: this._attachments,
			contexts: this._contexts,
			tags: this._tags,
			extra: this._extra,
			user: this._user,
			level: this._level,
			fingerprint: this._fingerprint || [],
			eventProcessors: this._eventProcessors,
			propagationContext: this._propagationContext,
			sdkProcessingMetadata: this._sdkProcessingMetadata,
			transactionName: this._transactionName,
			span: _getSpanForScope(this)
		};
	}
	/**
	* @inheritDoc
	*/
	setSDKProcessingMetadata(newData) {
		this._sdkProcessingMetadata = {
			...this._sdkProcessingMetadata,
			...newData
		};
		return this;
	}
	/**
	* @inheritDoc
	*/
	setPropagationContext(context) {
		this._propagationContext = context;
		return this;
	}
	/**
	* @inheritDoc
	*/
	getPropagationContext() {
		return this._propagationContext;
	}
	/**
	* @inheritDoc
	*/
	captureException(exception, hint) {
		const eventId = hint && hint.event_id ? hint.event_id : uuid4();
		if (!this._client) {
			logger.warn("No client configured on scope - will not capture exception!");
			return eventId;
		}
		const syntheticException = /* @__PURE__ */ new Error("Sentry syntheticException");
		this._client.captureException(exception, {
			originalException: exception,
			syntheticException,
			...hint,
			event_id: eventId
		}, this);
		return eventId;
	}
	/**
	* @inheritDoc
	*/
	captureMessage(message, level, hint) {
		const eventId = hint && hint.event_id ? hint.event_id : uuid4();
		if (!this._client) {
			logger.warn("No client configured on scope - will not capture message!");
			return eventId;
		}
		const syntheticException = new Error(message);
		this._client.captureMessage(message, level, {
			originalException: message,
			syntheticException,
			...hint,
			event_id: eventId
		}, this);
		return eventId;
	}
	/**
	* @inheritDoc
	*/
	captureEvent(event, hint) {
		const eventId = hint && hint.event_id ? hint.event_id : uuid4();
		if (!this._client) {
			logger.warn("No client configured on scope - will not capture event!");
			return eventId;
		}
		this._client.captureEvent(event, {
			...hint,
			event_id: eventId
		}, this);
		return eventId;
	}
	/**
	* This will be called on every set call.
	*/
	_notifyScopeListeners() {
		if (!this._notifyingListeners) {
			this._notifyingListeners = true;
			this._scopeListeners.forEach((callback) => {
				callback(this);
			});
			this._notifyingListeners = false;
		}
	}
};
/**
* Holds additional event information.
*/
const Scope = ScopeClass;

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/defaultScopes.js
/** Get the default current scope. */
function getDefaultCurrentScope() {
	return getGlobalSingleton("defaultCurrentScope", () => new Scope());
}
/** Get the default isolation scope. */
function getDefaultIsolationScope() {
	return getGlobalSingleton("defaultIsolationScope", () => new Scope());
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/asyncContext/stackStrategy.js
/**
* This is an object that holds a stack of scopes.
*/
var AsyncContextStack = class {
	constructor(scope, isolationScope) {
		let assignedScope;
		if (!scope) assignedScope = new Scope();
		else assignedScope = scope;
		let assignedIsolationScope;
		if (!isolationScope) assignedIsolationScope = new Scope();
		else assignedIsolationScope = isolationScope;
		this._stack = [{ scope: assignedScope }];
		this._isolationScope = assignedIsolationScope;
	}
	/**
	* Fork a scope for the stack.
	*/
	withScope(callback) {
		const scope = this._pushScope();
		let maybePromiseResult;
		try {
			maybePromiseResult = callback(scope);
		} catch (e) {
			this._popScope();
			throw e;
		}
		if (isThenable(maybePromiseResult)) return maybePromiseResult.then((res) => {
			this._popScope();
			return res;
		}, (e) => {
			this._popScope();
			throw e;
		});
		this._popScope();
		return maybePromiseResult;
	}
	/**
	* Get the client of the stack.
	*/
	getClient() {
		return this.getStackTop().client;
	}
	/**
	* Returns the scope of the top stack.
	*/
	getScope() {
		return this.getStackTop().scope;
	}
	/**
	* Get the isolation scope for the stack.
	*/
	getIsolationScope() {
		return this._isolationScope;
	}
	/**
	* Returns the scope stack for domains or the process.
	*/
	getStack() {
		return this._stack;
	}
	/**
	* Returns the topmost scope layer in the order domain > local > process.
	*/
	getStackTop() {
		return this._stack[this._stack.length - 1];
	}
	/**
	* Push a scope to the stack.
	*/
	_pushScope() {
		const scope = this.getScope().clone();
		this.getStack().push({
			client: this.getClient(),
			scope
		});
		return scope;
	}
	/**
	* Pop a scope from the stack.
	*/
	_popScope() {
		if (this.getStack().length <= 1) return false;
		return !!this.getStack().pop();
	}
};
/**
* Get the global async context stack.
* This will be removed during the v8 cycle and is only here to make migration easier.
*/
function getAsyncContextStack() {
	const sentry = getSentryCarrier(getMainCarrier());
	return sentry.stack = sentry.stack || new AsyncContextStack(getDefaultCurrentScope(), getDefaultIsolationScope());
}
function withScope(callback) {
	return getAsyncContextStack().withScope(callback);
}
function withSetScope(scope, callback) {
	const stack = getAsyncContextStack();
	return stack.withScope(() => {
		stack.getStackTop().scope = scope;
		return callback(scope);
	});
}
function withIsolationScope(callback) {
	return getAsyncContextStack().withScope(() => {
		return callback(getAsyncContextStack().getIsolationScope());
	});
}
/**
* Get the stack-based async context strategy.
*/
function getStackAsyncContextStrategy() {
	return {
		withIsolationScope,
		withScope,
		withSetScope,
		withSetIsolationScope: (_isolationScope, callback) => {
			return withIsolationScope(callback);
		},
		getCurrentScope: () => getAsyncContextStack().getScope(),
		getIsolationScope: () => getAsyncContextStack().getIsolationScope()
	};
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/asyncContext/index.js
/**
* Get the current async context strategy.
* If none has been setup, the default will be used.
*/
function getAsyncContextStrategy(carrier) {
	const sentry = getSentryCarrier(carrier);
	if (sentry.acs) return sentry.acs;
	return getStackAsyncContextStrategy();
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/currentScopes.js
/**
* Get the currently active scope.
*/
function getCurrentScope() {
	return getAsyncContextStrategy(getMainCarrier()).getCurrentScope();
}
/**
* Get the currently active isolation scope.
* The isolation scope is active for the current exection context.
*/
function getIsolationScope() {
	return getAsyncContextStrategy(getMainCarrier()).getIsolationScope();
}
/**
* Get the global scope.
* This scope is applied to _all_ events.
*/
function getGlobalScope() {
	return getGlobalSingleton("globalScope", () => new Scope());
}
/**
* Get the currently active client.
*/
function getClient() {
	return getCurrentScope().getClient();
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/metrics/metric-summary.js
/**
* key: bucketKey
* value: [exportKey, MetricSummary]
*/
const METRICS_SPAN_FIELD = "_sentryMetrics";
/**
* Fetches the metric summary if it exists for the passed span
*/
function getMetricSummaryJsonForSpan(span) {
	const storage = span[METRICS_SPAN_FIELD];
	if (!storage) return;
	const output = {};
	for (const [, [exportKey, summary]] of storage) {
		if (!output[exportKey]) output[exportKey] = [];
		output[exportKey].push(dropUndefinedKeys(summary));
	}
	return output;
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/semanticAttributes.js
/**
* Use this attribute to represent the source of a span.
* Should be one of: custom, url, route, view, component, task, unknown
*
*/
const SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = "sentry.source";
/**
* Use this attribute to represent the sample rate used for a span.
*/
const SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE = "sentry.sample_rate";
/**
* Use this attribute to represent the operation of a span.
*/
const SEMANTIC_ATTRIBUTE_SENTRY_OP = "sentry.op";
/**
* Use this attribute to represent the origin of a span.
*/
const SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = "sentry.origin";

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/tracing/spanstatus.js
const SPAN_STATUS_UNSET = 0;
const SPAN_STATUS_OK = 1;
const SPAN_STATUS_ERROR = 2;

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/utils/spanUtils.js
const TRACE_FLAG_SAMPLED = 1;
/**
* Convert a span to a trace context, which can be sent as the `trace` context in a non-transaction event.
*/
function spanToTraceContext(span) {
	const { spanId: span_id, traceId: trace_id } = span.spanContext();
	const { parent_span_id } = spanToJSON(span);
	return dropUndefinedKeys({
		parent_span_id,
		span_id,
		trace_id
	});
}
/**
* Convert a span time input intp a timestamp in seconds.
*/
function spanTimeInputToSeconds(input) {
	if (typeof input === "number") return ensureTimestampInSeconds(input);
	if (Array.isArray(input)) return input[0] + input[1] / 1e9;
	if (input instanceof Date) return ensureTimestampInSeconds(input.getTime());
	return timestampInSeconds();
}
/**
* Converts a timestamp to second, if it was in milliseconds, or keeps it as second.
*/
function ensureTimestampInSeconds(timestamp) {
	return timestamp > 9999999999 ? timestamp / 1e3 : timestamp;
}
/**
* Convert a span to a JSON representation.
*/
function spanToJSON(span) {
	if (spanIsSentrySpan(span)) return span.getSpanJSON();
	try {
		const { spanId: span_id, traceId: trace_id } = span.spanContext();
		if (spanIsOpenTelemetrySdkTraceBaseSpan(span)) {
			const { attributes, startTime, name, endTime, parentSpanId, status } = span;
			return dropUndefinedKeys({
				span_id,
				trace_id,
				data: attributes,
				description: name,
				parent_span_id: parentSpanId,
				start_timestamp: spanTimeInputToSeconds(startTime),
				timestamp: spanTimeInputToSeconds(endTime) || void 0,
				status: getStatusMessage(status),
				op: attributes[SEMANTIC_ATTRIBUTE_SENTRY_OP],
				origin: attributes[SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN],
				_metrics_summary: getMetricSummaryJsonForSpan(span)
			});
		}
		return {
			span_id,
			trace_id
		};
	} catch (e) {
		return {};
	}
}
function spanIsOpenTelemetrySdkTraceBaseSpan(span) {
	const castSpan = span;
	return !!castSpan.attributes && !!castSpan.startTime && !!castSpan.name && !!castSpan.endTime && !!castSpan.status;
}
/** Exported only for tests. */
/**
* Sadly, due to circular dependency checks we cannot actually import the Span class here and check for instanceof.
* :( So instead we approximate this by checking if it has the `getSpanJSON` method.
*/
function spanIsSentrySpan(span) {
	return typeof span.getSpanJSON === "function";
}
/**
* Returns true if a span is sampled.
* In most cases, you should just use `span.isRecording()` instead.
* However, this has a slightly different semantic, as it also returns false if the span is finished.
* So in the case where this distinction is important, use this method.
*/
function spanIsSampled(span) {
	const { traceFlags } = span.spanContext();
	return traceFlags === TRACE_FLAG_SAMPLED;
}
/** Get the status message to use for a JSON representation of a span. */
function getStatusMessage(status) {
	if (!status || status.code === SPAN_STATUS_UNSET) return;
	if (status.code === SPAN_STATUS_OK) return "ok";
	return status.message || "unknown_error";
}
const ROOT_SPAN_FIELD = "_sentryRootSpan";
/**
* Returns the root span of a given span.
*/
function getRootSpan(span) {
	return span[ROOT_SPAN_FIELD] || span;
}
/**
* Returns the currently active span.
*/
function getActiveSpan() {
	const acs = getAsyncContextStrategy(getMainCarrier());
	if (acs.getActiveSpan) return acs.getActiveSpan();
	return _getSpanForScope(getCurrentScope());
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/tracing/errors.js
let errorsInstrumented = false;
/**
* Ensure that global errors automatically set the active span status.
*/
function registerSpanErrorInstrumentation() {
	if (errorsInstrumented) return;
	errorsInstrumented = true;
	addGlobalErrorInstrumentationHandler(errorCallback);
	addGlobalUnhandledRejectionInstrumentationHandler(errorCallback);
}
/**
* If an error or unhandled promise occurs, we mark the active root span as failed
*/
function errorCallback() {
	const activeSpan = getActiveSpan();
	const rootSpan = activeSpan && getRootSpan(activeSpan);
	if (rootSpan) {
		const message = "internal_error";
		DEBUG_BUILD && logger.log(`[Tracing] Root span: ${message} -> Global error occured`);
		rootSpan.setStatus({
			code: SPAN_STATUS_ERROR,
			message
		});
	}
}
errorCallback.tag = "sentry_tracingErrorCallback";

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/constants.js
const DEFAULT_ENVIRONMENT = "production";

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/tracing/dynamicSamplingContext.js
/**
* If you change this value, also update the terser plugin config to
* avoid minification of the object property!
*/
const FROZEN_DSC_FIELD = "_frozenDsc";
/**
* Creates a dynamic sampling context from a client.
*
* Dispatches the `createDsc` lifecycle hook as a side effect.
*/
function getDynamicSamplingContextFromClient(trace_id, client) {
	const options = client.getOptions();
	const { publicKey: public_key } = client.getDsn() || {};
	const dsc = dropUndefinedKeys({
		environment: options.environment || DEFAULT_ENVIRONMENT,
		release: options.release,
		public_key,
		trace_id
	});
	client.emit("createDsc", dsc);
	return dsc;
}
/**
* Creates a dynamic sampling context from a span (and client and scope)
*
* @param span the span from which a few values like the root span name and sample rate are extracted.
*
* @returns a dynamic sampling context
*/
function getDynamicSamplingContextFromSpan(span) {
	const client = getClient();
	if (!client) return {};
	const dsc = getDynamicSamplingContextFromClient(spanToJSON(span).trace_id || "", client);
	const rootSpan = getRootSpan(span);
	if (!rootSpan) return dsc;
	const frozenDsc = rootSpan[FROZEN_DSC_FIELD];
	if (frozenDsc) return frozenDsc;
	const jsonSpan = spanToJSON(rootSpan);
	const attributes = jsonSpan.data || {};
	const maybeSampleRate = attributes[SEMANTIC_ATTRIBUTE_SENTRY_SAMPLE_RATE];
	if (maybeSampleRate != null) dsc.sample_rate = `${maybeSampleRate}`;
	const source = attributes[SEMANTIC_ATTRIBUTE_SENTRY_SOURCE];
	if (source && source !== "url") dsc.transaction = jsonSpan.description;
	dsc.sampled = String(spanIsSampled(rootSpan));
	client.emit("createDsc", dsc);
	return dsc;
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/utils/parseSampleRate.js
/**
* Parse a sample rate from a given value.
* This will either return a boolean or number sample rate, if the sample rate is valid (between 0 and 1).
* If a string is passed, we try to convert it to a number.
*
* Any invalid sample rate will return `undefined`.
*/
function parseSampleRate(sampleRate) {
	if (typeof sampleRate === "boolean") return Number(sampleRate);
	const rate = typeof sampleRate === "string" ? parseFloat(sampleRate) : sampleRate;
	if (typeof rate !== "number" || isNaN(rate) || rate < 0 || rate > 1) {
		DEBUG_BUILD && logger.warn(`[Tracing] Given sample rate is invalid. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(sampleRate)} of type ${JSON.stringify(typeof sampleRate)}.`);
		return;
	}
	return rate;
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/envelope.js
/**
* Apply SdkInfo (name, version, packages, integrations) to the corresponding event key.
* Merge with existing data if any.
**/
function enhanceEventWithSdkInfo(event, sdkInfo) {
	if (!sdkInfo) return event;
	event.sdk = event.sdk || {};
	event.sdk.name = event.sdk.name || sdkInfo.name;
	event.sdk.version = event.sdk.version || sdkInfo.version;
	event.sdk.integrations = [...event.sdk.integrations || [], ...sdkInfo.integrations || []];
	event.sdk.packages = [...event.sdk.packages || [], ...sdkInfo.packages || []];
	return event;
}
/** Creates an envelope from a Session */
function createSessionEnvelope(session, dsn, metadata, tunnel) {
	const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
	return createEnvelope({
		sent_at: (/* @__PURE__ */ new Date()).toISOString(),
		...sdkInfo && { sdk: sdkInfo },
		...!!tunnel && dsn && { dsn: dsnToString(dsn) }
	}, ["aggregates" in session ? [{ type: "sessions" }, session] : [{ type: "session" }, session.toJSON()]]);
}
/**
* Create an Envelope from an event.
*/
function createEventEnvelope(event, dsn, metadata, tunnel) {
	const sdkInfo = getSdkMetadataForEnvelopeHeader(metadata);
	const eventType = event.type && event.type !== "replay_event" ? event.type : "event";
	enhanceEventWithSdkInfo(event, metadata && metadata.sdk);
	const envelopeHeaders = createEventEnvelopeHeaders(event, sdkInfo, tunnel, dsn);
	delete event.sdkProcessingMetadata;
	return createEnvelope(envelopeHeaders, [[{ type: eventType }, event]]);
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/eventProcessors.js
/**
* Process an array of event processors, returning the processed event (or `null` if the event was dropped).
*/
function notifyEventProcessors(processors, event, hint, index = 0) {
	return new SyncPromise((resolve$1, reject) => {
		const processor = processors[index];
		if (event === null || typeof processor !== "function") resolve$1(event);
		else {
			const result = processor({ ...event }, hint);
			DEBUG_BUILD && processor.id && result === null && logger.log(`Event processor "${processor.id}" dropped event`);
			if (isThenable(result)) result.then((final) => notifyEventProcessors(processors, final, hint, index + 1).then(resolve$1)).then(null, reject);
			else notifyEventProcessors(processors, result, hint, index + 1).then(resolve$1).then(null, reject);
		}
	});
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/utils/applyScopeDataToEvent.js
/**
* Applies data from the scope to the event and runs all event processors on it.
*/
function applyScopeDataToEvent(event, data) {
	const { fingerprint, span, breadcrumbs, sdkProcessingMetadata } = data;
	applyDataToEvent(event, data);
	if (span) applySpanToEvent(event, span);
	applyFingerprintToEvent(event, fingerprint);
	applyBreadcrumbsToEvent(event, breadcrumbs);
	applySdkMetadataToEvent(event, sdkProcessingMetadata);
}
/** Merge data of two scopes together. */
function mergeScopeData(data, mergeData) {
	const { extra, tags, user, contexts, level, sdkProcessingMetadata, breadcrumbs, fingerprint, eventProcessors, attachments, propagationContext, transactionName, span } = mergeData;
	mergeAndOverwriteScopeData(data, "extra", extra);
	mergeAndOverwriteScopeData(data, "tags", tags);
	mergeAndOverwriteScopeData(data, "user", user);
	mergeAndOverwriteScopeData(data, "contexts", contexts);
	mergeAndOverwriteScopeData(data, "sdkProcessingMetadata", sdkProcessingMetadata);
	if (level) data.level = level;
	if (transactionName) data.transactionName = transactionName;
	if (span) data.span = span;
	if (breadcrumbs.length) data.breadcrumbs = [...data.breadcrumbs, ...breadcrumbs];
	if (fingerprint.length) data.fingerprint = [...data.fingerprint, ...fingerprint];
	if (eventProcessors.length) data.eventProcessors = [...data.eventProcessors, ...eventProcessors];
	if (attachments.length) data.attachments = [...data.attachments, ...attachments];
	data.propagationContext = {
		...data.propagationContext,
		...propagationContext
	};
}
/**
* Merges certain scope data. Undefined values will overwrite any existing values.
* Exported only for tests.
*/
function mergeAndOverwriteScopeData(data, prop, mergeVal) {
	if (mergeVal && Object.keys(mergeVal).length) {
		data[prop] = { ...data[prop] };
		for (const key in mergeVal) if (Object.prototype.hasOwnProperty.call(mergeVal, key)) data[prop][key] = mergeVal[key];
	}
}
function applyDataToEvent(event, data) {
	const { extra, tags, user, contexts, level, transactionName } = data;
	const cleanedExtra = dropUndefinedKeys(extra);
	if (cleanedExtra && Object.keys(cleanedExtra).length) event.extra = {
		...cleanedExtra,
		...event.extra
	};
	const cleanedTags = dropUndefinedKeys(tags);
	if (cleanedTags && Object.keys(cleanedTags).length) event.tags = {
		...cleanedTags,
		...event.tags
	};
	const cleanedUser = dropUndefinedKeys(user);
	if (cleanedUser && Object.keys(cleanedUser).length) event.user = {
		...cleanedUser,
		...event.user
	};
	const cleanedContexts = dropUndefinedKeys(contexts);
	if (cleanedContexts && Object.keys(cleanedContexts).length) event.contexts = {
		...cleanedContexts,
		...event.contexts
	};
	if (level) event.level = level;
	if (transactionName && event.type !== "transaction") event.transaction = transactionName;
}
function applyBreadcrumbsToEvent(event, breadcrumbs) {
	const mergedBreadcrumbs = [...event.breadcrumbs || [], ...breadcrumbs];
	event.breadcrumbs = mergedBreadcrumbs.length ? mergedBreadcrumbs : void 0;
}
function applySdkMetadataToEvent(event, sdkProcessingMetadata) {
	event.sdkProcessingMetadata = {
		...event.sdkProcessingMetadata,
		...sdkProcessingMetadata
	};
}
function applySpanToEvent(event, span) {
	event.contexts = {
		trace: spanToTraceContext(span),
		...event.contexts
	};
	event.sdkProcessingMetadata = {
		dynamicSamplingContext: getDynamicSamplingContextFromSpan(span),
		...event.sdkProcessingMetadata
	};
	const transactionName = spanToJSON(getRootSpan(span)).description;
	if (transactionName && !event.transaction && event.type === "transaction") event.transaction = transactionName;
}
/**
* Applies fingerprint from the scope to the event if there's one,
* uses message if there's one instead or get rid of empty fingerprint
*/
function applyFingerprintToEvent(event, fingerprint) {
	event.fingerprint = event.fingerprint ? arrayify(event.fingerprint) : [];
	if (fingerprint) event.fingerprint = event.fingerprint.concat(fingerprint);
	if (event.fingerprint && !event.fingerprint.length) delete event.fingerprint;
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/utils/prepareEvent.js
/**
* This type makes sure that we get either a CaptureContext, OR an EventHint.
* It does not allow mixing them, which could lead to unexpected outcomes, e.g. this is disallowed:
* { user: { id: '123' }, mechanism: { handled: false } }
*/
/**
* Adds common information to events.
*
* The information includes release and environment from `options`,
* breadcrumbs and context (extra, tags and user) from the scope.
*
* Information that is already present in the event is never overwritten. For
* nested objects, such as the context, keys are merged.
*
* @param event The original event.
* @param hint May contain additional information about the original exception.
* @param scope A scope containing event metadata.
* @returns A new event with more information.
* @hidden
*/
function prepareEvent(options, event, hint, scope, client, isolationScope) {
	const { normalizeDepth = 3, normalizeMaxBreadth = 1e3 } = options;
	const prepared = {
		...event,
		event_id: event.event_id || hint.event_id || uuid4(),
		timestamp: event.timestamp || dateTimestampInSeconds()
	};
	const integrations = hint.integrations || options.integrations.map((i) => i.name);
	applyClientOptions(prepared, options);
	applyIntegrationsMetadata(prepared, integrations);
	if (event.type === void 0) applyDebugIds(prepared, options.stackParser);
	const finalScope = getFinalScope(scope, hint.captureContext);
	if (hint.mechanism) addExceptionMechanism(prepared, hint.mechanism);
	const clientEventProcessors = client ? client.getEventProcessors() : [];
	const data = getGlobalScope().getScopeData();
	if (isolationScope) mergeScopeData(data, isolationScope.getScopeData());
	if (finalScope) mergeScopeData(data, finalScope.getScopeData());
	const attachments = [...hint.attachments || [], ...data.attachments];
	if (attachments.length) hint.attachments = attachments;
	applyScopeDataToEvent(prepared, data);
	return notifyEventProcessors([...clientEventProcessors, ...data.eventProcessors], prepared, hint).then((evt) => {
		if (evt) applyDebugMeta(evt);
		if (typeof normalizeDepth === "number" && normalizeDepth > 0) return normalizeEvent(evt, normalizeDepth, normalizeMaxBreadth);
		return evt;
	});
}
/**
*  Enhances event using the client configuration.
*  It takes care of all "static" values like environment, release and `dist`,
*  as well as truncating overly long values.
* @param event event instance to be enhanced
*/
function applyClientOptions(event, options) {
	const { environment, release, dist, maxValueLength = 250 } = options;
	if (!("environment" in event)) event.environment = "environment" in options ? environment : DEFAULT_ENVIRONMENT;
	if (event.release === void 0 && release !== void 0) event.release = release;
	if (event.dist === void 0 && dist !== void 0) event.dist = dist;
	if (event.message) event.message = truncate(event.message, maxValueLength);
	const exception = event.exception && event.exception.values && event.exception.values[0];
	if (exception && exception.value) exception.value = truncate(exception.value, maxValueLength);
	const request = event.request;
	if (request && request.url) request.url = truncate(request.url, maxValueLength);
}
const debugIdStackParserCache = /* @__PURE__ */ new WeakMap();
/**
* Puts debug IDs into the stack frames of an error event.
*/
function applyDebugIds(event, stackParser) {
	const debugIdMap = GLOBAL_OBJ._sentryDebugIds;
	if (!debugIdMap) return;
	let debugIdStackFramesCache;
	const cachedDebugIdStackFrameCache = debugIdStackParserCache.get(stackParser);
	if (cachedDebugIdStackFrameCache) debugIdStackFramesCache = cachedDebugIdStackFrameCache;
	else {
		debugIdStackFramesCache = /* @__PURE__ */ new Map();
		debugIdStackParserCache.set(stackParser, debugIdStackFramesCache);
	}
	const filenameDebugIdMap = Object.keys(debugIdMap).reduce((acc, debugIdStackTrace) => {
		let parsedStack;
		const cachedParsedStack = debugIdStackFramesCache.get(debugIdStackTrace);
		if (cachedParsedStack) parsedStack = cachedParsedStack;
		else {
			parsedStack = stackParser(debugIdStackTrace);
			debugIdStackFramesCache.set(debugIdStackTrace, parsedStack);
		}
		for (let i = parsedStack.length - 1; i >= 0; i--) {
			const stackFrame = parsedStack[i];
			if (stackFrame.filename) {
				acc[stackFrame.filename] = debugIdMap[debugIdStackTrace];
				break;
			}
		}
		return acc;
	}, {});
	try {
		event.exception.values.forEach((exception) => {
			exception.stacktrace.frames.forEach((frame) => {
				if (frame.filename) frame.debug_id = filenameDebugIdMap[frame.filename];
			});
		});
	} catch (e) {}
}
/**
* Moves debug IDs from the stack frames of an error event into the debug_meta field.
*/
function applyDebugMeta(event) {
	const filenameDebugIdMap = {};
	try {
		event.exception.values.forEach((exception) => {
			exception.stacktrace.frames.forEach((frame) => {
				if (frame.debug_id) {
					if (frame.abs_path) filenameDebugIdMap[frame.abs_path] = frame.debug_id;
					else if (frame.filename) filenameDebugIdMap[frame.filename] = frame.debug_id;
					delete frame.debug_id;
				}
			});
		});
	} catch (e) {}
	if (Object.keys(filenameDebugIdMap).length === 0) return;
	event.debug_meta = event.debug_meta || {};
	event.debug_meta.images = event.debug_meta.images || [];
	const images = event.debug_meta.images;
	Object.keys(filenameDebugIdMap).forEach((filename) => {
		images.push({
			type: "sourcemap",
			code_file: filename,
			debug_id: filenameDebugIdMap[filename]
		});
	});
}
/**
* This function adds all used integrations to the SDK info in the event.
* @param event The event that will be filled with all integrations.
*/
function applyIntegrationsMetadata(event, integrationNames) {
	if (integrationNames.length > 0) {
		event.sdk = event.sdk || {};
		event.sdk.integrations = [...event.sdk.integrations || [], ...integrationNames];
	}
}
/**
* Applies `normalize` function on necessary `Event` attributes to make them safe for serialization.
* Normalized keys:
* - `breadcrumbs.data`
* - `user`
* - `contexts`
* - `extra`
* @param event Event
* @returns Normalized event
*/
function normalizeEvent(event, depth, maxBreadth) {
	if (!event) return null;
	const normalized = {
		...event,
		...event.breadcrumbs && { breadcrumbs: event.breadcrumbs.map((b) => ({
			...b,
			...b.data && { data: normalize(b.data, depth, maxBreadth) }
		})) },
		...event.user && { user: normalize(event.user, depth, maxBreadth) },
		...event.contexts && { contexts: normalize(event.contexts, depth, maxBreadth) },
		...event.extra && { extra: normalize(event.extra, depth, maxBreadth) }
	};
	if (event.contexts && event.contexts.trace && normalized.contexts) {
		normalized.contexts.trace = event.contexts.trace;
		if (event.contexts.trace.data) normalized.contexts.trace.data = normalize(event.contexts.trace.data, depth, maxBreadth);
	}
	if (event.spans) normalized.spans = event.spans.map((span) => {
		return {
			...span,
			...span.data && { data: normalize(span.data, depth, maxBreadth) }
		};
	});
	return normalized;
}
function getFinalScope(scope, captureContext) {
	if (!captureContext) return scope;
	const finalScope = scope ? scope.clone() : new Scope();
	finalScope.update(captureContext);
	return finalScope;
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/sessionflusher.js
/**
* @inheritdoc
*/
var SessionFlusher = class {
	constructor(client, attrs) {
		this._client = client;
		this.flushTimeout = 60;
		this._pendingAggregates = {};
		this._isEnabled = true;
		this._intervalId = setInterval(() => this.flush(), this.flushTimeout * 1e3);
		if (this._intervalId.unref) this._intervalId.unref();
		this._sessionAttrs = attrs;
	}
	/** Checks if `pendingAggregates` has entries, and if it does flushes them by calling `sendSession` */
	flush() {
		const sessionAggregates = this.getSessionAggregates();
		if (sessionAggregates.aggregates.length === 0) return;
		this._pendingAggregates = {};
		this._client.sendSession(sessionAggregates);
	}
	/** Massages the entries in `pendingAggregates` and returns aggregated sessions */
	getSessionAggregates() {
		const aggregates = Object.keys(this._pendingAggregates).map((key) => {
			return this._pendingAggregates[parseInt(key)];
		});
		return dropUndefinedKeys({
			attrs: this._sessionAttrs,
			aggregates
		});
	}
	/** JSDoc */
	close() {
		clearInterval(this._intervalId);
		this._isEnabled = false;
		this.flush();
	}
	/**
	* Wrapper function for _incrementSessionStatusCount that checks if the instance of SessionFlusher is enabled then
	* fetches the session status of the request from `Scope.getRequestSession().status` on the scope and passes them to
	* `_incrementSessionStatusCount` along with the start date
	*/
	incrementSessionStatusCount() {
		if (!this._isEnabled) return;
		const isolationScope = getIsolationScope();
		const requestSession = isolationScope.getRequestSession();
		if (requestSession && requestSession.status) {
			this._incrementSessionStatusCount(requestSession.status, /* @__PURE__ */ new Date());
			isolationScope.setRequestSession(void 0);
		}
	}
	/**
	* Increments status bucket in pendingAggregates buffer (internal state) corresponding to status of
	* the session received
	*/
	_incrementSessionStatusCount(status, date) {
		const sessionStartedTrunc = new Date(date).setSeconds(0, 0);
		this._pendingAggregates[sessionStartedTrunc] = this._pendingAggregates[sessionStartedTrunc] || {};
		const aggregationCounts = this._pendingAggregates[sessionStartedTrunc];
		if (!aggregationCounts.started) aggregationCounts.started = new Date(sessionStartedTrunc).toISOString();
		switch (status) {
			case "errored":
				aggregationCounts.errored = (aggregationCounts.errored || 0) + 1;
				return aggregationCounts.errored;
			case "ok":
				aggregationCounts.exited = (aggregationCounts.exited || 0) + 1;
				return aggregationCounts.exited;
			default:
				aggregationCounts.crashed = (aggregationCounts.crashed || 0) + 1;
				return aggregationCounts.crashed;
		}
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/api.js
const SENTRY_API_VERSION = "7";
/** Returns the prefix to construct Sentry ingestion API endpoints. */
function getBaseApiEndpoint(dsn) {
	const protocol = dsn.protocol ? `${dsn.protocol}:` : "";
	const port = dsn.port ? `:${dsn.port}` : "";
	return `${protocol}//${dsn.host}${port}${dsn.path ? `/${dsn.path}` : ""}/api/`;
}
/** Returns the ingest API endpoint for target. */
function _getIngestEndpoint(dsn) {
	return `${getBaseApiEndpoint(dsn)}${dsn.projectId}/envelope/`;
}
/** Returns a URL-encoded string with auth config suitable for a query string. */
function _encodedAuth(dsn, sdkInfo) {
	return urlEncode({
		sentry_key: dsn.publicKey,
		sentry_version: SENTRY_API_VERSION,
		...sdkInfo && { sentry_client: `${sdkInfo.name}/${sdkInfo.version}` }
	});
}
/**
* Returns the envelope endpoint URL with auth in the query string.
*
* Sending auth as part of the query string and not as custom HTTP headers avoids CORS preflight requests.
*/
function getEnvelopeEndpointWithUrlEncodedAuth(dsn, tunnel, sdkInfo) {
	return tunnel ? tunnel : `${_getIngestEndpoint(dsn)}?${_encodedAuth(dsn, sdkInfo)}`;
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/integration.js
const installedIntegrations = [];
/** Map of integrations assigned to a client */
/**
* Remove duplicates from the given array, preferring the last instance of any duplicate. Not guaranteed to
* preseve the order of integrations in the array.
*
* @private
*/
function filterDuplicates(integrations) {
	const integrationsByName = {};
	integrations.forEach((currentInstance) => {
		const { name } = currentInstance;
		const existingInstance = integrationsByName[name];
		if (existingInstance && !existingInstance.isDefaultInstance && currentInstance.isDefaultInstance) return;
		integrationsByName[name] = currentInstance;
	});
	return Object.keys(integrationsByName).map((k) => integrationsByName[k]);
}
/** Gets integrations to install */
function getIntegrationsToSetup(options) {
	const defaultIntegrations = options.defaultIntegrations || [];
	const userIntegrations = options.integrations;
	defaultIntegrations.forEach((integration) => {
		integration.isDefaultInstance = true;
	});
	let integrations;
	if (Array.isArray(userIntegrations)) integrations = [...defaultIntegrations, ...userIntegrations];
	else if (typeof userIntegrations === "function") integrations = arrayify(userIntegrations(defaultIntegrations));
	else integrations = defaultIntegrations;
	const finalIntegrations = filterDuplicates(integrations);
	const debugIndex = findIndex(finalIntegrations, (integration) => integration.name === "Debug");
	if (debugIndex !== -1) {
		const [debugInstance] = finalIntegrations.splice(debugIndex, 1);
		finalIntegrations.push(debugInstance);
	}
	return finalIntegrations;
}
/**
* Given a list of integration instances this installs them all. When `withDefaults` is set to `true` then all default
* integrations are added unless they were already provided before.
* @param integrations array of integration instances
* @param withDefault should enable default integrations
*/
function setupIntegrations$1(client, integrations) {
	const integrationIndex = {};
	integrations.forEach((integration) => {
		if (integration) setupIntegration(client, integration, integrationIndex);
	});
	return integrationIndex;
}
/**
* Execute the `afterAllSetup` hooks of the given integrations.
*/
function afterSetupIntegrations(client, integrations) {
	for (const integration of integrations) if (integration && integration.afterAllSetup) integration.afterAllSetup(client);
}
/** Setup a single integration.  */
function setupIntegration(client, integration, integrationIndex) {
	if (integrationIndex[integration.name]) {
		DEBUG_BUILD && logger.log(`Integration skipped because it was already installed: ${integration.name}`);
		return;
	}
	integrationIndex[integration.name] = integration;
	if (installedIntegrations.indexOf(integration.name) === -1 && typeof integration.setupOnce === "function") {
		integration.setupOnce();
		installedIntegrations.push(integration.name);
	}
	if (integration.setup && typeof integration.setup === "function") integration.setup(client);
	if (typeof integration.preprocessEvent === "function") {
		const callback = integration.preprocessEvent.bind(integration);
		client.on("preprocessEvent", (event, hint) => callback(event, hint, client));
	}
	if (typeof integration.processEvent === "function") {
		const callback = integration.processEvent.bind(integration);
		const processor = Object.assign((event, hint) => callback(event, hint, client), { id: integration.name });
		client.addEventProcessor(processor);
	}
	DEBUG_BUILD && logger.log(`Integration installed: ${integration.name}`);
}
function findIndex(arr, callback) {
	for (let i = 0; i < arr.length; i++) if (callback(arr[i]) === true) return i;
	return -1;
}
/**
* Define an integration function that can be used to create an integration instance.
* Note that this by design hides the implementation details of the integration, as they are considered internal.
*/
function defineIntegration(fn) {
	return fn;
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/baseclient.js
const ALREADY_SEEN_ERROR = "Not capturing exception because it's already been captured.";
/**
* Base implementation for all JavaScript SDK clients.
*
* Call the constructor with the corresponding options
* specific to the client subclass. To access these options later, use
* {@link Client.getOptions}.
*
* If a Dsn is specified in the options, it will be parsed and stored. Use
* {@link Client.getDsn} to retrieve the Dsn at any moment. In case the Dsn is
* invalid, the constructor will throw a {@link SentryException}. Note that
* without a valid Dsn, the SDK will not send any events to Sentry.
*
* Before sending an event, it is passed through
* {@link BaseClient._prepareEvent} to add SDK information and scope data
* (breadcrumbs and context). To add more custom information, override this
* method and extend the resulting prepared event.
*
* To issue automatically created events (e.g. via instrumentation), use
* {@link Client.captureEvent}. It will prepare the event and pass it through
* the callback lifecycle. To issue auto-breadcrumbs, use
* {@link Client.addBreadcrumb}.
*
* @example
* class NodeClient extends BaseClient<NodeOptions> {
*   public constructor(options: NodeOptions) {
*     super(options);
*   }
*
*   // ...
* }
*/
var BaseClient = class {
	/** Options passed to the SDK. */
	/** The client Dsn, if specified in options. Without this Dsn, the SDK will be disabled. */
	/** Array of set up integrations. */
	/** Number of calls being processed */
	/** Holds flushable  */
	/**
	* Initializes this client instance.
	*
	* @param options Options for the client.
	*/
	constructor(options) {
		this._options = options;
		this._integrations = {};
		this._numProcessing = 0;
		this._outcomes = {};
		this._hooks = {};
		this._eventProcessors = [];
		if (options.dsn) this._dsn = makeDsn(options.dsn);
		else DEBUG_BUILD && logger.warn("No DSN provided, client will not send events.");
		if (this._dsn) {
			const url = getEnvelopeEndpointWithUrlEncodedAuth(this._dsn, options.tunnel, options._metadata ? options._metadata.sdk : void 0);
			this._transport = options.transport({
				tunnel: this._options.tunnel,
				recordDroppedEvent: this.recordDroppedEvent.bind(this),
				...options.transportOptions,
				url
			});
		}
	}
	/**
	* @inheritDoc
	*/
	captureException(exception, hint, scope) {
		const eventId = uuid4();
		if (checkOrSetAlreadyCaught(exception)) {
			DEBUG_BUILD && logger.log(ALREADY_SEEN_ERROR);
			return eventId;
		}
		const hintWithEventId = {
			event_id: eventId,
			...hint
		};
		this._process(this.eventFromException(exception, hintWithEventId).then((event) => this._captureEvent(event, hintWithEventId, scope)));
		return hintWithEventId.event_id;
	}
	/**
	* @inheritDoc
	*/
	captureMessage(message, level, hint, currentScope) {
		const hintWithEventId = {
			event_id: uuid4(),
			...hint
		};
		const eventMessage = isParameterizedString(message) ? message : String(message);
		const promisedEvent = isPrimitive(message) ? this.eventFromMessage(eventMessage, level, hintWithEventId) : this.eventFromException(message, hintWithEventId);
		this._process(promisedEvent.then((event) => this._captureEvent(event, hintWithEventId, currentScope)));
		return hintWithEventId.event_id;
	}
	/**
	* @inheritDoc
	*/
	captureEvent(event, hint, currentScope) {
		const eventId = uuid4();
		if (hint && hint.originalException && checkOrSetAlreadyCaught(hint.originalException)) {
			DEBUG_BUILD && logger.log(ALREADY_SEEN_ERROR);
			return eventId;
		}
		const hintWithEventId = {
			event_id: eventId,
			...hint
		};
		const capturedSpanScope = (event.sdkProcessingMetadata || {}).capturedSpanScope;
		this._process(this._captureEvent(event, hintWithEventId, capturedSpanScope || currentScope));
		return hintWithEventId.event_id;
	}
	/**
	* @inheritDoc
	*/
	captureSession(session) {
		if (!(typeof session.release === "string")) DEBUG_BUILD && logger.warn("Discarded session because of missing or non-string release");
		else {
			this.sendSession(session);
			updateSession(session, { init: false });
		}
	}
	/**
	* @inheritDoc
	*/
	getDsn() {
		return this._dsn;
	}
	/**
	* @inheritDoc
	*/
	getOptions() {
		return this._options;
	}
	/**
	* @see SdkMetadata in @sentry/types
	*
	* @return The metadata of the SDK
	*/
	getSdkMetadata() {
		return this._options._metadata;
	}
	/**
	* @inheritDoc
	*/
	getTransport() {
		return this._transport;
	}
	/**
	* @inheritDoc
	*/
	flush(timeout) {
		const transport = this._transport;
		if (transport) {
			this.emit("flush");
			return this._isClientDoneProcessing(timeout).then((clientFinished) => {
				return transport.flush(timeout).then((transportFlushed) => clientFinished && transportFlushed);
			});
		} else return resolvedSyncPromise(true);
	}
	/**
	* @inheritDoc
	*/
	close(timeout) {
		return this.flush(timeout).then((result) => {
			this.getOptions().enabled = false;
			this.emit("close");
			return result;
		});
	}
	/** Get all installed event processors. */
	getEventProcessors() {
		return this._eventProcessors;
	}
	/** @inheritDoc */
	addEventProcessor(eventProcessor) {
		this._eventProcessors.push(eventProcessor);
	}
	/** @inheritdoc */
	init() {
		if (this._isEnabled()) this._setupIntegrations();
	}
	/**
	* Gets an installed integration by its name.
	*
	* @returns The installed integration or `undefined` if no integration with that `name` was installed.
	*/
	getIntegrationByName(integrationName) {
		return this._integrations[integrationName];
	}
	/**
	* @inheritDoc
	*/
	addIntegration(integration) {
		const isAlreadyInstalled = this._integrations[integration.name];
		setupIntegration(this, integration, this._integrations);
		if (!isAlreadyInstalled) afterSetupIntegrations(this, [integration]);
	}
	/**
	* @inheritDoc
	*/
	sendEvent(event, hint = {}) {
		this.emit("beforeSendEvent", event, hint);
		let env = createEventEnvelope(event, this._dsn, this._options._metadata, this._options.tunnel);
		for (const attachment of hint.attachments || []) env = addItemToEnvelope(env, createAttachmentEnvelopeItem(attachment));
		const promise = this.sendEnvelope(env);
		if (promise) promise.then((sendResponse) => this.emit("afterSendEvent", event, sendResponse), null);
	}
	/**
	* @inheritDoc
	*/
	sendSession(session) {
		const env = createSessionEnvelope(session, this._dsn, this._options._metadata, this._options.tunnel);
		this.sendEnvelope(env);
	}
	/**
	* @inheritDoc
	*/
	recordDroppedEvent(reason, category, _event) {
		if (this._options.sendClientReports) {
			const key = `${reason}:${category}`;
			DEBUG_BUILD && logger.log(`Adding outcome: "${key}"`);
			this._outcomes[key] = this._outcomes[key] + 1 || 1;
		}
	}
	/** @inheritdoc */
	/** @inheritdoc */
	on(hook, callback) {
		if (!this._hooks[hook]) this._hooks[hook] = [];
		this._hooks[hook].push(callback);
	}
	/** @inheritdoc */
	/** @inheritdoc */
	emit(hook, ...rest) {
		if (this._hooks[hook]) this._hooks[hook].forEach((callback) => callback(...rest));
	}
	/**
	* @inheritdoc
	*/
	sendEnvelope(envelope) {
		this.emit("beforeEnvelope", envelope);
		if (this._isEnabled() && this._transport) return this._transport.send(envelope).then(null, (reason) => {
			DEBUG_BUILD && logger.error("Error while sending event:", reason);
			return reason;
		});
		DEBUG_BUILD && logger.error("Transport disabled");
		return resolvedSyncPromise({});
	}
	/** Setup integrations for this client. */
	_setupIntegrations() {
		const { integrations } = this._options;
		this._integrations = setupIntegrations$1(this, integrations);
		afterSetupIntegrations(this, integrations);
	}
	/** Updates existing session based on the provided event */
	_updateSessionFromEvent(session, event) {
		let crashed = false;
		let errored = false;
		const exceptions = event.exception && event.exception.values;
		if (exceptions) {
			errored = true;
			for (const ex of exceptions) {
				const mechanism = ex.mechanism;
				if (mechanism && mechanism.handled === false) {
					crashed = true;
					break;
				}
			}
		}
		const sessionNonTerminal = session.status === "ok";
		if (sessionNonTerminal && session.errors === 0 || sessionNonTerminal && crashed) {
			updateSession(session, {
				...crashed && { status: "crashed" },
				errors: session.errors || Number(errored || crashed)
			});
			this.captureSession(session);
		}
	}
	/**
	* Determine if the client is finished processing. Returns a promise because it will wait `timeout` ms before saying
	* "no" (resolving to `false`) in order to give the client a chance to potentially finish first.
	*
	* @param timeout The time, in ms, after which to resolve to `false` if the client is still busy. Passing `0` (or not
	* passing anything) will make the promise wait as long as it takes for processing to finish before resolving to
	* `true`.
	* @returns A promise which will resolve to `true` if processing is already done or finishes before the timeout, and
	* `false` otherwise
	*/
	_isClientDoneProcessing(timeout) {
		return new SyncPromise((resolve$1) => {
			let ticked = 0;
			const tick = 1;
			const interval = setInterval(() => {
				if (this._numProcessing == 0) {
					clearInterval(interval);
					resolve$1(true);
				} else {
					ticked += tick;
					if (timeout && ticked >= timeout) {
						clearInterval(interval);
						resolve$1(false);
					}
				}
			}, tick);
		});
	}
	/** Determines whether this SDK is enabled and a transport is present. */
	_isEnabled() {
		return this.getOptions().enabled !== false && this._transport !== void 0;
	}
	/**
	* Adds common information to events.
	*
	* The information includes release and environment from `options`,
	* breadcrumbs and context (extra, tags and user) from the scope.
	*
	* Information that is already present in the event is never overwritten. For
	* nested objects, such as the context, keys are merged.
	*
	* @param event The original event.
	* @param hint May contain additional information about the original exception.
	* @param currentScope A scope containing event metadata.
	* @returns A new event with more information.
	*/
	_prepareEvent(event, hint, currentScope, isolationScope = getIsolationScope()) {
		const options = this.getOptions();
		const integrations = Object.keys(this._integrations);
		if (!hint.integrations && integrations.length > 0) hint.integrations = integrations;
		this.emit("preprocessEvent", event, hint);
		if (!event.type) isolationScope.setLastEventId(event.event_id || hint.event_id);
		return prepareEvent(options, event, hint, currentScope, this, isolationScope).then((evt) => {
			if (evt === null) return evt;
			const propagationContext = {
				...isolationScope.getPropagationContext(),
				...currentScope ? currentScope.getPropagationContext() : void 0
			};
			if (!(evt.contexts && evt.contexts.trace) && propagationContext) {
				const { traceId: trace_id, spanId, parentSpanId, dsc } = propagationContext;
				evt.contexts = {
					trace: dropUndefinedKeys({
						trace_id,
						span_id: spanId,
						parent_span_id: parentSpanId
					}),
					...evt.contexts
				};
				evt.sdkProcessingMetadata = {
					dynamicSamplingContext: dsc ? dsc : getDynamicSamplingContextFromClient(trace_id, this),
					...evt.sdkProcessingMetadata
				};
			}
			return evt;
		});
	}
	/**
	* Processes the event and logs an error in case of rejection
	* @param event
	* @param hint
	* @param scope
	*/
	_captureEvent(event, hint = {}, scope) {
		return this._processEvent(event, hint, scope).then((finalEvent) => {
			return finalEvent.event_id;
		}, (reason) => {
			if (DEBUG_BUILD) {
				const sentryError = reason;
				if (sentryError.logLevel === "log") logger.log(sentryError.message);
				else logger.warn(sentryError);
			}
		});
	}
	/**
	* Processes an event (either error or message) and sends it to Sentry.
	*
	* This also adds breadcrumbs and context information to the event. However,
	* platform specific meta data (such as the User's IP address) must be added
	* by the SDK implementor.
	*
	*
	* @param event The event to send to Sentry.
	* @param hint May contain additional information about the original exception.
	* @param currentScope A scope containing event metadata.
	* @returns A SyncPromise that resolves with the event or rejects in case event was/will not be send.
	*/
	_processEvent(event, hint, currentScope) {
		const options = this.getOptions();
		const { sampleRate } = options;
		const isTransaction = isTransactionEvent(event);
		const isError$1 = isErrorEvent(event);
		const eventType = event.type || "error";
		const beforeSendLabel = `before send for type \`${eventType}\``;
		const parsedSampleRate = typeof sampleRate === "undefined" ? void 0 : parseSampleRate(sampleRate);
		if (isError$1 && typeof parsedSampleRate === "number" && Math.random() > parsedSampleRate) {
			this.recordDroppedEvent("sample_rate", "error", event);
			return rejectedSyncPromise(new SentryError(`Discarding event because it's not included in the random sample (sampling rate = ${sampleRate})`, "log"));
		}
		const dataCategory = eventType === "replay_event" ? "replay" : eventType;
		const capturedSpanIsolationScope = (event.sdkProcessingMetadata || {}).capturedSpanIsolationScope;
		return this._prepareEvent(event, hint, currentScope, capturedSpanIsolationScope).then((prepared) => {
			if (prepared === null) {
				this.recordDroppedEvent("event_processor", dataCategory, event);
				throw new SentryError("An event processor returned `null`, will not send event.", "log");
			}
			if (hint.data && hint.data.__sentry__ === true) return prepared;
			return _validateBeforeSendResult(processBeforeSend(options, prepared, hint), beforeSendLabel);
		}).then((processedEvent) => {
			if (processedEvent === null) {
				this.recordDroppedEvent("before_send", dataCategory, event);
				throw new SentryError(`${beforeSendLabel} returned \`null\`, will not send event.`, "log");
			}
			const session = currentScope && currentScope.getSession();
			if (!isTransaction && session) this._updateSessionFromEvent(session, processedEvent);
			const transactionInfo = processedEvent.transaction_info;
			if (isTransaction && transactionInfo && processedEvent.transaction !== event.transaction) {
				const source = "custom";
				processedEvent.transaction_info = {
					...transactionInfo,
					source
				};
			}
			this.sendEvent(processedEvent, hint);
			return processedEvent;
		}).then(null, (reason) => {
			if (reason instanceof SentryError) throw reason;
			this.captureException(reason, {
				data: { __sentry__: true },
				originalException: reason
			});
			throw new SentryError(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.\nReason: ${reason}`);
		});
	}
	/**
	* Occupies the client with processing and event
	*/
	_process(promise) {
		this._numProcessing++;
		promise.then((value) => {
			this._numProcessing--;
			return value;
		}, (reason) => {
			this._numProcessing--;
			return reason;
		});
	}
	/**
	* Clears outcomes on this client and returns them.
	*/
	_clearOutcomes() {
		const outcomes = this._outcomes;
		this._outcomes = {};
		return Object.keys(outcomes).map((key) => {
			const [reason, category] = key.split(":");
			return {
				reason,
				category,
				quantity: outcomes[key]
			};
		});
	}
};
/**
* Verifies that return value of configured `beforeSend` or `beforeSendTransaction` is of expected type, and returns the value if so.
*/
function _validateBeforeSendResult(beforeSendResult, beforeSendLabel) {
	const invalidValueError = `${beforeSendLabel} must return \`null\` or a valid event.`;
	if (isThenable(beforeSendResult)) return beforeSendResult.then((event) => {
		if (!isPlainObject(event) && event !== null) throw new SentryError(invalidValueError);
		return event;
	}, (e) => {
		throw new SentryError(`${beforeSendLabel} rejected with ${e}`);
	});
	else if (!isPlainObject(beforeSendResult) && beforeSendResult !== null) throw new SentryError(invalidValueError);
	return beforeSendResult;
}
/**
* Process the matching `beforeSendXXX` callback.
*/
function processBeforeSend(options, event, hint) {
	const { beforeSend, beforeSendTransaction, beforeSendSpan } = options;
	if (isErrorEvent(event) && beforeSend) return beforeSend(event, hint);
	if (isTransactionEvent(event)) {
		if (event.spans && beforeSendSpan) {
			const processedSpans = [];
			for (const span of event.spans) {
				const processedSpan = beforeSendSpan(span);
				if (processedSpan) processedSpans.push(processedSpan);
			}
			event.spans = processedSpans;
		}
		if (beforeSendTransaction) return beforeSendTransaction(event, hint);
	}
	return event;
}
function isErrorEvent(event) {
	return event.type === void 0;
}
function isTransactionEvent(event) {
	return event.type === "transaction";
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/checkin.js
/**
* Create envelope from check in item.
*/
function createCheckInEnvelope(checkIn, dynamicSamplingContext, metadata, tunnel, dsn) {
	const headers = { sent_at: (/* @__PURE__ */ new Date()).toISOString() };
	if (metadata && metadata.sdk) headers.sdk = {
		name: metadata.sdk.name,
		version: metadata.sdk.version
	};
	if (!!tunnel && !!dsn) headers.dsn = dsnToString(dsn);
	if (dynamicSamplingContext) headers.trace = dropUndefinedKeys(dynamicSamplingContext);
	return createEnvelope(headers, [createCheckInEnvelopeItem(checkIn)]);
}
function createCheckInEnvelopeItem(checkIn) {
	return [{ type: "check_in" }, checkIn];
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/server-runtime-client.js
/**
* The Sentry Server Runtime Client SDK.
*/
var ServerRuntimeClient = class extends BaseClient {
	/**
	* Creates a new Edge SDK instance.
	* @param options Configuration options for this SDK.
	*/
	constructor(options) {
		registerSpanErrorInstrumentation();
		super(options);
	}
	/**
	* @inheritDoc
	*/
	eventFromException(exception, hint) {
		return resolvedSyncPromise(eventFromUnknownInput$1(this, this._options.stackParser, exception, hint));
	}
	/**
	* @inheritDoc
	*/
	eventFromMessage(message, level = "info", hint) {
		return resolvedSyncPromise(eventFromMessage$1(this._options.stackParser, message, level, hint, this._options.attachStacktrace));
	}
	/**
	* @inheritDoc
	*/
	captureException(exception, hint, scope) {
		if (this._options.autoSessionTracking && this._sessionFlusher) {
			const requestSession = getIsolationScope().getRequestSession();
			if (requestSession && requestSession.status === "ok") requestSession.status = "errored";
		}
		return super.captureException(exception, hint, scope);
	}
	/**
	* @inheritDoc
	*/
	captureEvent(event, hint, scope) {
		if (this._options.autoSessionTracking && this._sessionFlusher) {
			if ((event.type || "exception") === "exception" && event.exception && event.exception.values && event.exception.values.length > 0) {
				const requestSession = getIsolationScope().getRequestSession();
				if (requestSession && requestSession.status === "ok") requestSession.status = "errored";
			}
		}
		return super.captureEvent(event, hint, scope);
	}
	/**
	*
	* @inheritdoc
	*/
	close(timeout) {
		if (this._sessionFlusher) this._sessionFlusher.close();
		return super.close(timeout);
	}
	/** Method that initialises an instance of SessionFlusher on Client */
	initSessionFlusher() {
		const { release, environment } = this._options;
		if (!release) DEBUG_BUILD && logger.warn("Cannot initialise an instance of SessionFlusher if no release is provided!");
		else this._sessionFlusher = new SessionFlusher(this, {
			release,
			environment
		});
	}
	/**
	* Create a cron monitor check in and send it to Sentry.
	*
	* @param checkIn An object that describes a check in.
	* @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
	* to create a monitor automatically when sending a check in.
	*/
	captureCheckIn(checkIn, monitorConfig, scope) {
		const id = "checkInId" in checkIn && checkIn.checkInId ? checkIn.checkInId : uuid4();
		if (!this._isEnabled()) {
			DEBUG_BUILD && logger.warn("SDK not enabled, will not capture checkin.");
			return id;
		}
		const { release, environment, tunnel } = this.getOptions();
		const serializedCheckIn = {
			check_in_id: id,
			monitor_slug: checkIn.monitorSlug,
			status: checkIn.status,
			release,
			environment
		};
		if ("duration" in checkIn) serializedCheckIn.duration = checkIn.duration;
		if (monitorConfig) serializedCheckIn.monitor_config = {
			schedule: monitorConfig.schedule,
			checkin_margin: monitorConfig.checkinMargin,
			max_runtime: monitorConfig.maxRuntime,
			timezone: monitorConfig.timezone,
			failure_issue_threshold: monitorConfig.failureIssueThreshold,
			recovery_threshold: monitorConfig.recoveryThreshold
		};
		const [dynamicSamplingContext, traceContext] = this._getTraceInfoFromScope(scope);
		if (traceContext) serializedCheckIn.contexts = { trace: traceContext };
		const envelope = createCheckInEnvelope(serializedCheckIn, dynamicSamplingContext, this.getSdkMetadata(), tunnel, this.getDsn());
		DEBUG_BUILD && logger.info("Sending checkin:", checkIn.monitorSlug, checkIn.status);
		this.sendEnvelope(envelope);
		return id;
	}
	/**
	* Method responsible for capturing/ending a request session by calling `incrementSessionStatusCount` to increment
	* appropriate session aggregates bucket
	*/
	_captureRequestSession() {
		if (!this._sessionFlusher) DEBUG_BUILD && logger.warn("Discarded request mode session because autoSessionTracking option was disabled");
		else this._sessionFlusher.incrementSessionStatusCount();
	}
	/**
	* @inheritDoc
	*/
	_prepareEvent(event, hint, scope, isolationScope) {
		if (this._options.platform) event.platform = event.platform || this._options.platform;
		if (this._options.runtime) event.contexts = {
			...event.contexts,
			runtime: (event.contexts || {}).runtime || this._options.runtime
		};
		if (this._options.serverName) event.server_name = event.server_name || this._options.serverName;
		return super._prepareEvent(event, hint, scope, isolationScope);
	}
	/** Extract trace information from scope */
	_getTraceInfoFromScope(scope) {
		if (!scope) return [void 0, void 0];
		const span = _getSpanForScope(scope);
		if (span) {
			const rootSpan = getRootSpan(span);
			return [getDynamicSamplingContextFromSpan(rootSpan), spanToTraceContext(rootSpan)];
		}
		const { traceId, spanId, parentSpanId, dsc } = scope.getPropagationContext();
		const traceContext = {
			trace_id: traceId,
			span_id: spanId,
			parent_span_id: parentSpanId
		};
		if (dsc) return [dsc, traceContext];
		return [getDynamicSamplingContextFromClient(traceId, this), traceContext];
	}
};

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/transports/base.js
const DEFAULT_TRANSPORT_BUFFER_SIZE = 64;
/**
* Creates an instance of a Sentry `Transport`
*
* @param options
* @param makeRequest
*/
function createTransport(options, makeRequest, buffer = makePromiseBuffer(options.bufferSize || DEFAULT_TRANSPORT_BUFFER_SIZE)) {
	let rateLimits = {};
	const flush = (timeout) => buffer.drain(timeout);
	function send(envelope) {
		const filteredEnvelopeItems = [];
		forEachEnvelopeItem(envelope, (item, type) => {
			const dataCategory = envelopeItemTypeToDataCategory(type);
			if (isRateLimited(rateLimits, dataCategory)) {
				const event = getEventForEnvelopeItem(item, type);
				options.recordDroppedEvent("ratelimit_backoff", dataCategory, event);
			} else filteredEnvelopeItems.push(item);
		});
		if (filteredEnvelopeItems.length === 0) return resolvedSyncPromise({});
		const filteredEnvelope = createEnvelope(envelope[0], filteredEnvelopeItems);
		const recordEnvelopeLoss = (reason) => {
			forEachEnvelopeItem(filteredEnvelope, (item, type) => {
				const event = getEventForEnvelopeItem(item, type);
				options.recordDroppedEvent(reason, envelopeItemTypeToDataCategory(type), event);
			});
		};
		const requestTask = () => makeRequest({ body: serializeEnvelope(filteredEnvelope) }).then((response) => {
			if (response.statusCode !== void 0 && (response.statusCode < 200 || response.statusCode >= 300)) DEBUG_BUILD && logger.warn(`Sentry responded with status code ${response.statusCode} to sent event.`);
			rateLimits = updateRateLimits(rateLimits, response);
			return response;
		}, (error) => {
			recordEnvelopeLoss("network_error");
			throw error;
		});
		return buffer.add(requestTask).then((result) => result, (error) => {
			if (error instanceof SentryError) {
				DEBUG_BUILD && logger.error("Skipped sending event because buffer is full.");
				recordEnvelopeLoss("queue_overflow");
				return resolvedSyncPromise({});
			} else throw error;
		});
	}
	return {
		send,
		flush
	};
}
function getEventForEnvelopeItem(item, type) {
	if (type !== "event" && type !== "transaction") return;
	return Array.isArray(item) ? item[1] : void 0;
}

//#endregion
//#region ../../node_modules/.pnpm/@sentry+core@8.9.2/node_modules/@sentry/core/esm/integrations/rewriteframes.js
const INTEGRATION_NAME = "RewriteFrames";
/**
* Rewrite event frames paths.
*/
const rewriteFramesIntegration = defineIntegration((options = {}) => {
	const root = options.root;
	const prefix = options.prefix || "app:///";
	const isBrowser = "window" in GLOBAL_OBJ && GLOBAL_OBJ.window !== void 0;
	const iteratee = options.iteratee || generateIteratee({
		isBrowser,
		root,
		prefix
	});
	/** Process an exception event. */
	function _processExceptionsEvent(event) {
		try {
			return {
				...event,
				exception: {
					...event.exception,
					values: event.exception.values.map((value) => ({
						...value,
						...value.stacktrace && { stacktrace: _processStacktrace(value.stacktrace) }
					}))
				}
			};
		} catch (_oO) {
			return event;
		}
	}
	/** Process a stack trace. */
	function _processStacktrace(stacktrace) {
		return {
			...stacktrace,
			frames: stacktrace && stacktrace.frames && stacktrace.frames.map((f) => iteratee(f))
		};
	}
	return {
		name: INTEGRATION_NAME,
		processEvent(originalEvent) {
			let processedEvent = originalEvent;
			if (originalEvent.exception && Array.isArray(originalEvent.exception.values)) processedEvent = _processExceptionsEvent(processedEvent);
			return processedEvent;
		}
	};
});
/**
* Exported only for tests.
*/
function generateIteratee({ isBrowser, root, prefix }) {
	return (frame) => {
		if (!frame.filename) return frame;
		const isWindowsFrame = /^[a-zA-Z]:\\/.test(frame.filename) || frame.filename.includes("\\") && !frame.filename.includes("/");
		const startsWithSlash = /^\//.test(frame.filename);
		if (isBrowser) {
			if (root) {
				const oldFilename = frame.filename;
				if (oldFilename.indexOf(root) === 0) frame.filename = oldFilename.replace(root, prefix);
			}
		} else if (isWindowsFrame || startsWithSlash) {
			const filename = isWindowsFrame ? frame.filename.replace(/^[a-zA-Z]:/, "").replace(/\\/g, "/") : frame.filename;
			frame.filename = `${prefix}${root ? relative(root, filename) : basename(filename)}`;
		}
		return frame;
	};
}

//#endregion
//#region ../../node_modules/.pnpm/toucan-js@4.0.0_patch_hash=60bdb1dcdbde0a135bb56d6fa1a1027caba891b149e2cfcb48d6a5b3524e0a91/node_modules/toucan-js/dist/index.esm.js
function isObject(value) {
	return typeof value === "object" && value !== null;
}
function isMechanism(value) {
	return isObject(value) && "handled" in value && typeof value.handled === "boolean" && "type" in value && typeof value.type === "string";
}
function containsMechanism(value) {
	return isObject(value) && "mechanism" in value && isMechanism(value["mechanism"]);
}
/**
* Tries to find release in a global
*/
function getSentryRelease() {
	if (GLOBAL_OBJ.SENTRY_RELEASE && GLOBAL_OBJ.SENTRY_RELEASE.id) return GLOBAL_OBJ.SENTRY_RELEASE.id;
}
/**
* Creates an entry on existing object and returns it, or creates a new object with the entry if it doesn't exist.
*
* @param target
* @param entry
* @returns Object with new entry.
*/
function setOnOptional(target, entry) {
	if (target !== void 0) {
		target[entry[0]] = entry[1];
		return target;
	} else return { [entry[0]]: entry[1] };
}
/**
* Extracts stack frames from the error.stack string
*/
function parseStackFrames(stackParser, error) {
	return stackParser(error.stack || "", 1);
}
/**
* There are cases where stacktrace.message is an Event object
* https://github.com/getsentry/sentry-javascript/issues/1949
* In this specific case we try to extract stacktrace.message.error.message
*/
function extractMessage(ex) {
	const message = ex && ex.message;
	if (!message) return "No error message";
	if (message.error && typeof message.error.message === "string") return message.error.message;
	return message;
}
/**
* Extracts stack frames from the error and builds a Sentry Exception
*/
function exceptionFromError(stackParser, error) {
	const exception = {
		type: error.name || error.constructor.name,
		value: extractMessage(error)
	};
	const frames = parseStackFrames(stackParser, error);
	if (frames.length) exception.stacktrace = { frames };
	if (exception.type === void 0 && exception.value === "") exception.value = "Unrecoverable error caught";
	return exception;
}
/**
* Builds and Event from a Exception
*/
function eventFromUnknownInput(sdk, stackParser, exception, hint) {
	let ex;
	const mechanism = (hint && hint.data && containsMechanism(hint.data) ? hint.data.mechanism : void 0) ?? {
		handled: true,
		type: "generic"
	};
	if (!isError(exception)) {
		if (isPlainObject(exception)) {
			const message = `Non-Error exception captured with keys: ${extractExceptionKeysForMessage(exception)}`;
			const client = sdk?.getClient();
			const normalizeDepth = client && client.getOptions().normalizeDepth;
			sdk?.setExtra("__serialized__", normalizeToSize(exception, normalizeDepth));
			ex = hint && hint.syntheticException || new Error(message);
			ex.message = message;
		} else {
			ex = hint && hint.syntheticException || new Error(exception);
			ex.message = exception;
		}
		mechanism.synthetic = true;
	} else ex = exception;
	const event = { exception: { values: [exceptionFromError(stackParser, ex)] } };
	addExceptionTypeValue(event, void 0, void 0);
	addExceptionMechanism(event, mechanism);
	return {
		...event,
		event_id: hint && hint.event_id
	};
}
/**
* Builds and Event from a Message
*/
function eventFromMessage(stackParser, message, level = "info", hint, attachStacktrace) {
	const event = {
		event_id: hint && hint.event_id,
		level,
		message
	};
	if (attachStacktrace && hint && hint.syntheticException) {
		const frames = parseStackFrames(stackParser, hint.syntheticException);
		if (frames.length) event.exception = { values: [{
			value: message,
			stacktrace: { frames }
		}] };
	}
	return event;
}
const DEFAULT_LIMIT = 5;
const linkedErrorsIntegration = defineIntegration((options = { limit: DEFAULT_LIMIT }) => {
	return {
		name: "LinkedErrors",
		processEvent: (event, hint, client) => {
			return handler(client.getOptions().stackParser, options.limit, event, hint);
		}
	};
});
function handler(parser, limit, event, hint) {
	if (!event.exception || !event.exception.values || !hint || !isInstanceOf(hint.originalException, Error)) return event;
	const linkedErrors = walkErrorTree(parser, limit, hint.originalException);
	event.exception.values = [...linkedErrors, ...event.exception.values];
	return event;
}
function walkErrorTree(parser, limit, error, stack = []) {
	if (!isInstanceOf(error.cause, Error) || stack.length + 1 >= limit) return stack;
	const exception = exceptionFromError(parser, error.cause);
	return walkErrorTree(parser, limit, error.cause, [exception, ...stack]);
}
const defaultRequestDataOptions = { allowedHeaders: ["CF-RAY", "CF-Worker"] };
const requestDataIntegration = defineIntegration((userOptions = {}) => {
	const options = {
		...defaultRequestDataOptions,
		...userOptions
	};
	return {
		name: "RequestData",
		preprocessEvent: (event) => {
			const { sdkProcessingMetadata } = event;
			if (!sdkProcessingMetadata) return event;
			if ("request" in sdkProcessingMetadata && sdkProcessingMetadata.request instanceof Request) {
				event.request = toEventRequest(sdkProcessingMetadata.request, options);
				event.user = toEventUser(event.user ?? {}, sdkProcessingMetadata.request, options);
			}
			if ("requestData" in sdkProcessingMetadata) if (event.request) event.request.data = sdkProcessingMetadata.requestData;
			else event.request = { data: sdkProcessingMetadata.requestData };
			return event;
		}
	};
});
/**
* Applies allowlists on existing user object.
*
* @param user
* @param request
* @param options
* @returns New copy of user
*/
function toEventUser(user, request, options) {
	const ip_address = request.headers.get("CF-Connecting-IP");
	const { allowedIps } = options;
	const newUser = { ...user };
	if (!("ip_address" in user) && ip_address && allowedIps !== void 0 && testAllowlist(ip_address, allowedIps)) newUser.ip_address = ip_address;
	return Object.keys(newUser).length > 0 ? newUser : void 0;
}
/**
* Converts data from fetch event's Request to Sentry Request used in Sentry Event
*
* @param request Native Request object
* @param options Integration options
* @returns Sentry Request object
*/
function toEventRequest(request, options) {
	const cookieString = request.headers.get("cookie");
	let cookies = void 0;
	if (cookieString) try {
		cookies = parseCookie(cookieString);
	} catch (e) {}
	const headers = {};
	for (const [k, v] of request.headers.entries()) if (k !== "cookie") headers[k] = v;
	const eventRequest = {
		method: request.method,
		cookies,
		headers
	};
	try {
		const url = new URL(request.url);
		eventRequest.url = `${url.protocol}//${url.hostname}${url.pathname}`;
		eventRequest.query_string = url.search;
	} catch (e) {
		const qi = request.url.indexOf("?");
		if (qi < 0) eventRequest.url = request.url;
		else {
			eventRequest.url = request.url.substr(0, qi);
			eventRequest.query_string = request.url.substr(qi + 1);
		}
	}
	const { allowedHeaders, allowedCookies, allowedSearchParams } = options;
	if (allowedHeaders !== void 0 && eventRequest.headers) {
		eventRequest.headers = applyAllowlistToObject(eventRequest.headers, allowedHeaders);
		if (Object.keys(eventRequest.headers).length === 0) delete eventRequest.headers;
	} else delete eventRequest.headers;
	if (allowedCookies !== void 0 && eventRequest.cookies) {
		eventRequest.cookies = applyAllowlistToObject(eventRequest.cookies, allowedCookies);
		if (Object.keys(eventRequest.cookies).length === 0) delete eventRequest.cookies;
	} else delete eventRequest.cookies;
	if (allowedSearchParams !== void 0) {
		const params = Object.fromEntries(new URLSearchParams(eventRequest.query_string));
		const allowedParams = new URLSearchParams();
		Object.keys(applyAllowlistToObject(params, allowedSearchParams)).forEach((allowedKey) => {
			allowedParams.set(allowedKey, params[allowedKey]);
		});
		eventRequest.query_string = allowedParams.toString();
	} else delete eventRequest.query_string;
	return eventRequest;
}
/**
* Helper function that tests 'allowlist' on string.
*
* @param target
* @param allowlist
* @returns True if target is allowed.
*/
function testAllowlist(target, allowlist) {
	if (typeof allowlist === "boolean") return allowlist;
	else if (allowlist instanceof RegExp) return allowlist.test(target);
	else if (Array.isArray(allowlist)) return allowlist.map((item) => item.toLowerCase()).includes(target);
	else return false;
}
/**
* Helper function that applies 'allowlist' to target's entries.
*
* @param target
* @param allowlist
* @returns New object with allowed keys.
*/
function applyAllowlistToObject(target, allowlist) {
	let predicate = () => false;
	if (typeof allowlist === "boolean") return allowlist ? target : {};
	else if (allowlist instanceof RegExp) predicate = (item) => allowlist.test(item);
	else if (Array.isArray(allowlist)) {
		const allowlistLowercased = allowlist.map((item) => item.toLowerCase());
		predicate = (item) => allowlistLowercased.includes(item.toLowerCase());
	} else return {};
	return Object.keys(target).filter(predicate).reduce((allowed, key) => {
		allowed[key] = target[key];
		return allowed;
	}, {});
}
/**
* Converts cookie string to an object.
*
* @param cookieString
* @returns Object of cookie entries, or empty object if something went wrong during the conversion.
*/
function parseCookie(cookieString) {
	if (typeof cookieString !== "string") return {};
	try {
		return cookieString.split(";").map((part) => part.split("=")).reduce((acc, [cookieKey, cookieValue]) => {
			acc[decodeURIComponent(cookieKey.trim())] = decodeURIComponent(cookieValue.trim());
			return acc;
		}, {});
	} catch {
		return {};
	}
}
/**
* Installs integrations on the current scope.
*
* @param integrations array of integration instances
*/
function setupIntegrations(integrations, sdk) {
	const integrationIndex = {};
	integrations.forEach((integration) => {
		integrationIndex[integration.name] = integration;
		if (typeof integration.setupOnce === "function") integration.setupOnce();
		const client = sdk.getClient();
		if (!client) return;
		if (typeof integration.setup === "function") integration.setup(client);
		if (typeof integration.preprocessEvent === "function") {
			const callback = integration.preprocessEvent.bind(integration);
			client.on("preprocessEvent", (event, hint) => callback(event, hint, client));
		}
		if (typeof integration.processEvent === "function") {
			const callback = integration.processEvent.bind(integration);
			const processor = Object.assign((event, hint) => callback(event, hint, client), { id: integration.name });
			client.addEventProcessor(processor);
		}
	});
	return integrationIndex;
}
/**
* The Cloudflare Workers SDK Client.
*/
var ToucanClient = class extends ServerRuntimeClient {
	/**
	* Some functions need to access the scope (Toucan instance) this client is bound to,
	* but calling 'getCurrentHub()' is unsafe because it uses globals.
	* So we store a reference to the Hub after binding to it and provide it to methods that need it.
	*/
	#sdk = null;
	#integrationsInitialized = false;
	/**
	* Creates a new Toucan SDK instance.
	* @param options Configuration options for this SDK.
	*/
	constructor(options) {
		options._metadata = options._metadata || {};
		options._metadata.sdk = options._metadata.sdk || {
			name: "toucan-js",
			packages: [{
				name: "npm:toucan-js",
				version: "4.0.0"
			}],
			version: "4.0.0"
		};
		super(options);
	}
	/**
	* By default, integrations are stored in a global. We want to store them in a local instance because they may have contextual data, such as event request.
	*/
	setupIntegrations() {
		if (this._isEnabled() && !this.#integrationsInitialized && this.#sdk) {
			this._integrations = setupIntegrations(this._options.integrations, this.#sdk);
			this.#integrationsInitialized = true;
		}
	}
	eventFromException(exception, hint) {
		return resolvedSyncPromise(eventFromUnknownInput(this.#sdk, this._options.stackParser, exception, hint));
	}
	eventFromMessage(message, level = "info", hint) {
		return resolvedSyncPromise(eventFromMessage(this._options.stackParser, message, level, hint, this._options.attachStacktrace));
	}
	_prepareEvent(event, hint, scope) {
		event.platform = event.platform || "javascript";
		if (this.getOptions().request) event.sdkProcessingMetadata = setOnOptional(event.sdkProcessingMetadata, ["request", this.getOptions().request]);
		if (this.getOptions().requestData) event.sdkProcessingMetadata = setOnOptional(event.sdkProcessingMetadata, ["requestData", this.getOptions().requestData]);
		return super._prepareEvent(event, hint, scope);
	}
	getSdk() {
		return this.#sdk;
	}
	setSdk(sdk) {
		this.#sdk = sdk;
	}
	/**
	* Sets the request body context on all future events.
	*
	* @param body Request body.
	* @example
	* const body = await request.text();
	* toucan.setRequestBody(body);
	*/
	setRequestBody(body) {
		this.getOptions().requestData = body;
	}
	/**
	* Enable/disable the SDK.
	*
	* @param enabled
	*/
	setEnabled(enabled) {
		this.getOptions().enabled = enabled;
	}
};
/**
* Stack line parser for Cloudflare Workers.
* This wraps node stack parser and adjusts root paths to match with source maps.
*
*/
function workersStackLineParser(getModule$1) {
	const [arg1, arg2] = nodeStackLineParser(getModule$1);
	const fn = (line) => {
		const result = arg2(line);
		if (result) {
			const filename = result.filename;
			result.abs_path = filename !== void 0 && !filename.startsWith("/") ? `/${filename}` : filename;
			result.in_app = filename !== void 0;
		}
		return result;
	};
	return [arg1, fn];
}
/**
* Gets the module from filename.
*
* @param filename
* @returns Module name
*/
function getModule(filename) {
	if (!filename) return;
	return basename(filename, ".js");
}
/** Cloudflare Workers stack parser */
const defaultStackParser = createStackParser(workersStackLineParser(getModule));
/**
* Creates a Transport that uses native fetch. This transport automatically extends the Workers lifetime with 'waitUntil'.
*/
function makeFetchTransport(options) {
	function makeRequest({ body }) {
		try {
			const request = (options.fetcher ?? fetch)(options.url, {
				method: "POST",
				headers: options.headers,
				body
			}).then((response) => {
				return {
					statusCode: response.status,
					headers: {
						"retry-after": response.headers.get("Retry-After"),
						"x-sentry-rate-limits": response.headers.get("X-Sentry-Rate-Limits")
					}
				};
			});
			/**
			* Call waitUntil to extend Workers Event lifetime
			*/
			if (options.context) options.context.waitUntil(request);
			return request;
		} catch (e) {
			return rejectedSyncPromise(e);
		}
	}
	return createTransport(options, makeRequest);
}
/**
* The Cloudflare Workers SDK.
*/
var Toucan = class Toucan extends Scope {
	#options;
	constructor(options) {
		super();
		options.defaultIntegrations = options.defaultIntegrations === false ? [] : [...Array.isArray(options.defaultIntegrations) ? options.defaultIntegrations : [requestDataIntegration(options.requestDataOptions), linkedErrorsIntegration()]];
		if (options.release === void 0) {
			const detectedRelease = getSentryRelease();
			if (detectedRelease !== void 0) options.release = detectedRelease;
		}
		this.#options = options;
		this.attachNewClient();
	}
	/**
	* Creates new ToucanClient and links it to this instance.
	*/
	attachNewClient() {
		const client = new ToucanClient({
			...this.#options,
			transport: makeFetchTransport,
			integrations: getIntegrationsToSetup(this.#options),
			stackParser: stackParserFromStackParserOptions(this.#options.stackParser || defaultStackParser),
			transportOptions: {
				...this.#options.transportOptions,
				context: this.#options.context
			}
		});
		this.setClient(client);
		client.setSdk(this);
		client.setupIntegrations();
	}
	/**
	* Sets the request body context on all future events.
	*
	* @param body Request body.
	* @example
	* const body = await request.text();
	* toucan.setRequestBody(body);
	*/
	setRequestBody(body) {
		this.getClient()?.setRequestBody(body);
	}
	/**
	* Enable/disable the SDK.
	*
	* @param enabled
	*/
	setEnabled(enabled) {
		this.getClient()?.setEnabled(enabled);
	}
	/**
	* Create a cron monitor check in and send it to Sentry.
	*
	* @param checkIn An object that describes a check in.
	* @param upsertMonitorConfig An optional object that describes a monitor config. Use this if you want
	* to create a monitor automatically when sending a check in.
	*/
	captureCheckIn(checkIn, monitorConfig, scope) {
		if (checkIn.status === "in_progress") this.setContext("monitor", { slug: checkIn.monitorSlug });
		return this.getClient().captureCheckIn(checkIn, monitorConfig, scope);
	}
	/**
	* Add a breadcrumb to the current scope.
	*/
	addBreadcrumb(breadcrumb, maxBreadcrumbs = 100) {
		const max = this.getClient().getOptions().maxBreadcrumbs || maxBreadcrumbs;
		return super.addBreadcrumb(breadcrumb, max);
	}
	/**
	* Clone all data from this instance into a new Toucan instance.
	*
	* @override
	* @returns New Toucan instance.
	*/
	clone() {
		const toucan = new Toucan({ ...this.#options });
		toucan._breadcrumbs = [...this._breadcrumbs];
		toucan._tags = { ...this._tags };
		toucan._extra = { ...this._extra };
		toucan._contexts = { ...this._contexts };
		toucan._user = this._user;
		toucan._level = this._level;
		toucan._session = this._session;
		toucan._transactionName = this._transactionName;
		toucan._fingerprint = this._fingerprint;
		toucan._eventProcessors = [...this._eventProcessors];
		toucan._requestSession = this._requestSession;
		toucan._attachments = [...this._attachments];
		toucan._sdkProcessingMetadata = { ...this._sdkProcessingMetadata };
		toucan._propagationContext = { ...this._propagationContext };
		toucan._lastEventId = this._lastEventId;
		return toucan;
	}
	/**
	* Creates a new scope with and executes the given operation within.
	* The scope is automatically removed once the operation
	* finishes or throws.
	*/
	withScope(callback) {
		return callback(this.clone());
	}
};

//#endregion
//#region ../workers-shared/utils/sentry.ts
function setupSentry(request, context, dsn, clientId, clientSecret, coloMetadata, versionMetadata, accountId, scriptId) {
	if (!(dsn && clientId && clientSecret)) return;
	const sentry = new Toucan({
		dsn,
		request,
		context,
		sampleRate: 1,
		release: versionMetadata?.tag,
		integrations: [rewriteFramesIntegration({ iteratee(frame) {
			frame.filename = "/index.js";
			return frame;
		} })],
		requestDataOptions: {
			allowedHeaders: [
				"user-agent",
				"cf-challenge",
				"accept-encoding",
				"accept-language",
				"cf-ray",
				"content-length",
				"content-type",
				"host"
			],
			allowedSearchParams: /(.*)/
		},
		transportOptions: { headers: {
			"CF-Access-Client-ID": clientId,
			"CF-Access-Client-Secret": clientSecret
		} }
	});
	if (coloMetadata) {
		sentry.setTag("colo", coloMetadata.coloId);
		sentry.setTag("metal", coloMetadata.metalId);
	}
	if (accountId && scriptId) {
		sentry.setTag("accountId", accountId);
		sentry.setTag("scriptId", scriptId);
	}
	sentry.setUser({ id: accountId?.toString() });
	return sentry;
}

//#endregion
//#region ../workers-shared/router-worker/src/analytics.ts
const VERSION = 1;
let STATIC_ROUTING_DECISION = /* @__PURE__ */ function(STATIC_ROUTING_DECISION$1) {
	STATIC_ROUTING_DECISION$1[STATIC_ROUTING_DECISION$1["NOT_PROVIDED"] = 0] = "NOT_PROVIDED";
	STATIC_ROUTING_DECISION$1[STATIC_ROUTING_DECISION$1["NOT_ROUTED"] = 1] = "NOT_ROUTED";
	STATIC_ROUTING_DECISION$1[STATIC_ROUTING_DECISION$1["ROUTED"] = 2] = "ROUTED";
	return STATIC_ROUTING_DECISION$1;
}({});
let DISPATCH_TYPE = /* @__PURE__ */ function(DISPATCH_TYPE$1) {
	DISPATCH_TYPE$1["ASSETS"] = "asset";
	DISPATCH_TYPE$1["WORKER"] = "worker";
	return DISPATCH_TYPE$1;
}({});
var Analytics = class {
	data = {};
	readyAnalytics;
	hasWritten = false;
	constructor(readyAnalytics) {
		this.readyAnalytics = readyAnalytics;
	}
	setData(newData) {
		this.data = {
			...this.data,
			...newData
		};
	}
	getData(key) {
		return this.data[key];
	}
	write() {
		if (this.hasWritten) return;
		else if (!this.readyAnalytics) return;
		this.hasWritten = true;
		this.readyAnalytics.logEvent({
			version: VERSION,
			accountId: this.data.accountId,
			indexId: this.data.scriptId?.toString(),
			doubles: [
				this.data.requestTime ?? -1,
				this.data.coloId ?? -1,
				this.data.metalId ?? -1,
				this.data.coloTier ?? -1,
				this.data.userWorkerAhead === void 0 ? -1 : Number(this.data.userWorkerAhead),
				this.data.staticRoutingDecision ?? STATIC_ROUTING_DECISION.NOT_PROVIDED,
				this.data.abuseMitigationBlocked ? 1 : 0,
				this.data.userWorkerFreeTierLimiting ? 1 : 0,
				this.data.timeToDispatch ?? -1
			],
			blobs: [
				this.data.hostname?.substring(0, 256),
				this.data.dispatchtype,
				this.data.error?.substring(0, 256),
				this.data.version,
				this.data.coloRegion,
				this.data.abuseMitigationURLHost,
				this.data.xssDetectionImageHref,
				this.data.cdnCgiBackslashBypassUrl?.substring(0, 256)
			]
		});
	}
};

//#endregion
//#region ../workers-shared/router-worker/src/configuration.ts
const applyRouterConfigDefaults = (configuration) => {
	return {
		invoke_user_worker_ahead_of_assets: configuration?.invoke_user_worker_ahead_of_assets ?? false,
		has_user_worker: configuration?.has_user_worker ?? false,
		account_id: configuration?.account_id ?? -1,
		script_id: configuration?.script_id ?? -1,
		debug: configuration?.debug ?? false,
		static_routing: configuration?.static_routing ?? { user_worker: [] }
	};
};
const applyEyeballConfigDefaults = (eyeballConfiguration) => {
	return { limitedAssetsOnly: eyeballConfiguration?.limitedAssetsOnly ?? false };
};

//#endregion
//#region ../workers-shared/router-worker/src/limited-response.ts
function formatDate(date) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23",
		timeZone: "UTC"
	}).formatToParts(date);
	let year, month, day, hour, minute, second;
	for (const part of parts) switch (part.type) {
		case "year":
			year = part.value;
			break;
		case "month":
			month = part.value;
			break;
		case "day":
			day = part.value;
			break;
		case "hour":
			hour = part.value;
			break;
		case "minute":
			minute = part.value;
			break;
		case "second":
			second = part.value;
			break;
	}
	return `${year}-${month}-${day} ${hour}:${minute}:${second} UTC`;
}
function renderLimitedResponse(req) {
	const hostname = new URL(req.url).hostname;
	const ip = req.headers.get("cf-connecting-ip") ?? "";
	return `
	<!doctype html>
<!--[if lt IE 7]> <html class="no-js ie6 oldie" lang="en-US"> <![endif]-->
<!--[if IE 7]>    <html class="no-js ie7 oldie" lang="en-US"> <![endif]-->
<!--[if IE 8]>    <html class="no-js ie8 oldie" lang="en-US"> <![endif]-->
<!--[if gt IE 8]><!-->
<html class="no-js" lang="en-US">
    <!--<![endif]-->
    <head>
        <title>
            This website has been temporarily rate limited |
            ${hostname} | Cloudflare
        </title>
        <meta charset="UTF-8" />
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <!--[if lt IE 9
            ]><link
                rel="stylesheet"
                id="cf_styles-ie-css"
                href="/cdn-cgi/styles/cf.errors.ie.css"
        /><![endif]-->
        <style>
            #cf-wrapper a,
            #cf-wrapper abbr,
            #cf-wrapper article,
            #cf-wrapper aside,
            #cf-wrapper b,
            #cf-wrapper big,
            #cf-wrapper blockquote,
            #cf-wrapper body,
            #cf-wrapper canvas,
            #cf-wrapper caption,
            #cf-wrapper center,
            #cf-wrapper cite,
            #cf-wrapper code,
            #cf-wrapper dd,
            #cf-wrapper del,
            #cf-wrapper details,
            #cf-wrapper dfn,
            #cf-wrapper div,
            #cf-wrapper dl,
            #cf-wrapper dt,
            #cf-wrapper em,
            #cf-wrapper embed,
            #cf-wrapper fieldset,
            #cf-wrapper figcaption,
            #cf-wrapper figure,
            #cf-wrapper footer,
            #cf-wrapper form,
            #cf-wrapper h1,
            #cf-wrapper h2,
            #cf-wrapper h3,
            #cf-wrapper h4,
            #cf-wrapper h5,
            #cf-wrapper h6,
            #cf-wrapper header,
            #cf-wrapper hgroup,
            #cf-wrapper html,
            #cf-wrapper i,
            #cf-wrapper iframe,
            #cf-wrapper img,
            #cf-wrapper label,
            #cf-wrapper legend,
            #cf-wrapper li,
            #cf-wrapper mark,
            #cf-wrapper menu,
            #cf-wrapper nav,
            #cf-wrapper object,
            #cf-wrapper ol,
            #cf-wrapper output,
            #cf-wrapper p,
            #cf-wrapper pre,
            #cf-wrapper s,
            #cf-wrapper samp,
            #cf-wrapper section,
            #cf-wrapper small,
            #cf-wrapper span,
            #cf-wrapper strike,
            #cf-wrapper strong,
            #cf-wrapper sub,
            #cf-wrapper summary,
            #cf-wrapper sup,
            #cf-wrapper table,
            #cf-wrapper tbody,
            #cf-wrapper td,
            #cf-wrapper tfoot,
            #cf-wrapper th,
            #cf-wrapper thead,
            #cf-wrapper tr,
            #cf-wrapper tt,
            #cf-wrapper u,
            #cf-wrapper ul {
                margin: 0;
                padding: 0;
                border: 0;
                font: inherit;
                font-size: 100%;
                text-decoration: none;
                vertical-align: baseline;
            }
            #cf-wrapper a img {
                border: none;
            }
            #cf-wrapper article,
            #cf-wrapper aside,
            #cf-wrapper details,
            #cf-wrapper figcaption,
            #cf-wrapper figure,
            #cf-wrapper footer,
            #cf-wrapper header,
            #cf-wrapper hgroup,
            #cf-wrapper menu,
            #cf-wrapper nav,
            #cf-wrapper section,
            #cf-wrapper summary {
                display: block;
            }
            #cf-wrapper .cf-columns:after,
            #cf-wrapper .cf-columns:before,
            #cf-wrapper .cf-section:after,
            #cf-wrapper .cf-section:before,
            #cf-wrapper .cf-wrapper:after,
            #cf-wrapper .cf-wrapper:before,
            #cf-wrapper .clearfix:after,
            #cf-wrapper .clearfix:before,
            #cf-wrapper section:after,
            #cf-wrapper section:before {
                content: " ";
                display: table;
            }
            #cf-wrapper .cf-columns:after,
            #cf-wrapper .cf-section:after,
            #cf-wrapper .cf-wrapper:after,
            #cf-wrapper .clearfix:after,
            #cf-wrapper section:after {
                clear: both;
            }
            #cf-wrapper {
                display: block;
                margin: 0;
                padding: 0;
                position: relative;
                text-align: left;
                width: 100%;
                z-index: 999999999;
                color: #404040 !important;
                font-family:
                    -apple-system,
                    BlinkMacSystemFont,
                    Segoe UI,
                    Roboto,
                    Oxygen,
                    Ubuntu,
                    Helvetica Neue,
                    Arial,
                    sans-serif !important;
                font-size: 15px !important;
                line-height: 1.5 !important;
                text-decoration: none !important;
                letter-spacing: normal;
                -webkit-tap-highlight-color: rgba(246, 139, 31, 0.3);
                -webkit-font-smoothing: antialiased;
            }
            #cf-wrapper .cf-section,
            #cf-wrapper section {
                background: 0 0;
                display: block;
                margin-bottom: 2em;
                margin-top: 2em;
            }
            #cf-wrapper .cf-wrapper {
                margin-left: auto;
                margin-right: auto;
                width: 90%;
            }
            #cf-wrapper .cf-columns {
                display: block;
                list-style: none;
                padding: 0;
                width: 100%;
            }
            #cf-wrapper .cf-columns img,
            #cf-wrapper .cf-columns input,
            #cf-wrapper .cf-columns object,
            #cf-wrapper .cf-columns select,
            #cf-wrapper .cf-columns textarea {
                max-width: 100%;
            }
            #cf-wrapper .cf-columns > .cf-column {
                float: left;
                padding-bottom: 45px;
                width: 100%;
                box-sizing: border-box;
            }
            @media screen and (min-width: 49.2em) {
                #cf-wrapper .cf-columns.cols-2 > .cf-column:nth-child(n + 3),
                #cf-wrapper .cf-columns.cols-3 > .cf-column:nth-child(n + 4),
                #cf-wrapper .cf-columns.cols-4 > .cf-column:nth-child(n + 3),
                #cf-wrapper .cf-columns.four > .cf-column:nth-child(n + 3),
                #cf-wrapper .cf-columns.three > .cf-column:nth-child(n + 4),
                #cf-wrapper .cf-columns.two > .cf-column:nth-child(n + 3) {
                    padding-top: 67.5px;
                }
                #cf-wrapper .cf-columns > .cf-column {
                    padding-bottom: 0;
                }
                #cf-wrapper .cf-columns.cols-2 > .cf-column,
                #cf-wrapper .cf-columns.cols-4 > .cf-column,
                #cf-wrapper .cf-columns.four > .cf-column,
                #cf-wrapper .cf-columns.two > .cf-column {
                    padding-left: 0;
                    padding-right: 22.5px;
                    width: 50%;
                }
                #cf-wrapper .cf-columns.cols-2 > .cf-column:nth-child(2n),
                #cf-wrapper .cf-columns.cols-4 > .cf-column:nth-child(2n),
                #cf-wrapper .cf-columns.four > .cf-column:nth-child(2n),
                #cf-wrapper .cf-columns.two > .cf-column:nth-child(2n) {
                    padding-left: 22.5px;
                    padding-right: 0;
                }
                #cf-wrapper .cf-columns.cols-2 > .cf-column:nth-child(odd),
                #cf-wrapper .cf-columns.cols-4 > .cf-column:nth-child(odd),
                #cf-wrapper .cf-columns.four > .cf-column:nth-child(odd),
                #cf-wrapper .cf-columns.two > .cf-column:nth-child(odd) {
                    clear: left;
                }
                #cf-wrapper .cf-columns.cols-3 > .cf-column,
                #cf-wrapper .cf-columns.three > .cf-column {
                    padding-left: 30px;
                    width: 33.3333333333333%;
                }
                #cf-wrapper .cf-columns.cols-3 > .cf-column:first-child,
                #cf-wrapper .cf-columns.cols-3 > .cf-column:nth-child(3n + 1),
                #cf-wrapper .cf-columns.three > .cf-column:first-child,
                #cf-wrapper .cf-columns.three > .cf-column:nth-child(3n + 1) {
                    clear: left;
                    padding-left: 0;
                    padding-right: 30px;
                }
                #cf-wrapper .cf-columns.cols-3 > .cf-column:nth-child(3n + 2),
                #cf-wrapper .cf-columns.three > .cf-column:nth-child(3n + 2) {
                    padding-left: 15px;
                    padding-right: 15px;
                }
                #cf-wrapper .cf-columns.cols-3 > .cf-column:nth-child(-n + 3),
                #cf-wrapper .cf-columns.three > .cf-column:nth-child(-n + 3) {
                    padding-top: 0;
                }
            }
            @media screen and (min-width: 66em) {
                #cf-wrapper .cf-columns > .cf-column {
                    padding-bottom: 0;
                }
                #cf-wrapper .cf-columns.cols-4 > .cf-column,
                #cf-wrapper .cf-columns.four > .cf-column {
                    padding-left: 33.75px;
                    width: 25%;
                }
                #cf-wrapper .cf-columns.cols-4 > .cf-column:nth-child(odd),
                #cf-wrapper .cf-columns.four > .cf-column:nth-child(odd) {
                    clear: none;
                }
                #cf-wrapper .cf-columns.cols-4 > .cf-column:first-child,
                #cf-wrapper .cf-columns.cols-4 > .cf-column:nth-child(4n + 1),
                #cf-wrapper .cf-columns.four > .cf-column:first-child,
                #cf-wrapper .cf-columns.four > .cf-column:nth-child(4n + 1) {
                    clear: left;
                    padding-left: 0;
                    padding-right: 33.75px;
                }
                #cf-wrapper .cf-columns.cols-4 > .cf-column:nth-child(4n + 2),
                #cf-wrapper .cf-columns.four > .cf-column:nth-child(4n + 2) {
                    padding-left: 11.25px;
                    padding-right: 22.5px;
                }
                #cf-wrapper .cf-columns.cols-4 > .cf-column:nth-child(4n + 3),
                #cf-wrapper .cf-columns.four > .cf-column:nth-child(4n + 3) {
                    padding-left: 22.5px;
                    padding-right: 11.25px;
                }
                #cf-wrapper .cf-columns.cols-4 > .cf-column:nth-child(n + 5),
                #cf-wrapper .cf-columns.four > .cf-column:nth-child(n + 5) {
                    padding-top: 67.5px;
                }
                #cf-wrapper .cf-columns.cols-4 > .cf-column:nth-child(-n + 4),
                #cf-wrapper .cf-columns.four > .cf-column:nth-child(-n + 4) {
                    padding-top: 0;
                }
            }
            #cf-wrapper a {
                background: 0 0;
                border: 0;
                color: #0051c3;
                outline: 0;
                text-decoration: none;
                -webkit-transition: all 0.15s ease;
                transition: all 0.15s ease;
            }
            #cf-wrapper a:hover {
                background: 0 0;
                border: 0;
                color: #f68b1f;
            }
            #cf-wrapper a:focus {
                background: 0 0;
                border: 0;
                color: #62a1d8;
                outline: 0;
            }
            #cf-wrapper a:active {
                background: 0 0;
                border: 0;
                color: #c16508;
                outline: 0;
            }
            #cf-wrapper h1,
            #cf-wrapper h2,
            #cf-wrapper h3,
            #cf-wrapper h4,
            #cf-wrapper h5,
            #cf-wrapper h6,
            #cf-wrapper p {
                color: #404040;
                margin: 0;
                padding: 0;
            }
            #cf-wrapper h1,
            #cf-wrapper h2,
            #cf-wrapper h3 {
                font-weight: 400;
            }
            #cf-wrapper h4,
            #cf-wrapper h5,
            #cf-wrapper h6,
            #cf-wrapper strong {
                font-weight: 600;
            }
            #cf-wrapper h1 {
                font-size: 36px;
                line-height: 1.2;
            }
            #cf-wrapper h2 {
                font-size: 30px;
                line-height: 1.3;
            }
            #cf-wrapper h3 {
                font-size: 25px;
                line-height: 1.3;
            }
            #cf-wrapper h4 {
                font-size: 20px;
                line-height: 1.3;
            }
            #cf-wrapper h5 {
                font-size: 15px;
            }
            #cf-wrapper h6 {
                font-size: 13px;
            }
            #cf-wrapper ol,
            #cf-wrapper ul {
                list-style: none;
                margin-left: 3em;
            }
            #cf-wrapper ul {
                list-style-type: disc;
            }
            #cf-wrapper ol {
                list-style-type: decimal;
            }
            #cf-wrapper em {
                font-style: italic;
            }
            #cf-wrapper .cf-subheadline {
                color: #595959;
                font-weight: 300;
            }
            #cf-wrapper .cf-text-error {
                color: #bd2426;
            }
            #cf-wrapper .cf-text-success {
                color: #9bca3e;
            }
            #cf-wrapper ol + h2,
            #cf-wrapper ol + h3,
            #cf-wrapper ol + h4,
            #cf-wrapper ol + h5,
            #cf-wrapper ol + h6,
            #cf-wrapper ol + p,
            #cf-wrapper p + dl,
            #cf-wrapper p + ol,
            #cf-wrapper p + p,
            #cf-wrapper p + table,
            #cf-wrapper p + ul,
            #cf-wrapper ul + h2,
            #cf-wrapper ul + h3,
            #cf-wrapper ul + h4,
            #cf-wrapper ul + h5,
            #cf-wrapper ul + h6,
            #cf-wrapper ul + p {
                margin-top: 1.5em;
            }
            #cf-wrapper h1 + p,
            #cf-wrapper p + h1,
            #cf-wrapper p + h2,
            #cf-wrapper p + h3,
            #cf-wrapper p + h4,
            #cf-wrapper p + h5,
            #cf-wrapper p + h6 {
                margin-top: 1.25em;
            }
            #cf-wrapper h1 + h2,
            #cf-wrapper h1 + h3,
            #cf-wrapper h2 + h3,
            #cf-wrapper h3 + h4,
            #cf-wrapper h4 + h5 {
                margin-top: 0.25em;
            }
            #cf-wrapper h2 + p {
                margin-top: 1em;
            }
            #cf-wrapper h1 + h4,
            #cf-wrapper h1 + h5,
            #cf-wrapper h1 + h6,
            #cf-wrapper h2 + h4,
            #cf-wrapper h2 + h5,
            #cf-wrapper h2 + h6,
            #cf-wrapper h3 + h5,
            #cf-wrapper h3 + h6,
            #cf-wrapper h3 + p,
            #cf-wrapper h4 + p,
            #cf-wrapper h5 + ol,
            #cf-wrapper h5 + p,
            #cf-wrapper h5 + ul {
                margin-top: 0.5em;
            }
            #cf-wrapper .cf-btn {
                background-color: transparent;
                border: 1px solid #999;
                color: #404040;
                font-size: 14px;
                font-weight: 400;
                line-height: 1.2;
                margin: 0;
                padding: 0.6em 1.33333em 0.53333em;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
                display: -moz-inline-stack;
                display: inline-block;
                vertical-align: middle;
                zoom: 1;
                border-radius: 2px;
                box-sizing: border-box;
                -webkit-transition: all 0.2s ease;
                transition: all 0.2s ease;
            }
            #cf-wrapper .cf-btn:hover {
                background-color: #bfbfbf;
                border: 1px solid #737373;
                color: #fff;
            }
            #cf-wrapper .cf-btn:focus {
                color: inherit;
                outline: 0;
                box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.3);
            }
            #cf-wrapper .cf-btn.active,
            #cf-wrapper .cf-btn:active {
                background-color: #bfbfbf;
                border: 1px solid #404040;
                color: #272727;
            }
            #cf-wrapper .cf-btn::-moz-focus-inner {
                padding: 0;
                border: 0;
            }
            #cf-wrapper .cf-btn .cf-caret {
                border-top-color: currentColor;
                margin-left: 0.25em;
                margin-top: 0.18333em;
            }
            #cf-wrapper .cf-btn-primary {
                background-color: #2f7bbf;
                border: 1px solid transparent;
                color: #fff;
            }
            #cf-wrapper .cf-btn-primary:hover {
                background-color: #62a1d8;
                border: 1px solid #2f7bbf;
                color: #fff;
            }
            #cf-wrapper .cf-btn-primary.active,
            #cf-wrapper .cf-btn-primary:active,
            #cf-wrapper .cf-btn-primary:focus {
                background-color: #62a1d8;
                border: 1px solid #163959;
                color: #fff;
            }
            #cf-wrapper .cf-btn-danger,
            #cf-wrapper .cf-btn-error,
            #cf-wrapper .cf-btn-important {
                background-color: #bd2426;
                border-color: transparent;
                color: #fff;
            }
            #cf-wrapper .cf-btn-danger:hover,
            #cf-wrapper .cf-btn-error:hover,
            #cf-wrapper .cf-btn-important:hover {
                background-color: #de5052;
                border-color: #bd2426;
                color: #fff;
            }
            #cf-wrapper .cf-btn-danger.active,
            #cf-wrapper .cf-btn-danger:active,
            #cf-wrapper .cf-btn-danger:focus,
            #cf-wrapper .cf-btn-error.active,
            #cf-wrapper .cf-btn-error:active,
            #cf-wrapper .cf-btn-error:focus,
            #cf-wrapper .cf-btn-important.active,
            #cf-wrapper .cf-btn-important:active,
            #cf-wrapper .cf-btn-important:focus {
                background-color: #de5052;
                border-color: #521010;
                color: #fff;
            }
            #cf-wrapper .cf-btn-accept,
            #cf-wrapper .cf-btn-success {
                background-color: #9bca3e;
                border: 1px solid transparent;
                color: #fff;
            }
            #cf-wrapper .cf-btn-accept:hover,
            #cf-wrapper .cf-btn-success:hover {
                background-color: #bada7a;
                border: 1px solid #9bca3e;
                color: #fff;
            }
            #cf-wrapper .active.cf-btn-accept,
            #cf-wrapper .cf-btn-accept:active,
            #cf-wrapper .cf-btn-accept:focus,
            #cf-wrapper .cf-btn-success.active,
            #cf-wrapper .cf-btn-success:active,
            #cf-wrapper .cf-btn-success:focus {
                background-color: #bada7a;
                border: 1px solid #516b1d;
                color: #fff;
            }
            #cf-wrapper .cf-btn-accept {
                color: transparent;
                font-size: 0;
                height: 36.38px;
                overflow: hidden;
                position: relative;
                text-indent: 0;
                width: 36.38px;
                white-space: nowrap;
            }
            #cf-wrapper input,
            #cf-wrapper select,
            #cf-wrapper textarea {
                background: #fff !important;
                border: 1px solid #999 !important;
                color: #404040 !important;
                font-size: 0.86667em !important;
                line-height: 1.24 !important;
                margin: 0 0 1em !important;
                max-width: 100% !important;
                outline: 0 !important;
                padding: 0.45em 0.75em !important;
                vertical-align: middle !important;
                display: -moz-inline-stack;
                display: inline-block;
                zoom: 1;
                box-sizing: border-box;
                -webkit-transition: all 0.2s ease;
                transition: all 0.2s ease;
                border-radius: 2px;
            }
            #cf-wrapper input:hover,
            #cf-wrapper select:hover,
            #cf-wrapper textarea:hover {
                border-color: gray;
            }
            #cf-wrapper input:focus,
            #cf-wrapper select:focus,
            #cf-wrapper textarea:focus {
                border-color: #2f7bbf;
                outline: 0;
                box-shadow: 0 0 8px rgba(47, 123, 191, 0.5);
            }
            #cf-wrapper fieldset {
                width: 100%;
            }
            #cf-wrapper label {
                display: block;
                font-size: 13px;
                margin-bottom: 0.38333em;
            }
            #cf-wrapper .cf-form-stacked .select2-container,
            #cf-wrapper .cf-form-stacked input,
            #cf-wrapper .cf-form-stacked select,
            #cf-wrapper .cf-form-stacked textarea {
                display: block;
                width: 100%;
            }
            #cf-wrapper .cf-form-stacked input[type="button"],
            #cf-wrapper .cf-form-stacked input[type="checkbox"],
            #cf-wrapper .cf-form-stacked input[type="submit"] {
                display: -moz-inline-stack;
                display: inline-block;
                vertical-align: middle;
                zoom: 1;
                width: auto;
            }
            #cf-wrapper .cf-form-actions {
                text-align: right;
            }
            #cf-wrapper .cf-alert {
                background-color: #f9b169;
                border: 1px solid #904b06;
                color: #404040;
                font-size: 13px;
                padding: 7.5px 15px;
                position: relative;
                vertical-align: middle;
                border-radius: 2px;
            }
            #cf-wrapper .cf-alert:empty {
                display: none;
            }
            #cf-wrapper .cf-alert .cf-close {
                border: 1px solid transparent;
                color: inherit;
                font-size: 18.75px;
                line-height: 1;
                padding: 0;
                position: relative;
                right: -18.75px;
                top: 0;
            }
            #cf-wrapper .cf-alert .cf-close:hover {
                background-color: transparent;
                border-color: currentColor;
                color: inherit;
            }
            #cf-wrapper .cf-alert-danger,
            #cf-wrapper .cf-alert-error {
                background-color: #de5052;
                border-color: #521010;
                color: #fff;
            }
            #cf-wrapper .cf-alert-success {
                background-color: #bada7a;
                border-color: #516b1d;
                color: #516b1d;
            }
            #cf-wrapper .cf-alert-warning {
                background-color: #f9b169;
                border-color: #904b06;
                color: #404040;
            }
            #cf-wrapper .cf-alert-info {
                background-color: #62a1d8;
                border-color: #163959;
                color: #163959;
            }
            #cf-wrapper .cf-alert-nonessential {
                background-color: #ebebeb;
                border-color: #999;
                color: #404040;
            }
            #cf-wrapper .cf-icon-exclamation-sign {
                background: url(/cdn-cgi/images/icon-exclamation.png?1376755637)
                    50% no-repeat;
                height: 54px;
                width: 54px;
                display: -moz-inline-stack;
                display: inline-block;
                vertical-align: middle;
                zoom: 1;
            }
            #cf-wrapper h1 .cf-icon-exclamation-sign {
                margin-top: -10px;
            }
            #cf-wrapper #cf-error-banner {
                background-color: #fff;
                border-bottom: 3px solid #f68b1f;
                padding: 15px 15px 20px;
                position: relative;
                z-index: 999999999;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }
            #cf-wrapper #cf-error-banner h4,
            #cf-wrapper #cf-error-banner p {
                display: -moz-inline-stack;
                display: inline-block;
                vertical-align: bottom;
                zoom: 1;
            }
            #cf-wrapper #cf-error-banner h4 {
                color: #2f7bbf;
                font-weight: 400;
                font-size: 20px;
                line-height: 1;
                vertical-align: baseline;
            }
            #cf-wrapper #cf-error-banner .cf-error-actions {
                margin-bottom: 10px;
                text-align: center;
                width: 100%;
            }
            #cf-wrapper #cf-error-banner .cf-error-actions a {
                display: -moz-inline-stack;
                display: inline-block;
                vertical-align: middle;
                zoom: 1;
            }
            #cf-wrapper #cf-error-banner .cf-error-actions a + a {
                margin-left: 10px;
            }
            #cf-wrapper #cf-error-banner .cf-error-actions .cf-btn-accept,
            #cf-wrapper #cf-error-banner .cf-error-actions .cf-btn-success {
                color: #fff;
            }
            #cf-wrapper #cf-error-banner .error-header-desc {
                text-align: left;
            }
            #cf-wrapper #cf-error-banner .cf-close {
                color: #999;
                cursor: pointer;
                display: inline-block;
                font-size: 34.5px;
                float: none;
                font-weight: 700;
                height: 22.5px;
                line-height: 0.6;
                overflow: hidden;
                position: absolute;
                right: 20px;
                top: 25px;
                text-indent: 200%;
                width: 22.5px;
            }
            #cf-wrapper #cf-error-banner .cf-close:hover {
                color: gray;
            }
            #cf-wrapper #cf-error-banner .cf-close:before {
                content: "\\00D7";
                left: 0;
                height: 100%;
                position: absolute;
                text-align: center;
                text-indent: 0;
                top: 0;
                width: 100%;
            }
            #cf-inline-error-wrapper {
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
            }
            #cf-wrapper #cf-error-details {
                background: #fff;
            }
            #cf-wrapper #cf-error-details .cf-error-overview {
                padding: 25px 0 0;
            }
            #cf-wrapper #cf-error-details .cf-error-overview h1,
            #cf-wrapper #cf-error-details .cf-error-overview h2 {
                font-weight: 300;
            }
            #cf-wrapper #cf-error-details .cf-error-overview h2 {
                margin-top: 0;
            }
            #cf-wrapper #cf-error-details .cf-highlight {
                background: #ebebeb;
                overflow-x: hidden;
                padding: 30px 0;
                background-image: -webkit-gradient(
                    linear,
                    left top,
                    left bottom,
                    from(#dedede),
                    color-stop(3%, #ebebeb),
                    color-stop(97%, #ebebeb),
                    to(#dedede)
                );
                background-image: linear-gradient(
                    top,
                    #dedede,
                    #ebebeb 3%,
                    #ebebeb 97%,
                    #dedede
                );
            }
            #cf-wrapper #cf-error-details .cf-highlight h3 {
                color: #999;
                font-weight: 300;
            }
            #cf-wrapper #cf-error-details .cf-highlight .cf-column:last-child {
                padding-bottom: 0;
            }
            #cf-wrapper #cf-error-details .cf-highlight .cf-highlight-inverse {
                background-color: #fff;
                padding: 15px;
                border-radius: 2px;
            }
            #cf-wrapper #cf-error-details .cf-status-display h3 {
                margin-top: 0.5em;
            }
            #cf-wrapper #cf-error-details .cf-status-label {
                color: #9bca3e;
                font-size: 1.46667em;
            }
            #cf-wrapper #cf-error-details .cf-status-label,
            #cf-wrapper #cf-error-details .cf-status-name {
                display: inline;
            }
            #cf-wrapper #cf-error-details .cf-status-item {
                display: block;
                position: relative;
                text-align: left;
            }
            #cf-wrapper #cf-error-details .cf-status-item,
            #cf-wrapper #cf-error-details .cf-status-item.cf-column {
                padding-bottom: 1.5em;
            }
            #cf-wrapper #cf-error-details .cf-status-item.cf-error-source {
                display: block;
                text-align: center;
            }
            #cf-wrapper
                #cf-error-details
                .cf-status-item.cf-error-source:after {
                bottom: -60px;
                content: "";
                display: none;
                border-bottom: 18px solid #fff;
                border-left: 20px solid transparent;
                border-right: 20px solid transparent;
                height: 0;
                left: 50%;
                margin-left: -9px;
                position: absolute;
                right: 50%;
                width: 0;
            }
            #cf-wrapper #cf-error-details .cf-status-item + .cf-status-item {
                border-top: 1px solid #dedede;
                padding-top: 1.5em;
            }
            #cf-wrapper
                #cf-error-details
                .cf-status-item
                + .cf-status-item:before {
                background: url(/cdn-cgi/images/cf-icon-horizontal-arrow.png)
                    no-repeat;
                content: "";
                display: block;
                left: 0;
                position: absolute;
                top: 25.67px;
            }
            #cf-wrapper
                #cf-error-details
                .cf-error-source
                .cf-icon-error-container {
                height: 85px;
                margin-bottom: 2.5em;
            }
            #cf-wrapper #cf-error-details .cf-error-source .cf-status-label {
                color: #bd2426;
            }
            #cf-wrapper #cf-error-details .cf-error-source .cf-icon {
                display: block;
            }
            #cf-wrapper #cf-error-details .cf-error-source .cf-icon-status {
                bottom: -10px;
                left: 50%;
                top: auto;
                right: auto;
            }
            #cf-wrapper #cf-error-details .cf-error-source .cf-status-label,
            #cf-wrapper #cf-error-details .cf-error-source .cf-status-name {
                display: block;
            }
            #cf-wrapper #cf-error-details .cf-icon-error-container {
                height: auto;
                position: relative;
            }
            #cf-wrapper #cf-error-details .cf-icon-status {
                display: block;
                margin-left: -24px;
                position: absolute;
                top: 0;
                right: 0;
            }
            #cf-wrapper #cf-error-details .cf-icon {
                display: none;
                margin: 0 auto;
            }
            #cf-wrapper #cf-error-details .cf-status-desc {
                display: block;
                height: 22.5px;
                overflow: hidden;
                text-overflow: ellipsis;
                width: 100%;
                white-space: nowrap;
            }
            #cf-wrapper #cf-error-details .cf-status-desc:empty {
                display: none;
            }
            #cf-wrapper #cf-error-details .cf-error-footer {
                padding: 1.33333em 0;
                border-top: 1px solid #ebebeb;
                text-align: center;
            }
            #cf-wrapper #cf-error-details .cf-error-footer p {
                font-size: 13px;
            }
            #cf-wrapper #cf-error-details .cf-error-footer select {
                margin: 0 !important;
            }
            #cf-wrapper #cf-error-details .cf-footer-item {
                display: block;
                margin-bottom: 5px;
                text-align: left;
            }
            #cf-wrapper #cf-error-details .cf-footer-separator {
                display: none;
            }
            #cf-wrapper #cf-error-details .cf-captcha-info {
                margin-bottom: 10px;
                position: relative;
                text-align: center;
            }
            #cf-wrapper #cf-error-details .cf-captcha-image {
                height: 57px;
                width: 300px;
            }
            #cf-wrapper #cf-error-details .cf-captcha-actions {
                margin-top: 15px;
            }
            #cf-wrapper #cf-error-details .cf-captcha-actions a {
                font-size: 0;
                height: 36.38px;
                overflow: hidden;
                padding-left: 1.2em;
                padding-right: 1.2em;
                position: relative;
                text-indent: -9999px;
                width: 36.38px;
                white-space: nowrap;
            }
            #cf-wrapper
                #cf-error-details
                .cf-captcha-actions
                a.cf-icon-refresh
                span {
                background-position: 0 -787px;
            }
            #cf-wrapper
                #cf-error-details
                .cf-captcha-actions
                a.cf-icon-announce
                span {
                background-position: 0 -767px;
            }
            #cf-wrapper
                #cf-error-details
                .cf-captcha-actions
                a.cf-icon-question
                span {
                background-position: 0 -827px;
            }
            #cf-wrapper #cf-error-details .cf-screenshot-container {
                background: url(/cdn-cgi/images/browser-bar.png?1376755637)
                    no-repeat #fff;
                max-height: 400px;
                max-width: 100%;
                overflow: hidden;
                padding-top: 53px;
                width: 960px;
                border-radius: 5px 5px 0 0;
            }
            #cf-wrapper
                #cf-error-details
                .cf-screenshot-container
                .cf-no-screenshot {
                background: url(/cdn-cgi/images/cf-no-screenshot-warn.png)
                    no-repeat;
                display: block;
                height: 158px;
                left: 25%;
                margin-top: -79px;
                overflow: hidden;
                position: relative;
                top: 50%;
                width: 178px;
            }
            #cf-wrapper
                #cf-error-details
                .cf-captcha-container
                .cf-screenshot-container,
            #cf-wrapper
                #cf-error-details
                .cf-captcha-container
                .cf-screenshot-container
                img,
            #recaptcha-widget .cf-alert,
            #recaptcha-widget .recaptcha_only_if_audio,
            .cf-cookie-error {
                display: none;
            }
            #cf-wrapper
                #cf-error-details
                .cf-screenshot-container
                .cf-no-screenshot.error {
                background: url(/cdn-cgi/images/cf-no-screenshot-error.png)
                    no-repeat;
                height: 175px;
            }
            #cf-wrapper
                #cf-error-details
                .cf-screenshot-container.cf-screenshot-full
                .cf-no-screenshot {
                left: 50%;
                margin-left: -89px;
            }
            .cf-captcha-info iframe {
                max-width: 100%;
            }
            #cf-wrapper .cf-icon-ok {
                background: url(/cdn-cgi/images/cf-icon-ok.png) no-repeat;
                height: 48px;
                width: 48px;
            }
            #cf-wrapper .cf-icon-error {
                background: url(/cdn-cgi/images/cf-icon-error.png) no-repeat;
                height: 48px;
                width: 48px;
            }
            #cf-wrapper .cf-icon-browser {
                background: url(/cdn-cgi/images/cf-icon-browser.png) no-repeat;
                height: 80px;
                width: 100px;
            }
            #cf-wrapper .cf-icon-cloud {
                background: url(/cdn-cgi/images/cf-icon-cloud.png) no-repeat;
                height: 77px;
                width: 151px;
            }
            #cf-wrapper .cf-icon-server {
                background: url(/cdn-cgi/images/cf-icon-server.png) no-repeat;
                height: 75px;
                width: 95px;
            }
            #cf-wrapper .cf-caret {
                border: 0.33333em solid transparent;
                border-top-color: inherit;
                content: "";
                height: 0;
                width: 0;
                display: -moz-inline-stack;
                display: inline-block;
                vertical-align: middle;
                zoom: 1;
            }
            @media screen and (min-width: 49.2em) {
                #cf-wrapper #cf-error-details .cf-status-desc:empty,
                #cf-wrapper
                    #cf-error-details
                    .cf-status-item.cf-error-source:after,
                #cf-wrapper #cf-error-details .cf-status-item .cf-icon,
                #cf-wrapper #cf-error-details .cf-status-label,
                #cf-wrapper #cf-error-details .cf-status-name {
                    display: block;
                }
                #cf-wrapper .cf-wrapper {
                    width: 708px;
                }
                #cf-wrapper #cf-error-banner {
                    padding: 20px 20px 25px;
                }
                #cf-wrapper #cf-error-banner .cf-error-actions {
                    margin-bottom: 15px;
                }
                #cf-wrapper #cf-error-banner .cf-error-header-desc h4 {
                    margin-right: 0.5em;
                }
                #cf-wrapper #cf-error-details h1 {
                    font-size: 4em;
                }
                #cf-wrapper #cf-error-details .cf-error-overview {
                    padding-top: 2.33333em;
                }
                #cf-wrapper #cf-error-details .cf-highlight {
                    padding: 4em 0;
                }
                #cf-wrapper #cf-error-details .cf-status-item {
                    text-align: center;
                }
                #cf-wrapper #cf-error-details .cf-status-item,
                #cf-wrapper #cf-error-details .cf-status-item.cf-column {
                    padding-bottom: 0;
                }
                #cf-wrapper
                    #cf-error-details
                    .cf-status-item
                    + .cf-status-item {
                    border: 0;
                    padding-top: 0;
                }
                #cf-wrapper
                    #cf-error-details
                    .cf-status-item
                    + .cf-status-item:before {
                    background-position: 0 -544px;
                    height: 24.75px;
                    margin-left: -37.5px;
                    width: 75px;
                    background-size: 131.25px auto;
                }
                #cf-wrapper #cf-error-details .cf-icon-error-container {
                    height: 85px;
                    margin-bottom: 2.5em;
                }
                #cf-wrapper #cf-error-details .cf-icon-status {
                    bottom: -10px;
                    left: 50%;
                    top: auto;
                    right: auto;
                }
                #cf-wrapper #cf-error-details .cf-error-footer {
                    padding: 2.66667em 0;
                }
                #cf-wrapper #cf-error-details .cf-footer-item,
                #cf-wrapper #cf-error-details .cf-footer-separator {
                    display: -moz-inline-stack;
                    display: inline-block;
                    vertical-align: baseline;
                    zoom: 1;
                }
                #cf-wrapper #cf-error-details .cf-footer-separator {
                    padding: 0 0.25em;
                }
                #cf-wrapper
                    #cf-error-details
                    .cf-status-item.cloudflare-status:before {
                    margin-left: -50px;
                }
                #cf-wrapper
                    #cf-error-details
                    .cf-status-item.cloudflare-status
                    + .status-item:before {
                    margin-left: -25px;
                }
                #cf-wrapper #cf-error-details .cf-screenshot-container {
                    height: 400px;
                    margin-bottom: -4em;
                    max-width: none;
                }
                #cf-wrapper
                    #cf-error-details
                    .cf-captcha-container
                    .cf-screenshot-container,
                #cf-wrapper
                    #cf-error-details
                    .cf-captcha-container
                    .cf-screenshot-container
                    img {
                    display: block;
                }
            }
            @media screen and (min-width: 66em) {
                #cf-wrapper .cf-wrapper {
                    width: 960px;
                }
                #cf-wrapper #cf-error-banner .cf-close {
                    position: relative;
                    right: auto;
                    top: auto;
                }
                #cf-wrapper #cf-error-banner .cf-details {
                    white-space: nowrap;
                }
                #cf-wrapper #cf-error-banner .cf-details-link {
                    padding-right: 0.5em;
                }
                #cf-wrapper #cf-error-banner .cf-error-actions {
                    float: right;
                    margin-bottom: 0;
                    text-align: left;
                    width: auto;
                }
                #cf-wrapper
                    #cf-error-details
                    .cf-status-item
                    + .cf-status-item:before {
                    background-position: 0 -734px;
                    height: 33px;
                    margin-left: -50px;
                    width: 100px;
                    background-size: auto;
                }
                #cf-wrapper
                    #cf-error-details
                    .cf-status-item.cf-cloudflare-status:before {
                    margin-left: -66.67px;
                }
                #cf-wrapper
                    #cf-error-details
                    .cf-status-item.cf-cloudflare-status
                    + .cf-status-item:before {
                    margin-left: -37.5px;
                }
                #cf-wrapper #cf-error-details .cf-captcha-image {
                    float: left;
                }
                #cf-wrapper #cf-error-details .cf-captcha-actions {
                    position: absolute;
                    top: 0;
                    right: 0;
                }
            }
            .no-js #cf-wrapper .js-only {
                display: none;
            }
            #cf-wrapper #cf-error-details .heading-ray-id {
                font-family: monaco, courier, monospace;
                font-size: 15px;
                white-space: nowrap;
            }
            #cf-wrapper #cf-error-details .cf-footer-item.hidden,
            .cf-error-footer .hidden {
                display: none;
            }
            .cf-error-footer .cf-footer-ip-reveal-btn {
                -webkit-appearance: button;
                -moz-appearance: button;
                appearance: button;
                text-decoration: none;
                background: none;
                color: inherit;
                border: none;
                padding: 0;
                font: inherit;
                cursor: pointer;
                color: #0051c3;
                -webkit-transition: color 0.15s ease;
                transition: color 0.15s ease;
            }
            .cf-error-footer .cf-footer-ip-reveal-btn:hover {
                color: #ee730a;
            }
        </style>
        <style>
            body {
                margin: 0;
                padding: 0;
            }
        </style>

        <!--[if gte IE 10]><!-->
        <script>
            if (!navigator.cookieEnabled) {
                window.addEventListener("DOMContentLoaded", function () {
                    var cookieEl = document.getElementById("cookie-alert");
                    cookieEl.style.display = "block";
                });
            }
        <\/script>
        <!--<![endif]-->

        <style type="text/css">
            body {
                margin: 0;
                padding: 0;
            }

            #cf-wrapper {
                font-family:
                    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                    Helvetica, Arial, sans-serif, "Apple Color Emoji",
                    "Segoe UI Emoji", "Segoe UI Symbol" !important;
            }
            .cf-error-description {
                max-width: 600px;
            }
        </style>
    </head>
    <body>
        <div id="cf-wrapper">
            <div
                id="cookie-alert"
                class="cf-alert cf-alert-error cf-cookie-error"
                data-translate="enable_cookies"
            >
                Please enable cookies.
            </div>
            <div id="cf-error-details" class="cf-error-details-wrapper">
                <div class="cf-wrapper cf-header cf-error-overview">
                    <h1>
                        <span
                            class="cf-error-type"
                            data-translate="please check back later"
                            >Please check back later</span
                        >
                    </h1>
                    <h2 class="cf-subheadline">Error 1027</h2>
                </div>

                <div class="cf-section cf-wrapper">
                    <p>
                        <span
                            style="
                                width: 16px;
                                display: inline-block;
                                vertical-align: text-top;
                            "
                        >
                            <svg
                                fill="#b03340"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 16 16"
                            >
                                <path
                                    d="M15.672,14.2,8.3,1.443a.352.352,0,0,0-.609,0L.328,14.2a.352.352,0,0,0,.3.527H15.368A.352.352,0,0,0,15.672,14.2ZM8.743,12.9a.221.221,0,0,1-.221.221H7.478a.221.221,0,0,1-.221-.221V11.86a.221.221,0,0,1,.221-.221H8.522a.221.221,0,0,1,.221.221Zm-.025-2.422H7.282L7.257,6.005H8.743Z"
                                />
                            </svg>
                        </span>
                        <strong>
                            This website has been temporarily rate limited
                        </strong>
                    </p>
                    <p class="cf-error-description">
                        You cannot access this site because the owner has
                        reached their plan limits. Check back later once traffic
                        has gone down.
                    </p>

                    <p class="cf-error-description">
                        If you are owner of this website, prevent this from
                        happening again by upgrading your plan on the
                        <a
                            href="https://dash.cloudflare.com/?account=workers/plans"
                            target="_blank"
                            >Cloudflare Workers dashboard</a
                        >.
                    </p>

                    <p>
                        <a
                            href="https://developers.cloudflare.com/workers/about/limits/#number-of-requests-limit"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Learn more about this issue →
                        </a>
                    </p>
                </div>

                <div class="cf-error-footer cf-wrapper">
                    <p>
                        <span class="cf-footer-item"
                            >Cloudflare Ray ID: ${req.headers.get("cf-ray") ?? ""}</span
                        >
                        <span class="cf-footer-separator">&bull;</span>
                        <span class="cf-footer-item"
                            >${formatDate(/* @__PURE__ */ new Date())}</span
                        >
                        <span
                            id="cf-footer-item-ip"
                            class="cf-footer-item hidden"
                        >
                            <span class="cf-footer-separator">&bull;</span>
                            Your IP:
                            <button
                                type="button"
                                id="cf-footer-ip-reveal"
                                class="cf-footer-ip-reveal-btn"
                            >
                                Click to reveal
                            </button>
                            <span class="hidden" id="cf-footer-ip"
                                >${ip}</span
                            >
                        </span>
                        <span class="cf-footer-separator">&bull;</span>
                        <span class="cf-footer-item"
                            ><span>Runs on </span
                            ><a
                                rel="noopener noreferrer"
                                href="https://workers.cloudflare.com?utm_source=error_footer"
                                id="brand_link"
                                target="_blank"
                                >Cloudflare Workers</a
                            ></span
                        >
                    </p>
                    <script>
                        (function () {
                            function d() {
                                var b = a.getElementById("cf-footer-item-ip"),
                                    c = a.getElementById("cf-footer-ip-reveal");
                                b &&
                                    "classList" in b &&
                                    (b.classList.remove("hidden"),
                                    c.addEventListener("click", function () {
                                        c.classList.add("hidden");
                                        a.getElementById(
                                            "cf-footer-ip",
                                        ).classList.remove("hidden");
                                    }));
                            }
                            var a = document;
                            document.addEventListener &&
                                a.addEventListener("DOMContentLoaded", d);
                        })();
                    <\/script>
                </div>
                <!-- /.error-footer -->
            </div>
        </div>

        <script>
            window._cf_translation = {};
        <\/script>
    </body>
</html>`;
}

//#endregion
//#region ../workers-shared/router-worker/src/worker.ts
var worker_default = { async fetch(request, env, ctx) {
	const loopbackCtx = ctx;
	const analytics = new Analytics(env.ANALYTICS);
	let inner;
	try {
		if (env.COLO_METADATA && env.VERSION_METADATA && env.CONFIG) {
			const url = new URL(request.url);
			analytics.setData({
				accountId: env.CONFIG.account_id,
				scriptId: env.CONFIG.script_id,
				coloId: env.COLO_METADATA.coloId,
				metalId: env.COLO_METADATA.metalId,
				coloTier: env.COLO_METADATA.coloTier,
				coloRegion: env.COLO_METADATA.coloRegion,
				hostname: url.hostname,
				version: env.VERSION_METADATA.tag
			});
		}
		inner = loopbackCtx.exports.RouterInnerEntrypoint({ props: {} });
	} catch (err) {
		setupSentry(request, ctx, env.SENTRY_DSN, env.SENTRY_ACCESS_CLIENT_ID, env.SENTRY_ACCESS_CLIENT_SECRET, env.COLO_METADATA, env.VERSION_METADATA, env.CONFIG?.account_id, env.CONFIG?.script_id)?.captureException(err);
		if (err instanceof Error) analytics.setData({ error: err.message });
		analytics.write();
		throw err;
	}
	return inner.fetch(request);
} };
var RouterInnerEntrypoint = class extends WorkerEntrypoint {
	async fetch(request) {
		let sentry;
		let userWorkerInvocation = false;
		const analytics = new Analytics(this.env.ANALYTICS);
		const performance = new PerformanceTimer(this.env.UNSAFE_PERFORMANCE);
		const startTimeMs = performance.now();
		try {
			if (!this.env.JAEGER) this.env.JAEGER = mockJaegerBinding();
			sentry = setupSentry(request, this.ctx, this.env.SENTRY_DSN, this.env.SENTRY_ACCESS_CLIENT_ID, this.env.SENTRY_ACCESS_CLIENT_SECRET, this.env.COLO_METADATA, this.env.VERSION_METADATA, this.env.CONFIG?.account_id, this.env.CONFIG?.script_id);
			const hasStaticRouting = this.env.CONFIG.static_routing !== void 0;
			const config = applyRouterConfigDefaults(this.env.CONFIG);
			const eyeballConfig = applyEyeballConfigDefaults(this.env.EYEBALL_CONFIG);
			const url = new URL(request.url);
			if (this.env.COLO_METADATA && this.env.VERSION_METADATA && this.env.CONFIG) analytics.setData({
				accountId: this.env.CONFIG.account_id,
				scriptId: this.env.CONFIG.script_id,
				coloId: this.env.COLO_METADATA.coloId,
				metalId: this.env.COLO_METADATA.metalId,
				coloTier: this.env.COLO_METADATA.coloTier,
				coloRegion: this.env.COLO_METADATA.coloRegion,
				hostname: url.hostname,
				version: this.env.VERSION_METADATA.tag,
				userWorkerAhead: config.invoke_user_worker_ahead_of_assets
			});
			if (url.pathname.startsWith("/cdn-cgi/") && request.url.includes("/cdn-cgi\\")) {
				analytics.setData({ cdnCgiBackslashBypassUrl: request.url });
				return new TemporaryRedirectResponse(url.href);
			}
			const routeToUserWorker = async ({ asset }) => {
				if (!config.has_user_worker) throw new Error("Fetch for user worker without having a user worker binding");
				if (eyeballConfig.limitedAssetsOnly) {
					analytics.setData({ userWorkerFreeTierLimiting: true });
					return new Response(renderLimitedResponse(request), {
						status: 429,
						headers: { "Content-Type": "text/html" }
					});
				}
				analytics.setData({ dispatchtype: DISPATCH_TYPE.WORKER });
				userWorkerInvocation = true;
				return this.env.JAEGER.enterSpan("dispatch_worker", async (span) => {
					span.setTags({
						hasUserWorker: true,
						asset,
						dispatchType: DISPATCH_TYPE.WORKER
					});
					let shouldCheckContentType = false;
					if (url.pathname.endsWith("/_next/image")) {
						const queryURLParam = url.searchParams.get("url");
						if (queryURLParam && !queryURLParam.startsWith("/")) {
							if (request.method !== "GET" || request.headers.get("sec-fetch-dest") !== "image") {
								shouldCheckContentType = true;
								analytics.setData({ abuseMitigationURLHost: queryURLParam });
							}
						}
					}
					if (url.pathname === "/_image") {
						const hrefParam = url.searchParams.get("href");
						if (hrefParam && hrefParam.length > 2 && hrefParam.startsWith("//")) try {
							const hrefUrl = new URL("https:" + hrefParam);
							const isImageFetchDest = request.headers.get("sec-fetch-dest") == "image";
							if (hrefUrl.hostname !== url.hostname && !isImageFetchDest) {
								analytics.setData({ xssDetectionImageHref: hrefParam });
								return new Response("Blocked", { status: 403 });
							}
						} catch {
							console.log(`Invalid href parameter in /_image: ${hrefParam}`);
						}
					}
					analytics.setData({ timeToDispatch: performance.now() - startTimeMs });
					if (shouldCheckContentType) {
						const response = await this.env.USER_WORKER.fetch(request);
						if (response.status !== 304 && shouldBlockContentType(response)) {
							analytics.setData({ abuseMitigationBlocked: true });
							return new Response("Blocked", { status: 403 });
						}
						return response;
					}
					return this.env.USER_WORKER.fetch(request);
				});
			};
			const routeToAssets = async ({ asset }) => {
				analytics.setData({ dispatchtype: DISPATCH_TYPE.ASSETS });
				return await this.env.JAEGER.enterSpan("dispatch_assets", async (span) => {
					span.setTags({
						hasUserWorker: config.has_user_worker,
						asset,
						dispatchType: DISPATCH_TYPE.ASSETS
					});
					analytics.setData({ timeToDispatch: performance.now() - startTimeMs });
					return this.env.ASSET_WORKER.fetch(request);
				});
			};
			if (config.static_routing) {
				if (generateStaticRoutingRuleMatcher(config.static_routing.asset_worker ?? [])({ request })) {
					analytics.setData({ staticRoutingDecision: STATIC_ROUTING_DECISION.ROUTED });
					return await routeToAssets({ asset: "static_routing" });
				}
				if (generateStaticRoutingRuleMatcher(config.static_routing.user_worker ?? [])({ request })) {
					if (!config.has_user_worker) throw new Error("Fetch for user worker without having a user worker binding");
					analytics.setData({ staticRoutingDecision: STATIC_ROUTING_DECISION.ROUTED });
					return await routeToUserWorker({ asset: "static_routing" });
				}
				analytics.setData({ staticRoutingDecision: hasStaticRouting ? STATIC_ROUTING_DECISION.NOT_ROUTED : STATIC_ROUTING_DECISION.NOT_PROVIDED });
			}
			if (config.invoke_user_worker_ahead_of_assets) return await routeToUserWorker({ asset: "static_routing" });
			const assetsExist = await this.env.ASSET_WORKER.unstable_canFetch(new Request(request.url, {
				headers: request.headers,
				method: request.method
			}));
			if (config.has_user_worker && !assetsExist) return await routeToUserWorker({ asset: "none" });
			return await routeToAssets({ asset: assetsExist ? "found" : "none" });
		} catch (err) {
			if (userWorkerInvocation) throw err;
			else if (err instanceof Error) analytics.setData({ error: err.message });
			if (sentry) sentry.captureException(err);
			throw err;
		} finally {
			analytics.setData({ requestTime: performance.now() - startTimeMs });
			analytics.write();
		}
	}
};
/**
* Check if the Content Type is allowed for the the `_next/image` endpoint.
*
* - Content Type with multiple values should be blocked
* - Only Image and Plain Text types are not blocked
*
* @param contentType The value of the Content Type header (`null` if no set)
* @returns Whether the Content Type should be blocked
*/
function shouldBlockContentType(response) {
	const contentType = response.headers.get("content-type");
	if (contentType === null) return true;
	if (contentType.includes(",")) return true;
	return !(contentType.startsWith("image/") || contentType.split(";")[0] === "text/plain");
}

//#endregion
export { RouterInnerEntrypoint, worker_default as default };