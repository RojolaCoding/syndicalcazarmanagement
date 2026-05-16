// ============================================================
// Auth helpers — login, logout, garde-fous de routes
// ============================================================
// Approche : Firebase Auth Email/Password. Le "PIN" est le password.
// L'identifiant principal est l'email. Le téléphone est stocké comme
// métadonnée pour les notifications WhatsApp.

import { auth, db } from "./firebase-init.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updatePassword as fbUpdatePassword,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

export const Role = { ADMIN: "ADMIN", COPRO: "COPRO" };

/**
 * Connecte l'utilisateur.
 * @param {string} email
 * @param {string} pin  (= password Firebase)
 * @returns {Promise<{uid:string, role:string, profile:object}>}
 */
export async function login(email, pin) {
  const cred = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), pin);
  const uid = cred.user.uid;
  const profile = await getUserProfile(uid);
  if (!profile) {
    await signOut(auth);
    throw new Error("Profil introuvable. Contactez le syndic.");
  }
  // Mettre à jour lastLogin
  try {
    await updateDoc(doc(db, "users", uid), { lastLogin: serverTimestamp() });
  } catch {
    /* non bloquant */
  }
  return { uid, role: profile.role, profile };
}

export async function logout() {
  await signOut(auth);
}

/**
 * Récupère le profil Firestore d'un utilisateur.
 */
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/**
 * Crée le doc Firestore pour un nouvel utilisateur.
 * Appelé après createUserWithEmailAndPassword.
 */
export async function createUserProfile(uid, data) {
  await setDoc(doc(db, "users", uid), {
    ...data,
    createdAt: serverTimestamp(),
    lastLogin: null,
    pinResetRequired: data.pinResetRequired ?? false,
  });
}

/**
 * Promise qui se résout dès qu'on connaît l'état d'auth (connecté ou non).
 * Évite le "flicker" au chargement de page.
 */
export function getAuthReady() {
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}

/**
 * Garde-fou de page : redirige vers /index.html si pas connecté,
 * ou vers la page d'accueil de l'autre rôle si mauvais rôle.
 * Retourne { uid, profile } si OK.
 */
export async function requireAuth(requiredRole = null) {
  const user = await getAuthReady();
  if (!user) {
    window.location.href = "/index.html";
    return null;
  }
  const profile = await getUserProfile(user.uid);
  if (!profile) {
    await logout();
    window.location.href = "/index.html";
    return null;
  }
  if (requiredRole && profile.role !== requiredRole) {
    // Mauvais rôle → renvoyer vers son espace
    window.location.href =
      profile.role === Role.ADMIN ? "/admin/dashboard.html" : "/copro/accueil.html";
    return null;
  }
  // Forcer changement PIN si flag actif
  if (profile.pinResetRequired && !window.location.pathname.includes("changer-pin")) {
    window.location.href = "/copro/changer-pin.html";
    return null;
  }
  return { uid: user.uid, profile };
}

/**
 * Inscription d'un copropriétaire avec code d'invitation.
 * Vérifie le code en Firestore, crée le compte Auth, lie au doc user.
 */
export async function signupWithInvitation({ code, email, pin, prenom, nom }) {
  // Cherche l'invitation
  const invSnap = await getDoc(doc(db, "invitations", code));
  if (!invSnap.exists()) throw new Error("Code d'invitation introuvable.");
  const inv = invSnap.data();
  if (inv.used) throw new Error("Ce code d'invitation a déjà été utilisé.");

  // Crée le compte Firebase Auth
  const cred = await createUserWithEmailAndPassword(
    auth,
    email.trim().toLowerCase(),
    pin
  );
  const uid = cred.user.uid;

  // Crée le profil Firestore
  await createUserProfile(uid, {
    email: email.trim().toLowerCase(),
    telephone: inv.telephone || null,
    nom: nom || inv.nom || "",
    prenom: prenom || inv.prenom || "",
    role: Role.COPRO,
    invitationCode: code,
  });

  // Marque l'invitation comme utilisée
  await updateDoc(doc(db, "invitations", code), {
    used: true,
    usedAt: serverTimestamp(),
    userId: uid,
  });

  // Si l'invitation a une liste de biens à associer
  if (Array.isArray(inv.biens) && inv.biens.length > 0) {
    for (const b of inv.biens) {
      await setDoc(doc(db, "propertyOwnerships", `${b.bienId}_${uid}`), {
        bienId: b.bienId,
        userId: uid,
        quotePart: b.quotePart || 100,
        dateDebut: serverTimestamp(),
      });
    }
  }

  return { uid };
}

/**
 * Change le PIN de l'utilisateur connecté.
 */
export async function changePin(newPin) {
  if (!auth.currentUser) throw new Error("Non connecté");
  await fbUpdatePassword(auth.currentUser, newPin);
  await updateDoc(doc(db, "users", auth.currentUser.uid), {
    pinResetRequired: false,
  });
}
