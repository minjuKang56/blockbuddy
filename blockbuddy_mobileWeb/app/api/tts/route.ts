import { NextRequest } from "next/server";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json(); // { text, imageUrl?, speaker_wav? }
    const fd = new FormData();
    fd.set("text", body.text);

    if (body.speaker_wav) {
      fd.set("speaker_wav", body.speaker_wav);
    } else if (body.imageUrl) {
      const isAbs = /^https?:\/\//i.test(body.imageUrl);
      const proto = req.headers.get("x-forwarded-proto") ?? "http";
      const host  = req.headers.get("host")!;
      const abs = isAbs ? body.imageUrl : `${proto}://${host}${body.imageUrl}`;
      const img = await fetch(abs);
      const buf = await img.arrayBuffer();
      fd.set("image", new Blob([buf]), "current.png");
    }

    const r = await fetch(`${process.env.BACKEND}/tts`, { method: "POST", body: fd });
    const ct = r.headers.get("content-type") || "application/octet-stream";
    const ab = await r.arrayBuffer();
    return new Response(ab, { status: r.status, headers: { "Content-Type": ct } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: "proxy_failed" }), { status: 502, headers: { "Content-Type": "application/json" } });
  }
}
