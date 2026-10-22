import React from 'react';
import {number} from './shared.jsx';
const percent=n=>(n*100).toLocaleString('zh-CN',{maximumFractionDigits:6})+'%';
export default function ExchangeEquity({market}){
 const e=market.equity;if(!e)return null;
 const describe=v=>v.map((n,i)=>n>=1?`${market.names[i]} ${number(n)}`:null).filter(Boolean).join(' · ')||'尚未累积满 1 单位';
 return <details className="exchange-equity panel"><summary><span>商盟股权与分红</span><b>我的持股 {percent(e.share)}</b></summary><p>自由港商盟固定保留 1%；其余 99% 随各文明实力动态分配。同一联盟合并展示，成员按自己的贡献收取分红。</p><div className="equity-income"><div><small>已到账 · 母星与战略仓库</small><strong>{describe(e.paid)}</strong></div><div><small>持股依据</small><strong>工业 40% · 科技 30% · 军力 30%</strong></div></div><p>建设设施、研究科技、扩充舰队都会增加对应实力。每笔成交重新计算股权并分配实际手续费；不足 1 单位的份额累计到下一次，不丢弃。囤货和反复交易不增加实力分。</p><div className="grand-power-table"><table><thead><tr><th>文明 / 联盟</th><th>持股</th><th>工业指数</th><th>科技指数</th><th>军力指数</th></tr></thead><tbody>{e.rows.map(r=><tr key={r.id} className={r.id===e.group?'equity-mine':''}><th>{r.name}{r.id===e.group?' · 我方':''}</th><td>{percent(r.share)}</td><td>{number(r.industry)}</td><td>{number(r.science)}</td><td>{number(r.military)}</td></tr>)}</tbody></table></div><p>工业指数按设施等级平方计分，采矿、供能、工厂和船坞权重 ×10；科技按等级平方计分；军力计入驻军、在途舰队和会战存活部队。</p></details>;
}
