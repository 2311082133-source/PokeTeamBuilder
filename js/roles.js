import {
    auth,
    database,
    ref,
    get,
    onAuthStateChanged
} from "./firebase.js";

export function verificarRol(callback) {

    onAuthStateChanged(auth, async (user) => {

        if (!user) {

            location.href = "login.html";
            return;

        }

        const snapshot = await get(
            ref(database, "usuarios/" + user.uid)
        );

        if (!snapshot.exists()) {

            location.href = "login.html";
            return;

        }

        callback(snapshot.val());

    });

}