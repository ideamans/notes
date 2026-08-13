// src/build.ts
import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { dirname, join, resolve } from "path";

// src/zip.ts
import { deflateRawSync } from "zlib";
var LOCAL_SIG = 67324752;
var CENTRAL_SIG = 33639248;
var EOCD_SIG = 101010256;
var METHOD_STORE = 0;
var METHOD_DEFLATE = 8;
var FLAG_UTF8 = 2048;
function zipSync(entries, modified) {
  const [dosTime, dosDate] = toDosDateTime(modified);
  const locals = [];
  const centrals = [];
  let offset = 0;
  for (const entry of entries) {
    const name = Buffer.from(entry.name, "utf8");
    const raw = Buffer.from(entry.data);
    const crc = crc32(raw);
    const deflated = deflateRawSync(raw, { level: 6 });
    const useDeflate = deflated.length < raw.length;
    const body = useDeflate ? deflated : raw;
    const method = useDeflate ? METHOD_DEFLATE : METHOD_STORE;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(LOCAL_SIG, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(FLAG_UTF8, 6);
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(dosTime, 10);
    local.writeUInt16LE(dosDate, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    locals.push(local, name, body);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(CENTRAL_SIG, 0);
    central.writeUInt16LE(20, 4);
    central.writeUInt16LE(20, 6);
    central.writeUInt16LE(FLAG_UTF8, 8);
    central.writeUInt16LE(method, 10);
    central.writeUInt16LE(dosTime, 12);
    central.writeUInt16LE(dosDate, 14);
    central.writeUInt32LE(crc, 16);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(raw.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt16LE(0, 30);
    central.writeUInt16LE(0, 32);
    central.writeUInt16LE(0, 34);
    central.writeUInt16LE(0, 36);
    central.writeUInt32LE(33188 << 16 >>> 0, 38);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, name);
    offset += local.length + name.length + body.length;
  }
  const centralBuf = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(EOCD_SIG, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, centralBuf, eocd]);
}
function toDosDateTime(d) {
  const year = Math.max(d.getFullYear(), 1980);
  const time = d.getHours() << 11 | d.getMinutes() << 5 | d.getSeconds() >> 1;
  const date = year - 1980 << 9 | d.getMonth() + 1 << 5 | d.getDate();
  return [time, date];
}
var crcTable = null;
function crc32(buf) {
  if (crcTable === null) {
    crcTable = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) {
        c = c & 1 ? 3988292384 ^ c >>> 1 : c >>> 1;
      }
      crcTable[i] = c >>> 0;
    }
  }
  let crc = 4294967295;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 255] ^ crc >>> 8;
  }
  return (crc ^ 4294967295) >>> 0;
}

// src/hash.ts
import { createHash } from "crypto";
function contentHash(files) {
  const h = createHash("sha256");
  const zero = Buffer.from([0]);
  for (const path of [...files.keys()].sort()) {
    const fileHash = createHash("sha256").update(files.get(path)).digest("hex");
    h.update(Buffer.from(path, "utf8"));
    h.update(zero);
    h.update(Buffer.from(fileHash, "utf8"));
    h.update(zero);
  }
  return "sha256:" + h.digest("hex");
}

// src/build.ts
var PACKAGE_VERSION = "0.1.0";
var FORMAT_VERSION = 1;
var DOCS_DIR = "docs";
var SECTION_FILE = "_index.md";
async function buildKnowledgePackage(siteConfig, options) {
  const pages = await loadPages(options.include);
  const published = publishedFilter(siteConfig?.outDir);
  const documents = [];
  const unpublished = [];
  for (const page of pages) {
    const doc = options.map(page);
    if (!doc) continue;
    const url = doc.url ?? page.url;
    validateDocument(options.id, url, doc);
    if (!published(url)) {
      unpublished.push(url);
      continue;
    }
    documents.push({ ...doc, url, body: page.body });
  }
  if (unpublished.length > 0) {
    console.log(
      `[knowledge-indexer] ${options.id}: \u516C\u958B\u3055\u308C\u3066\u3044\u306A\u3044 ${unpublished.length} \u30DA\u30FC\u30B8\u3092\u9664\u5916 (${unpublished.slice(0, 5).join(", ")}${unpublished.length > 5 ? " \u307B\u304B" : ""})`
    );
  }
  return buildKnowledgePackageFromDocuments(options, documents);
}
async function buildKnowledgePackageFromDocuments(options, documents) {
  const files = /* @__PURE__ */ new Map();
  const encoder = new TextEncoder();
  const seenPaths = /* @__PURE__ */ new Set();
  let documentCount = 0;
  for (const doc of documents) {
    validateDocument(options.id, doc.url, doc);
    const path = docPathFromURL(doc.url);
    if (seenPaths.has(path)) {
      throw new Error(
        `[knowledge-indexer] ${options.id}: \u30D1\u30B9\u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059: ${path}
URL \u304C\u540C\u3058\u30DA\u30FC\u30B8\u304C2\u3064\u3042\u308A\u307E\u3059\uFF08${doc.url}\uFF09\u3002map \u3067 id \u3092\u660E\u793A\u3059\u308B\u304B\u3001\u5BFE\u8C61\u306E glob \u3092\u898B\u76F4\u3057\u3066\u304F\u3060\u3055\u3044\u3002`
      );
    }
    seenPaths.add(path);
    files.set(path, encoder.encode(renderDocument(doc, doc.body ?? "")));
    documentCount++;
  }
  if (documentCount === 0) {
    throw new Error(
      `[knowledge-indexer] ${options.id}: \u30C9\u30AD\u30E5\u30E1\u30F3\u30C8\u304C0\u4EF6\u3067\u3059\u3002\u53D6\u308A\u8FBC\u307F\u5BFE\u8C61\u306E\u6307\u5B9A\uFF08include / \u30AF\u30ED\u30FC\u30EB\u7BC4\u56F2\uFF09\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002`
    );
  }
  for (const [dir, body] of Object.entries(options.sections ?? {})) {
    const path = dir === "." || dir === "" ? `${DOCS_DIR}/${SECTION_FILE}` : `${DOCS_DIR}/${dir}/${SECTION_FILE}`;
    files.set(path, encoder.encode(body.endsWith("\n") ? body : body + "\n"));
  }
  const builtAt = /* @__PURE__ */ new Date();
  const hash = contentHash(files);
  const generation = `${compactISO(builtAt)}-${hash.slice("sha256:".length, "sha256:".length + 7)}`;
  const manifest = {
    format: FORMAT_VERSION,
    id: options.id,
    title: options.title,
    description: options.description ?? "",
    origin: options.origin.replace(/\/$/, ""),
    lang: "ja",
    generation: {
      id: generation,
      built_at: builtAt.toISOString(),
      generator: `@ideamans/knowledge-indexer/${PACKAGE_VERSION}`,
      content_hash: hash
    },
    access: options.access ?? "public",
    documents: { count: documentCount },
    search: {
      fields: options.search?.fields,
      facets: options.search?.facets ?? ["category_path", "tags"],
      display: {
        summary: true,
        snippet: true,
        breadcrumb: true,
        thumbnail: true,
        date: true,
        ...options.search?.display
      }
    },
    outline: options.outline ?? {}
  };
  const entries = [{ name: "manifest.json", data: encoder.encode(JSON.stringify(manifest, null, 2)) }];
  for (const [path, bytes] of [...files.entries()].sort(([a], [b]) => a < b ? -1 : 1)) {
    entries.push({ name: path, data: bytes });
  }
  const zipped = zipSync(entries, builtAt);
  const out = resolve(options.out ?? `knowledge/${options.id}.zip`);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, zipped);
  return { out, documents: documentCount, generation, bytes: zipped.length };
}
function publishedFilter(outDir) {
  if (!outDir || !existsSync(outDir)) {
    return () => true;
  }
  return (url) => {
    const rel = url.replace(/^\//, "").split(/[?#]/)[0] ?? "";
    const candidates = rel.endsWith(".html") ? [rel] : rel === "" || rel.endsWith("/") ? [`${rel}index.html`] : [`${rel}.html`, `${rel}/index.html`];
    return candidates.some((c) => existsSync(join(outDir, c)));
  };
}
async function loadPages(include) {
  const { createContentLoader } = await import("vitepress");
  const patterns = Array.isArray(include) ? include : [include];
  const loader = createContentLoader(patterns, { includeSrc: true, excerpt: true });
  const raw = await loader.load();
  return raw.map((item) => {
    const body = stripFrontmatter(item.src ?? "");
    return {
      url: item.url,
      frontmatter: item.frontmatter ?? {},
      body,
      // createContentLoader の excerpt は**レンダリング済みHTML**。
      // そのまま summary にすると <h1 id="..."> などが検索結果に出てしまう。
      excerpt: toPlainText(item.excerpt),
      src: item.src,
      firstHeading: firstHeading(body)
    };
  });
}
function toPlainText(html) {
  if (!html) return void 0;
  const text = html.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  return text || void 0;
}
var FRONTMATTER_RE = /^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/;
function firstHeading(body) {
  let inFence = false;
  for (const line of body.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = line.match(/^#{1,3}\s+(.+?)\s*#*\s*$/);
    if (m?.[1]) return m[1].trim();
  }
  return void 0;
}
function stripFrontmatter(src) {
  return src.replace(FRONTMATTER_RE, "");
}
function docPathFromURL(url) {
  let p = url.replace(/^\//, "").replace(/\.html$/, "");
  if (p === "" || p.endsWith("/")) p += "index";
  return `${DOCS_DIR}/${p}.md`;
}
function validateDocument(setID, url, doc) {
  const where = `[knowledge-indexer] ${setID} (${url})`;
  if (!url.startsWith("/")) {
    throw new Error(`${where}: url \u306F\u30B5\u30A4\u30C8\u76F8\u5BFE\uFF08/ \u59CB\u307E\u308A\uFF09\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059: ${url}`);
  }
  if (!doc.title || !doc.title.trim()) {
    throw new Error(
      `${where}: title \u304C\u7A7A\u3067\u3059\u3002frontmatter \u306B title \u304C\u7121\u3044\u30B5\u30A4\u30C8\u3067\u306F\u3001map \u306E\u4E2D\u3067\u672C\u6587\u306EH1\u304B\u3089\u88DC\u3063\u3066\u304F\u3060\u3055\u3044\u3002`
    );
  }
}
function renderDocument(doc, body) {
  const lines = ["---"];
  const push = (key, value) => {
    if (value === void 0 || value === null || value === "") return;
    if (Array.isArray(value) && value.length === 0) return;
    lines.push(`${key}: ${toYAML(value)}`);
  };
  push("id", doc.id);
  push("url", doc.url);
  push("title", doc.title);
  push("summary", doc.summary && oneLine(doc.summary));
  push("category_path", doc.category_path);
  push("category_labels", doc.category_labels);
  push("breadcrumb", doc.breadcrumb);
  push("tags", doc.tags);
  push("author", doc.author);
  push("image", doc.image);
  push("published_at", toRFC3339(doc.published_at));
  push("updated_at", toRFC3339(doc.updated_at));
  push("headings", doc.headings);
  if (doc.weight !== void 0 && doc.weight !== 1) push("weight", doc.weight);
  lines.push("---", "");
  return lines.join("\n") + "\n" + body.trimStart();
}
function toYAML(value) {
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === "object") return JSON.stringify(value);
  return JSON.stringify(String(value));
}
function toRFC3339(value) {
  if (value === void 0 || value === null || value === "") return void 0;
  if (value instanceof Date) return value.toISOString();
  const s = String(value).trim();
  const dotted = s.match(/^(\d{4})\.(\d{2})\.(\d{2})(?:\s+(\d{2}):(\d{2}))?$/);
  if (dotted) {
    const [, y, m, d, hh = "00", mm = "00"] = dotted;
    return `${y}-${m}-${d}T${hh}:${mm}:00+09:00`;
  }
  const plain = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (plain) {
    const [, y, m, d, hh = "00", mm = "00", ss = "00"] = plain;
    return `${y}-${m}-${d}T${hh}:${mm}:${ss}+09:00`;
  }
  const parsed = new Date(s);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`[knowledge-indexer] \u65E5\u4ED8\u3092\u89E3\u91C8\u3067\u304D\u307E\u305B\u3093: ${JSON.stringify(value)}`);
  }
  return parsed.toISOString();
}
function oneLine(s) {
  return s.replace(/\s+/g, " ").trim();
}
function compactISO(d) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
}
export {
  buildKnowledgePackage,
  buildKnowledgePackageFromDocuments,
  contentHash
};
