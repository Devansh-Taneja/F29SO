let id = localStorage.getItem("currentUser")
let user = users[id]

let deviceState = JSON.parse(localStorage.getItem("deviceState")) || {}

let total = 0
let highestDevice = ""
let lowestDevice = ""
let highest = 0
let lowest = 999

let grid = document.getElementById("deviceGrid")



for(let d in user.devices){

let energy = user.devices[d]
let key = d.replace(/\s/g,'')

total += energy

if(energy > highest){
highest = energy
highestDevice = d
}

if(energy < lowest){
lowest = energy
lowestDevice = d
}

if(!deviceState[key]){
deviceState[key] = { on:false, time:0 }
}

grid.innerHTML += `
<div class="device-card">
<h4>${d}</h4>
<p>${energy.toFixed(2)} kWh</p>

<p id="status-${key}" class="status ${deviceState[key].on ? 'on':'off'}">
${deviceState[key].on ? 'ON':'OFF'}
</p>

<p class="timer" id="timer-${key}">
${formatTime(deviceState[key].time)}
</p>

<div class="device-controls">
<button onclick="turnOn('${key}')">ON</button>
<button onclick="turnOff('${key}')">OFF</button>
</div>
</div>
`
}



document.getElementById("energyLive").innerText = total.toFixed(2) + " kWh"

document.getElementById("usageInfo").innerHTML =
`Highest: ${highestDevice} (${highest.toFixed(2)} kWh)<br>
Lowest: ${lowestDevice} (${lowest.toFixed(2)} kWh)`

let score = Math.max(0, 100 - total * 20)
document.getElementById("energyScore").innerText = Math.round(score)



let allUsers = Object.keys(users).map(u => {
let sum = Object.values(users[u].devices).reduce((a,b)=>a+b,0)
return {id: u, total: sum}
})

allUsers.sort((a,b)=>a.total - b.total)

let rank = allUsers.findIndex(u => u.id === id) + 1
document.getElementById("rank").innerText = "#" + rank



document.getElementById("prediction").innerText =
"AI predicts tomorrow usage around " + (total * 0.9).toFixed(2) + " kWh"



function loadChart(type){

let labels = Object.keys(user.devices)
let values = Object.values(user.devices)

let predicted = values.map(v => v * (0.9 + Math.random()*0.2))

createOrUpdateChart("residentChart", type, labels, values, predicted)

}



function formatTime(sec){
let m = Math.floor(sec / 60)
let s = sec % 60
return `${m}:${s < 10 ? "0"+s : s}`
}



function simulateLiveData(){

setInterval(()=>{


for(let d in user.devices){

user.devices[d] += (Math.random()*0.05 - 0.025)

if(user.devices[d] < 0){
user.devices[d] = 0
}

}


for(let d in deviceState){

if(deviceState[d].on){
deviceState[d].time += 1

let timerEl = document.getElementById("timer-" + d)
if(timerEl){
timerEl.innerText = formatTime(deviceState[d].time)
}
}

}


loadChart(document.getElementById("graphType").value)

},1000)

}



function turnOn(device){

deviceState[device].on = true
saveState()

let status = document.getElementById("status-" + device)

if(status){
status.innerText = "ON"
status.className = "status on"
}

}

function turnOff(device){

deviceState[device].on = false
deviceState[device].time = 0
saveState()

let status = document.getElementById("status-" + device)
let timer = document.getElementById("timer-" + device)

if(status){
status.innerText = "OFF"
status.className = "status off"
}

if(timer){
timer.innerText = "0:00"
}

}

function saveState(){
localStorage.setItem("deviceState", JSON.stringify(deviceState))
}


window.addEventListener("load", function(){

let theme = localStorage.getItem("theme")

if(theme === "dark"){
document.body.classList.add("dark")
}

loadChart("bar")
simulateLiveData()

})


function toggleTheme(){

document.body.classList.toggle("dark")

localStorage.setItem(
"theme",
document.body.classList.contains("dark") ? "dark" : "light"
)

}