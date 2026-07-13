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

const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "poketeambuilder-1110f.firebaseapp.com",
    databaseURL: "https://poketeambuilder-1110f-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "poketeambuilder-1110f",
    storageBucket: "poketeambuilder-1110f.firebasestorage.app",
    messagingSenderId: "182286617718",
    appId: "1:182286617718:web:e1779008d25f730fa8a357"
};

const app =
    initializeApp(firebaseConfig);

const database =
    getDatabase(app);

export {
    database,
    ref,
    set,
    push,
    get,
    onValue,
    remove,
    update
};