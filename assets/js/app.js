const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let busy=false;
function toast(m){const t=$('#toast');t.textContent=m;t.style.display='block';clearTimeout(toast.h);toast.h=setTimeout(()=>t.style.display='none',2600)}
function openModal(h){const m=$('#modal');m.innerHTML=`<div class="sheet">${h}</div>`;m.hidden=false}
function closeModal(){$('#modal').hidden=true}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
function ask(msg,okLabel='Ya, lanjut'){return new Promise(res=>{openModal(`<p>${msg}</p><div class="row"><button class="btn l" id="cn">Batal</button><button class="btn r" id="cy">${okLabel}</button></div>`);
 $('#cn').onclick=()=>{closeModal();res(false)};$('#cy').onclick=()=>{closeModal();res(true)}})}
function go(h){location.hash=h}
document.addEventListener('click',e=>{const g=e.target.closest('[data-go]');if(g)go(g.dataset.go)});
const mem=id=>Members.get(id)||{name:'?'};
const ini=n=>n.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();
const txRow=t=>`<div class="item" onclick="detail('${t.id}')"><div class="av">${t.type==='setor'?'⬆':'⬇'}</div><div class="mid"><b>${esc(mem(t.memberId).name)}</b><div class="k">${fd(t.date)} · ${esc(t.note)}</div></div><b class="${t.type==='setor'?'in':'out'}">${t.type==='setor'?'+':'-'}${rp(t.amount)}</b></div>`;

/* ---------- Halaman ---------- */
function pgHome(){const s=Tx.stats(),L=Tx.sorted().reverse().slice(0,5);
 return `<div class="card hero"><div class="k">${esc(DB.d.school.name)} · ${esc(DB.d.team.name)}</div><div class="k" style="margin-top:8px">Total Saldo Regu</div><div class="big">${rp(s.saldo)}</div></div>
 <div class="grid"><div class="card"><div class="k">Anggota aktif</div><div class="v">${s.members}</div></div><div class="card"><div class="k">Transaksi</div><div class="v">${s.count}</div></div>
 <div class="card"><div class="k">Total setoran</div><div class="v in">${rp(s.in)}</div></div><div class="card"><div class="k">Total penarikan</div><div class="v out">${rp(s.out)}</div></div></div>
 <div class="card"><h2>📈 Perkembangan Saldo</h2><div style="height:240px"><canvas id="ch1"></canvas></div></div>
 <div class="card"><h2>🍩 Komposisi Saldo per Anggota</h2><div style="height:240px"><canvas id="ch2"></canvas></div></div>
 <div class="row"><button class="btn g" data-go="#setor">＋ Tambah Setoran</button><button class="btn" onclick="memberForm()">👤 Tambah Anggota</button></div>
 <div class="card"><h2>Transaksi Terbaru</h2>${L.map(txRow).join('')||'<div class="empty">Belum ada transaksi</div>'}</div>`}

function memberList(q=''){q=q.toLowerCase();const L=Members.all().filter(m=>(m.name+m.kelas).toLowerCase().includes(q));
 return L.map(m=>`<div class="item ${m.active?'':'off'}" onclick="go('#anggota/${m.id}')"><div class="av">${esc(ini(m.name))}</div><div class="mid"><b>${esc(m.name)}</b><div class="k">${esc(m.kelas||'-')} · ${Tx.forMember(m.id).length} transaksi${m.active?'':' · nonaktif'}</div></div><b>${rp(Tx.balance(m.id))}</b></div>`).join('')||'<div class="empty">Belum ada anggota</div>'}
function pgMembers(){return `<div class="row noprint"><input placeholder="🔍 Cari anggota..." oninput="$('#ml').innerHTML=memberList(this.value)" style="margin:0"><button class="btn s" style="flex:0 0 auto" onclick="memberForm()">＋ Anggota</button></div><div class="card" id="ml">${memberList()}</div>`}
function memberForm(id){const m=id?Members.get(id):null;
 openModal(`<h2>${m?'Edit':'Tambah'} Anggota</h2><label>Nama lengkap</label><input id="mn" value="${esc(m?.name)}"><label>Kelas</label><input id="mk" value="${esc(m?.kelas)}" placeholder="mis. 7A">
 ${m?'':`<label>Tanggal bergabung</label><input id="mj" type="date" value="${Tx.today()}">`}<button class="btn" id="ms">Simpan</button>
 ${m?`<button class="btn l" style="margin-top:8px" id="mt">${m.active?'Nonaktifkan':'Aktifkan'} anggota</button>`:''}`);
 $('#ms').onclick=()=>{const r=m?Members.edit(id,$('#mn').value,$('#mk').value):Members.add($('#mn').value,$('#mk').value,$('#mj').value);
  if(r.err)return toast(r.err);closeModal();toast('Data anggota disimpan');route()};
 if(m)$('#mt').onclick=async()=>{if(m.active&&!await ask('Nonaktifkan anggota ini? Riwayat tabungan tetap tersimpan.'))return;Members.toggle(id);closeModal();toast('Status diperbarui');route()}}
function pgBook(id){const m=Members.get(id);if(!m)return'<div class="empty">Anggota tidak ditemukan</div>';const L=Tx.ledger(id);
 const i=L.filter(t=>t.type==='setor').reduce((s,t)=>s+t.amount,0),o=L.filter(t=>t.type==='tarik').reduce((s,t)=>s+t.amount,0);
 return `<div class="kop"><img src="assets/images/logo-sekolah.png" alt=""><div class="kt"><b>BUKU TABUNGAN PRAMUKA</b><b>${esc(DB.d.school.name.toUpperCase())}</b><span>${esc(DB.d.team.name)}</span></div><img src="assets/images/logo-pramuka.png" alt=""><img src="assets/images/logo-pramuka-dunia.png" alt=""></div><div class="card hero"><b>${esc(m.name)}</b><div class="k">Kelas ${esc(m.kelas||'-')} · ${esc(m.id)} · bergabung ${fd(m.joined)}${m.active?'':' · NONAKTIF'}</div><div class="big">${rp(i-o)}</div>
 <div class="k">Setoran ${rp(i)} · Penarikan ${rp(o)} · ${L.length} transaksi</div></div>
 <div class="row noprint"><button class="btn g" data-go="#setor/${id}" ${m.active?'':'disabled'}>＋ Setor</button><button class="btn r" data-go="#tarik/${id}" ${m.active?'':'disabled'}>− Tarik</button><button class="btn l" onclick="memberForm('${id}')">✏️ Edit</button></div>
 <div class="card tw"><table><tr><th>Tanggal</th><th>Keterangan</th><th class="n">Setoran</th><th class="n">Penarikan</th><th class="n">Saldo</th></tr>${L.map(t=>`<tr onclick="detail('${t.id}')"><td>${fd(t.date)}</td><td>${esc(t.note)}</td><td class="n in">${t.type==='setor'?rp(t.amount):'-'}</td><td class="n out">${t.type==='tarik'?rp(t.amount):'-'}</td><td class="n"><b>${rp(t.saldo)}</b></td></tr>`).join('')||'<tr><td colspan="5" class="empty">Belum ada transaksi</td></tr>'}</table></div>
 <div class="sign"><div>Pembina Pramuka<br><br><br><br>( ........................ )</div><div>Bendahara<br><br><br><br>( ........................ )</div></div><button class="btn l noprint" onclick="window.print()">🖨 Cetak Buku Tabungan</button>`}

function pgTx(type,pre){const act=Members.all().filter(m=>m.active);const s=type==='setor';
 return `<div class="tabs"><a href="#setor" class="${s?'on':''}">Setoran</a><a href="#tarik" class="${s?'':'on'}">Penarikan</a></div><div class="card">
 <label>Anggota</label><select id="fm" onchange="showBal()"><option value="">-- Pilih anggota --</option>${act.map(m=>`<option value="${m.id}" ${m.id===pre?'selected':''}>${esc(m.name)} ${m.kelas?'('+esc(m.kelas)+')':''}</option>`).join('')}</select><div class="k" id="bal" style="margin:-6px 0 10px"></div>
 <label>Tanggal</label><input id="fd" type="date" value="${Tx.today()}"><label>Nominal (Rp)</label><input id="fa" type="number" inputmode="numeric" min="1" placeholder="0">
 ${s?`<div class="chips">${[1000,2000,5000,10000,20000,50000].map(n=>`<button onclick="$('#fa').value=${n}">${n/1000}rb</button>`).join('')}</div>`:''}
 <label>Keterangan</label><input id="fn" placeholder="${s?'Tabungan rutin':'Penarikan'}"><button class="btn ${s?'g':'r'}" id="fs">Simpan ${s?'Setoran':'Penarikan'}</button></div>`}
function showBal(){const v=$('#fm').value;$('#bal').textContent=v?'Saldo saat ini: '+rp(Tx.balance(v)):''}
function bindTx(type){showBal();$('#fs').onclick=()=>{if(busy)return;busy=true;const r=Tx.add({memberId:$('#fm').value,type,date:$('#fd').value,amount:$('#fa').value,note:$('#fn').value});
 setTimeout(()=>busy=false,600);if(r.err)return toast(r.err);toast('Transaksi tersimpan');const from=location.hash.split('/')[1];if(from)go('#anggota/'+from);else{$('#fa').value='';$('#fn').value='';showBal()}}}

let hf={q:'',m:'',from:'',to:'',t:''};
function histList(){const q=hf.q.toLowerCase();const L=Tx.sorted().reverse().filter(t=>(!hf.m||t.memberId===hf.m)&&(!hf.t||t.type===hf.t)&&(!hf.from||t.date>=hf.from)&&(!hf.to||t.date<=hf.to)&&(!q||(t.note+mem(t.memberId).name).toLowerCase().includes(q)));
 return `<div class="k" style="margin-bottom:6px">${L.length} transaksi</div>`+(L.map(txRow).join('')||'<div class="empty">Tidak ada transaksi</div>')}
function pgHist(){const u=(k)=>`oninput="hf.${k}=this.value;$('#hl').innerHTML=histList()"`;
 return `<div class="card noprint"><input placeholder="🔍 Cari transaksi..." value="${esc(hf.q)}" ${u('q')}><select ${u('m')}><option value="">Semua anggota</option>${Members.all().map(m=>`<option value="${m.id}" ${hf.m===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select>
 <select ${u('t')}><option value="">Setoran & penarikan</option><option value="setor" ${hf.t==='setor'?'selected':''}>Setoran</option><option value="tarik" ${hf.t==='tarik'?'selected':''}>Penarikan</option></select>
 <div class="row" style="margin:0"><input type="date" value="${hf.from}" ${u('from')}><input type="date" value="${hf.to}" ${u('to')}></div></div><div class="card" id="hl">${histList()}</div>`}
function detail(id){const t=DB.d.transactions.find(x=>x.id===id);if(!t)return;
 openModal(`<h2>${t.type==='setor'?'Setoran':'Penarikan'} · ${esc(mem(t.memberId).name)}</h2><div class="k">${esc(t.id)} · dicatat ${new Date(t.createdAt).toLocaleString('id-ID')}</div><br>
 <label>Tanggal</label><input id="dd" type="date" value="${t.date}"><label>Nominal</label><input id="da" type="number" inputmode="numeric" value="${t.amount}"><label>Keterangan</label><input id="dn" value="${esc(t.note)}">
 <div class="row"><button class="btn r" id="dx">Hapus</button><button class="btn" id="ds">Simpan Koreksi</button></div>`);
 $('#ds').onclick=async()=>{const f={date:$('#dd').value,amount:$('#da').value,note:$('#dn').value};const e=Tx.check(f);if(e)return toast(e);if(!await ask('Simpan koreksi transaksi ini? Saldo dan laporan dihitung ulang.'))return;
  const r=Tx.update(id,f);if(r.err)return toast(r.err);toast('Transaksi dikoreksi');route()};
 $('#dx').onclick=async()=>{if(!await ask('Hapus transaksi ini? Tindakan tidak dapat dibatalkan.','Ya, hapus'))return;const r=Tx.remove(id);if(r.err)return toast(r.err);toast('Transaksi dihapus');route()}}

let rf={type:'saldo',from:'',to:'',member:''};
function repOut(){const r=Rep.build(rf);$('#ro').innerHTML=Rep.html(r)}
function pgRep(){const u=k=>`onchange="rf.${k}=this.value;${k==='type'?'route()':'repOut()'}"`;const T={saldo:'Saldo seluruh anggota',setor:'Setoran',tarik:'Penarikan',anggota:'Per anggota',rekap:'Rekapitulasi regu'};
 if(rf.type==='anggota'&&!rf.member&&Members.all()[0])rf.member=Members.all()[0].id;
 return `<div class="card noprint"><label>Jenis laporan</label><select ${u('type')}>${Object.entries(T).map(([k,v])=>`<option value="${k}" ${rf.type===k?'selected':''}>${v}</option>`).join('')}</select>
 ${rf.type==='anggota'?`<label>Anggota</label><select ${u('member')}>${Members.all().map(m=>`<option value="${m.id}" ${rf.member===m.id?'selected':''}>${esc(m.name)}</option>`).join('')}</select>`:''}
 <div class="row" style="margin:0"><div><label>Dari</label><input type="date" value="${rf.from}" ${u('from')}></div><div><label>Sampai</label><input type="date" value="${rf.to}" ${u('to')}></div></div>
 <div class="row"><button class="btn" onclick="window.print()">🖨 Cetak / PDF</button><button class="btn l" onclick="dlCsv(1)">⬇ Excel (tabel)</button><button class="btn l" onclick="dlCsv()">⬇ CSV</button></div></div><div id="ro"></div>`}
function dl(txt,mime,name){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:mime}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
function dlCsv(x){const r=Rep.build(rf),n='laporan-'+rf.type+'-'+Tx.today();x?dl('\ufeff'+Rep.xls(r),'application/vnd.ms-excel',n+'.xls'):dl(Rep.csv(r),'text/csv;charset=utf-8',n+'.csv')}

function pgSet(){
 return `<div class="warn">⚠️ Data hanya tersimpan di browser & perangkat ini. Lakukan backup secara berkala agar data tidak hilang.</div>
 <div class="card"><h2>Identitas</h2><label>Nama regu</label><input id="sr" value="${esc(DB.d.team.name)}"><label>Nama sekolah</label><input id="ss" value="${esc(DB.d.school.name)}"><button class="btn" onclick="saveSet()">Simpan</button></div>
 <div class="card"><h2>Backup & Restore</h2><div class="row"><button class="btn g" onclick="Backup.export();toast('Backup diunduh')">⬇ Backup JSON</button><button class="btn l" onclick="$('#rf').click()">⬆ Restore</button></div><input type="file" id="rf" accept=".json,application/json" hidden onchange="restore(this)"></div>
 <div class="card"><h2>Tentang Aplikasi</h2><div class="k">Versi aplikasi</div><div class="v" style="margin-bottom:10px">Versi 1.0.8</div><div class="k">Fitur aplikasi</div><ul style="margin:6px 0 0;padding-left:18px"><li>Dashboard saldo regu, ringkasan, dan grafik perkembangan</li><li>Data anggota dengan buku tabungan masing-masing</li><li>Setoran dan penarikan dengan nominal bebas</li><li>Riwayat transaksi: filter, pencarian, koreksi, hapus</li><li>Laporan: cetak/PDF dengan kop, Excel, dan CSV</li><li>Backup dan restore data (JSON)</li><li>Mode gelap dan terang</li><li>Bisa dipasang di layar utama dan jalan offline (PWA)</li></ul></div>`}
function saveSet(){const r=$('#sr').value.trim(),s=$('#ss').value.trim();if(!r||!s)return toast('Nama tidak boleh kosong');DB.d.team.name=r;DB.d.school.name=s;DB.save()?toast('Pengaturan disimpan'):toast('Gagal menyimpan');hdr()}
async function restore(inp){const f=inp.files[0];inp.value='';if(!f)return;const r=await Backup.import(f);if(r.err)return toast('Gagal: '+r.err);
 if(!await ask(`Data lama akan DIGANTI dengan backup ini (${r.ok.members.length} anggota, ${r.ok.transactions.length} transaksi). Lanjutkan?`,'Ya, timpa'))return;
 toast(Backup.apply(r.ok)?'Restore berhasil':'Restore gagal');hdr();route()}

const dk=()=>document.documentElement.dataset.theme==='dark';
function setTheme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem('tp.theme',t)}catch(e){}
 $('#thm').textContent=t==='dark'?'☀️':'🌙';const m=document.querySelector('meta[name=theme-color]');if(m)m.content=t==='dark'?'#0a3f7c':'#0b4f9c';
 if(($('#ch1')||$('#ch2')))drawCharts()}
function toggleTheme(){setTheme(dk()?'light':'dark')}
let charts=[];
function drawCharts(){Chart.defaults.color=dk()?'#93a3b5':'#666';charts.forEach(c=>c.destroy());charts=[];if(typeof Chart==='undefined'||!$('#ch1'))return;
 const T=Tx.sorted();if(!T.length){['ch1','ch2'].forEach(i=>$('#'+i).parentNode.innerHTML='<div class="empty">Belum ada data untuk grafik</div>');return}
 let s=0;const by={};T.forEach(t=>{s+=t.type==='setor'?t.amount:-t.amount;by[t.date]=s});const ds=Object.keys(by).slice(-15);
 const o={responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,ticks:{callback:v=>v>=1000?v/1000+'rb':v}}}};
 const pts=Object.keys(by).map(d=>({x:Date.parse(d)/864e5,y:by[d]}));const dx=x=>new Date(x*864e5).toISOString().slice(0,10);
 const gr={color:dk()?'#3a4656':'#b5b5b5',lineWidth:1},lc=dk()?'#5aa9ff':'#0000ff',ac=dk()?'#8a99ab':'#555';
 charts.push(new Chart($('#ch1'),{type:'scatter',data:{datasets:[{data:pts,showLine:true,borderColor:lc,backgroundColor:lc,borderWidth:3,pointRadius:4,pointHoverRadius:6,tension:0}]},
  options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>fd(dx(c.parsed.x))+': '+rp(c.parsed.y)}}},
  scales:{x:{type:'linear',min:pts.length>1?undefined:pts[0].x-3,max:pts.length>1?undefined:pts[0].x+3,grid:gr,border:{color:ac},ticks:{maxTicksLimit:6,callback:v=>{const d=fd(dx(v)).split('/');return d[0]+'/'+d[1]+'/'+d[2].slice(2)}}},
   y:{beginAtZero:true,grid:gr,border:{color:ac},ticks:{callback:v=>v.toLocaleString('id-ID')}}}}}));
 const ms=Members.all().map(m=>({n:m.name,v:Tx.balance(m.id)})).filter(x=>x.v>0).sort((a,b)=>b.v-a.v);const tot=ms.reduce((a,x)=>a+x.v,0);
 if(!ms.length){$('#ch2').parentNode.innerHTML='<div class="empty">Belum ada saldo</div>';return}
 const col=['#0b4f9c','#19a35a','#e0a800','#d33','#7b3fa0','#1b9aaa','#ef7d00','#6b7a8c'];
 charts.push(new Chart($('#ch2'),{type:'doughnut',data:{labels:ms.map(x=>x.n),datasets:[{data:ms.map(x=>x.v),backgroundColor:ms.map((x,i)=>col[i%col.length]),borderWidth:2,borderColor:dk()?'#18212c':'#fff'}]},
  options:{responsive:true,maintainAspectRatio:false,cutout:'62%',plugins:{legend:{position:'right',labels:{boxWidth:12}},tooltip:{callbacks:{label:c=>c.label+': '+rp(c.parsed)+' ('+Math.round(c.parsed/tot*100)+'%)'}}}}}));}
/* ---------- Router ---------- */
function hdr(){$('#hdrSub').textContent=DB.d.school.name+' · '+DB.d.team.name}
function route(){const[p,a]=(location.hash||'#beranda').slice(1).split('/');const v=$('#view');
 const m={beranda:()=>pgHome(),anggota:()=>a?pgBook(a):pgMembers(),setor:()=>pgTx('setor',a),tarik:()=>pgTx('tarik',a),riwayat:()=>pgHist(),laporan:()=>pgRep(),pengaturan:()=>pgSet()};
 v.innerHTML=(m[p]||m.beranda)();
 document.querySelectorAll('.bn a').forEach(x=>x.classList.toggle('on',x.dataset.n===(p==='tarik'?'setor':p)));
 if(p==='setor'||p==='tarik')bindTx(p);if(p==='laporan')repOut();if(p==='beranda'||!m[p])drawCharts();window.scrollTo(0,0)}
addEventListener('hashchange',()=>{closeModal();route()});
hdr();setTheme(document.documentElement.dataset.theme||'light');route();
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
