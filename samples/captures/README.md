# Built-in training captures

These files are synthetic and generated locally by `scripts/generate_sample_pcaps.py`. They use private or documentation-only IP ranges and never contain real user traffic.

| Capture | Contents | Useful filters |
| --- | --- | --- |
| `http-dns-basics.pcap` | DNS query/response, TCP handshake, HTTP GET and 200 response | `dns`, `http.request`, `tcp.flags.syn == 1` |
| `tcp-retransmission.pcap` | TCP handshake, TLS metadata, duplicate ACKs, retransmission, reset | `tcp.analysis.retransmission`, `tcp.analysis.duplicate_ack`, `tcp.flags.reset == 1` |
| `network-basics.pcap` | ARP, ICMP echo, repeated unanswered SYN packets | `arp`, `icmp`, `tcp.flags.syn == 1 && tcp.flags.ack == 0` |

Each capture has a neighboring `ground-truth.json` file containing the expected packet numbers. These fixtures are suitable for parser tests, lab demonstrations, and evidence-validation tests.
