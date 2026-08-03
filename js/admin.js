import {
    auth,
    database,
    ref,
    get,
    update,
    remove,
    onAuthStateChanged,
    signOut
} from "./firebase.js";

const usuariosTotal = document.getElementById("usuariosTotal");
const favoritosTotal = document.getElementById("favoritosTotal");
const equiposTotal = document.getElementById("equiposTotal");

const usersTable = document.getElementById("usersTable");
const searchUser = document.getElementById("searchUser");
const logoutLink = document.getElementById("logoutLink");

let usuarios = [];

if (logoutLink) {
    logoutLink.addEventListener("click", async (e) => {
        e.preventDefault();
        await signOut(auth);
        window.location.href = "login.html";
    });
}

onAuthStateChanged(auth, async (user) => {

    if (!user) {
        location.href = "login.html";
        return;
    }

    const usuarioActual = await get(
        ref(database, "usuarios/" + user.uid)
    );

    if (!usuarioActual.exists()) {
        location.href = "login.html";
        return;
    }

    if (usuarioActual.val().rol !== "admin") {
        location.href = "index.html";
        return;
    }

    cargarDashboard();

});

async function cargarDashboard() {

    const usuariosSnap = await get(ref(database, "usuarios"));
    const favoritosSnap = await get(ref(database, "favoritos"));
    const equiposSnap = await get(ref(database, "equipos"));

    usuariosTotal.textContent = usuariosSnap.exists()
        ? Object.keys(usuariosSnap.val()).length
        : 0;

    favoritosTotal.textContent = favoritosSnap.exists()
        ? Object.keys(favoritosSnap.val()).length
        : 0;

    equiposTotal.textContent = equiposSnap.exists()
        ? Object.keys(equiposSnap.val()).length
        : 0;

    usuarios = [];

    if (usuariosSnap.exists()) {

        Object.entries(usuariosSnap.val()).forEach(([uid, datos]) => {

            usuarios.push({
                uid,
                ...datos
            });

        });

    }

    renderUsuarios();

}

function renderUsuarios() {

    const texto = searchUser.value.toLowerCase();

    const lista = usuarios.filter(usuario =>

        usuario.nombre.toLowerCase().includes(texto)

        ||

        usuario.correo.toLowerCase().includes(texto)

    );

    usersTable.innerHTML = lista.map(usuario => `

<tr>

<td>${usuario.nombre}</td>

<td>${usuario.correo}</td>

<td>

<span class="${
usuario.rol==="admin"
?"badge-admin"
:"badge-user"
}">

${usuario.rol}

</span>

</td>

<td>

<button
class="btn btn-edit"
data-id="${usuario.uid}"
data-rol="${usuario.rol}">

Cambiar Rol

</button>

<button
class="btn btn-delete"
data-id="${usuario.uid}">

Eliminar

</button>

</td>

</tr>

`).join("");

    eventosTabla();

}
function eventosTabla() {

    document
        .querySelectorAll(".btn-edit")
        .forEach(boton => {

            boton.addEventListener("click", async () => {

                const uid = boton.dataset.id;
                const rolActual = boton.dataset.rol;

                const nuevoRol =
                    rolActual === "admin"
                        ? "usuario"
                        : "admin";

                try {

                    await update(
                        ref(database, "usuarios/" + uid),
                        {
                            rol: nuevoRol
                        }
                    );

                    cargarDashboard();

                } catch (error) {

                    console.error(error);

                    alert(
                        "No fue posible cambiar el rol."
                    );

                }

            });

        });

    document
        .querySelectorAll(".btn-delete")
        .forEach(boton => {

            boton.addEventListener("click", async () => {

                const uid = boton.dataset.id;

                const confirmar =
                    confirm(
                        "¿Seguro que deseas eliminar este usuario?"
                    );

                if (!confirmar) {

                    return;

                }

                try {

                    await remove(
                        ref(database, "usuarios/" + uid)
                    );

                    cargarDashboard();

                } catch (error) {

                    console.error(error);

                    alert(
                        "No fue posible eliminar el usuario."
                    );

                }

            });

        });

}

searchUser.addEventListener(
    "input",
    renderUsuarios
);