function login(){

let id=document.getElementById("userid").value.toLowerCase()
let password=document.getElementById("password").value
let role=document.getElementById("role").value

if(users[id] && users[id].password===password){

localStorage.setItem("currentUser",id)

if(role==="resident")
window.location="pages/resident.html"

if(role==="manager")
window.location="pages/manager.html"

if(role==="admin")
window.location="pages/admin.html"

}
else{
alert("Invalid Login")
}

}