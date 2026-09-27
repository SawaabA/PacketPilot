# PacketPilot product defaults

These defaults keep the project usable without requiring configuration decisions during early development.

## Privacy and storage

- Packet analysis is local-first.
- Raw capture files are never sent to an AI provider.
- An AI provider receives only selected structured evidence after the user enables it.
- Local captures are retained until the user deletes them. Automatic cloud upload is disabled.
- SQLite is the local-development database; PostgreSQL is the production target.

## AI

- Deterministic TShark analysis works without an API key.
- OpenAI is the first optional hosted provider.
- The provider boundary will also support local models such as Ollama.
- Capture-specific answers must cite packet evidence. If evidence is missing, the agent must say so.

## Live capture

- Live capture never starts automatically.
- The operator must select an interface and deliberately start recording.
- PacketPilot uses Dumpcap/Npcap and exposes no stealth or remote interception mode.

## Geography

- Geographic maps are off by default.
- Approximate public-IP locations may later be enabled with a local MaxMind GeoLite2 database.
- Private IPs and unknown locations are never plotted as fake locations.

## Authentication

- The key-mashing terminal login is a playful local entrance, not a security boundary.
- Real authentication will only be introduced for hosted or multi-user deployments.
