'use client';

import { useState } from 'react';

// 백엔드 주소는 .env.local의 NEXT_PUBLIC_API_BASE 사용
async function startProcess(form: FormData) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/process`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { job_id }
}

async function getStatus(jobId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/status/${jobId}?verbose=1`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export default function UploadTestPage() {
  const [subject, setSubject] = useState('demo_subject');
  const [jobId, setJobId] = useState<string>('');
  const [state, setState] = useState<string>('');
  const [detail, setDetail] = useState<string>('');
  const [resultUrl, setResultUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runDemo = async () => {
    setLoading(true);
    setJobId(''); setState(''); setDetail(''); setResultUrl('');
    try {
      // 업로드 없이 demo_subject로 실행
      const form = new FormData();
      form.append('subject', subject);

      const { job_id } = await startProcess(form);
      setJobId(job_id);

      // 폴링
      for (;;) {
        const s = await getStatus(job_id);
        setState(s.state || '');
        setDetail(s.detail || (s.log_tail ? s.log_tail.at(-1) : ''));
        if (s.state === 'done') {
          const glb = s.result?.rigged_glb;
          if (glb) setResultUrl(`${process.env.NEXT_PUBLIC_API_BASE}${glb}`);
          break;
        }
        if (s.state === 'failed') {
          throw new Error(s.detail || 'failed');
        }
        await new Promise(r => setTimeout(r, 1200));
      }
    } catch (e: any) {
      setDetail(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{maxWidth: 640, margin: '40px auto', fontFamily: 'system-ui'}}>
      <h1>Pipeline Test (demo_subject)</h1>
      <label style={{display:'block', margin:'12px 0'}}>
        subject:&nbsp;
        <input value={subject} onChange={e=>setSubject(e.target.value)} />
      </label>

      <button onClick={runDemo} disabled={loading}
        style={{padding:'8px 12px', border:'1px solid #ddd', borderRadius:8}}>
        {loading ? '실행 중…' : 'demo_subject로 실행'}
      </button>

      <div style={{marginTop:16, fontSize:14}}>
        <div><b>jobId:</b> {jobId}</div>
        <div><b>state:</b> {state}</div>
        <div><b>detail:</b> <pre style={{whiteSpace:'pre-wrap'}}>{detail}</pre></div>
        {resultUrl && (
          <div style={{marginTop:12}}>
            <b>rigged_glb:</b> <a href={resultUrl} target="_blank" rel="noreferrer">{resultUrl}</a>
            <p style={{marginTop:6}}>※ Three.js 뷰어 없이, 파일 링크만 확인.</p>
          </div>
        )}
      </div>
    </main>
  );
}
