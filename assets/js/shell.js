// ============================================================
// Shell partagé — sidebar + burger menu + déconnexion
// ============================================================

import { logout } from "./auth.js";
import { escapeHtml } from "./utils.js";

const ADMIN_NAV = [
  { label: "Tableau de bord", href: "/admin/dashboard.html" },
  { label: "Biens", href: "/admin/biens.html" },
  { label: "Copropriétaires", href: "/admin/copros.html" },
  { label: "Cotisations", href: "/admin/cotisations.html" },
  { label: "Dépenses", href: "/admin/depenses.html" },
  { label: "Transparence", href: "/admin/transparence.html" },
  { label: "Plaintes", href: "/admin/plaintes.html" },
  { label: "Propositions", href: "/admin/propositions.html" },
];

const COPRO_NAV = [
  { label: "Accueil", href: "/copro/accueil.html" },
  { label: "Mes biens & paiements", href: "/copro/mes-biens.html" },
  { label: "Transparence", href: "/copro/transparence.html" },
  { label: "Mes plaintes", href: "/copro/plaintes.html" },
  { label: "Propositions", href: "/copro/propositions.html" },
  { label: "Mon profil", href: "/copro/profil.html" },
];

/**
 * Monte le shell (sidebar + burger). À appeler après requireAuth().
 *
 * @param {"ADMIN"|"COPRO"} role
 * @param {object} profile  – le profil utilisateur (nom, prenom)
 * @param {string} mountId  – id du container où injecter le shell (défaut "app")
 */
export function mountShell(role, profile, mountId = "app") {
  const nav = role === "ADMIN" ? ADMIN_NAV : COPRO_NAV;
  const title = role === "ADMIN" ? "Espace Syndic" : "Espace copropriétaire";
  const roleLabel = role === "ADMIN" ? "Syndic" : "Copropriétaire";
  const current = window.location.pathname;

  const navLinksHtml = nav
    .map((item) => {
      const active = current === item.href || current.startsWith(item.href.replace(".html", ""));
      return `<a href="${item.href}" class="sidebar-link${active ? " active" : ""}">${escapeHtml(item.label)}</a>`;
    })
    .join("");

  const root = document.getElementById(mountId);
  if (!root) {
    console.error(`mountShell: container #${mountId} introuvable`);
    return;
  }

  // Récupère le contenu original (page-specific) avant de le réinjecter dans main
  const pageContent = root.innerHTML;

  root.innerHTML = `
    <div class="mobile-header">
      <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Menu">☰</button>
      <strong style="color: var(--color-primary);">Syndic Alcazar</strong>
      <button class="btn btn-ghost btn-sm" id="mobile-logout-btn">Quitter</button>
    </div>
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-brand">Syndic Alcazar</div>
          <div class="sidebar-subtitle">${escapeHtml(title)}</div>
        </div>
        <nav class="sidebar-nav">${navLinksHtml}</nav>
        <div class="sidebar-footer">
          <div class="flex items-center justify-between">
            <div>
              <div class="sidebar-user">${escapeHtml(profile.prenom)} ${escapeHtml(profile.nom)}</div>
              <div class="sidebar-role">${roleLabel}</div>
            </div>
            <button class="btn btn-ghost btn-sm" id="logout-btn">Déconnexion</button>
          </div>
        </div>
      </aside>
      <main class="main">
        <div class="main-container" id="page-content">${pageContent}</div>
      </main>
    </div>
  `;

  // Wiring
  const doLogout = async (e) => {
    e?.preventDefault();
    await logout();
    window.location.href = "/index.html";
  };
  document.getElementById("logout-btn")?.addEventListener("click", doLogout);
  document.getElementById("mobile-logout-btn")?.addEventListener("click", doLogout);
  document.getElementById("mobile-menu-btn")?.addEventListener("click", () => {
    document.getElementById("sidebar").classList.toggle("open");
  });
  // Fermer le menu mobile quand on clique sur un lien
  document.querySelectorAll(".sidebar-link").forEach((a) => {
    a.addEventListener("click", () => {
      document.getElementById("sidebar").classList.remove("open");
    });
  });
}
