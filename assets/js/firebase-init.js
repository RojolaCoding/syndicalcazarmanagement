// ============================================================
// Firebase init — Syndic Alcazar
// ============================================================
// Centralise l'initialisation Firebase. Tous les autres scripts
// importent depuis ici.

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBjI3bno_fWc0Lkh8F3iQa_zMQFXqT8y00",
  authDomain: "syndicalcazar2.firebaseapp.com",
  projectId: "syndicalcazar2",
  storageBucket: "syndicalcazar2.firebasestorage.app",
  messagingSenderId: "454702898444",
  appId: "1:454702898444:web:a4cded50f43a9e9553bd29",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
