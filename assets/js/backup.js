const Backup={
export(){const b=new Blob([JSON.stringify({app:'tabungan-pramuka',version:1,exported:new Date().toISOString(),data:DB.d},null,1)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`backup-tabungan-pramuka-${Tx.today()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000)},
async import(file){try{const j=JSON.parse(await file.text());const d=j.data||j;if(!DB.valid(d))return{err:'File tidak valid atau datanya rusak'};return{ok:d}}catch(e){return{err:'File bukan JSON yang benar'}}},
apply(d){DB.d=d;return DB.save()}
};
