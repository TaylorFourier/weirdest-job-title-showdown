import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Real hotel post: the night auditor assigned to a single minibar cashew.
const title = "Night Auditor to One Minibar Cashew";

const MAX = 60;

function assertTitle(text: string): void {
  if (text.length === 0 || text.trim() !== text) {
    throw new Error("title must be non-empty and unpadded");
  }
  if (/[\r\n]/.test(text)) {
    throw new Error("title must be a single line");
  }
  if (!/^[\x20-\x7E]+$/.test(text)) {
    throw new Error("title must be printable ASCII");
  }
  if (/[.!?]/.test(text)) {
    throw new Error("title must be a job title, not a sentence");
  }
  if (!text.includes(" ")) {
    throw new Error("title must be more than one word");
  }
  const codePoints = Array.from(text).length;
  const utf16Units = text.length;
  const bytes = Buffer.byteLength(text, "utf8");
  if (codePoints > MAX || utf16Units > MAX || bytes > MAX) {
    throw new Error(
      `title exceeds ${MAX}: codepoints=${codePoints} utf16=${utf16Units} bytes=${bytes}`,
    );
  }
}

function outputDir(): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR;
  if (dir === undefined || dir.length === 0) {
    return "/output";
  }
  return dir;
}

function entryPath(dir: string): string {
  const root = dir.endsWith("/") ? dir.slice(0, -1) : dir;
  return `${root}/entry.txt`;
}

assertTitle(title);
const dir = outputDir();
mkdirSync(dir, { recursive: true });
const file = entryPath(dir);
writeFileSync(file, title, { encoding: "utf8" });

const written = readFileSync(file);
if (written.includes(10) || written.includes(13)) {
  throw new Error("entry.txt must not contain a newline");
}
if (!written.equals(Buffer.from(title, "utf8"))) {
  throw new Error("entry.txt bytes differ from the title");
}

const codePoints = Array.from(title).length;
const digest = createHash("sha256").update(written).digest("hex");
process.stdout.write(
  `codepoints=${codePoints} utf16=${title.length} bytes=${written.length} sha256=${digest}\n`,
);
