import {
    auth,
    signOut,
    onAuthStateChanged
} from "./firebase.js";

const loginLink = document.getElementById("loginLink");
const registerLink = document.getElementById("registerLink");
const logoutLink = document.getElementById("logoutLink");

onAuthStateChanged(auth, (user) => {

    if (user) {

        loginLink.style.display = "none";
        registerLink.style.display = "none";
        logoutLink.style.display = "inline-block";

    } else {

        loginLink.style.display = "inline-block";
        registerLink.style.display = "inline-block";
        logoutLink.style.display = "none";

    }

});

logoutLink.addEventListener("click", async (e) => {

    e.preventDefault();

    await signOut(auth);

    location.href = "login.html";

});