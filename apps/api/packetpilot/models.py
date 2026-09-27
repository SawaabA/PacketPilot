from datetime import datetime
from enum import StrEnum
from pydantic import BaseModel, Field

class AnalysisState(StrEnum):
    READY = "ready"
    INDEXING = "indexing"
    FAILED = "failed"

class CaptureSummary(BaseModel):
    id: str
    filename: str
    packet_count: int = Field(ge=0)
    size_bytes: int = Field(ge=0)
    duration_seconds: float = Field(ge=0)
    first_timestamp: datetime | None = None
    last_timestamp: datetime | None = None
    state: AnalysisState = AnalysisState.READY

class PacketRow(BaseModel):
    number: int = Field(gt=0)
    relative_time: float = Field(ge=0)
    source: str
    destination: str
    protocol: str
    length: int = Field(ge=0)
    info: str

class Evidence(BaseModel):
    capture_id: str
    packet_numbers: list[int] = Field(default_factory=list)
    display_filter: str
    analysis_method: str
    fields: dict[str, str | int | float | bool | None] = Field(default_factory=dict)

class Finding(BaseModel):
    title: str
    severity: str
    observation: str
    interpretation: str
    confidence: float = Field(ge=0, le=1)
    evidence: list[Evidence] = Field(min_length=1)

class AskRequest(BaseModel):
    question: str = Field(min_length=2, max_length=4000)
    selected_packet: int | None = Field(default=None, gt=0)
    selected_time_range: tuple[float, float] | None = None

class AskResponse(BaseModel):
    answer: str
    findings: list[Finding]
    tools_used: list[str]
    insufficient_evidence: bool = False
