// npm run dev: يشغّل الواجهة وخادم البايثون مع بعض بأمر واحد.
// أول مرة يسوي بيئة بايثون (model/.venv) ويثبت requirements.txt تلقائيًا.
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const modelDir = join(root, "model");
const venv = join(modelDir, ".venv");
const win = process.platform === "win32";
const py = join(venv, win ? "Scripts/python.exe" : "bin/python");
const API_PORT = process.env.EMAA_API_PORT || "8000";

const log = (msg) => console.log(`\x1b[35m[emaa]\x1b[0m ${msg}`);

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", ...opts });
  return r.status === 0;
}

function findSystemPython() {
  for (const cmd of win ? ["py", "python", "python3"] : ["python3", "python"]) {
    const r = spawnSync(cmd, ["--version"], { encoding: "utf8" });
    if (r.status === 0) return cmd;
  }
  return null;
}

function ensurePython() {
  if (!existsSync(py)) {
    const sys = findSystemPython();
    if (!sys) {
      log("ما لقيت Python. ثبتوا Python 3.10 أو أحدث من python.org ثم أعيدوا npm run dev");
      return false;
    }
    log("أول تشغيل: أسوي بيئة بايثون في model/.venv ...");
    if (!run(sys, ["-m", "venv", venv])) return false;
  }
  // نعيد التثبيت فقط إذا تغير requirements.txt
  const req = join(modelDir, "requirements.txt");
  const hash = createHash("sha1").update(readFileSync(req)).digest("hex");
  const stamp = join(venv, ".emaa-requirements");
  if (!existsSync(stamp) || readFileSync(stamp, "utf8") !== hash) {
    log("أثبت مكتبات الخادم (مرة وحدة بس) ...");
    if (!run(py, ["-m", "pip", "install", "-q", "-r", req])) return false;
    writeFileSync(stamp, hash);
  }
  return true;
}

const children = [];
function start(name, cmd, args, cwd) {
  const child = spawn(cmd, args, { cwd, stdio: "inherit" });
  child.on("exit", (code) => {
    if (code && code !== 0) log(`${name} توقف (رمز ${code})`);
  });
  children.push(child);
  return child;
}

if (!existsSync(join(modelDir, ".env"))) {
  log(
    "ما فيه model/.env: المساعد بيرد بردود جاهزة بس. انسخوا model/.env.example إلى model/.env وحطوا مفتاح Claude فيه.",
  );
}

if (ensurePython()) {
  log(`الخادم على http://localhost:${API_PORT}`);
  start("الخادم", py, ["-m", "uvicorn", "api:app", "--port", API_PORT], modelDir);
} else {
  log("الواجهة بتشتغل بدون الخادم. شوفوا الخطأ فوق.");
}

const vite = join(root, "node_modules", "vite", "bin", "vite.js");
start("الواجهة", process.execPath, [vite, "dev", ...process.argv.slice(2)], root);

const stop = () => {
  for (const c of children) if (!c.killed) c.kill();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
