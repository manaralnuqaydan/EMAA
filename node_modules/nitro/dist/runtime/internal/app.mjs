import { H3Core, toRequest } from "h3";
import { HookableCore } from "hookable";
import { nitroAsyncContext } from "./context.mjs";

import errorHandler from "#nitro/virtual/error-handler";
import { plugins } from "#nitro/virtual/plugins";
import { findRoute, findRouteRules, globalMiddleware, findRoutedMiddleware } from "#nitro/virtual/routing";
import { hasRouteRules, hasRoutedMiddleware, hasGlobalMiddleware, hasRoutes, hasHooks, hasPlugins } from "#nitro/virtual/feature-flags";
const APP_ID = import.meta.prerender ? "prerender" : "default";
export function useNitroApp() {
	let instance = useNitroApp._instance;
	if (instance) {
		return instance;
	}
	instance = useNitroApp._instance = createNitroApp();
	globalThis.__nitro__ = globalThis.__nitro__ || {};
	globalThis.__nitro__[APP_ID] = instance;
	if (hasPlugins) {
		initNitroPlugins(instance);
	}
	return instance;
}
export function useNitroHooks() {
	const nitroApp = useNitroApp();
	const hooks = nitroApp.hooks;
	if (hooks) {
		return hooks;
	}
	return nitroApp.hooks = new HookableCore();
}
export function serverFetch(resource, init, context) {
	const req = toRequest(resource, init);
	req.context = {
		...req.context,
		...context
	};
	const appHandler = useNitroApp().fetch;
	try {
		return Promise.resolve(appHandler(req));
	} catch (error) {
		return Promise.reject(error);
	}
}
export async function resolveWebsocketHooks(req) {
	
	const hooks = (await serverFetch(req)).crossws;
	return hooks || {};
}
export function fetch(resource, init, context) {
	if (typeof resource === "string" && resource.charCodeAt(0) === 47) {
		return serverFetch(resource, init, context);
	}
	resource = resource._request || resource;
	return globalThis.fetch(resource, init);
}
function createNitroApp() {
	const hooks = hasHooks ? new HookableCore() : undefined;
	const captureError = (error, errorCtx) => {
		const promise = hasHooks && hooks.callHook("error", error, errorCtx)?.catch?.((hookError) => {
			console.error("Error while capturing another error", hookError);
		});
		if (errorCtx?.event) {
			const errors = errorCtx.event.req.context?.nitro?.errors;
			if (errors) {
				errors.push({
					error,
					context: errorCtx
				});
			}
			if (hasHooks && promise && typeof errorCtx.event.req.waitUntil === "function") {
				errorCtx.event.req.waitUntil(promise);
			}
		}
	};
	const h3App = createH3App({ onError(error, event) {
		hasHooks && captureError(error, { event });
		return errorHandler(error, event);
	} });
	if (hasHooks) {
		h3App.config.onRequest = (event) => {
			return hooks.callHook("request", event)?.catch?.((error) => {
				captureError(error, {
					event,
					tags: ["request"]
				});
			});
		};
		h3App.config.onResponse = (res, event) => {
			return hooks.callHook("response", res, event)?.catch?.((error) => {
				captureError(error, {
					event,
					tags: ["response"]
				});
			});
		};
	}
	let appHandler = (req) => {
		req.context ||= {};
		req.context.nitro = req.context.nitro || { errors: [] };
		return h3App.fetch(req);
	};
	
	if (import.meta._asyncContext) {
		const originalHandler = appHandler;
		appHandler = (req) => {
			const asyncCtx = { request: req };
			return nitroAsyncContext.callAsync(asyncCtx, () => originalHandler(req));
		};
	}
	const app = {
		fetch: appHandler,
		h3: h3App,
		hooks,
		captureError
	};
	return app;
}
function initNitroPlugins(app) {
	for (const plugin of plugins) {
		try {
			plugin(app);
		} catch (error) {
			app.captureError?.(error, { tags: ["plugin"] });
			throw error;
		}
	}
	return app;
}
function createH3App(config) {
	
	const h3App = new H3Core(config);
	
	hasRoutes && (h3App["~findRoute"] = (event) => findRoute(event.req.method, event.url.pathname));
	hasGlobalMiddleware && h3App["~middleware"].push(...globalMiddleware);
	if (hasRouteRules || hasRoutedMiddleware) {
		h3App["~getMiddleware"] = (event, route) => {
			const needsRouting = hasRouteRules || hasRoutedMiddleware;
			const pathname = needsRouting ? event.url.pathname : undefined;
			const method = needsRouting ? event.req.method : undefined;
			const middleware = [];
			if (hasRouteRules) {
				const routeRules = getRouteRules(method, pathname);
				event.context.routeRules = routeRules?.routeRules;
				if (routeRules?.routeRuleMiddleware.length) {
					middleware.push(...routeRules.routeRuleMiddleware);
				}
			}
			hasGlobalMiddleware && middleware.push(...h3App["~middleware"]);
			hasRoutedMiddleware && middleware.push(...findRoutedMiddleware(method, pathname).map((r) => r.data));
			if (hasRoutes && route?.data?.middleware?.length) {
				middleware.push(...route.data.middleware);
			}
			return middleware;
		};
	}
	return h3App;
}
export function getRouteRules(method, pathname) {
	const m = findRouteRules(method, pathname);
	if (!m?.length) {
		return { routeRuleMiddleware: [] };
	}
	const routeRules = {};
	for (const layer of m) {
		for (const rule of layer.data) {
			const currentRule = routeRules[rule.name];
			if (currentRule) {
				if (rule.options === false) {
					
					delete routeRules[rule.name];
					continue;
				}
				if (typeof currentRule.options === "object" && typeof rule.options === "object") {
					
					currentRule.options = {
						...currentRule.options,
						...rule.options
					};
				} else {
					
					currentRule.options = rule.options;
				}
				
				currentRule.route = rule.route;
				currentRule.params = {
					...currentRule.params,
					...layer.params
				};
			} else if (rule.options !== false) {
				routeRules[rule.name] = {
					...rule,
					params: layer.params
				};
			}
		}
	}
	const middleware = [];
	const orderedRules = Object.values(routeRules).sort((a, b) => (a.handler?.order || 0) - (b.handler?.order || 0));
	for (const rule of orderedRules) {
		if (rule.options === false || !rule.handler) {
			continue;
		}
		middleware.push(rule.handler(rule));
	}
	return {
		routeRules,
		routeRuleMiddleware: middleware
	};
}
