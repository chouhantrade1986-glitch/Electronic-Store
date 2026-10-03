const http = require("http");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".map": "application/json; charset=utf-8"
};

const COMPRESSIBLE_EXTENSIONS = new Set([
  ".html", ".css", ".js", ".json", ".svg", ".ico", ".txt", ".xml", ".webmanifest", ".map"
]);

function resolveFile(requestPath, root) {
  const cleanPath = decodeURIComponent(String(requestPath || "/").split("?")[0]);
  const relativePath = cleanPath === "/" ? "/index.html" : cleanPath;
  const filePath = path.normalize(path.join(root, relativePath));
  if (!filePath.startsWith(root)) {
    return null;
  }
  return filePath;
}

function computeEtag(stats) {
  return `W/"${stats.size.toString(16)}-${Math.round(stats.mtimeMs).toString(16)}"`;
}

function pickEncoding(acceptEncoding) {
  const header = String(acceptEncoding || "").toLowerCase();
  if (/\bbr\b/.test(header)) {
    return "br";
  }
  if (/\bgzip\b/.test(header)) {
    return "gzip";
  }
  return null;
}

function createCompressor(encoding) {
  if (encoding === "br") {
    return zlib.createBrotliCompress({
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: 5,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: 1 << 20
      }
    });
  }
  return zlib.createGzip({ level: 6 });
}

function resolveNoCache(options) {
  if (typeof options.noCache === "boolean") {
    return options.noCache;
  }
  return String(process.env.QA_NO_CACHE || "").trim() === "1";
}

function createStaticServer(options = {}) {
  const root = options.root || process.cwd();
  const backendPort = Number(options.backendPort || process.env.BACKEND_PORT || 4000);
  const noCache = resolveNoCache(options);

  return http.createServer((req, res) => {
    if (req.url && (req.url.startsWith("/api/") || req.url === "/api" || req.url.startsWith("/api?"))) {
      const proxyReq = http.request(
        {
          hostname: "127.0.0.1",
          port: backendPort,
          path: req.url,
          method: req.method,
          headers: {
            ...req.headers,
            host: `127.0.0.1:${backendPort}`
          }
        },
        (proxyRes) => {
          res.writeHead(proxyRes.statusCode, proxyRes.headers);
          proxyRes.pipe(res);
        }
      );
      proxyReq.on("error", (err) => {
        res.writeHead(502, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ error: "Backend proxy error", message: err.message }));
      });
      req.pipe(proxyReq);
      return;
    }

    const filePath = resolveFile(req.url || "/", root);
    if (!filePath) {
      res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Forbidden");
      return;
    }

    fs.stat(filePath, (statError, stats) => {
      if (statError || !stats.isFile()) {
        res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Not found");
        return;
      }

      const extension = path.extname(filePath).toLowerCase();
      const etag = computeEtag(stats);

      if (!noCache && req.headers["if-none-match"] === etag) {
        res.writeHead(304, {
          "ETag": etag,
          "Cache-Control": "no-cache",
          "Vary": "Accept-Encoding"
        });
        res.end();
        return;
      }

      const baseHeaders = {
        "Content-Type": CONTENT_TYPES[extension] || "application/octet-stream",
        "Cache-Control": noCache ? "no-store" : "no-cache",
        "ETag": etag,
        "Last-Modified": stats.mtime.toUTCString(),
        "Vary": "Accept-Encoding"
      };

      const encoding = COMPRESSIBLE_EXTENSIONS.has(extension)
        ? pickEncoding(req.headers["accept-encoding"])
        : null;

      if (!encoding) {
        res.writeHead(200, { ...baseHeaders, "Content-Length": stats.size });
        const stream = fs.createReadStream(filePath);
        stream.on("error", () => {
          res.destroy();
        });
        stream.pipe(res);
        return;
      }

      res.writeHead(200, { ...baseHeaders, "Content-Encoding": encoding });
      const compressor = createCompressor(encoding);
      compressor.on("error", () => {
        res.destroy();
      });
      const stream = fs.createReadStream(filePath);
      stream.on("error", () => {
        res.destroy();
      });
      stream.pipe(compressor).pipe(res);
    });
  });
}

if (require.main === module) {
  const PORT = Number(process.argv[2] || process.env.FRONTEND_PORT || 5500);
  const server = createStaticServer({ root: process.cwd() });
  server.listen(PORT, "127.0.0.1", () => {
    // eslint-disable-next-line no-console
    console.log(`qa-static-server listening on http://127.0.0.1:${PORT}`);
  });
}

module.exports = { createStaticServer, computeEtag, pickEncoding };
