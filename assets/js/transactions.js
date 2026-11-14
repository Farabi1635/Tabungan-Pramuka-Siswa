const Tx={
today(){return new Date().toLocaleDateString('sv')},
sorted(list){return [...(list||DB.d.transactions)].sort((a,b)=>a.date.localeCompare(b.date)||a.createdAt.localeCompare(b.createdAt))},
forMember(id,list){return this.sorted(list||DB.d.transactions).filter(t=>t.memberId===id)},
balance(id,list){return this.forMember(id,list).reduce((s,t)=>s+(t.type==='setor'?t.amount:-t.amount),0)},
ledger(id){let s=0;return this.forMember(id).map(t=>{s+=t.type==='setor'?t.amount:-t.amount;return{...t,saldo:s}})},
okList(list,id){let s=0;for(const t of this.forMember(id,list)){s+=t.type==='setor'?t.amount:-t.amount;if(s<0)return false}return true},
stats(){const L=DB.d.transactions;const i=L.filter(t=>t.type==='setor').reduce((s,t)=>s+t.amount,0),o=L.filter(t=>t.type==='tarik').reduce((s,t)=>s+t.amount,0);
 return{in:i,out:o,saldo:i-o,count:L.length,members:DB.d.members.filter(m=>m.active).length}},
check(f){const a=Math.round(Number(f.amount));if(!Number.isFinite(a)||a<=0)return'Nominal harus angka positif';
 if(!/^\d{4}-\d{2}-\d{2}$/.test(f.date||''))return'Tanggal tidak valid';return null},
add(f){const e=this.check(f);if(e)return{err:e};const m=Members.get(f.memberId);if(!m)return{err:'Pilih anggota'};if(!m.active)return{err:'Anggota nonaktif'};
 const t={id:DB.uid('TX'),memberId:f.memberId,type:f.type,date:f.date,amount:Math.round(Number(f.amount)),note:(f.note||'').trim()||(f.type==='setor'?'Setoran':'Penarikan'),createdAt:new Date().toISOString()};
 const nl=[...DB.d.transactions,t];if(!this.okList(nl,t.memberId))return{err:'Saldo anggota tidak mencukupi'};
 DB.d.transactions=nl;DB.save();return{ok:t}},
update(id,f){const e=this.check(f);if(e)return{err:e};const old=DB.d.transactions.find(t=>t.id===id);
 const nl=DB.d.transactions.map(t=>t.id===id?{...t,date:f.date,amount:Math.round(Number(f.amount)),note:(f.note||'').trim()||t.note}:t);
 if(!this.okList(nl,old.memberId))return{err:'Koreksi membuat saldo negatif'};DB.d.transactions=nl;DB.save();return{ok:1}},
remove(id){const old=DB.d.transactions.find(t=>t.id===id);const nl=DB.d.transactions.filter(t=>t.id!==id);
 if(!this.okList(nl,old.memberId))return{err:'Penghapusan membuat saldo negatif (ada penarikan setelahnya)'};DB.d.transactions=nl;DB.save();return{ok:1}}
};
