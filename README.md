# PacketPilot AI

PacketPilot is a local-first, evidence-driven network analysis command center. It combines a Wireshark-inspired packet workspace with a controlled AI analyst for troubleshooting, education, observability, and authorized defensive analysis.

The current foundation includes an interactive command center, global traffic visualization, telemetry, protocol statistics, evidence-backed findings, searchable packet stream, packet inspector, AI analyst interface, theme support, and a fail-closed FastAPI contract for deterministic TShark analysis.

## Run the interface

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Run the API

Install Wireshark/TShark first, then:

```bash
python -m venv .venv
.venv/Scripts/pip install -r apps/api/requirements.txt
.venv/Scripts/uvicorn apps.api.packetpilot.main:app --reload
```

API docs are at `http://localhost:8000/docs`.

## Architecture principles

- Evidence before explanation: capture claims require packet numbers, filters, methods, and extracted fields.
- Controlled tools: the agent calls typed analysis functions only and cannot execute arbitrary commands.
- Fail closed: the API refuses capture claims until deterministic indexing is available.
- Local first: captures remain local unless the operator explicitly configures an external provider.
- Honest encryption boundaries: encrypted application payload is never presented as readable without keys.

The visible sample capture is deterministic demo data isolated in `src/data.ts`. Production findings flow only through typed backend models.

## Built-in packet captures

Safe synthetic PCAP fixtures are included under `samples/captures`. They cover DNS, HTTP, TCP retransmission, duplicate ACKs, reset traffic, ARP, ICMP, and failed TCP connection attempts. Every capture includes a ground-truth JSON file with expected packet numbers.

Regenerate them at any time with:

```bash
python scripts/generate_sample_pcaps.py
```

Product and privacy defaults are documented in `docs/PRODUCT_DEFAULTS.md`. Geographic enrichment is optional and disabled by default.
