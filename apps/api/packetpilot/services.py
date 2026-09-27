"""Controlled analysis boundary. The agent never receives shell access."""
from pathlib import Path
from .models import CaptureSummary, PacketRow

class CaptureNotFoundError(LookupError):
    pass

class PacketAnalysisService:
    ALLOWED_TOOLS = frozenset({
        "get_capture_summary", "get_packets", "get_packet_details",
        "get_endpoints", "get_conversations", "get_protocol_hierarchy",
        "get_dns_queries", "get_tcp_retransmissions", "get_tcp_resets",
        "get_tcp_rtt", "get_tls_handshakes", "get_expert_info",
        "get_packet_timeline", "search_packets",
    })

    def __init__(self, capture_root: Path) -> None:
        self.capture_root = capture_root.resolve()

    def resolve_capture(self, capture_id: str) -> Path:
        path = (self.capture_root / f"{capture_id}.pcapng").resolve()
        if self.capture_root not in path.parents or not path.is_file():
            raise CaptureNotFoundError(capture_id)
        return path

    async def get_summary(self, capture_id: str) -> CaptureSummary:
        self.resolve_capture(capture_id)
        raise NotImplementedError("TShark adapter is not configured")

    async def get_packets(self, capture_id: str, offset: int, limit: int) -> list[PacketRow]:
        self.resolve_capture(capture_id)
        if not 0 <= offset or not 1 <= limit <= 1000:
            raise ValueError("Invalid page window")
        raise NotImplementedError("TShark adapter is not configured")
