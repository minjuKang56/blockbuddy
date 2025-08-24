// 예: /app/api-client.ts
export async function startProcess(form: FormData) {
  const res = await fetch(process.env.NEXT_PUBLIC_API_BASE + "/process", {
    method: "POST",
    body: form,
  });
  return res.json(); // { job_id }
}

export async function getStatus(jobId: string) {
  const res = await fetch(process.env.NEXT_PUBLIC_API_BASE + `/status/${jobId}`, { cache: "no-store" });
  return res.json(); // { state, detail, result? }
}
