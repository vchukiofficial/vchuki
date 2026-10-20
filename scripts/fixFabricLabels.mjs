#!/usr/bin/env node
/**
 * Replace "100% (premium) linen" claims stored in the database with the honest blend label.
 *
 *   node scripts/fixFabricLabels.mjs                      # dry run — shows what would change
 *   node scripts/fixFabricLabels.mjs --apply              # writes the changes
 *   node scripts/fixFabricLabels.mjs --apply --label "55% Linen / 45% Cotton"
 *
 * Requires MONGODB_URI in the environment (or .env.local).
 */

import { MongoClient } from "mongodb";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const APPLY = args.includes("--apply");
const labelIdx = args.indexOf("--label");
const LABEL = labelIdx >= 0 ? args[labelIdx + 1] : "Cotton-linen blend";

function loadEnv() {
  if (process.env.MONGODB_URI) return;
  const file = join(REPO, ".env.local");
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const PURE_LINEN = /100\s*%\s*(premium\s*)?linen/i;

loadEnv();
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set (env or .env.local).");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db();

const variants = await db.collection("productvariants").find({ fabric: { $regex: PURE_LINEN } }).project({ sku: 1, fabric: 1 }).toArray();
const products = await db.collection("products").find({ description: { $regex: PURE_LINEN } }).project({ name: 1, description: 1 }).toArray();

console.log(`${variants.length} variant(s) with a pure-linen fabric label`);
for (const v of variants) console.log(`  ${v.sku}: "${v.fabric}" → "${LABEL}"`);
console.log(`${products.length} product description(s) mentioning 100% linen`);
for (const p of products) console.log(`  ${p.name}`);

if (!APPLY) {
  console.log("\nDry run. Re-run with --apply to write these changes.");
} else {
  if (variants.length) {
    await db.collection("productvariants").updateMany({ fabric: { $regex: PURE_LINEN } }, { $set: { fabric: LABEL } });
  }
  for (const p of products) {
    await db.collection("products").updateOne(
      { _id: p._id },
      { $set: { description: p.description.replace(/100\s*%\s*(premium\s*)?linen/gi, `a premium ${LABEL.toLowerCase()}`) } }
    );
  }
  console.log("\nDone.");
}

await client.close();
