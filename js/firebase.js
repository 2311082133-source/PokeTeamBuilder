import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    push,
    get,
    onValue,
    remove,
    update
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AQUI_TU_API_KEY_REAL",
    authDomain: "poketeambuilder-1110f.firebaseapp.com",
    databaseURL: "https://poketeambuilder-1110f-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "poketeambuilder-1110f",
    storageBucket: "poketeambuilder-1110f.firebasestorage.app",
    messagingSenderId: "182286617718",
    appId: "1:182286617718:web:e1779008d25f730fa8a357"
};

const app = initializeApp(firebaseConfig);

const database = getDatabase(app);

const auth = getAuth(app);

export {
    app,

    database,

    auth,

    ref,
    set,
    push,
    get,
    onValue,
    remove,
    update,

    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
};