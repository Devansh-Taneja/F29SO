const users = {

alice:{
devices:{
Lighting:0.6,
TV:0.5,
Computer:0.8
}
},

john:{
devices:{
Lighting:0.7,
TV:0.6,
Computer:0.9
}
},

sarah:{
devices:{
Lighting:0.4,
TV:0.3,
Computer:0.5
}
}

}


function login(){

let id=document.getElementById("userid").value.toLowerCase();
let role=document.getElementById("role").value;

localStorage.setItem("user",id);

if(role==="resident"){
window.location="resident.html";
}

if(role==="manager"){
window.location="manager.html";
}

if(role==="admin"){
window.location="admin.html";
}

}


function toggleDark(){
document.body.classList.toggle("dark");
}


function loadResident(){

let id=localStorage.getItem("user");

let user=users[id] || users["alice"];

document.getElementById("welcome").innerText="Welcome "+id;

let total=0;

let grid=document.getElementById("deviceGrid");

grid.innerHTML="";

for(let d in user.devices){

let energy=user.devices[d];

total+=energy;

grid.innerHTML+=`

<div class="device-card">

<h4>${d}</h4>

<p>${energy} kWh</p>

</div>

`;

}
let score = Math.max(0,100-total*20);

document.getElementById("energyScore").innerText = score + " pts";
document.getElementById("energyLive").innerText=total.toFixed(2)+" kWh";

let badge="";

if(total < 1.8){
badge="🥇 Gold Energy Saver";
}
else if(total < 2.3){
badge="🥈 Silver Energy Saver";
}
else{
badge="🥉 Bronze Energy Saver";
}

document.getElementById("badge").innerText = badge;



let prediction=(total*0.9).toFixed(2);

document.getElementById("prediction").innerText=
"AI predicts tomorrow's energy usage will be "+prediction+" kWh if current behaviour continues.";


new Chart(document.getElementById("residentChart"),{

type:"line",

data:{
labels:["Mon","Tue","Wed","Thu","Fri"],
datasets:[{
label:"Energy Usage",
data:[2.4,2.3,2.5,2.2,total],
borderColor:"#3b82f6"
}]
}

});
const leaderboardData=[
{name:"Sarah",energy:1.8},
{name:"Alice",energy:2.1},
{name:"John",energy:2.6}
];

leaderboardData.sort((a,b)=>a.energy-b.energy);

let board=document.getElementById("leaderboard");

leaderboardData.forEach((p,i)=>{

board.innerHTML+=`
<div class="leader">
${i+1}. ${p.name} - ${p.energy} kWh
</div>
`;

});

}
let managerChart;

function loadManagerChart(){

let type=document.getElementById("graphType").value;

let labels=["Lighting","Kitchen","Laundry","Heating"];
let data=[30,50,25,45];

if(managerChart){
managerChart.destroy();
}

managerChart=new Chart(
document.getElementById("managerChart"),
{
type:type,

data:{
labels:labels,
datasets:[{
label:"Energy Usage (kWh)",
data:data,
backgroundColor:[
"#3b82f6",
"#22c55e",
"#f97316",
"#ef4444"
]
}]
},

options:{
responsive:true
}

});

}

document.addEventListener("DOMContentLoaded",()=>{

let selector=document.getElementById("graphType");

if(selector){
selector.addEventListener("change",loadManagerChart);
loadManagerChart();
}

});

function loadAdmin(){

let totalUsers=Object.keys(users).length;

document.getElementById("totalUsers").innerText=totalUsers;

let energies=[];

let labels=[];

let total=0;

for(let u in users){

let sum=0;

for(let d in users[u].devices){
sum+=users[u].devices[d];
}

labels.push(u);
energies.push(sum);

total+=sum;

}

document.getElementById("facilityEnergy").innerText=total.toFixed(2)+" kWh";


new Chart(document.getElementById("adminChart"),{

type:"bar",

data:{
labels:labels,
datasets:[{
label:"Energy Usage",
data:energies
}]
}

});


let table=document.getElementById("userTable");

labels.forEach((u,i)=>{

table.innerHTML+=`

<tr>

<td>${u}</td>

<td>${energies[i]} kWh</td>

<td>${energies[i]>2 ? "⚠ High Usage":"Normal"}</td>

</tr>

`;

});


let alerts=document.getElementById("alerts");

energies.forEach((e,i)=>{

if(e>2){

alerts.innerHTML+=
"<p>⚠ High energy usage detected for "+labels[i]+"</p>";

}

});

}


window.onload=function(){

if(document.getElementById("residentChart")){
loadResident();
}

if(document.getElementById("adminChart")){
loadAdmin();
}

}