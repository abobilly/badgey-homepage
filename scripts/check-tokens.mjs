#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const TARGETS = [
  path.join(repoRoot, "src"),
  path.join(repoRoot, "index.html"),
];

const SKIP_DIRS = new Set([
  "node_modules",
  "dist",
  "build",
  ".turbo",
  ".next",
  ".git",
  ".idea",
  ".vscode",
  "coverage",
  "badgey-logos",
]);

const TEXT_EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".css",
  ".scss",
  ".sass",
  ".less",
  ".html",
]);

const PATTERNS = [
  {
    name: "Hex color literal",
    regex: /#[0-9a-f]{3,8}\b/i,
    message: "Replace hex literal with a semantic/alpha token.",
  },
  {
    name: "rgb/rgba literal",
    regex: /\brgba?\(/i,
    message: "Replace rgb/rgba usage with tokens.",
  },
  {
    name: "hsl literal",
    regex: /\bhsla?\((?!\s*var\()/i,
    message: "Use semantic tokens instead of numeric hsl/hsla.",
  },
  {
    name: "bg-black/white utility",
    regex: /bg-(?:black|white)\/\d+/i,
    message: "Use overlay tokens instead of bg-black/white.",
  },
  {
    name: "Arbitrary literal utility",
    regex: /(?:bg|text|border|ring|stroke|fill|shadow|from|via|to)-\[[^\]]*(?:#|rgba?\(|hsla?\()(?!\s*var\()[^\]]*\]/i,
    message: "Arbitrary color utilities must reference tokens.",
  },
  {
    name: "Inline hsl alpha",
    regex: /hsl\(var\(--[^)]+?\)\s*\/[^)]+\)/i,
    message: "Alpha must come from dedicated tokens.",
  },
];

const errors = [];

for (const target of TARGETS) {
  if (fs.existsSync(target)) {
    const stats = fs.statSync(target);
    if (stats.isDirectory()) {
      walk(target);
    } else if (shouldCheckFile(target)) {
      scanFile(target);
    }
  }
}

if (errors.length > 0) {
  console.error("❌ Token guard violations found:\n");
  for (const err of errors) {
    console.error(`${err.file}:${err.line} – ${err.message}`);
    console.error(`  ${err.example}\n`);
  }
  console.error(`Total violations: ${errors.length}`);
  process.exit(1);
}

console.log("✅ Token guard passed.");

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) {
        walk(path.join(dir, entry.name));
      }
      continue;
    }

    const filePath = path.join(dir, entry.name);
    if (shouldCheckFile(filePath)) {
      scanFile(filePath);
    }
  }
}

function shouldCheckFile(filePath) {
  const ext = path.extname(filePath);
  if (ext && TEXT_EXTENSIONS.has(ext)) {
    return true;
  }
  return false;
}

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);

  lines.forEach((line, idx) => {
    PATTERNS.forEach((pattern) => {
      if (pattern.regex.test(line)) {
        errors.push({
          file: path.relative(repoRoot, filePath),
          line: idx + 1,
          message: `${pattern.name}: ${pattern.message}`,
          example: line.trim(),
        });
      }
    });
  });
}
