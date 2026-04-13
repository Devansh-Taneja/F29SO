let chartInstances = {}

function createOrUpdateChart(canvasId, type, labels, values, predicted){

let multiColors = [
"#3b82f6","#6366f1","#291c47","#22c55e",
"#f59e0b","#ef4444","#14b8a6","#f43f5e",
"#0ea5e9","#a855f7"
]

let isPie = (type === "pie")
let chartType = isPie ? "doughnut" : type

let chart = chartInstances[canvasId]


if(!chart){

chartInstances[canvasId] = new Chart(document.getElementById(canvasId),{
type: chartType,
data:{
labels: labels,
datasets: isPie
? [{
data: values,
backgroundColor: multiColors.slice(0, values.length)
}]
: [
{
label:"Actual Usage",
data:values,
backgroundColor:"rgba(59,130,246,0.4)",
borderColor:"#3b82f6",
borderWidth:2,
fill:true
},
{
label:"AI Prediction",
data:predicted,
borderColor:"#8b5cf6",
borderDash:[6,6],
borderWidth:2,
fill:false
}
]
},
options:{
responsive:true,
maintainAspectRatio:false,
cutout:"60%",
animation:false
}
})

return
}


chart.config.type = chartType
chart.data.labels = labels

if(isPie){

chart.data.datasets = [{
data: values,
backgroundColor: multiColors.slice(0, values.length)
}]

}else{

chart.data.datasets = [
{
label:"Actual Usage",
data:values,
backgroundColor:"rgba(59,130,246,0.4)",
borderColor:"#3b82f6",
borderWidth:2,
fill:true
},
{
label:"AI Prediction",
data:predicted,
borderColor:"#8b5cf6",
borderDash:[6,6],
borderWidth:2,
fill:false
}
]

}

chart.update("none")
}