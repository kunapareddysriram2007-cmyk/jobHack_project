import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicRoot = path.resolve(__dirname, "..", "public");
const port = Number(process.env.PORT || 4173);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"]
]);

const pageRoutes = new Map([
  ["/", "/index.html"],
  ["/index", "/index.html"],
  ["/index.html", "/index.html"],
  ["/login", "/pages/login.html"],
  ["/login.html", "/pages/login.html"],
  ["/signup", "/pages/signup.html"],
  ["/signup.html", "/pages/signup.html"],
  ["/dashboard", "/pages/dashboard.html"],
  ["/dashboard.html", "/pages/dashboard.html"],
  ["/planner", "/pages/planner.html"],
  ["/planner.html", "/pages/planner.html"],
  ["/growth", "/pages/growth.html"],
  ["/growth.html", "/pages/growth.html"],
  ["/account", "/pages/account.html"],
  ["/account.html", "/pages/account.html"]
]);

const server = createServer(async (request, response) => {
  try {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, {
        "Allow": "GET, HEAD",
        "Content-Type": "text/plain; charset=utf-8"
      });
      response.end("Method not allowed.");
      return;
    }

    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    const requestPath = normalizeRequestPath(requestUrl.pathname);
    const candidatePath = pageRoutes.get(requestPath) || requestPath;
    const filePath = resolvePath(candidatePath);
    const stat = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const headers = buildHeaders(ext, stat);

    if (request.headers["if-none-match"] === headers.ETag) {
      delete headers["Content-Length"];
      response.writeHead(304, headers);
      response.end();
      return;
    }

    response.writeHead(200, headers);
    if (request.method === "HEAD") {
      response.end();
      return;
    }

    const body = await fs.readFile(filePath);
    response.end(body);
  } catch (error) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("File not found.");
  }
});

server.listen(port, () => {
  console.log(`JobHack Lite is running at http://localhost:${port}`);
});

export { server };

/**
 * Keep requests inside the public folder. SPA-style requests without an extension
 * fall back to the main document, while asset requests must map to a real file.
 * @param {string} pathname
 * @returns {string}
 */
function resolvePath(pathname) {
  if (!path.extname(pathname)) {
    return path.join(publicRoot, "index.html");
  }

  const decoded = decodeURIComponent(pathname).replace(/^\/+/, "");
  const absolutePath = path.resolve(publicRoot, decoded);
  const relativePath = path.relative(publicRoot, absolutePath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Path traversal blocked.");
  }

  return absolutePath;
}

function normalizeRequestPath(pathname) {
  const decoded = decodeURIComponent(pathname || "/");
  const normalized = decoded.startsWith("/") ? decoded : `/${decoded}`;

  return normalized.length > 1 && normalized.endsWith("/")
    ? normalized.slice(0, -1)
    : normalized;
}

function buildHeaders(ext, stat) {
  return {
    "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=300",
    "Content-Length": String(stat.size),
    "Content-Type": contentTypes.get(ext) || "application/octet-stream",
    "ETag": createEtag(stat),
    "Last-Modified": stat.mtime.toUTCString(),
    "X-Content-Type-Options": "nosniff"
  };
}

function createEtag(stat) {
  return `"${stat.size.toString(16)}-${Math.floor(stat.mtimeMs).toString(16)}"`;
}
