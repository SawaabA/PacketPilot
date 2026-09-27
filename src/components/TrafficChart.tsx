import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { traffic } from '../data';

export default function TrafficChart() {
 return <ResponsiveContainer width="100%" height="100%"><AreaChart data={traffic} margin={{top:10,right:2,left:-25,bottom:0}}>
   <defs><linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#00e6a7" stopOpacity=".4"/><stop offset="1" stopColor="#00e6a7" stopOpacity="0"/></linearGradient></defs>
   <CartesianGrid stroke="#17313a" vertical={false}/><XAxis dataKey="time" tick={{fill:'#66818b',fontSize:10}} tickLine={false} axisLine={false}/><YAxis tick={{fill:'#66818b',fontSize:10}} tickLine={false} axisLine={false}/>
   <Tooltip contentStyle={{background:'#071116',border:'1px solid #24444c',borderRadius:8,fontSize:12}}/>
   <Area type="monotone" dataKey="total" stroke="#00e6a7" strokeWidth={2} fill="url(#trafficFill)"/>
   <Area type="monotone" dataKey="dns" stroke="#f5cb5c" strokeWidth={1} fill="transparent"/>
 </AreaChart></ResponsiveContainer>;
}
