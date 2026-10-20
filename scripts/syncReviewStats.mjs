#!/usr/bin/env node
/**
 * One-time fix: reset every product's rating and reviewCount to what its approved reviews
 * actually say. Listing cards were showing hand-entered numbers (e.g. "4.7 ★ (64)") while the
 * product page showed "1 review" — shoppers notice that gap.
 *
 *   node scripts/syncReviewStats.mjs           # dry run — prints old vs real numbers
 *   node scripts/syncReviewStats.mjs --apply   # writes the real numbers
 *
 * New reviews keep products in sync automatically (lib/reviewStats.ts).
 * Requires MONGODB_URI in the environment (or .env.local).
 */

import { MongoClient } from "mongodb";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const REPO = join(dirname(fileURLToPath(import.meta.url)), "..");
const APPLY = process.argv.includes("--apply");

if (!process.env.MONGODB_URI) {
  const file = join(REPO, ".env.local");
  if (existsSync(file)) {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  }
}
if (!process.env.MONGODB_URI) {
  console.error("MONGODB_URI is not set (env or .env.local).");
  process.exit(1);
}

const client = new MongoClient(process.env.MONGODB_URI);
await client.connect();
const db = client.db();

const stats = await db.collection("reviews").aggregate([
  { $match: { status: "approved" } },
  { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
]).toArray();
const byProduct = new Map(stats.map((s) => [String(s._id), s]));

const products = await db.collection("products").find({}).project({ name: 1, rating: 1, reviewCount: 1 }).toArray();
let changes = 0;
for (const p of products) {
  const s = byProduct.get(String(p._id));
  const rating = s ? Math.round(s.avg * 10) / 10 : 0;
  const reviewCount = s?.count ?? 0;
  if (p.rating === rating && p.reviewCount === reviewCount) continue;
  changes++;
  console.log(`${p.name}: ${p.rating ?? 0} ★ (${p.reviewCount ?? 0})  →  ${rating} ★ (${reviewCount})`);
  if (APPLY) await db.collection("products").updateOne({ _id: p._id }, { $set: { rating, reviewCount } });
}

console.log(`\n${changes} product(s) ${APPLY ? "updated" : "would change"}.${APPLY ? "" : " Re-run with --apply to write."}`);
await client.close();
