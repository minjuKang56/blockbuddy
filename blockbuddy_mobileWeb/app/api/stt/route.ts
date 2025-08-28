import { NextRequest } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const r = await fetch(`${process.env.BACKEND}/stt`, { method: "POST", body: form });
  const txt = await r.text();
  return new Response(txt, { status: r.status, headers: { "Content-Type": "application/json" } });
}
