import { useState } from 'react';

const nodes = [
  { id: 'toronto', name: 'Toronto', detail: 'Local gateway · 192.168.1.1', x: 27, y: 38, color: '#00e6a7' },
  { id: 'virginia', name: 'Ashburn', detail: 'GitHub · 140.82.112.6', x: 34, y: 47, color: '#20a4f3' },
  { id: 'frankfurt', name: 'Frankfurt', detail: 'Google · 142.250.80.14', x: 56, y: 37, color: '#a66cff' },
  { id: 'tokyo', name: 'Tokyo', detail: 'CDN edge · TLS 443', x: 84, y: 44, color: '#f5cb5c' },
];

export default function WorldMap() {
  const [active, setActive] = useState(nodes[2]);
  return <div className="map-wrap" aria-label="Global traffic map">
    <svg viewBox="0 0 1000 440" role="img" aria-label="Network endpoints across a stylized world map">
      <defs>
        <pattern id="mapGrid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="#17313a" strokeWidth=".7"/></pattern>
        <filter id="glow"><feGaussianBlur stdDeviation="4" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <rect width="1000" height="440" fill="url(#mapGrid)" opacity=".55" />
      <g className="continents" transform="translate(0,5)">
        <path d="M84 107l55-47 93 2 46 32 12 51-35 31-26 54-39 9-22 78-31-23 5-69-35-42-39-14z"/>
        <path d="M269 278l37 20 25 46-22 79-30 2-17-64-25-57z"/>
        <path d="M427 92l70-35 84 19 42-4 40 35 103 6 75 52-24 42-86 8-42 52-51-14-20 77-55 63-53-38-6-85-54-33-30-69z"/>
        <path d="M666 314l48-24 75 30 36 45-30 33-91 3-48-43z"/>
      </g>
      <g className="connection-lines" filter="url(#glow)">
        <path d="M270 167 Q 310 145 340 207"/><path d="M270 167 Q 420 80 560 163"/>
        <path d="M270 167 Q 590 40 840 194"/><path d="M340 207 Q 450 135 560 163"/>
      </g>
      {[{x1:270,y1:167,x2:560,y2:163,d:.2},{x1:270,y1:167,x2:340,y2:207,d:1.1},{x1:270,y1:167,x2:840,y2:194,d:2}].map((p,i)=><circle key={i} r="4" fill="#8dffe0" className="packet-pulse" style={{animationDelay:`${p.d}s`}}><animateMotion dur={`${2.2+i*.45}s`} repeatCount="indefinite" path={`M${p.x1} ${p.y1} Q ${(p.x1+p.x2)/2} ${Math.min(p.y1,p.y2)-70} ${p.x2} ${p.y2}`} /></circle>)}
      {nodes.map(n => <g key={n.id} className="map-node" transform={`translate(${n.x*10},${n.y*4.4})`} onClick={()=>setActive(n)} role="button" tabIndex={0}>
        <circle r="17" fill={n.color} opacity=".12" className="node-ring"/><circle r="6" fill={n.color}/><circle r="2" fill="#fff"/>
      </g>)}
    </svg>
    <div className="map-label" style={{left:`${active.x}%`,top:`${active.y}%`}}>
      <strong>{active.name}</strong><span>{active.detail}</span><small>Click to investigate ↗</small>
    </div>
    <div className="map-legend"><span><i className="dot live"/>LIVE TRAFFIC</span><span>4 REGIONS</span><span>8.2 MB</span></div>
  </div>;
}
