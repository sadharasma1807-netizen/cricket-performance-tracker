const STORAGE_KEY="cricket_tracker_v2";
const defaultData={
 players:[
  {id:"p1",name:"Arjun",team:"KCAS Warriors",role:"Batter"},
  {id:"p2",name:"Kavin",team:"KCAS Warriors",role:"All-Rounder"},
  {id:"p3",name:"Vishal",team:"Chengam CC",role:"Bowler"}
 ],
 performances:[
  {id:"m1",playerId:"p1",date:"2026-09-20",opponent:"Chengam CC",runs:72,balls:48,wickets:0,overs:0},
  {id:"m2",playerId:"p2",date:"2026-09-20",opponent:"Chengam CC",runs:35,balls:27,wickets:2,overs:4},
  {id:"m3",playerId:"p3",date:"2026-09-20",opponent:"KCAS Warriors",runs:8,balls:12,wickets:3,overs:4}
 ]};

let data=loadData();

function clone(x){return JSON.parse(JSON.stringify(x))}
function loadData(){try{const s=localStorage.getItem(STORAGE_KEY);return s?JSON.parse(s):clone(defaultData)}catch{return clone(defaultData)}}
function save(msg){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));render();if(msg)showToast(msg)}
function uid(p){return p+"_"+Date.now()+"_"+Math.random().toString(36).slice(2,7)}
function playerById(id){return data.players.find(p=>p.id===id)}
function num(v){return Number(v)||0}
function sr(r,b){return b?num(r)/num(b)*100:0}
function eco(r,o){return o?num(r)/num(o):0}
function fmt(v){return Number(v).toFixed(2)}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function showToast(msg){const t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");clearTimeout(showToast.x);showToast.x=setTimeout(()=>t.classList.remove("show"),2200)}
function setToday(){document.getElementById("matchDate").value=new Date().toISOString().slice(0,10)}

function render(){renderStats();renderSelects();renderPlayers();renderPerformances();renderLeaderboard();renderProfile();renderBars()}

function renderStats(){
 const runs=data.performances.reduce((s,m)=>s+num(m.runs),0), wk=data.performances.reduce((s,m)=>s+num(m.wickets),0);
 const high=data.performances.length?data.performances.reduce((a,b)=>num(b.runs)>num(a.runs)?b:a):null;
 const bowl=data.performances.length?data.performances.reduce((a,b)=>num(b.wickets)>num(a.wickets)?b:a):null;
 document.getElementById("totalPlayers").textContent=data.players.length;
 document.getElementById("totalMatches").textContent=data.performances.length;
 document.getElementById("totalRuns").textContent=runs;
 document.getElementById("totalWickets").textContent=wk;
 document.getElementById("highestScore").textContent=high?num(high.runs):0;
 document.getElementById("bestBowling").textContent=bowl?num(bowl.wickets):0;
 document.getElementById("highestPlayer").textContent=high?(playerById(high.playerId)?.name||"Unknown"):"—";
 document.getElementById("bestBowler").textContent=bowl?(playerById(bowl.playerId)?.name||"Unknown"):"—";
}

function renderSelects(){
 const current=document.getElementById("performancePlayer").value;
 document.getElementById("performancePlayer").innerHTML=data.players.length?data.players.map(p=>`<option value="${p.id}">${esc(p.name)} — ${esc(p.team)}</option>`).join(""):'<option value="">Add a player first</option>';
 if(data.players.some(p=>p.id===current))document.getElementById("performancePlayer").value=current;
 const filter=document.getElementById("filterPlayer"), fcur=filter.value;
 filter.innerHTML='<option value="">All Players</option>'+data.players.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("");
 if(data.players.some(p=>p.id===fcur))filter.value=fcur;
 const profile=document.getElementById("profilePlayer"), pcur=profile.value;
 profile.innerHTML=data.players.length?data.players.map(p=>`<option value="${p.id}">${esc(p.name)} — ${esc(p.team)}</option>`).join(""):'<option value="">No players</option>';
 if(data.players.some(p=>p.id===pcur))profile.value=pcur;
}

function renderPlayers(){
 const body=document.getElementById("playersBody"),q=document.getElementById("searchPlayer").value.toLowerCase();
 const rows=data.players.filter(p=>(p.name+" "+p.team+" "+p.role).toLowerCase().includes(q));
 if(!rows.length){body.innerHTML='<tr><td colspan="8" class="empty">No players found.</td></tr>';return}
 body.innerHTML=rows.map(p=>{
  const ms=data.performances.filter(m=>m.playerId===p.id),runs=ms.reduce((s,m)=>s+num(m.runs),0),balls=ms.reduce((s,m)=>s+num(m.balls),0),wk=ms.reduce((s,m)=>s+num(m.wickets),0);
  return `<tr><td><strong>${esc(p.name)}</strong></td><td>${esc(p.team)}</td><td>${esc(p.role)}</td><td>${ms.length}</td><td>${runs}</td><td>${wk}</td><td>${fmt(sr(runs,balls))}</td><td><button class="mini-btn" onclick="editPlayer('${p.id}')">Edit</button><button class="mini-btn delete" onclick="deletePlayer('${p.id}')">Delete</button></td></tr>`
 }).join("");
}

function filteredPerformances(){
 const pid=document.getElementById("filterPlayer").value,from=document.getElementById("filterFrom").value,to=document.getElementById("filterTo").value,opp=document.getElementById("filterOpponent").value.toLowerCase().trim();
 let rows=data.performances.filter(m=>(!pid||m.playerId===pid)&&(!from||m.date>=from)&&(!to||m.date<=to)&&(!opp||m.opponent.toLowerCase().includes(opp)));
 const mode=document.getElementById("sortPerformance").value;
 rows.sort((a,b)=>mode==="date"?b.date.localeCompare(a.date):num(b[mode])-num(a[mode]));
 return rows;
}
function renderPerformances(){
 const body=document.getElementById("performanceBody"),rows=filteredPerformances();
 if(!rows.length){body.innerHTML='<tr><td colspan="9" class="empty">No matching performance records.</td></tr>';return}
 body.innerHTML=rows.map(m=>{
  const p=playerById(m.playerId);
  return `<tr><td>${esc(m.date)}</td><td><strong>${esc(p?.name||"Unknown")}</strong></td><td>${esc(m.opponent)}</td><td>${num(m.runs)}</td><td>${num(m.balls)}</td><td>${fmt(sr(m.runs,m.balls))}</td><td>${num(m.wickets)}</td><td>${fmt(eco(m.runs,m.overs))}</td><td><button class="mini-btn" onclick="editPerformance('${m.id}')">Edit</button><button class="mini-btn delete" onclick="deletePerformance('${m.id}')">Delete</button></td></tr>`
 }).join("");
}

function renderLeaderboard(){
 const totals=data.players.map(p=>({p,runs:data.performances.filter(m=>m.playerId===p.id).reduce((s,m)=>s+num(m.runs),0),wk:data.performances.filter(m=>m.playerId===p.id).reduce((s,m)=>s+num(m.wickets),0)}));
 const byRuns=[...totals].sort((a,b)=>b.runs-a.runs),byWk=[...totals].sort((a,b)=>b.wk-a.wk);
 const tr=byRuns[0],tw=byWk[0];
 document.getElementById("topRunPlayer").textContent=tr?.p.name||"—";document.getElementById("topRunValue").textContent=(tr?.runs||0)+" runs";
 document.getElementById("topWicketPlayer").textContent=tw?.p.name||"—";document.getElementById("topWicketValue").textContent=(tw?.wk||0)+" wickets";
 const max=Math.max(1,...byRuns.map(x=>x.runs));
 document.getElementById("leaderRows").innerHTML=byRuns.slice(0,5).map((x,i)=>`<div class="leader-row"><span class="rank">#${i+1}</span><strong>${esc(x.p.name)}</strong><div class="bar-wrap"><div class="bar" style="width:${x.runs/max*100}%"></div></div><span class="bar-value">${x.runs}</span></div>`).join("")||'<div class="empty">No data yet.</div>';
}

function renderProfile(){
 const pid=document.getElementById("profilePlayer").value||data.players[0]?.id;
 const p=playerById(pid), ms=data.performances.filter(m=>m.playerId===pid);
 const runs=ms.reduce((s,m)=>s+num(m.runs),0),balls=ms.reduce((s,m)=>s+num(m.balls),0),wk=ms.reduce((s,m)=>s+num(m.wickets),0),best=ms.length?Math.max(...ms.map(m=>num(m.runs))):0;
 document.getElementById("profileContent").innerHTML=p?`
 <div class="profile-stat"><span>Player</span><strong>${esc(p.name)}</strong></div>
 <div class="profile-stat"><span>Matches</span><strong>${ms.length}</strong></div>
 <div class="profile-stat"><span>Total Runs</span><strong>${runs}</strong></div>
 <div class="profile-stat"><span>Wickets</span><strong>${wk}</strong></div>
 <div class="profile-stat"><span>Strike Rate</span><strong>${fmt(sr(runs,balls))}</strong></div>
 <div class="profile-stat"><span>Best Score</span><strong>${best}</strong></div>
 <div class="profile-stat"><span>Role</span><strong>${esc(p.role)}</strong></div>
 <div class="profile-stat"><span>Team</span><strong>${esc(p.team)}</strong></div>`:'<div class="empty">Add a player to view summary.</div>';
}

function renderBars(){
 const totals=data.players.map(p=>({p,runs:data.performances.filter(m=>m.playerId===p.id).reduce((s,m)=>s+num(m.runs),0)})).sort((a,b)=>b.runs-a.runs);
 const max=Math.max(1,...totals.map(x=>x.runs));
 document.getElementById("performanceBars").innerHTML=totals.map(x=>`<div class="player-bar"><span class="player-bar-name">${esc(x.p.name)}</span><div class="bar-wrap"><div class="bar" style="width:${x.runs/max*100}%"></div></div><strong>${x.runs}</strong></div>`).join("")||'<div class="empty">No player data.</div>';
}

document.getElementById("playerForm").addEventListener("submit",e=>{
 e.preventDefault();const id=document.getElementById("editPlayerId").value,name=document.getElementById("playerName").value.trim(),team=document.getElementById("playerTeam").value.trim(),role=document.getElementById("playerRole").value;
 if(!name||!team)return;
 if(id){const p=playerById(id);Object.assign(p,{name,team,role});resetPlayerForm();save("Player updated successfully!")}
 else{data.players.push({id:uid("p"),name,team,role});e.target.reset();save("Player added successfully!")}
});
function editPlayer(id){const p=playerById(id);if(!p)return;document.getElementById("editPlayerId").value=id;document.getElementById("playerName").value=p.name;document.getElementById("playerTeam").value=p.team;document.getElementById("playerRole").value=p.role;document.getElementById("playerSubmit").textContent="Update Player";document.getElementById("playerCancel").classList.remove("hidden");document.getElementById("playerForm").scrollIntoView({behavior:"smooth"})}
function resetPlayerForm(){document.getElementById("playerForm").reset();document.getElementById("editPlayerId").value="";document.getElementById("playerSubmit").textContent="Add Player";document.getElementById("playerCancel").classList.add("hidden")}
document.getElementById("playerCancel").onclick=resetPlayerForm;
window.deletePlayer=id=>{const p=playerById(id);if(!p)return;if(!confirm(`Delete ${p.name} and all their performance records?`))return;data.players=data.players.filter(x=>x.id!==id);data.performances=data.performances.filter(m=>m.playerId!==id);save("Player deleted.")};

document.getElementById("performanceForm").addEventListener("submit",e=>{
 e.preventDefault();const id=document.getElementById("editPerformanceId").value;
 const m={playerId:document.getElementById("performancePlayer").value,date:document.getElementById("matchDate").value,opponent:document.getElementById("opponent").value.trim(),runs:num(document.getElementById("runs").value),balls:num(document.getElementById("balls").value),wickets:num(document.getElementById("wickets").value),overs:num(document.getElementById("overs").value)};
 if(!m.playerId||!m.date||!m.opponent){showToast("Please fill all required fields.");return}
 if(id){Object.assign(data.performances.find(x=>x.id===id),m);resetPerformanceForm();save("Performance updated successfully!")}
 else{data.performances.push({...m,id:uid("m")});e.target.reset();setToday();save("Performance saved successfully!")}
});
function editPerformance(id){const m=data.performances.find(x=>x.id===id);if(!m)return;document.getElementById("editPerformanceId").value=id;document.getElementById("performancePlayer").value=m.playerId;document.getElementById("matchDate").value=m.date;document.getElementById("opponent").value=m.opponent;document.getElementById("runs").value=m.runs;document.getElementById("balls").value=m.balls;document.getElementById("wickets").value=m.wickets;document.getElementById("overs").value=m.overs;document.getElementById("performanceSubmit").textContent="Update Performance";document.getElementById("performanceCancel").classList.remove("hidden");document.getElementById("performanceForm").scrollIntoView({behavior:"smooth"})}
function resetPerformanceForm(){document.getElementById("performanceForm").reset();document.getElementById("editPerformanceId").value="";document.getElementById("performanceSubmit").textContent="Save Performance";document.getElementById("performanceCancel").classList.add("hidden");setToday()}
document.getElementById("performanceCancel").onclick=resetPerformanceForm;
window.deletePerformance=id=>{if(!confirm("Delete this performance record?"))return;data.performances=data.performances.filter(m=>m.id!==id);save("Performance deleted.")};

["searchPlayer","filterPlayer","filterFrom","filterTo","filterOpponent","sortPerformance","profilePlayer"].forEach(id=>document.getElementById(id).addEventListener("input",render));
document.getElementById("sortPerformance").addEventListener("change",render);
document.getElementById("resetBtn").onclick=()=>{if(!confirm("This restores the sample data and removes your saved changes. Continue?"))return;data=clone(defaultData);localStorage.setItem(STORAGE_KEY,JSON.stringify(data));resetPlayerForm();resetPerformanceForm();render();showToast("Sample data restored.")};

function downloadCSV(filename,rows){
 const csv=rows.map(row=>row.map(v=>`"${String(v??"").replace(/"/g,'""')}"`).join(",")).join("\n");
 const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;a.click();URL.revokeObjectURL(a.href);showToast("CSV exported successfully!");
}
document.getElementById("exportPlayers").onclick=()=>{
 const rows=[["Player","Team","Role","Matches","Runs","Wickets","Strike Rate"]];
 data.players.forEach(p=>{const ms=data.performances.filter(m=>m.playerId===p.id),runs=ms.reduce((s,m)=>s+num(m.runs),0),balls=ms.reduce((s,m)=>s+num(m.balls),0),wk=ms.reduce((s,m)=>s+num(m.wickets),0);rows.push([p.name,p.team,p.role,ms.length,runs,wk,fmt(sr(runs,balls))])});downloadCSV("players.csv",rows)
};
document.getElementById("exportPerformance").onclick=()=>{
 const rows=[["Date","Player","Opponent","Runs","Balls","Strike Rate","Wickets","Overs","Economy"]];
 filteredPerformances().forEach(m=>rows.push([m.date,playerById(m.playerId)?.name||"Unknown",m.opponent,m.runs,m.balls,fmt(sr(m.runs,m.balls)),m.wickets,m.overs,fmt(eco(m.runs,m.overs))]));downloadCSV("performance-records.csv",rows)
};

document.getElementById("themeBtn").onclick=()=>{
 document.body.classList.toggle("dark");const dark=document.body.classList.contains("dark");localStorage.setItem("cricket_theme",dark?"dark":"light");document.getElementById("themeBtn").textContent=dark?"☀️ Light":"🌙 Dark";
};
if(localStorage.getItem("cricket_theme")==="dark"){document.body.classList.add("dark");document.getElementById("themeBtn").textContent="☀️ Light"}
setToday();render();