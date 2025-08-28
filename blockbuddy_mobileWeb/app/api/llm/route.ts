import { NextRequest } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const url = process.env.LLM_URL || "http://127.0.0.1:8001/generate";
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: body.text, history: body.history ?? [], max_new_tokens: 64, temperature: 0.0, top_p: 1.0 }),
    });
    const txt = await r.text();
    return new Response(txt, { status: r.status, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    return new Response(JSON.stringify({ text: "" }), { status: 502, headers: { "Content-Type": "application/json" } });
  }
}
