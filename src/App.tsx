import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, Bot, CheckCircle2, ChevronDown, ChevronRight, CircleDot, Command,
  Database, FileQuestion, FileText, FileUp, Fingerprint, Globe2, GraduationCap,
  Hexagon, Layers3, Lightbulb, LogOut, Network, Play, Radio, Search, Settings,
  ShieldCheck as ShieldText, SquareTerminal, TimerReset, WandSparkles, Zap
} from 'lucide-react';
import { packets, type Packet } from './data';

type Section = 'home' | 'packets' | 'flows' | 'map' | 'analyst' | 'labs';

const commands: { id: Section; label: string; hint: string; icon: typeof Activity; shortcut: string }[] = [
  { id: 'home', label: 'Lab desk', hint: 'Start or resume a Wireshark lab', icon: GraduationCap, shortcut: '01' },
  { id: 'packets', label: 'Packet field', hint: 'Inspect frames and protocol layers', icon: Layers3, shortcut: '02' },
  { id: 'flows', label: 'Flow room', hint: 'Follow conversations through time', icon: Network, shortcut: '03' },
  { id: 'map', label: 'Signal map', hint: 'Trace observed endpoints', icon: Globe2, shortcut: '04' },
  { id: 'analyst', label: 'Ask Pilot', hint: 'Investigate with evidence', icon: Bot, shortcut: '05' },
  { id: 'labs', label: 'Lab workspace', hint: 'Questions, hints, answers, and evidence', icon: GraduationCap, shortcut: '06' },
];

const stream = [
  'SYN 192.168.1.14:51682 > 142.250.80.14:443', 'TLSv1.3 CLIENT_HELLO api.github.com',
  'ACK SEQ=18382911 WIN=64240', 'DNS QUERY A api.github.com',
  'FRAME 1842 TCP RETRANSMISSION', 'ICMP FRAGMENTATION NEEDED MTU=1400',
  'UDP 192.168.1.14:63211 > 1.1.1.1:53', 'SHA256 2f6d9c8a... capture block verified',
  'ARP WHO HAS 192.168.1.1 TELL 192.168.1.14', 'RTT STREAM_17 31.42ms',
  'TLS SERVER_HELLO AES_256_GCM', 'INDEX PACKET 001842 / 012482',
];

const labTopics = [
  { name: 'HTTP', subtitle: 'Requests, responses & caching', filter: 'http', progress: 35 },
  { name: 'DNS', subtitle: 'Queries, records & resolution', filter: 'dns', progress: 0 },
  { name: 'TCP', subtitle: 'Handshake, sequence & congestion', filter: 'tcp', progress: 0 },
  { name: 'UDP', subtitle: 'Datagrams & checksums', filter: 'udp', progress: 0 },
  { name: 'IP', subtitle: 'Headers, TTL & fragmentation', filter: 'ip', progress: 0 },
  { name: 'ICMP', subtitle: 'Ping, traceroute & errors', filter: 'icmp', progress: 0 },
  { name: 'Ethernet + ARP', subtitle: 'Frames, MAC addresses & ARP', filter: 'arp', progress: 0 },
  { name: 'DHCP', subtitle: 'Discover, offer, request, ACK', filter: 'dhcp', progress: 0 },
];

function Login({ onUnlock }: { onUnlock: () => void }) {
  const [phase, setPhase] = useState<'boot' | 'user' | 'pass' | 'granted'>('boot');
  const [userProgress, setUserProgress] = useState(0);
  const [passProgress, setPassProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const username = 'packet_operator';

  useEffect(() => {
    const t = window.setTimeout(() => { setPhase('user'); inputRef.current?.focus(); }, 1100);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const handle = (event: KeyboardEvent) => {
      if (phase === 'boot' || phase === 'granted') return;
      event.preventDefault();
      if (event.key === 'Enter') {
        if (phase === 'user' && userProgress > 2) setPhase('pass');
        else if (phase === 'pass' && passProgress > 2) {
          setPhase('granted');
          window.setTimeout(onUnlock, 900);
        }
        return;
      }
      if (event.key.length !== 1) return;
      if (phase === 'user') setUserProgress(p => Math.min(username.length, p + 1));
      else setPassProgress(p => Math.min(14, p + 1));
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [phase, userProgress, passProgress, onUnlock]);

  const raining = Array.from({ length: 18 }, (_, col) => ({
    left: `${col * 5.8}%`, delay: `${-(col % 7) * .8}s`, duration: `${6 + (col % 5)}s`,
    text: Array.from({ length: 10 }, (_, i) => stream[(col + i) % stream.length]).join('\n'),
  }));

  return <main className="login-screen" onClick={() => inputRef.current?.focus()}>
    <div className="data-rain" aria-hidden="true">{raining.map((r, i) => <pre key={i} style={{ left: r.left, animationDelay: r.delay, animationDuration: r.duration }}>{r.text}</pre>)}</div>
    <div className="login-vignette" />
    <section className="login-console">
      <div className="console-chrome"><span/><span/><span/><b>pp-auth // secure terminal</b><em>tty-01</em></div>
      <div className="boot-copy">
        <p>PACKETPILOT NETWORK OPERATING ENVIRONMENT</p>
        <p>Copyright (c) 2026 PacketPilot Labs</p>
        <br/>
        <p><i>[ OK ]</i> packet engine mounted</p>
        <p><i>[ OK ]</i> evidence ledger verified</p>
        <p><i>[ OK ]</i> definitely serious cyber security initialized</p>
        {phase === 'boot' && <p className="blink">booting operator console_</p>}
        {phase !== 'boot' && <>
          <div className="login-row"><span>operator@packetpilot:~$</span> login --user <strong>{username.slice(0, userProgress)}</strong>{phase === 'user' && <i className="cursor"/>}</div>
          {phase !== 'user' && <div className="login-row"><span>operator@packetpilot:~$</span> sudo unlock --password <strong>{'•'.repeat(passProgress)}</strong>{phase === 'pass' && <i className="cursor"/>}</div>}
          {phase === 'granted' && <div className="access-granted"><Fingerprint/> ACCESS GRANTED · WELCOME, OPERATOR</div>}
        </>}
      </div>
      <footer>{phase === 'user' ? 'MASH RANDOM KEYS TO IDENTIFY YOURSELF · ENTER TO CONTINUE' : phase === 'pass' ? 'MORE RANDOM KEYS. MAKE IT LOOK CONVINCING · ENTER TO BREACH' : phase === 'granted' ? 'YOU ARE SO IN' : 'ESTABLISHING SECURE HANDSHAKE...'}</footer>
    </section>
    <input ref={inputRef} className="ghost-input" aria-label="Mock terminal login" />
    <div className="login-mark"><Hexagon/><span>PACKETPILOT</span><small>AUTHORIZED USERS & PEOPLE WHO CAN PRESS KEYS</small></div>
  </main>;
}

function Launcher({ open, onClose, onNavigate }: { open: boolean; onClose: () => void; onNavigate: (id: Section) => void }) {
  const [query, setQuery] = useState('');
  const shown = commands.filter(c => `${c.label} ${c.hint}`.toLowerCase().includes(query.toLowerCase()));
  useEffect(() => { if (!open) setQuery(''); }, [open]);
  if (!open) return null;
  return <div className="launcher-backdrop" onClick={onClose}><div className="launcher" onClick={e => e.stopPropagation()}>
    <div className="launcher-input"><Search/><input autoFocus value={query} onChange={e => setQuery(e.target.value)} placeholder="Where do you want to go?"/><kbd>ESC</kbd></div>
    <div className="launcher-results"><span>JUMP TO</span>{shown.map(({ id, label, hint, icon: Icon, shortcut }) => <button key={id} onClick={() => { onNavigate(id); onClose(); }}><Icon/><div><strong>{label}</strong><small>{hint}</small></div><kbd>{shortcut}</kbd><ChevronRight/></button>)}</div>
    <footer><span>↑↓ move</span><span>↵ open</span><b>PacketPilot command launcher</b></footer>
  </div></div>;
}

function Rail({ active, onNavigate, onLaunch, onLogout }: { active: Section; onNavigate: (s: Section) => void; onLaunch: () => void; onLogout: () => void }) {
  return <aside className="rail">
    <button className="rail-logo" onClick={() => onNavigate('home')} title="PacketPilot"><Hexagon/><Zap/></button>
    <button className="command-trigger" onClick={onLaunch} title="Command launcher"><Command/></button>
    <nav>{commands.slice(1).map(({ id, label, icon: Icon, shortcut }) => <button className={active === id ? 'active' : ''} key={id} onClick={() => onNavigate(id)} title={`${label} · ${shortcut}`}><Icon/><span>{label}</span></button>)}</nav>
    <div className="rail-bottom"><button title="Engine status"><CircleDot/></button><button title="Settings"><Settings/></button><button title="Lock console" onClick={onLogout}><LogOut/></button></div>
  </aside>;
}

function CaptureDeck({ onNavigate }: { onNavigate: (s: Section) => void }) {
  return <div className="lab-home">
    <div className="lab-hero">
      <span>TOP-DOWN WIRESHARK LAB GUIDE</span>
      <h1>Learn it by<br/><em>following packets.</em></h1>
      <p>A step-by-step companion for the Wireshark labs from <i>Computer Networking: A Top-Down Approach</i>. You do the work; PacketPilot shows you where to look.</p>
      <div className="mode-pills"><span><Lightbulb/>STEP-BY-STEP</span><span><CheckCircle2/>CHECK MY ANSWER</span><span><Layers3/>SHOW ME WHERE</span></div>
    </div>
    <div className="topic-picker">
      <header><div><GraduationCap/><span><strong>CHOOSE A WIRESHARK LAB</strong><small>Top-Down Approach study path</small></span></div><button><FileUp/> USE MY LAB FILES</button></header>
      <div className="topic-grid">{labTopics.map((lab, index) => <button key={lab.name} className={index === 0 ? 'featured' : ''} onClick={() => onNavigate('labs')}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{lab.name}</strong><small>{lab.subtitle}</small>{lab.progress > 0 && <i><u style={{width:`${lab.progress}%`}}/></i>}</div><code>{lab.filter}</code><ChevronRight/></button>)}</div>
      <footer><Lightbulb/><span>PacketPilot gives you the next action—not the final answer.</span></footer>
    </div>
    <button className="resume-strip lab-resume" onClick={() => onNavigate('labs')}>
      <span className="resume-index">CONTINUE GUIDE</span><div className="file-chip"><GraduationCap/><span><strong>HTTP Wireshark Lab</strong><small>Basic HTTP GET/response · Step 3 of 8</small></span></div><div className="lab-progress"><i><u style={{width:'35%'}}/></i><span>35%</span></div><div className="resume-finding"><Lightbulb/> NEXT <strong>Find the first GET request</strong></div><span className="resume-go">RESUME <ChevronRight/></span>
    </button>
    <div className="deck-footer"><span><i className="online-dot"/> TSHARK 4.6.9 READY</span><span>GUIDES USE ORIGINAL INSTRUCTIONS</span><span>ANSWERS STAY HIDDEN</span><b>CTRL K · GO ANYWHERE</b></div>
  </div>;
}

function LabWorkspace({ onPackets }: { onPackets: () => void }) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [step, setStep] = useState(3);
  const steps = [
    ['Get ready', 'Load the HTTP trace'], ['Filter the traffic', 'Show only HTTP packets'],
    ['Find the request', 'Locate the first GET'], ['Inspect the request', 'Expand the HTTP layer'],
    ['Inspect the response', 'Find the matching 200 OK'], ['Measure timing', 'Compare request and response'],
    ['Check caching', 'Inspect conditional headers'], ['Wrap up', 'Review the packet story']
  ];
  return <div className="lab-workspace">
    <header className="lab-top"><div><span>GUIDED LAB / APPLICATION LAYER</span><h1>HTTP · Basic Request and Response</h1></div><div className="lab-files"><span><FileText/>YOUR LAB HANDOUT</span><span><Activity/>http-dns-basics.pcap</span></div><div className="guide-status"><Lightbulb/>GUIDE MODE</div></header>
    <aside className="question-rail"><div><b>LAB PATH</b><span>{step} / 8</span></div>{steps.map((item, index) => <button className={step === index + 1 ? 'active' : ''} key={item[0]} onClick={() => { setStep(index + 1); setShowAnswer(false); }}><i>{index + 1 < step ? <CheckCircle2/> : index + 1}</i><span><b>{item[0]}</b><small>{item[1]}</small></span></button>)}</aside>
    <section className="question-stage">
      <div className="question-count">STEP {String(step).padStart(2, '0')} <span>/ 08 · DO THIS IN WIRESHARK</span></div>
      <h2>{steps[step - 1][1]}</h2>
      <div className="instruction-card"><header><SquareTerminal/><span>YOUR NEXT ACTION</span><b>~ 1 MIN</b></header><ol><li>Click the <strong>display filter bar</strong> at the top of Wireshark.</li><li>Type the filter below and press Enter.</li><li>Look in the <strong>Info</strong> column for the first row beginning with <em>GET</em>.</li><li>Select that packet. Don’t expand anything yet.</li></ol><code>http.request.method == "GET"</code><footer><button onClick={onPackets}><Layers3/>SHOW ME IN PACKETPILOT</button><button onClick={() => setStep(s => Math.min(8, s + 1))}>I FOUND IT · NEXT <ChevronRight/></button></footer></div>
      <div className="checkpoint"><header><FileQuestion/><span>CHECKPOINT</span></header><p>What is the packet number of the first HTTP GET request?</p><div><input placeholder="Enter the packet number…"/><button>CHECK MY ANSWER</button></div><button className="reveal" onClick={() => setShowAnswer(v => !v)}>{showAnswer ? 'HIDE ANSWER' : 'I’M STUCK · SHOW ANSWER'}</button>{showAnswer && <div className="revealed"><CheckCircle2/><span><b>Packet 6</b>The Info column identifies it as <code>GET /status HTTP/1.1</code>.</span></div>}</div>
    </section>
    <aside className="lab-evidence"><span>WHAT YOU’RE LEARNING</span><div className="learning-map"><i>APPLICATION</i><strong>HTTP</strong><ChevronDown/><i>TRANSPORT</i><strong>TCP</strong><ChevronDown/><i>NETWORK</i><strong>IP</strong></div><dl><dt>FILTER</dt><dd>HTTP</dd><dt>TARGET</dt><dd>GET</dd><dt>TRACE</dt><dd>9 packets</dd></dl><button onClick={onPackets}><Layers3/>OPEN PACKET FIELD</button><div className="honesty"><ShieldText/><p><b>WHY THIS STEP?</b>The display filter removes noise so you can connect an application message to its packet.</p></div></aside>
  </div>;
}

function PacketField({ selected, setSelected }: { selected: Packet | null; setSelected: (p: Packet) => void }) {
  const [filter, setFilter] = useState('');
  const shown = packets.filter(p => `${p.no} ${p.source} ${p.destination} ${p.protocol} ${p.info}`.toLowerCase().includes(filter.toLowerCase()));
  return <div className="field-view">
    <div className="work-head"><div><span>02 / PACKET FIELD</span><h1>office-traffic.pcapng</h1></div><div className="capture-state"><i/> CAPTURE INDEXED <b>12,482 FRAMES</b></div></div>
    <div className="filter-line"><span>display.filter ›</span><input value={filter} onChange={e => setFilter(e.target.value)} placeholder="tcp.analysis.retransmission"/><button><Play/>APPLY</button></div>
    <div className="packet-workspace">
      <div className="packet-list"><div className="packet-columns"><span>NO.</span><span>TIME</span><span>SOURCE → DESTINATION</span><span>PROTO</span><span>INFO</span></div>{shown.map(p => <button key={p.no} className={`${p.tone} ${selected?.no === p.no ? 'selected' : ''}`} onClick={() => setSelected(p)}><span>{p.no}</span><span>{p.time}</span><span>{p.source} <i>→</i> {p.destination}</span><b>{p.protocol}</b><span>{p.info}</span></button>)}</div>
      <PacketScope packet={selected ?? packets[0]}/>
    </div>
  </div>;
}

function PacketScope({ packet }: { packet: Packet }) {
  return <aside className="packet-scope"><div className="scope-title"><span>FRAME / {packet.no}</span><b>{packet.protocol}</b></div>
    <div className="layer-stack"><button><em>04</em><span>APPLICATION<strong>{packet.protocol}</strong></span><ChevronRight/></button><button><em>03</em><span>TRANSPORT<strong>TCP · 51682 → 443</strong></span><ChevronRight/></button><button><em>02</em><span>NETWORK<strong>{packet.source}<i>↓</i>{packet.destination}</strong></span><ChevronRight/></button><button><em>01</em><span>DATA LINK<strong>Ethernet II · {packet.length} B</strong></span><ChevronRight/></button></div>
    <div className="byte-river"><span>0000</span> 14 ab c5 21 08 00 27 f8<br/><span>0008</span> c0 a8 01 0e 8e fa 50 0e<br/><span>0010</span> 50 18 01 00 71 a9 00 00<br/><span>0018</span> 17 03 03 01 c8 a4 f2 91</div>
    <button className="explain"><Bot/>EXPLAIN FRAME {packet.no}</button>
  </aside>;
}

function PlaceholderView({ section }: { section: Section }) {
  const item = commands.find(c => c.id === section)!;
  const Icon = item.icon;
  return <div className="module-view"><span>{item.shortcut} / PACKETPILOT</span><Icon/><h1>{item.label}</h1><p>{item.hint}.</p><div className="module-command"><SquareTerminal/><span>module.ready</span><i>Waiting for a capture context_</i></div></div>;
}

function Workspace({ onLogout }: { onLogout: () => void }) {
  const [active, setActive] = useState<Section>('home');
  const [launcher, setLauncher] = useState(false);
  const [selected, setSelected] = useState<Packet | null>(null);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setLauncher(v => !v); }
      if (e.key === 'Escape') setLauncher(false);
    };
    window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  }, []);
  return <main className="workspace">
    <Rail active={active} onNavigate={setActive} onLaunch={() => setLauncher(true)} onLogout={onLogout}/>
    <header className="os-bar"><div><span>PP://</span><b>{active === 'home' ? 'LAB_DESK' : active.toUpperCase()}</b></div><button onClick={() => setLauncher(true)}><Search/>JUMP TO ANYTHING <kbd>CTRL K</kbd></button><div className="os-time"><span>ENGINE <i>ONLINE</i></span><TimerReset/><b>03:24:17</b></div></header>
    <section className="os-stage">{active === 'home' ? <CaptureDeck onNavigate={setActive}/> : active === 'labs' ? <LabWorkspace onPackets={() => setActive('packets')}/> : active === 'packets' ? <PacketField selected={selected} setSelected={setSelected}/> : <PlaceholderView section={active}/>}</section>
    <Launcher open={launcher} onClose={() => setLauncher(false)} onNavigate={setActive}/>
  </main>;
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('pp-unlocked') === 'true');
  const unlock = () => { sessionStorage.setItem('pp-unlocked', 'true'); setAuthenticated(true); };
  const logout = () => { sessionStorage.removeItem('pp-unlocked'); setAuthenticated(false); };
  return authenticated ? <Workspace onLogout={logout}/> : <Login onUnlock={unlock}/>;
}
