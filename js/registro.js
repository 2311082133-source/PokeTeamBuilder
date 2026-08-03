import {

auth,

database,

createUserWithEmailAndPassword,

ref,

set

} from "./firebase.js";

const form=document.getElementById("registerForm");

const message=document.getElementById("message");

form.addEventListener("submit",async(e)=>{

e.preventDefault();

const nombre=document.getElementById("name").value;

const correo=document.getElementById("email").value;

const password=document.getElementById("password").value;

try{

const userCredential=

await createUserWithEmailAndPassword(

auth,

correo,

password

);

const uid=userCredential.user.uid;

await set(

ref(database,"usuarios/"+uid),

{

nombre,

correo,

rol:"usuario"

}

);

message.style.color="green";

message.textContent="Cuenta creada correctamente";

setTimeout(()=>{

location.href="login.html";

},1500);

}catch(error){

message.style.color="red";

message.textContent=error.message;

}

});