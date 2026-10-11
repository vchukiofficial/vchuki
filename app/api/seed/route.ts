import { NextResponse } from "next/server"

// The old seed endpoint wiped every collection behind a password that lived in
// source control. It is permanently disabled on every deployment — use
// `npm run seed` (scripts/seed.ts) against a local database instead.
// Safe to delete this file entirely.
export async function GET() {
  return NextResponse.json({ error: "Not found" }, { status: 404 })
}
