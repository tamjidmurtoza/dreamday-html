/*
 * Builds the ThemeForest upload package:
 *
 *   dist/dreamday/
 *   ├─ documentation/      buyer documentation
 *   └─ template/           HTML pages + assets (placeholder images from assets/img-TF)
 *   dist/dreamday.zip
 *
 * The real preview photos in assets/img are never copied, so licensed images
 * can't end up in the download by mistake.
 *
 * Usage: npm run package
 */
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");
const OUT = path.join(DIST, "dreamday");
const TEMPLATE = path.join(OUT, "template");

// Never shipped inside template/
const EXCLUDE = new Set([
  ".git", ".vscode", ".idea", "node_modules", "dist", "scripts",
  "documentation", ".gitignore", ".prettierignore",
]);

function copyDir(src, dest, skip = () => false) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (skip(from, entry.name)) continue;
    if (entry.isDirectory()) copyDir(from, to, skip);
    else fs.copyFileSync(from, to);
  }
}

// --- 1. Make sure every image used by the pages has a placeholder ---
const pages = fs.readdirSync(ROOT).filter((f) => f.endsWith(".html"));
const missing = new Set();
for (const page of pages) {
  const html = fs.readFileSync(path.join(ROOT, page), "utf8");
  for (const [, file] of html.matchAll(/assets\/img\/([\w.-]+)/g)) {
    if (!fs.existsSync(path.join(ROOT, "assets/img-TF", file))) missing.add(file);
  }
}
if (missing.size) {
  console.error("Missing placeholders in assets/img-TF:\n  " + [...missing].join("\n  "));
  process.exit(1);
}

// --- 2. Copy files ---
fs.rmSync(DIST, { recursive: true, force: true });
copyDir(ROOT, TEMPLATE, (from, name) => {
  const rel = path.relative(ROOT, from).replace(/\\/g, "/");
  return EXCLUDE.has(name) && !rel.includes("/") ? true
    : rel === "assets/img" || rel === "assets/img-TF";
});
copyDir(path.join(ROOT, "assets/img-TF"), path.join(TEMPLATE, "assets/img"));
copyDir(path.join(ROOT, "documentation"), path.join(OUT, "documentation"));

// Buyers get the SCSS build scripts, not this packaging script
const pkgPath = path.join(TEMPLATE, "package.json");
if (fs.existsSync(pkgPath)) {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  delete pkg.scripts.package;
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
}

// --- 3. Zip (small built-in writer, no dependencies) ---
const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = zlib.crc32 || ((buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
});

function listFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? listFiles(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

const locals = [];
const central = [];
let offset = 0;
for (const file of listFiles(OUT)) {
  const name = Buffer.from(path.relative(DIST, file).replace(/\\/g, "/"));
  const data = fs.readFileSync(file);
  const deflated = zlib.deflateRawSync(data, { level: 9 });
  const stored = deflated.length >= data.length;
  const body = stored ? data : deflated;
  const crc = crc32(data);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x0800, 6); // UTF-8 names
  local.writeUInt16LE(stored ? 0 : 8, 8);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(body.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(name.length, 26);
  locals.push(local, name, body);

  const entry = Buffer.alloc(46);
  entry.writeUInt32LE(0x02014b50, 0);
  entry.writeUInt16LE(20, 4);
  entry.writeUInt16LE(20, 6);
  entry.writeUInt16LE(0x0800, 8);
  entry.writeUInt16LE(stored ? 0 : 8, 10);
  entry.writeUInt32LE(crc, 16);
  entry.writeUInt32LE(body.length, 20);
  entry.writeUInt32LE(data.length, 24);
  entry.writeUInt16LE(name.length, 28);
  entry.writeUInt32LE(offset, 42);
  central.push(entry, name);

  offset += local.length + name.length + body.length;
}
const centralBuf = Buffer.concat(central);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(central.length / 2, 8);
end.writeUInt16LE(central.length / 2, 10);
end.writeUInt32LE(centralBuf.length, 12);
end.writeUInt32LE(offset, 16);
fs.writeFileSync(path.join(DIST, "dreamday.zip"), Buffer.concat([...locals, centralBuf, end]));

const mb = (fs.statSync(path.join(DIST, "dreamday.zip")).size / 1e6).toFixed(2);
console.log(`Package ready: dist/dreamday.zip (${mb} MB, ${central.length / 2} files)`);
