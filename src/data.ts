export type Packet = {
  no: number; time: string; source: string; destination: string;
  protocol: string; length: number; info: string; tone: string;
};

export const packets: Packet[] = [
  { no: 1842, time: '12.843119', source: '192.168.1.14', destination: '142.250.80.14', protocol: 'TCP', length: 1514, info: '[TCP Retransmission] 51682 → 443 [PSH, ACK] Seq=5841', tone: 'danger' },
  { no: 1843, time: '12.844207', source: '192.168.1.1', destination: '192.168.1.14', protocol: 'ICMP', length: 70, info: 'Destination unreachable (Fragmentation needed)', tone: 'warn' },
  { no: 1844, time: '12.849632', source: '142.250.80.14', destination: '192.168.1.14', protocol: 'TCP', length: 66, info: '443 → 51682 [ACK] Ack=5841 Win=65535', tone: 'normal' },
  { no: 1845, time: '12.858011', source: '192.168.1.14', destination: '142.250.80.14', protocol: 'TLSv1.3', length: 517, info: 'Application Data', tone: 'tls' },
  { no: 1846, time: '12.861482', source: '192.168.1.14', destination: '1.1.1.1', protocol: 'DNS', length: 76, info: 'Standard query 0x3fd2 A api.github.com', tone: 'dns' },
  { no: 1847, time: '12.873210', source: '1.1.1.1', destination: '192.168.1.14', protocol: 'DNS', length: 124, info: 'Standard query response 0x3fd2 A 140.82.112.6', tone: 'dns' },
  { no: 1848, time: '12.889101', source: '192.168.1.14', destination: '140.82.112.6', protocol: 'TCP', length: 74, info: '51684 → 443 [SYN] Seq=0 Win=64240 MSS=1460', tone: 'syn' },
  { no: 1849, time: '12.918338', source: '140.82.112.6', destination: '192.168.1.14', protocol: 'TCP', length: 74, info: '443 → 51684 [SYN, ACK] Seq=0 Ack=1 Win=65535', tone: 'syn' },
];

export const traffic = [
  { time: '10:31:00', total: 220, tcp: 150, dns: 22 }, { time: ':10', total: 310, tcp: 210, dns: 18 },
  { time: ':20', total: 260, tcp: 195, dns: 31 }, { time: ':30', total: 580, tcp: 410, dns: 44 },
  { time: ':40', total: 900, tcp: 730, dns: 51 }, { time: ':50', total: 620, tcp: 480, dns: 29 },
  { time: '10:32:00', total: 430, tcp: 320, dns: 24 }, { time: ':10', total: 690, tcp: 550, dns: 37 },
  { time: ':20', total: 520, tcp: 390, dns: 21 }, { time: ':30', total: 1040, tcp: 890, dns: 48 },
  { time: ':40', total: 780, tcp: 640, dns: 32 }, { time: ':50', total: 350, tcp: 250, dns: 15 },
];

export const protocolData = [
  { name: 'TCP', value: 64, color: '#00e6a7' }, { name: 'UDP', value: 18, color: '#20a4f3' },
  { name: 'TLS', value: 11, color: '#a66cff' }, { name: 'DNS', value: 5, color: '#f5cb5c' },
  { name: 'Other', value: 2, color: '#47606d' },
];

export const findings = [
  { severity: 'high', title: 'Elevated TCP retransmissions', detail: '23 retransmissions concentrated in stream 17', packets: '1842, 1851, 1864', filter: 'tcp.analysis.retransmission' },
  { severity: 'medium', title: 'Path MTU mismatch detected', detail: 'ICMP fragmentation-needed follows a 1514-byte segment', packets: '1842–1843', filter: 'icmp.type == 3 && icmp.code == 4' },
  { severity: 'info', title: 'DNS performance normal', detail: 'Median response time is 18 ms; no failed queries', packets: '1846–1847', filter: 'dns' },
];
