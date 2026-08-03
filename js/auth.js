import {

auth,

database,

ref,

get,

onAuthStateChanged,

signOut

} from "./firebase.js";

export function verificarSesion(callback){

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="login.html";

return;

}

const snapshot=

await get(

ref(database,"usuarios/"+user.uid)

);

if(snapshot.exists()){

callback({

uid:user.uid,

...snapshot.val()

});

}

});

}

export async function cerrarSesion(){

await signOut(auth);

location.href="login.html";

}