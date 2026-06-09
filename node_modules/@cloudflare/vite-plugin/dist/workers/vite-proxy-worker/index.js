import { WorkerEntrypoint } from "cloudflare:workers";

//#region src/workers/vite-proxy-worker/index.ts
var ViteProxyWorker = class extends WorkerEntrypoint {
	constructor(ctx, env) {
		super(ctx, env);
		return new Proxy(this, { get(target, prop) {
			if (Reflect.has(target, prop)) return Reflect.get(target, prop);
			return Reflect.get(target.env.ENTRY_USER_WORKER, prop);
		} });
	}
	async fetch(request) {
		if (request.headers.get("Upgrade")) return this.env.ENTRY_USER_WORKER.fetch(request);
		return this.env.__VITE_MIDDLEWARE__.fetch(request);
	}
	tail(events) {
		return this.env.ENTRY_USER_WORKER.tail(JSON.parse(JSON.stringify(events, tailEventsReplacer), tailEventsReviver));
	}
};
const serializedDate = "___serialized_date___";
function tailEventsReplacer(_, value) {
	if (value instanceof Date) return { [serializedDate]: value.toISOString() };
	return value;
}
function tailEventsReviver(_, value) {
	if (value && typeof value === "object" && serializedDate in value && typeof value[serializedDate] === "string") return new Date(value[serializedDate]);
	return value;
}

//#endregion
export { ViteProxyWorker as default };