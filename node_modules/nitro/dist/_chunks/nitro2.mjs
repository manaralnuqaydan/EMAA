import { M as glob, dt as relative, lt as join } from "../_build/common.mjs";
import { withBase, withLeadingSlash, withoutTrailingSlash } from "ufo";
const GLOB_SCAN_PATTERN = "**/*.{js,mjs,cjs,ts,mts,cts,tsx,jsx}";
const suffixRegex = /(\.(?<method>connect|delete|get|head|options|patch|post|put|trace))?(\.(?<env>dev|prod|prerender))?$/;
async function scanAndSyncOptions(nitro) {
	const scannedPlugins = await scanPlugins(nitro);
	for (const plugin of scannedPlugins) if (!nitro.options.plugins.includes(plugin)) nitro.options.plugins.push(plugin);
	if (nitro.options.experimental.tasks) {
		const scannedTasks = await scanTasks(nitro);
		for (const scannedTask of scannedTasks) if (scannedTask.name in nitro.options.tasks) {
			if (!nitro.options.tasks[scannedTask.name].handler) nitro.options.tasks[scannedTask.name].handler = scannedTask.handler;
		} else nitro.options.tasks[scannedTask.name] = {
			handler: scannedTask.handler,
			description: ""
		};
	}
	const scannedModules = await scanModules(nitro);
	nitro.options.modules = nitro.options.modules || [];
	for (const modPath of scannedModules) if (!nitro.options.modules.includes(modPath)) nitro.options.modules.push(modPath);
}
async function scanHandlers(nitro) {
	const middleware = await scanMiddleware(nitro);
	const handlers = await Promise.all([scanServerRoutes(nitro, nitro.options.apiDir || "api", nitro.options.apiBaseURL || "/api"), scanServerRoutes(nitro, nitro.options.routesDir || "routes")]).then((r) => r.flat());
	const seenHandlers = /* @__PURE__ */ new Set();
	nitro.scannedHandlers = [...middleware, ...handlers.filter((h) => {
		const key = `${h.route}\0${h.method}\0${h.env}`;
		return seenHandlers.has(key) ? false : (seenHandlers.add(key), true);
	})];
	nitro.routing.sync();
	return handlers;
}
async function scanMiddleware(nitro) {
	return (await scanFiles(nitro, "middleware")).map((file) => {
		return {
			route: "/**",
			middleware: true,
			handler: file.fullPath
		};
	});
}
async function scanServerRoutes(nitro, dir, prefix = "/") {
	return (await scanFiles(nitro, dir)).map((file) => {
		let route = file.path.replace(/\.[A-Za-z]+$/, "").replace(/\(([^(/\\]+)\)[/\\]/g, "").replace(/\[\.{3}]/g, "**").replace(/\[\.{3}([^\]]+)]/g, (_, p) => "**:" + p.replace(/[^\w-]/g, "_")).replace(/\[([^/\]]+)]/g, (_, p) => ":" + p.replace(/[^\w-]/g, "_"));
		route = withLeadingSlash(withoutTrailingSlash(withBase(route, prefix)));
		const suffixMatch = route.match(suffixRegex);
		let method;
		let env;
		if (suffixMatch?.index && suffixMatch?.index >= 0) {
			route = route.slice(0, suffixMatch.index);
			method = suffixMatch.groups?.method;
			env = suffixMatch.groups?.env;
		}
		route = route.replace(/\/index$/, "") || "/";
		return {
			handler: file.fullPath,
			lazy: true,
			middleware: false,
			route,
			method,
			env
		};
	});
}
async function scanPlugins(nitro) {
	return (await scanFiles(nitro, "plugins")).map((f) => f.fullPath);
}
async function scanTasks(nitro) {
	return (await scanFiles(nitro, "tasks")).map((f) => {
		return {
			name: f.path.replace(/\/index$/, "").replace(/\.[A-Za-z]+$/, "").replace(/\//g, ":"),
			handler: f.fullPath
		};
	});
}
async function scanModules(nitro) {
	return (await scanFiles(nitro, "modules")).map((f) => f.fullPath);
}
async function scanFiles(nitro, name) {
	return await Promise.all(nitro.options.scanDirs.map((dir) => scanDir(nitro, dir, name))).then((r) => r.flat());
}
async function scanDir(nitro, dir, name) {
	return (await glob(join(name, GLOB_SCAN_PATTERN), {
		cwd: dir,
		dot: true,
		ignore: nitro.options.ignore,
		absolute: true
	}).catch((error) => {
		if (error?.code === "ENOTDIR") {
			nitro.logger.warn(`Ignoring \`${join(dir, name)}\`. It must be a directory.`);
			return [];
		}
		throw error;
	})).map((fullPath) => {
		return {
			fullPath,
			path: relative(join(dir, name), fullPath)
		};
	}).sort((a, b) => a.path.localeCompare(b.path));
}
export { scanHandlers as n, scanAndSyncOptions as t };
