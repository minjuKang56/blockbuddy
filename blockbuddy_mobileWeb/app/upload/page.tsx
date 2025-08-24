"use client";
import { useState } from "react";
import { startProcess, getStatus } from "../../lib/api-client";


export default function UploadPage() {
  const [subject, setSubject] = useState("demo_subject");
  const [frontFile, setFrontFile] = useState<File|null>(null);
  const [leftFile, setLeftFile] = useState<File|null>(null);
  const [backFile, setBackFile] = useState<File|null>(null);
  const [rightFile, setRightFile] = useState<File|null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  

  const handleUpload = async () => {
    if (!frontFile || !leftFile || !backFile || !rightFile) {
      alert("4개 이미지를 모두 업로드하세요!");
      return;
    }
    setLoading(true);

    const form = new FormData();
    form.append("subject", subject);
    form.append("front", frontFile);
    form.append("left", leftFile);
    form.append("back", backFile);
    form.append("right", rightFile);

    const { job_id } = await startProcess(form);

    let done = false, result = null;
    while (!done) {
      const s = await getStatus(job_id);
      if (s.state === "done") { done = true; result = s.result; }
      else if (s.state === "failed") { throw new Error(s.detail); }
      else { await new Promise(r => setTimeout(r, 1500)); }
    }

    setResult(result);
    setLoading(false);
  };

  return (
    <div className="p-4">
      <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject name"/>
      <input type="file" onChange={e => setFrontFile(e.target.files?.[0]||null)} />
      <input type="file" onChange={e => setLeftFile(e.target.files?.[0]||null)} />
      <input type="file" onChange={e => setBackFile(e.target.files?.[0]||null)} />
      <input type="file" onChange={e => setRightFile(e.target.files?.[0]||null)} />
      <button onClick={handleUpload} disabled={loading}>업로드 & 변환</button>

      {loading && <p>처리 중…</p>}
      {result && (
        <div>
          <p>완료! GLB URL: {result.rigged_glb}</p>
          {/* ThreeViewer로 전달 */}
        </div>
      )}
    </div>
  );
}
