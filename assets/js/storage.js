// Penyimpanan Local Storage: school, team, members, transactions. Saldo TIDAK disimpan, selalu dihitung dari transaksi.
const DB={
KEY:'tabunganPramuka.v1',d:null,
fresh(){return{school:{name:'SMP Mangun Jaya 01'},team:{name:'Regu Elang'},members:[],transactions:[]}},
load(){let x=null;try{const r=localStorage.getItem(this.KEY);if(r)x=JSON.parse(r)}catch(e){}
 this.d=x&&this.valid(x)?x:this.fresh()},
valid(x){try{return !!(x&&x.school&&x.school.name&&x.team&&x.team.name&&Array.isArray(x.members)&&Array.isArray(x.transactions)
 &&x.members.every(m=>m.id&&m.name&&m.joined)
 &&x.transactions.every(t=>t.id&&t.memberId&&['setor','tarik'].includes(t.type)&&Number(t.amount)>0&&/^\d{4}-\d{2}-\d{2}$/.test(t.date)&&x.members.some(m=>m.id===t.memberId))
 &&new Set(x.members.map(m=>m.id)).size===x.members.length&&new Set(x.transactions.map(t=>t.id)).size===x.transactions.length)}catch(e){return false}},
save(){try{localStorage.setItem(this.KEY,JSON.stringify(this.d));return true}catch(e){return false}},
uid(p){return p+Date.now().toString(36)+Math.random().toString(36).slice(2,7)},
size(){const r=localStorage.getItem(this.KEY)||'';return r.length*2}
};
DB.load();
