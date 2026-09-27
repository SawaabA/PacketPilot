"""Generate deterministic, harmless PacketPilot training captures.

The captures use documentation-only IP ranges and synthetic payloads. They never
touch a network interface, making packet numbers and expected findings stable.
"""
from __future__ import annotations

import json
import socket
import struct
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "samples" / "captures"


def checksum(data: bytes) -> int:
    if len(data) % 2:
        data += b"\0"
    total = sum(struct.unpack(f"!{len(data) // 2}H", data))
    total = (total >> 16) + (total & 0xFFFF)
    total += total >> 16
    return (~total) & 0xFFFF


def mac(value: str) -> bytes:
    return bytes.fromhex(value.replace(":", ""))


def ethernet(payload: bytes, ethertype: int = 0x0800) -> bytes:
    return mac("02:00:00:00:00:01") + mac("02:00:00:00:00:14") + struct.pack("!H", ethertype) + payload


def ipv4(src: str, dst: str, protocol: int, payload: bytes, ident: int, flags_fragment: int = 0x4000) -> bytes:
    src_raw, dst_raw = socket.inet_aton(src), socket.inet_aton(dst)
    header = struct.pack("!BBHHHBBH4s4s", 0x45, 0, 20 + len(payload), ident, flags_fragment, 64, protocol, 0, src_raw, dst_raw)
    header = header[:10] + struct.pack("!H", checksum(header)) + header[12:]
    return ethernet(header + payload)


def tcp(src: str, dst: str, sport: int, dport: int, seq: int, ack: int, flags: int, payload: bytes, ident: int) -> bytes:
    offset_flags = (5 << 12) | flags
    header = struct.pack("!HHIIHHHH", sport, dport, seq, ack, offset_flags, 64240, 0, 0)
    pseudo = socket.inet_aton(src) + socket.inet_aton(dst) + struct.pack("!BBH", 0, 6, len(header) + len(payload))
    header = header[:16] + struct.pack("!H", checksum(pseudo + header + payload)) + header[18:]
    return ipv4(src, dst, 6, header + payload, ident)


def udp(src: str, dst: str, sport: int, dport: int, payload: bytes, ident: int) -> bytes:
    header = struct.pack("!HHHH", sport, dport, 8 + len(payload), 0)
    pseudo = socket.inet_aton(src) + socket.inet_aton(dst) + struct.pack("!BBH", 0, 17, len(header) + len(payload))
    header = header[:6] + struct.pack("!H", checksum(pseudo + header + payload))
    return ipv4(src, dst, 17, header + payload, ident)


def dns_name(name: str) -> bytes:
    return b"".join(bytes([len(label)]) + label.encode() for label in name.split(".")) + b"\0"


def dns_query(txid: int, name: str) -> bytes:
    return struct.pack("!HHHHHH", txid, 0x0100, 1, 0, 0, 0) + dns_name(name) + struct.pack("!HH", 1, 1)


def dns_response(txid: int, name: str, address: str) -> bytes:
    question = dns_name(name) + struct.pack("!HH", 1, 1)
    answer = b"\xc0\x0c" + struct.pack("!HHIH", 1, 1, 60, 4) + socket.inet_aton(address)
    return struct.pack("!HHHHHH", txid, 0x8180, 1, 1, 0, 0) + question + answer


def arp(operation: int, sender_mac: str, sender_ip: str, target_mac: str, target_ip: str) -> bytes:
    body = struct.pack("!HHBBH", 1, 0x0800, 6, 4, operation) + mac(sender_mac) + socket.inet_aton(sender_ip) + mac(target_mac) + socket.inet_aton(target_ip)
    dst = "ff:ff:ff:ff:ff:ff" if operation == 1 else target_mac
    return mac(dst) + mac(sender_mac) + struct.pack("!H", 0x0806) + body


def icmp_echo(src: str, dst: str, reply: bool, ident: int, seq: int) -> bytes:
    payload = b"PacketPilot training ping payload"
    kind = 0 if reply else 8
    header = struct.pack("!BBHHH", kind, 0, 0, ident, seq)
    message = header[:2] + struct.pack("!H", checksum(header + payload)) + header[4:] + payload
    return ipv4(src, dst, 1, message, 300 + seq)


@dataclass
class Capture:
    name: str
    packets: list[tuple[float, bytes]]
    truth: dict


def write_pcap(capture: Capture) -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    with (OUTPUT / capture.name).open("wb") as file:
        file.write(struct.pack("<IHHIIII", 0xA1B2C3D4, 2, 4, 0, 0, 65535, 1))
        epoch = 1_750_000_000
        for relative, packet in capture.packets:
            seconds = epoch + int(relative)
            micros = int((relative % 1) * 1_000_000)
            file.write(struct.pack("<IIII", seconds, micros, len(packet), len(packet)))
            file.write(packet)
    (OUTPUT / f"{Path(capture.name).stem}.ground-truth.json").write_text(json.dumps(capture.truth, indent=2), encoding="utf-8")


def http_dns_capture() -> Capture:
    client, dns, server = "192.168.50.14", "1.1.1.1", "203.0.113.10"
    rows = [
        (0.000, udp(client, dns, 53000, 53, dns_query(0x42A1, "demo.packetpilot.test"), 1)),
        (0.018, udp(dns, client, 53, 53000, dns_response(0x42A1, "demo.packetpilot.test", server), 2)),
        (0.040, tcp(client, server, 51682, 80, 1000, 0, 0x02, b"", 3)),
        (0.071, tcp(server, client, 80, 51682, 7000, 1001, 0x12, b"", 4)),
        (0.073, tcp(client, server, 51682, 80, 1001, 7001, 0x10, b"", 5)),
        (0.090, tcp(client, server, 51682, 80, 1001, 7001, 0x18, b"GET /status HTTP/1.1\r\nHost: demo.packetpilot.test\r\nUser-Agent: PacketPilot-Lab\r\n\r\n", 6)),
        (0.121, tcp(server, client, 80, 51682, 7001, 1083, 0x10, b"", 7)),
        (0.240, tcp(server, client, 80, 51682, 7001, 1083, 0x18, b"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: 16\r\n\r\nPacketPilot OK!\n", 8)),
        (0.244, tcp(client, server, 51682, 80, 1083, 7082, 0x10, b"", 9)),
    ]
    return Capture("http-dns-basics.pcap", rows, {"purpose": "DNS and plaintext HTTP training", "dns_query_packet": 1, "dns_response_packet": 2, "tcp_handshake_packets": [3, 4, 5], "http_get_packet": 6, "http_response_packet": 8, "expected_filters": ["dns", "http.request", "tcp.flags.syn == 1"]})


def retransmission_capture() -> Capture:
    client, server = "192.168.50.14", "198.51.100.20"
    tls_record = bytes.fromhex("160301002f0100002b0303") + bytes(range(32)) + b"\x00\x00\x02\x13\x01\x01\x00"
    rows = [
        (0.000, tcp(client, server, 52000, 443, 9000, 0, 0x02, b"", 101)),
        (0.045, tcp(server, client, 443, 52000, 4000, 9001, 0x12, b"", 102)),
        (0.046, tcp(client, server, 52000, 443, 9001, 4001, 0x10, b"", 103)),
        (0.060, tcp(client, server, 52000, 443, 9001, 4001, 0x18, tls_record, 104)),
        (0.110, tcp(server, client, 443, 52000, 4001, 9001, 0x10, b"", 105)),
        (0.145, tcp(server, client, 443, 52000, 4001, 9001, 0x10, b"", 106)),
        (0.185, tcp(server, client, 443, 52000, 4001, 9001, 0x10, b"", 107)),
        (0.510, tcp(client, server, 52000, 443, 9001, 4001, 0x18, tls_record, 108)),
        (0.548, tcp(server, client, 443, 52000, 4001, 9059, 0x10, b"", 109)),
        (1.100, tcp(server, client, 443, 52000, 4001, 9059, 0x14, b"", 110)),
    ]
    return Capture("tcp-retransmission.pcap", rows, {"purpose": "TCP loss indicators and reset training", "tcp_handshake_packets": [1, 2, 3], "original_segment_packet": 4, "duplicate_ack_packets": [5, 6, 7], "retransmission_packet": 8, "reset_packet": 10, "expected_filters": ["tcp.analysis.retransmission", "tcp.analysis.duplicate_ack", "tcp.flags.reset == 1"]})


def network_basics_capture() -> Capture:
    client, router, unused = "192.168.50.14", "192.168.50.1", "192.168.50.99"
    rows = [
        (0.000, arp(1, "02:00:00:00:00:14", client, "00:00:00:00:00:00", router)),
        (0.002, arp(2, "02:00:00:00:00:01", router, "02:00:00:00:00:14", client)),
        (0.050, icmp_echo(client, router, False, 77, 1)),
        (0.054, icmp_echo(router, client, True, 77, 1)),
        (0.200, tcp(client, unused, 54000, 22, 2000, 0, 0x02, b"", 401)),
        (1.200, tcp(client, unused, 54000, 22, 2000, 0, 0x02, b"", 402)),
        (3.200, tcp(client, unused, 54000, 22, 2000, 0, 0x02, b"", 403)),
    ]
    return Capture("network-basics.pcap", rows, {"purpose": "ARP, ICMP, and failed TCP handshake training", "arp_request_packet": 1, "arp_reply_packet": 2, "icmp_echo_packets": [3, 4], "unanswered_syn_packets": [5, 6, 7], "expected_filters": ["arp", "icmp", "tcp.flags.syn == 1 && tcp.flags.ack == 0"]})


if __name__ == "__main__":
    captures = [http_dns_capture(), retransmission_capture(), network_basics_capture()]
    for item in captures:
        write_pcap(item)
        print(f"generated {OUTPUT / item.name} ({len(item.packets)} packets)")
