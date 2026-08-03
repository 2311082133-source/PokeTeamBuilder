import{

auth,

signInWithEmailAndPassword

}from"./firebase.js";

const form=document.getElementById("loginForm");

const message=document.getElementById("message");

form.addEventListener("submit",async(e)=>{

e.preventDefault();

const email=document.getElementById("email").value;

const password=document.getElementById("password").value;

try{

await signInWithEmailAndPassword(

auth,

email,

password

);

message.style.color="green";

message.textContent="Inicio de sesión correcto";

setTimeout(()=>{

location.href="index.html";

},1000);

}catch(error){

message.style.color="red";

message.textContent=error.message;

}

});