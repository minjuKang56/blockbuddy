"use client";
import { useCallback, useEffect, useRef, useState } from "react";

export function usePushToTalk() {
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const inflightRef = useRef(false);  // 업로드 중복 방지
  const pressedRef = useRef(false);   // pointerDown~Up 사이 1회만 처리

  useEffect(() => {
    return () => {
      try {
        mediaRef.current?.stream.getTracks().forEach(t => t.stop());
        if (mediaRef.current?.state !== "inactive") mediaRef.current?.stop();
      } catch {}
    };
  }, []);

  const start = useCallback(async () => {
    if (recording || inflightRef.current) return;
    pressedRef.current = true;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const preferred = ["audio/webm;codecs=opus", "audio/ogg;codecs=opus", "audio/webm"];
    const mime = preferred.find(t => (window as any).MediaRecorder?.isTypeSupported(t)) || "";

    const mr = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    chunksRef.current = [];
    mr.ondataavailable = (e) => e.data && chunksRef.current.push(e.data);
    mr.start();
    mediaRef.current = mr;
    setRecording(true);
  }, [recording]);

    const stopAndUpload = useCallback(async (): Promise<string> => {
    // 1회만 처리
    if (!pressedRef.current) return "";
    pressedRef.current = false;
    if (inflightRef.current) return "";

    inflightRef.current = true;

    return new Promise((resolve) => {
      const mr = mediaRef.current;

      const finishUpload = async () => {
        try {
          const blob = new Blob(chunksRef.current, { type: mr?.mimeType || "audio/webm" });
          chunksRef.current = [];
          console.log("[PTT] uploading", blob.type, blob.size, "bytes");

          const fd = new FormData();
          fd.append("file", blob, "speech.webm");

          const timeout = Number((process.env.NEXT_PUBLIC_STT_TIMEOUT_MS as any) ?? 180000);
          const ac = new AbortController();
          const timer = setTimeout(() => ac.abort(), timeout);

          const r = await fetch("/api/stt", { method: "POST", body: fd, signal: ac.signal });
          clearTimeout(timer);

          if (!r.ok) return resolve("");
          const j = await r.json().catch(() => ({} as any));
          return resolve((j?.text ?? "").trim());
        } catch (e) {
          console.error("[PTT] stt error", e);
          return resolve("");
        } finally {
          inflightRef.current = false;
          // 안전 정리
          try { mr?.stream.getTracks().forEach(t => t.stop()); } catch {}
          mediaRef.current = null;
          setRecording(false);               // <- 업로드 끝난 뒤에도 보장
        }
      };

      if (!mr) {
        inflightRef.current = false;
        setRecording(false);
        return resolve("");
      }

      // ✨ 즉시 UI 라벨 끄기 (여기서 ‘말하기’로 돌아감)
      setRecording(false);

      // onstop 들어오면 정상 루트
      let resolved = false;
      mr.onstop = async () => {
        if (!resolved) {
          resolved = true;
          await finishUpload();
        }
      };

      // MediaRecorder 멈추기
      try { if (mr.state !== "inactive") mr.stop(); } catch {}

      // ⛑️ 폴백: onstop이 700ms 안에 안 오면 강제 업로드
      setTimeout(async () => {
        if (!resolved) {
          resolved = true;
          try { mr.stream.getTracks().forEach(t => t.stop()); } catch {}
          await finishUpload();
        }
      }, 700);
    });
  }, []);


  return { recording, start, stopAndUpload };
}
