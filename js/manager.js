let leaderboard = []


for(let u in users){

if(!users[u].devices) continue

let total = 0

for(let d in users[u].devices){
total += users[u].devices[d]
}

leaderboard.push({
name:u,
energy:total,
devices:users[u].devices
})

}

leaderboard.sort((a,b)=>a.energy-b.energy)



let highest = leaderboard[leaderboard.length-1]
let lowest = leaderboard[0]

let avg = leaderboard.reduce((a,b)=>a+b.energy,0)/leaderboard.length

document.getElementById("highestUser").innerText =
highest.name+" ("+highest.energy.toFixed(2)+" kWh)"

document.getElementById("lowestUser").innerText =
lowest.name+" ("+lowest.energy.toFixed(2)+" kWh)"

document.getElementById("avgUsage").innerText =
avg.toFixed(2)+" kWh"

document.getElementById("prediction").innerText =
(avg*leaderboard.length*0.9).toFixed(2)+" kWh"



leaderboard.forEach((p,i)=>{
document.getElementById("leaderboardData").innerHTML +=
(i+1)+". "+p.name+" — "+p.energy.toFixed(2)+" kWh<br>"
})



let select = document.getElementById("residentSelect")

leaderboard.forEach(p=>{
let opt=document.createElement("option")
opt.value=p.name
opt.text=p.name
select.appendChild(opt)
})

select.onchange=function(){

let u=this.value
let user=users[u]

let html=""

let total = 0
let count = 0

let highD="", lowD=""
let high=0, low=999

html += "<h4>Device Usage</h4>"

for(let d in user.devices){

let val=user.devices[d]

total += val
count++

html+=`${d} — ${val.toFixed(2)} kWh<br>`

if(val>high){high=val; highD=d}
if(val<low){low=val; lowD=d}
}

let avg = total / count

html += `<br><h4>Analytics</h4>`
html += `Total Usage: ${total.toFixed(2)} kWh<br>`
html += `Average per Device: ${avg.toFixed(2)} kWh<br>`

html += `<br><b>Highest Device:</b> ${highD} (${high.toFixed(2)} kWh)`
html += `<br><b>Lowest Device:</b> ${lowD} (${low.toFixed(2)} kWh)`

let onCount = 0
let offCount = 0

for(let d in user.devices){
let isOn = Math.random() > 0.5
if(isOn) onCount++
else offCount++
}

html += `<br><br><h4>Device Behaviour</h4>`
html += `Active Devices: ${onCount}<br>`
html += `Idle Devices: ${offCount}<br>`

let efficiency = Math.max(0, 100 - total * 15)

html += `<br><h4>Efficiency</h4>`
html += `Score: ${Math.round(efficiency)} / 100<br>`

let risk = "Low"
if(total > 3) risk = "High"
else if(total > 2) risk = "Medium"

html += `<br><h4>AI Insight</h4>`
html += `Energy Risk Level: ${risk}`

html += `<br><br><h4>Device Timers</h4>`

for(let d in user.devices){
let time = Math.floor(Math.random()*120)
html += `${d}: ${time}s<br>`
}

document.getElementById("residentDetails").innerHTML = html
}


if(leaderboard.length > 0){
select.value = leaderboard[0].name
select.onchange()
}



function loadChart(type){

let filtered = leaderboard.filter(p => p.name !== "admin")

let labels = filtered.map(p=>p.name)
let values = filtered.map(p=>p.energy)

let predicted = values.map(v => v * (0.9 + Math.random()*0.2))

createOrUpdateChart("managerChart", type, labels, values, predicted)

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


let facilities = JSON.parse(localStorage.getItem("facilities")) || {
"Main":{on:false,time:0},
"Wing A":{on:false,time:0},
"Wing B":{on:false,time:0}
}

let currentFacility="Main"

function loadFacilities(){

let select=document.getElementById("facilitySelect")
select.innerHTML=""

for(let f in facilities){
let opt=document.createElement("option")
opt.value=f
opt.text=f
select.appendChild(opt)
}

select.onchange=function(){
currentFacility=this.value
updateFacility()
}
}

function facilityOn(){
facilities[currentFacility].on=true
saveFacility()
updateFacility()
alert("⚡ "+currentFacility+" activated")
}

function facilityOff(){
facilities[currentFacility].on=false
facilities[currentFacility].time=0
saveFacility()
updateFacility()
alert("🛑 "+currentFacility+" stopped")
}

function updateFacility(){

let f = facilities[currentFacility]

let statusEl = document.getElementById("facilityStatus")


statusEl.innerText = f.on ? "ON" : "OFF"


statusEl.style.color = f.on ? "#22c55e" : "#ef4444"


let mins = Math.floor(f.time / 60)
let secs = f.time % 60
let formatted = `${secs}s`

document.getElementById("facilityTimer").innerText = formatted

}
function saveFacility(){
localStorage.setItem("facilities",JSON.stringify(facilities))
}

setInterval(()=>{

for(let f in facilities){
if(facilities[f].on){
facilities[f].time++
}
}

updateFacility()
saveFacility()

},1000)



function toggleTheme(){
document.body.classList.toggle("dark")
localStorage.setItem("theme",
document.body.classList.contains("dark")?"dark":"light")
}



window.addEventListener("load", function(){

let theme = localStorage.getItem("theme")

if(theme === "dark"){
document.body.classList.add("dark")
}
loadChart("bar")
loadFacilities()
updateFacility()

simulateLiveData()

})


function toggleTheme(){

document.body.classList.toggle("dark")

localStorage.setItem(
"theme",
document.body.classList.contains("dark") ? "dark" : "light"
)

}