import { lt as join } from "../_build/common.mjs";
import { a as findRoute, i as findAllRoutes, n as addRoute, r as createRouter, t as compileRouterToString } from "../_libs/rou3.mjs";
import { runtimeDir } from "nitro/meta";
import { hash } from "ohash";
const isGlobalMiddleware = (h) => !h.method && (!h.route || h.route === "/**");
function initNitroRouting(nitro) {
	const envConditions = new Set([
		nitro.options.dev ? "dev" : "prod",
		nitro.options.preset,
		nitro.options.preset === "nitro-prerender" ? "prerender" : void 0
	].filter(Boolean));
	const matchesEnv = (h) => {
		const envs = (Array.isArray(h.env) ? h.env : [h.env]).filter(Boolean);
		return envs.length === 0 || envs.some((env) => envConditions.has(env));
	};
	const routes = new Router(nitro.options.baseURL);
	const routeRules = new Router(nitro.options.baseURL);
	const globalMiddleware = [];
	const routedMiddleware = new Router(nitro.options.baseURL);
	const sync = () => {
		routeRules._update(Object.entries(nitro.options.routeRules).map(([route, data]) => ({
			route,
			method: "",
			data: {
				...data,
				_route: route
			}
		})));
		const _routes = [
			...Object.entries(nitro.options.routes).flatMap(([route, handler]) => {
				if (typeof handler === "string") handler = { handler };
				return {
					...handler,
					route,
					middleware: false
				};
			}),
			...nitro.options.handlers,
			...nitro.scannedHandlers
		].filter((h) => h && !h.middleware && matchesEnv(h));
		if (nitro.options.serverEntry && nitro.options.serverEntry.handler) _routes.push({
			route: "/**",
			lazy: false,
			format: nitro.options.serverEntry.format,
			handler: nitro.options.serverEntry.handler
		});
		if (nitro.options.renderer?.handler) _routes.push({
			route: "/**",
			lazy: true,
			handler: nitro.options.renderer?.handler
		});
		routes._update(_routes.map((h) => ({
			...h,
			method: h.method || "",
			data: handlerWithImportHash(h)
		})), { merge: true });
		const _middleware = [...nitro.scannedHandlers, ...nitro.options.handlers].filter((h) => h && h.middleware && matchesEnv(h));
		if (nitro.options.serveStatic) _middleware.unshift({
			route: "/**",
			middleware: true,
			handler: join(runtimeDir, "internal/static")
		});
		globalMiddleware.splice(0, globalMiddleware.length, ..._middleware.filter((h) => isGlobalMiddleware(h)).map((m) => handlerWithImportHash(m)));
		routedMiddleware._update(_middleware.filter((h) => !isGlobalMiddleware(h)).map((h) => ({
			...h,
			method: h.method || "",
			data: handlerWithImportHash(h)
		})));
	};
	nitro.routing = Object.freeze({
		sync,
		routes,
		routeRules,
		globalMiddleware,
		routedMiddleware
	});
}
function handlerWithImportHash(h) {
	const id = (h.lazy ? "_lazy_" : "_") + hash(h.handler).replace(/-/g, "").slice(0, 6);
	return {
		...h,
		_importHash: id
	};
}
var Router = class {
	_routes;
	_router;
	_compiled;
	_baseURL;
	constructor(baseURL) {
		this._update([]);
		this._baseURL = baseURL || "";
		if (this._baseURL.endsWith("/")) this._baseURL = this._baseURL.slice(0, -1);
	}
	get routes() {
		return this._routes;
	}
	_update(routes, opts) {
		this._routes = routes;
		this._router = createRouter();
		this._compiled = void 0;
		for (const route of routes) addRoute(this._router, route.method, this._baseURL + route.route, route.data);
		if (opts?.merge) mergeCatchAll(this._router);
	}
	hasRoutes() {
		return this._routes.length > 0;
	}
	compileToString(opts) {
		const key = opts ? hash(opts) : "";
		this._compiled ||= {};
		if (this._compiled[key]) return this._compiled[key];
		this._compiled[key] = compileRouterToString(this._router, void 0, opts);
		if (this.routes.length === 1 && this.routes[0].route === "/**" && this.routes[0].method === "") {
			const data = (opts?.serialize || JSON.stringify)(this.routes[0].data);
			let retCode = `{data,params:{"_":p.slice(1)}}`;
			if (opts?.matchAll) retCode = `[${retCode}]`;
			this._compiled[key] = `/* @__PURE__ */ (() => {const data=${data};return ((_m, p)=>{return ${retCode};})})()`;
		}
		return this._compiled[key];
	}
	match(method, path) {
		return findRoute(this._router, method, path)?.data;
	}
	matchAll(method, path) {
		return findAllRoutes(this._router, method, path).map((route) => route.data);
	}
};
function mergeCatchAll(router) {
	const handlers = router.root?.wildcard?.methods?.[""];
	if (!handlers || handlers.length < 2) return;
	handlers.splice(0, handlers.length, {
		...handlers[0],
		data: handlers.map((h) => h.data)
	});
}
export { initNitroRouting as n, Router as t };
