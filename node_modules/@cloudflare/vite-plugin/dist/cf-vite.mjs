import { parseArgs } from "node:util";
import { createBuilder, createServer } from "vite";

//#region src/build-output-env.ts
/**
* Shared definition of the internal env var that the `cf-vite build`
* delegate uses to force the experimental Build Output API on by default.
*/
const FORCE_BUILD_OUTPUT_ENV_VAR = "CLOUDFLARE_VITE_FORCE_BUILD_OUTPUT";

//#endregion
//#region src/cf-vite.ts
/**
* `cf-vite` delegate binary entry point for `@cloudflare/vite-plugin`.
*
* EXPERIMENTAL / internal: spawned by Cloudflare's "cf-dev" parent
* process, not invoked directly by end users. Contract may change.
*
* Usage: `<pkgRoot>/bin/cf-vite <verb> [flags...]`. `dev` and `build`
* are the verbs today; future verbs follow the same shape.
* Unknown/missing verbs exit 2 (also the parent's version-detection
* signal).
*
* Every verb forces the experimental Build Output API on by default by
* setting `CLOUDFLARE_VITE_FORCE_BUILD_OUTPUT` in `main()` before Vite
* loads the user's config; the plugin reads it during config resolution
* to enable `experimental.newConfig` + `experimental.newConfig.cfBuildOutput`.
*
* Spawn contract for `dev`: parent uses `stdio: "inherit"` and forwards
* SIGINT/SIGTERM. Accepted flags mirror the sibling `cf-wrangler`
* delegate (`--mode`, `--port`, `--host`, `--local`) so the parent can
* drive either impl interchangeably; everything else lives in the user's
* `vite.config.ts` / `wrangler.jsonc` (including the wrangler config
* file, which is discovered by `cloudflare()` itself). `cf-vite` boots
* Vite via `createServer()` against the user's own config (expected to
* include `cloudflare()`); flags are bridged to it as documented inline.
*
* `build` runs Vite's full multi-environment app build via
* `createBuilder().buildApp()` (NOT the legacy single-environment
* `build()` helper, which would skip the plugin's worker builds). It
* accepts only `--mode` (the other shared flags don't apply to a build).
*
* Exit codes: 0 graceful, 2 unknown verb / parse error, 130 SIGINT,
* 143 SIGTERM.
*/
var ArgParseError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "ArgParseError";
	}
};
/** Strict argv parser; mirrors `cf-wrangler`'s flags (unknown → throw). */
function parseDevArgs(argv) {
	let parsed;
	try {
		parsed = parseArgs({
			args: argv,
			options: {
				mode: { type: "string" },
				host: { type: "string" },
				port: { type: "string" },
				local: { type: "boolean" }
			},
			strict: true,
			allowPositionals: false
		});
	} catch (err) {
		throw new ArgParseError(err instanceof Error ? err.message : String(err));
	}
	const out = {};
	if (parsed.values.mode !== void 0) out.mode = parsed.values.mode;
	if (parsed.values.host !== void 0) out.host = parsed.values.host;
	if (parsed.values.port !== void 0) {
		const raw = parsed.values.port;
		const n = Number(raw);
		if (!Number.isInteger(n) || n < 0 || n > 65535) throw new ArgParseError(`--port expects an integer between 0 and 65535, got "${raw}"`);
		out.port = n;
	}
	if (parsed.values.local !== void 0) out.local = parsed.values.local;
	return out;
}
function parseBuildArgs(argv) {
	let parsed;
	try {
		parsed = parseArgs({
			args: argv,
			options: { mode: { type: "string" } },
			strict: true,
			allowPositionals: false
		});
	} catch (err) {
		throw new ArgParseError(err instanceof Error ? err.message : String(err));
	}
	const out = {};
	if (parsed.values.mode !== void 0) out.mode = parsed.values.mode;
	return out;
}
async function main() {
	const verb = process.argv[2];
	const userArgv = process.argv.slice(3);
	process.env[FORCE_BUILD_OUTPUT_ENV_VAR] = "true";
	if (verb === "dev") return runDev(userArgv);
	if (verb === "build") return runBuild(userArgv);
	process.stderr.write(`Error: unknown subcommand "${verb ?? ""}".\nUsage: cf-vite <dev|build> [args]\n`);
	return 2;
}
async function runDev(userArgv) {
	let args;
	try {
		args = parseDevArgs(userArgv);
	} catch (err) {
		if (err instanceof ArgParseError) {
			process.stderr.write(`Error: ${err.message}\n`);
			return 2;
		}
		throw err;
	}
	if (args.local) process.env.CLOUDFLARE_VITE_FORCE_LOCAL = "true";
	const serverOptions = {};
	if (args.port !== void 0) serverOptions.port = args.port;
	if (args.host !== void 0) serverOptions.host = args.host;
	const inlineConfig = { server: serverOptions };
	if (args.mode !== void 0) inlineConfig.mode = args.mode;
	const server = await createServer(inlineConfig);
	await server.listen();
	server.printUrls();
	server.bindCLIShortcuts({ print: true });
	let closing = false;
	const shutdown = (signal) => {
		if (closing) return;
		closing = true;
		(async () => {
			try {
				await server.close();
				process.exit(0);
			} catch {
				process.exit(signal === "SIGINT" ? 130 : 143);
			}
		})();
	};
	process.on("SIGINT", () => shutdown("SIGINT"));
	process.on("SIGTERM", () => shutdown("SIGTERM"));
	return new Promise(() => {});
}
async function runBuild(userArgv) {
	let args;
	try {
		args = parseBuildArgs(userArgv);
	} catch (err) {
		if (err instanceof ArgParseError) {
			process.stderr.write(`Error: ${err.message}\n`);
			return 2;
		}
		throw err;
	}
	const inlineConfig = {};
	if (args.mode !== void 0) inlineConfig.mode = args.mode;
	await (await createBuilder(inlineConfig)).buildApp();
	return 0;
}
const exitCode = await main();
process.exit(exitCode);

//#endregion
export {  };