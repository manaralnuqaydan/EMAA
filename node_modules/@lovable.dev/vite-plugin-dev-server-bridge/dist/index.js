// src/index.ts
var RESTART_ANNOUNCE_PATH = "/__lovable/restart-announce";
var RESTART_EVENT = "lovable:dev-server-restarting";
var MAX_BODY_BYTES = 1024;
function readJsonBody(req) {
  return new Promise((resolve) => {
    let received = 0;
    const chunks = [];
    let aborted = false;
    req.on("data", (chunk) => {
      if (aborted)
        return;
      received += chunk.length;
      if (received > MAX_BODY_BYTES) {
        aborted = true;
        resolve(null);
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (aborted)
        return;
      if (chunks.length === 0) {
        resolve(null);
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        resolve(null);
      }
    });
    req.on("error", () => resolve(null));
  });
}
function devServerBridgePlugin() {
  return {
    name: "lovable-dev-server-bridge",
    apply: "serve",
    configureServer(srv) {
      srv.middlewares.use((req, res, next) => {
        if (req.method !== "POST")
          return next();
        const path = (req.url ?? "").split("?", 1)[0];
        if (path !== RESTART_ANNOUNCE_PATH)
          return next();
        void readJsonBody(req).then((parsed) => {
          const reason = parsed && typeof parsed === "object" && "reason" in parsed && typeof parsed.reason === "string" ? parsed.reason : void 0;
          srv.ws.send({
            type: "custom",
            event: RESTART_EVENT,
            data: reason ? { reason } : {}
          });
          res.writeHead(204);
          res.end();
        });
      });
    }
  };
}
export {
  devServerBridgePlugin
};
