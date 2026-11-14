const Members={
all(){return DB.d.members},
get(id){return DB.d.members.find(m=>m.id===id)},
nextId(){const n=DB.d.members.reduce((a,m)=>Math.max(a,parseInt(String(m.id).replace(/\D/g,''))||0),0)+1;return 'AG'+String(n).padStart(3,'0')},
add(name,kelas,joined){name=(name||'').trim();if(!name)return{err:'Nama wajib diisi'};
 if(DB.d.members.some(m=>m.active&&m.name.toLowerCase()===name.toLowerCase()))return{err:'Nama anggota sudah ada'};
 const m={id:this.nextId(),name,kelas:(kelas||'').trim(),joined:joined||Tx.today(),active:true};DB.d.members.push(m);DB.save();return{ok:m}},
edit(id,name,kelas){name=(name||'').trim();if(!name)return{err:'Nama wajib diisi'};
 const m=this.get(id);m.name=name;m.kelas=(kelas||'').trim();DB.save();return{ok:m}},
toggle(id){const m=this.get(id);m.active=!m.active;DB.save();return m}
};
