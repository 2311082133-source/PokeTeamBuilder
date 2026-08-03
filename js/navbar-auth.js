import {
    auth,
    database,
    ref,
    get,
    signOut,
    onAuthStateChanged
} from "./firebase.js";

const loginLink = document.getElementById("loginLink");
const registerLink = document.getElementById("registerLink");
const logoutLink = document.getElementById("logoutLink");
const navigation = document.getElementById("mainNavigation");

onAuthStateChanged(auth, async (user) => {

    // Elimina un enlace anterior si existe
    const oldAdmin = document.getElementById("adminLink");
    if (oldAdmin) {
        oldAdmin.remove();
    }

    if (!user) {

        if (loginLink) loginLink.style.display = "";
        if (registerLink) registerLink.style.display = "";
        if (logoutLink) logoutLink.style.display = "none";

        return;
    }

    if (loginLink) loginLink.style.display = "none";
    if (registerLink) registerLink.style.display = "none";
    if (logoutLink) logoutLink.style.display = "";

    const snapshot = await get(
        ref(database, "usuarios/" + user.uid)
    );

    if (!snapshot.exists()) {
        return;
    }

    const datos = snapshot.val();

    // Mostrar Panel de Administración solo al admin
    if (datos.rol === "admin" && navigation) {

        const adminLink = document.createElement("a");

        adminLink.href = "admin.html";
        adminLink.id = "adminLink";
        adminLink.textContent = "Administración";

        navigation.insertBefore(
            adminLink,
            logoutLink
        );
    }

});

if (logoutLink) {

    logoutLink.addEventListener("click", async (e) => {

        e.preventDefault();

        await signOut(auth);

        window.location.href = "login.html";

    });

}