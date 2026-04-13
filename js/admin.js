let leaderboard = []
let alerts = []



let deviceRequests = JSON.parse(localStorage.getItem("deviceRequests")) || []

let settings = JSON.parse(localStorage.getItem("settings")) || {
limit:3,
alertLevel:"medium",
alertHighUsage:true,
alertIdle:true,
aiMode:"balanced",
autoOff:60,
residentControl:"limited"
}


function buildData(){

leaderboard = []
alerts = []

for(let u in users){

if(!users[u].devices) continue

let total = 0

for(let d in users[u].devices){
total += users[u].devices[d]
}

leaderboard.push({
name:u,
energy:total,
devices:users[u].devices,
active: users[u].active !== false,
role: users[u].role || "resident"
})


let threshold = 1.5

if(settings.alertLevel === "low") threshold = 2.5
if(settings.alertLevel === "high") threshold = 1

if(settings.alertHighUsage && total > threshold){
alerts.push("⚠️ "+u+" high usage ("+total.toFixed(2)+" kWh)")
}

if(settings.alertIdle && total < 0.3){
alerts.push("💤 "+u+" mostly idle devices")
}

if(users[u].active === false){
alerts.push("⛔ "+u+" disabled")
}

}

leaderboard.sort((a,b)=>a.energy-b.energy)

}



function loadAnalytics(){

let totalEnergy = leaderboard.reduce((a,b)=>a+b.energy,0)

document.getElementById("totalUsers").innerText = leaderboard.length

let totalDevices = 0
for(let u in users){
for(let d in users[u].devices){
totalDevices++
}
}
document.getElementById("totalDevices").innerText = totalDevices

document.getElementById("totalEnergy").innerText = totalEnergy.toFixed(2)+" kWh"

let avg = totalEnergy / leaderboard.length

let msg = "System stable"

if(avg < 1) msg = "Excellent efficiency"
else if(avg < 2) msg = "Good usage"
else if(avg < 3) msg = "Monitor devices"
else msg = "High consumption detected"

document.getElementById("prediction").innerText = msg

}


function loadAlerts(){

let box = document.getElementById("alertsList")

box.innerHTML = alerts.length ? "" : "✅ No alerts"

alerts.forEach(a=>{
box.innerHTML += a + "<br>"
})

}



function loadUsers(){

let list=document.getElementById("userList")
list.innerHTML=""

for(let u in users){

let user = users[u]
let role = user.role || "resident"

list.innerHTML+=`
<div>
<span>${user.active !== false ? "🟢" : "🔴"} ${u}</span>

<select onchange="changeRole('${u}', this.value)">
<option value="resident" ${role==="resident"?"selected":""}>resident</option>
<option value="manager" ${role==="manager"?"selected":""}>manager</option>
<option value="admin" ${role==="admin"?"selected":""}>admin</option>
</select>

<button onclick="toggleUser('${u}')">
${user.active===false ? "Enable" : "Disable"}
</button>

<button onclick="removeUser('${u}')">Remove</button>
</div>
`
}
}

function addUser(){

let name=document.getElementById("newUser").value
if(!name) return

users[name]={
password:"1234",
devices:{},
role:"resident",
active:true
}

location.reload()
}

function removeUser(name){
delete users[name]
location.reload()
}

function toggleUser(name){
users[name].active = users[name].active === false ? true : false
loadUsers()
}

function changeRole(user,role){
users[user].role = role
}


function loadDeviceUsers(){

let select=document.getElementById("deviceUserSelect")
select.innerHTML=""

for(let u in users){
let opt=document.createElement("option")
opt.value=u
opt.text=u
select.appendChild(opt)
}

select.onchange=loadDevices
}

function loadDevices(){

let u=document.getElementById("deviceUserSelect").value
let list=document.getElementById("deviceList")

list.innerHTML=""

let user=users[u]

for(let d in user.devices){

list.innerHTML+=`
<div>
<span>${d}</span>
<button onclick="removeDevice('${u}','${d}')">Remove</button>
</div>
`
}
}

function addDevice(){

let u=document.getElementById("deviceUserSelect").value
let d=document.getElementById("newDevice").value

if(!d) return

users[u].devices[d]=0

buildData()
loadAnalytics()
loadDevices()
loadChart(document.getElementById("graphType").value)
}

function removeDevice(user,device){

delete users[user].devices[device]

buildData()
loadAnalytics()
loadDevices()
loadChart(document.getElementById("graphType").value)
}


function loadRequests(){

let r=document.getElementById("requestsList")
r.innerHTML=""

deviceRequests.forEach((req,i)=>{

r.innerHTML+=`
<div>
<span>${req.user} → ${req.device}</span>
<button onclick="approve(${i})">Approve</button>
</div>
`
})
}

function approve(i){

let req=deviceRequests[i]

users[req.user].devices[req.device]=0
deviceRequests.splice(i,1)

localStorage.setItem("deviceRequests", JSON.stringify(deviceRequests))

buildData()
loadRequests()
loadDevices()

}


function loadChart(type){

let labels = leaderboard.map(p=>p.name)
let values = leaderboard.map(p=>p.energy)


let factor = 1
if(settings.aiMode === "conservative") factor = 0.8
if(settings.aiMode === "aggressive") factor = 1.2

let predicted = values.map(v => v * (factor + Math.random()*0.2))

createOrUpdateChart("adminChart", type, labels, values, predicted)

}




function simulateLiveData(){

setInterval(()=>{

leaderboard.forEach(p=>{

p.energy += (Math.random()*0.05 - 0.025)

if(p.energy < 0){
p.energy = 0
}

})


loadChart(document.getElementById("graphType").value)

},3000)

}


function downloadCSV(){

let csv = "User,Total Energy,Devices\n"

leaderboard.forEach(p=>{

let deviceList = Object.keys(p.devices).join(" | ")

csv += `${p.name},${p.energy.toFixed(2)},${deviceList}\n`

})

let blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })

let url = URL.createObjectURL(blob)

let a = document.createElement("a")
a.href = url
a.download = "energy_report.csv"

document.body.appendChild(a)  
a.click()

document.body.removeChild(a)
URL.revokeObjectURL(url)

}


function updateSettings(){

settings.limit = Number(document.getElementById("limit").value)
settings.alertLevel = document.getElementById("alertLevel").value
settings.alertHighUsage = document.getElementById("alertHighUsage").checked
settings.alertIdle = document.getElementById("alertIdle").checked
settings.aiMode = document.getElementById("aiMode").value
settings.autoOff = Number(document.getElementById("autoOff").value)
settings.residentControl = document.getElementById("residentControl").value

localStorage.setItem("settings", JSON.stringify(settings))

buildData()
loadAlerts()

}

function resetSystem(){

if(confirm("Reset ALL data?")){
localStorage.clear()
location.reload()
}

}



function toggleTheme(){
document.body.classList.toggle("dark")
localStorage.setItem("theme",
document.body.classList.contains("dark")?"dark":"light")
}



window.onload=function(){

let theme=localStorage.getItem("theme")
if(theme==="dark") document.body.classList.add("dark")

document.getElementById("limit").value = settings.limit
document.getElementById("alertLevel").value = settings.alertLevel
document.getElementById("alertHighUsage").checked = settings.alertHighUsage
document.getElementById("alertIdle").checked = settings.alertIdle
document.getElementById("aiMode").value = settings.aiMode
document.getElementById("autoOff").value = settings.autoOff
document.getElementById("residentControl").value = settings.residentControl

buildData()
loadAnalytics()
loadUsers()
loadDeviceUsers()
loadDevices()
loadRequests()
loadAlerts()

document.getElementById("graphType").onchange = function(e){
loadChart(e.target.value)
}

loadChart("bar")
simulateLiveData()

}
function toggleTheme(){

document.body.classList.toggle("dark")

localStorage.setItem(
"theme",
document.body.classList.contains("dark") ? "dark" : "light"
)

}