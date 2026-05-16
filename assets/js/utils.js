// ============================================================
// Utilitaires partagés — formatage, validation
// ============================================================

/**
 * Normalise un téléphone marocain en E.164 (+212XXXXXXXXX).
 * Accepte : "0663402019", "+212663402019", "212663402019", "06 63 40 20 19".
 * Retourne null si invalide.
 */
export function normalizePhoneMA(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/[\s\-().]/g, "");
  if (/^\+212[5-7]\d{8}$/.test(digits)) return digits;
  if (/^212[5-7]\d{8}$/.test(digits)) return "+" + digits;
  if (/^0[5-7]\d{8}$/.test(digits)) return "+212" + digits.slice(1);
  return null;
}

/**
 * Validation email simple.
 */
export function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Format montant en DH : 1 234,56 DH
 */
export function formatMAD(montant) {
  const n = Number(montant) || 0;
  return (
    n
      .toLocaleString("fr-FR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
      .replace(/ /g, " ") + " DH"
  );
}

/**
 * Format date jj/mm/aaaa
 */
export function formatDateFR(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format date+heure jj/mm/aaaa HH:MM
 */
export function formatDateTimeFR(date) {
  if (!date) return "";
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  return (
    d.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) +
    " " +
    d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
  );
}

/**
 * Génère un code d'invitation à 6 chiffres.
 */
export function generateInvitationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Génère un PIN temporaire de 8 caractères (sans 0/O/1/I).
 */
export function generateTempPin() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pin = "";
  for (let i = 0; i < 8; i++) pin += chars[Math.floor(Math.random() * chars.length)];
  return pin;
}

/**
 * Construit un lien wa.me avec message pré-rempli.
 * @param {string} phoneE164  – tel au format +212XXXXXXXXX
 * @param {string} message    – texte (sera URL-encodé)
 */
export function waLink(phoneE164, message) {
  if (!phoneE164) return "#";
  const cleanPhone = phoneE164.replace(/[^\d]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Affiche un toast simple (création d'un div temporaire).
 * @param {string} message
 * @param {"success"|"error"|"info"} variant
 */
export function toast(message, variant = "info") {
  const colors = {
    success: { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
    error: { bg: "#fee2e2", border: "#ef4444", text: "#991b1b" },
    info: { bg: "#dbeafe", border: "#3b82f6", text: "#1e3a8a" },
  };
  const c = colors[variant] || colors.info;
  const el = document.createElement("div");
  el.textContent = message;
  el.style.cssText = `
    position: fixed; top: 1rem; left: 50%; transform: translateX(-50%);
    background: ${c.bg}; border: 1px solid ${c.border}; color: ${c.text};
    padding: 0.75rem 1.25rem; border-radius: 0.5rem; font-size: 0.875rem;
    z-index: 9999; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    max-width: 90vw; text-align: center;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

/**
 * Échappe une chaîne pour insertion HTML.
 */
export function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
