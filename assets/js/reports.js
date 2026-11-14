const rp=n=>(n<0?'-':'')+'Rp'+Math.abs(n).toLocaleString('id-ID');
const fd=d=>d.split('-').reverse().join('/');
const Rep={
build(o){const{type,from,to,member}=o;const inP=t=>(!from||t.date>=from)&&(!to||t.date<=to);const T=Tx.sorted();const M=n=>(Members.get(n)||{}).name||'?';
 let r={title:'',head:[],rows:[],foot:[]};const per=(from||to)?` (${from?fd(from):'awal'} - ${to?fd(to):'sekarang'})`:'';
 if(type==='saldo'){r.title='Laporan Saldo Anggota'+per;r.head=['Nama','Kelas','Saldo'];
  const rows=Members.all().map(m=>[m.name+(m.active?'':' (nonaktif)'),m.kelas||'-',Tx.balance(m.id,T.filter(t=>!to||t.date<=to))]);
  r.rows=rows;r.foot=['Total','',rows.reduce((s,x)=>s+x[2],0)]}
 else if(type==='setor'||type==='tarik'){r.title=(type==='setor'?'Laporan Setoran':'Laporan Penarikan')+per;r.head=['Tanggal','Nama','Keterangan','Nominal'];
  const L=T.filter(t=>t.type===type&&inP(t));r.rows=L.map(t=>[fd(t.date),M(t.memberId),t.note,t.amount]);r.foot=['Total','','',L.reduce((s,t)=>s+t.amount,0)]}
 else if(type==='anggota'){const m=Members.get(member);r.title='Buku Tabungan: '+(m?m.name+(m.kelas?' ('+m.kelas+')':''):'-')+per;r.head=['Tanggal','Keterangan','Setoran','Penarikan','Saldo'];
  const L=m?Tx.ledger(m.id).filter(inP):[];r.rows=L.map(t=>[fd(t.date),t.note,t.type==='setor'?t.amount:'-',t.type==='tarik'?t.amount:'-',t.saldo]);
  r.foot=['Total','',L.filter(t=>t.type==='setor').reduce((s,t)=>s+t.amount,0),L.filter(t=>t.type==='tarik').reduce((s,t)=>s+t.amount,0),m?Tx.balance(m.id,T.filter(t=>!to||t.date<=to)):0]}
 else{r.title='Rekapitulasi Regu'+per;r.head=['Nama','Setoran','Penarikan','Saldo Akhir'];
  const rows=Members.all().map(m=>{const L=T.filter(t=>t.memberId===m.id&&inP(t));const i=L.filter(t=>t.type==='setor').reduce((s,t)=>s+t.amount,0),u=L.filter(t=>t.type==='tarik').reduce((s,t)=>s+t.amount,0);return[m.name,i,u,Tx.balance(m.id,T.filter(t=>!to||t.date<=to))]});
  r.rows=rows;r.foot=['Total',...[1,2,3].map(i=>rows.reduce((s,x)=>s+x[i],0))]}
 return r},
html(r){const f=v=>typeof v==='number'?rp(v):esc(v);
 return `<div class="kop"><img src="assets/images/logo-sekolah.png" alt=""><div class="kt"><b>TABUNGAN PRAMUKA</b><b>${esc(DB.d.school.name.toUpperCase())}</b><span>${esc(DB.d.team.name)}</span></div><img src="assets/images/logo-pramuka.png" alt=""><img src="assets/images/logo-pramuka-dunia.png" alt=""></div><div class="card rtitle"><b>${esc(r.title)}</b><div class="k">${esc(DB.d.school.name)} · ${esc(DB.d.team.name)} · Dicetak ${fd(Tx.today())}</div></div><div class="card tw"><table><tr>${r.head.map((h,i)=>`<th class="${i>=r.head.length-(r.head.length>3?3:1)?'n':''}">${h}</th>`).join('')}</tr>${r.rows.map(x=>`<tr>${x.map((v,i)=>`<td class="${typeof v==='number'||v==='-'?'n':''}">${f(v)}</td>`).join('')}</tr>`).join('')||`<tr><td colspan="${r.head.length}" class="empty">Tidak ada data</td></tr>`}<tr>${r.foot.map(v=>`<th class="${typeof v==='number'?'n':''}">${f(v)}</th>`).join('')}</tr></table></div><div class="sign"><div>Mengetahui,<br>Pembina Pramuka<br><br><br><br>( ........................ )</div><div>Bendahara ${esc(DB.d.team.name)}<br><br><br><br><br>( ........................ )</div></div>`},
num:v=>typeof v==='number',
cells(r){return[[r.title],[DB.d.school.name+' - '+DB.d.team.name+' - Dicetak '+fd(Tx.today())],[],r.head,...r.rows,r.foot]},
csv(r){const q=v=>this.num(v)?String(v):'"'+String(v).replace(/"/g,'""')+'"';return '\ufeffsep=;\r\n'+this.cells(r).map(x=>x.map(q).join(';')).join('\r\n')},
xls(r){const c=this.cells(r);const td=(v,h,i)=>this.num(v)?`<td style="mso-number-format:'#,##0';text-align:right;${h?'font-weight:bold;background:#e4ecf7;':''}">${v}</td>`:`<td style="${h?'font-weight:bold;background:#e4ecf7;':''}">${esc(v)}</td>`;
 const hi=3,fi=c.length-1;return '<html xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="utf-8"></head><body><table border="1" cellpadding="4" style="border-collapse:collapse">'+c.map((x,ri)=>{if(ri<2)return`<tr><td colspan="${r.head.length}" style="border:0;font-weight:bold;font-size:${ri?11:14}pt">${esc(x[0])}</td></tr>`;if(ri===2)return'';return'<tr>'+x.map(v=>td(v,ri===hi||ri===fi)).join('')+'</tr>'}).join('')+'</table></body></html>'}
};
