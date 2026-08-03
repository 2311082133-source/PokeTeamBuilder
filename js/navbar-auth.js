import {
    auth,
    database,
    ref,
    get,
    signOut,
    onAuthStateChanged
} from "./firebase.js";

const login=document.getElementById("loginLink");
const registro=document.getElementById("registerLink");
const logout=document.getElementById("logoutLink");

const nav=document.getElementById("mainNavigation");

onAuthStateChanged(auth,async(user)=>{

if(!user){

if(login)login.style.display="";

if(registro)registro.style.display="";

if(logout)logout.style.display="none";

return;

}

if(login)login.style.display="none";

if(registro)registro.style.display="none";

if(logout)logout.style.display="";

const snapshot=

await get(

ref(database,"usuarios/"+user.uid)

);

if(snapshot.exists()){

const datos=snapshot.val();

if(datos.rol=="admin"){

const existe=

document.getElementById("adminLink");

if(!existe){

const a=document.createElement("a");

a.href="admin.html";

a.id="adminLink";

a.textContent="Administración";

nav.insertBefore(a,logout);

}

}

}

});

if(logout){

logout.addEventListener("click",async(e)=>{

e.preventDefault();

await signOut(auth);

location.href="login.html";

});

}