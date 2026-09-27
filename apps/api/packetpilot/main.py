from pathlib import Path
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from .models import AskRequest, AskResponse, CaptureSummary, PacketRow
from .services import CaptureNotFoundError, PacketAnalysisService

app = FastAPI(title="PacketPilot API", version="0.1.0", description="Safe, structured packet analysis API.")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])
analysis = PacketAnalysisService(Path("data/captures"))

@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "analysis_engine": "awaiting_tshark"}

@app.get("/captures/{capture_id}", response_model=CaptureSummary)
async def capture(capture_id: str) -> CaptureSummary:
    try:
        return await analysis.get_summary(capture_id)
    except CaptureNotFoundError as exc:
        raise HTTPException(404, "Capture not found") from exc
    except NotImplementedError as exc:
        raise HTTPException(503, str(exc)) from exc

@app.get("/captures/{capture_id}/packets", response_model=list[PacketRow])
async def capture_packets(capture_id: str, offset: int = Query(0, ge=0), limit: int = Query(100, ge=1, le=1000)) -> list[PacketRow]:
    try:
        return await analysis.get_packets(capture_id, offset, limit)
    except CaptureNotFoundError as exc:
        raise HTTPException(404, "Capture not found") from exc

@app.post("/captures/{capture_id}/ask", response_model=AskResponse)
async def ask(capture_id: str, request: AskRequest) -> AskResponse:
    raise HTTPException(503, "Capture must be indexed before evidence-backed analysis is available")
