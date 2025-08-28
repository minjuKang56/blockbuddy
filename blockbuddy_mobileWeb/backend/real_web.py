# real_web.py — final.py 파이프라인을 FastAPI로 어댑트
# - STT(Whisper, CPU) /generate(kidsbot 파일-브리지) /tts(이미지→보이스 선택→Zonos)
# - fn_index 대신 api_name="/generate_audio" 포지셔널 호출
# - speaker_wav 없으면: image 업로드 → 보이스 선택, 없으면 FIXED_IMAGE 폴백

import os, io, time, json, glob, tempfile, subprocess, wave
from typing import Optional, Dict, Any, List
import numpy as np

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse, StreamingResponse

import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
from transformers import CLIPModel, CLIPImageProcessor, AutoTokenizer
from gradio_client import Client
from gradio_client.utils import handle_file
from PIL import Image

# -------------------- 환경 --------------------
WHISPER_MODEL_ID = os.getenv("WHISPER_MODEL_ID", "/data/jiwon/whisper-kids-merged")

VOICE_DIR        = os.getenv("VOICE_DIR",        "/data/jiwon/project/voices")
CLIP_MODEL_DIR   = os.getenv("CLIP_MODEL_DIR",   "/data/jiwon/project/model/clip_merged_vision")
CLIP_DEVICE      = os.getenv("CLIP_DEVICE",      "cpu")

ZONOS_URL        = os.getenv("ZONOS_GRADIO_URL", "http://127.0.0.1:7860")
ZONOS_LANG       = os.getenv("ZONOS_LANG",       "ko")  # view_api에 있는 코드 사용
# final.py는 기본 fn_index 사용했지만, 이 서버는 api_name으로 안전 호출
ZONOS_API_NAME   = os.getenv("ZONOS_API_NAME",   "/generate_audio")

# kidsbot 파일 브리지
KIDS_REQ_FILE    = os.getenv("LLM_REQ_FILE",     "/tmp/kidsbot_llm_req.jsonl")
KIDS_RESP_FILE   = os.getenv("LLM_RESP_FILE",    "/tmp/kidsbot_llm_resp.jsonl")
SENDER_ID        = os.getenv("RASA_SENDER_ID",   os.getenv("RASA_SENDER", "cli-user"))

# 이미지 선택 관련 (final.py와 동일)
FIXED_IMAGE  = os.getenv("FIXED_IMAGE",  "/data/jiwon/project/data/samples/example.png")


# 업로드 음성 최소 바이트 (짧은/무음 방지)
MIN_BYTES_FOR_STT = int(os.getenv("MIN_BYTES_FOR_STT", "1800"))

# CPU 강제 (final.py는 로컬 마이크지만, 여기선 API라 CPU로만 STT)
os.environ.setdefault("CUDA_VISIBLE_DEVICES", "")

app = FastAPI()

# -------------------- STT (CPU) --------------------
print("[STT] loading model:", WHISPER_MODEL_ID, flush=True)
_stt_model = AutoModelForSpeechSeq2Seq.from_pretrained(
    WHISPER_MODEL_ID, torch_dtype=torch.float32, low_cpu_mem_usage=True
)
_stt_proc  = AutoProcessor.from_pretrained(WHISPER_MODEL_ID)
stt_pipe = pipeline(
    "automatic-speech-recognition",
    model=_stt_model,
    tokenizer=_stt_proc.tokenizer,
    feature_extractor=_stt_proc.feature_extractor,
    device=-1,
    chunk_length_s=20.0,
    stride_length_s=5.0,
)

def ffmpeg_to_wav16k_mono(b: bytes) -> np.ndarray:
    with tempfile.NamedTemporaryFile(suffix=".in", delete=False) as fi:
        fi.write(b)
        inpath = fi.name
    outpath = inpath + ".wav"
    subprocess.run(
        ["ffmpeg","-hide_banner","-loglevel","error","-y",
         "-i", inpath, "-ac","1","-ar","16000","-f","wav", outpath],
        check=True
    )
    with wave.open(outpath, "rb") as wf:
        sr = wf.getframerate(); ch = wf.getnchannels(); sw = wf.getsampwidth()
        frames = wf.readframes(wf.getnframes())
    try:
        os.remove(inpath); os.remove(outpath)
    except Exception:
        pass

    if sw == 2:
        x = np.frombuffer(frames, dtype=np.int16).astype(np.float32)/32768.0
    elif sw == 1:
        u = np.frombuffer(frames, dtype=np.uint8).astype(np.float32)
        x = (u-128.0)/128.0
    else:
        raise RuntimeError("unsupported pcm width")

    if ch == 2:
        x = x.reshape(-1,2).mean(1)
    return x.astype(np.float32, copy=False)

@app.post("/stt")
async def stt_api(file: UploadFile = File(...)):
    b = await file.read()
    print(f"[STT] got {len(b)} bytes")
    if len(b) < MIN_BYTES_FOR_STT:
        return JSONResponse({"text": ""})
    wav16 = ffmpeg_to_wav16k_mono(b)
    out = stt_pipe(
        {"array": wav16, "sampling_rate": 16000},
        return_timestamps=True,
        generate_kwargs={"language":"korean","task":"transcribe","temperature":0.0},
    )
    return JSONResponse({"text": (out.get("text") or "").strip()})

# -------------------- kidsbot 파일 브리지 --------------------
def send_to_kidsbot(text: str, timeout_sec: float = 15.0) -> str:
    os.makedirs(os.path.dirname(KIDS_REQ_FILE), exist_ok=True)
    rid = str(time.time_ns())
    # 요청 기록
    with open(KIDS_REQ_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps({"t": time.time(),"rid": rid,"text": text,"sender": SENDER_ID},
                           ensure_ascii=False)+"\n")
        f.flush()

    deadline = time.time() + timeout_sec
    start = os.path.getsize(KIDS_RESP_FILE) if os.path.exists(KIDS_RESP_FILE) else 0
    while time.time() < deadline:
        size = os.path.getsize(KIDS_RESP_FILE) if os.path.exists(KIDS_RESP_FILE) else 0
        if size < start:  # 파일 회전/초기화 처리
            start = 0
        if size > start:
            with open(KIDS_RESP_FILE, "r", encoding="utf-8") as f:
                f.seek(start)
                for line in f:
                    start += len(line.encode("utf-8"))
                    try:
                        obj = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    if str(obj.get("rid")) == rid:
                        return (obj.get("text") or "").strip()
        time.sleep(0.02)
    return ""

@app.post("/generate")
async def generate_api(payload: Dict[str, str]):
    user = (payload.get("text") or payload.get("prompt") or "").strip()
    ans = send_to_kidsbot(user) or ""
    return JSONResponse({"text": ans})

# -------------------- CLIP 임베딩/보이스 선택 --------------------
os.environ.setdefault("TRANSFORMERS_OFFLINE", "1")
print("[CLIP] loading:", CLIP_MODEL_DIR, flush=True)
_clip = CLIPModel.from_pretrained(CLIP_MODEL_DIR, local_files_only=True)
_clip_proc = CLIPImageProcessor.from_pretrained(CLIP_MODEL_DIR, local_files_only=True)
_tok = AutoTokenizer.from_pretrained(CLIP_MODEL_DIR, use_fast=False, local_files_only=True)
_clip.eval()
_clip.to("cpu")

_text_cache: Dict[str, np.ndarray] = {}
def _embed_text(t: str) -> np.ndarray:
    import hashlib, torch as _torch
    k = hashlib.sha1((t or "").strip().encode("utf-8")).hexdigest()
    if k in _text_cache: return _text_cache[k]
    tok = _tok(t, return_tensors="pt", padding=True).to(_clip.device)
    feats = _clip.get_text_features(**tok)
    arr = _torch.nn.functional.normalize(feats, dim=-1)[0].detach().cpu().numpy().astype(np.float32)
    _text_cache[k] = arr; return arr

def _embed_image_bytes(img_bytes: bytes) -> np.ndarray:
    import torch as _torch
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    inputs = _clip_proc(images=img, return_tensors="pt").to(_clip.device)
    feats = _clip.get_image_features(**inputs)
    arr = _torch.nn.functional.normalize(feats, dim=-1)[0].detach().cpu().numpy().astype(np.float32)
    return arr

def _build_voice_index() -> List[Dict[str, Any]]:
    wavs = glob.glob(os.path.join(VOICE_DIR, "*.wav"))
    if not wavs:
        raise RuntimeError(f"No *.wav found in VOICE_DIR: {VOICE_DIR}")
    items: List[Dict[str, Any]] = []
    for w in wavs:
        base = os.path.splitext(os.path.basename(w))[0]
        items.append({"name": base, "wav": w, "prompt": base})
    for it in items:
        _embed_text(it["prompt"])
    return items

VOICE_INDEX = _build_voice_index()

def choose_voice_by_image(img_bytes: bytes) -> str:
    q = _embed_image_bytes(img_bytes)
    sims = []
    for it in VOICE_INDEX:
        t = _embed_text(it["prompt"])
        sims.append(float((t*q).sum()))
    idx = int(np.argmax(np.array(sims)))
    return VOICE_INDEX[idx]["wav"]

# -------------------- Zonos 호출 --------------------
_zonos_client: Optional[Client] = None

def zonos_tts_bytes(text: str, speaker_wav: str) -> bytes:
    global _zonos_client
    if _zonos_client is None:
        _zonos_client = Client(ZONOS_URL)

    # api_name만 공개된 gradio이므로 포지셔널+api_name로 호출
    res = _zonos_client.predict(
        "Zyphra/Zonos-v0.1-transformer",
        text,
        ZONOS_LANG,
        handle_file(speaker_wav),   # speaker_audio
        None,                       # prefix_audio
        1.0,0.05,0.05,0.05,0.05,0.05,0.10,0.20,   # e1..e8
        0.78,24000,100.0,15.0,4.0,                # vq_single,fmax,pitch_std,speaking_rate,dnsmos_ovrl
        False,                                     # speaker_noised
        2.0,                                       # cfg_scale
        0.0,0,0.0,                                 # top_p, top_k(min_k), min_p
        0.5,0.4,0.0,                               # linear, confidence, quadratic
        420, True,                                 # seed, randomize_seed
        ['emotion'],                               # unconditional_keys
        api_name=ZONOS_API_NAME
    )

    def _to_bytes(r):
        if isinstance(r, (bytes, bytearray)): return bytes(r)
        if isinstance(r, str) and os.path.exists(r): return open(r, "rb").read()
        if isinstance(r, (list, tuple)) and r: return _to_bytes(r[0])
        raise RuntimeError(f"unexpected zonos return: {type(r)}")

    return _to_bytes(res)

@app.post("/tts")
async def tts_api(
    text: str = Form(...),
    speaker_wav: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    try:
        wav = speaker_wav

        if not wav and image is not None:
            ib = await image.read()
            if len(ib) == 0:
                return JSONResponse({"error":"empty_image"}, status_code=400)
            wav = choose_voice_by_image(ib)

        # final.py의 의도: 폴백 없음이었지만, FIXED_IMAGE가 지정되면 그걸 사용
        if not wav and FIXED_IMAGE:
            try:
                with open(FIXED_IMAGE, "rb") as f:
                    ib = f.read()
                wav = choose_voice_by_image(ib)
                print(f"[TTS] FIXED_IMAGE used → {FIXED_IMAGE}")
            except Exception as e:
                print("[TTS] FIXED_IMAGE failed:", e)

        if not wav or not os.path.exists(wav):
            return JSONResponse({"error":"no speaker_wav (or image)"}, status_code=400)

        audio = zonos_tts_bytes(text, wav)
        return StreamingResponse(io.BytesIO(audio), media_type="audio/wav")

    except Exception as e:
        print("[TTS] error:", e)
        return JSONResponse({"error":"tts_unavailable", "detail": str(e)}, status_code=502)

# optional: 헬스체크
@app.get("/")
def health():
    return {"ok": True}
