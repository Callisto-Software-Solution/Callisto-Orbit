/**
 * Callisto-Orbit Unified Footer Component (footer.js)
 * Autonomous Fund & Treasury Command for Callisto Cyber Security & AI
 *
 * Provides a single reusable footer across Dashboard, Specialists, and Payments.
 * - Automatically renders the responsive 3-column footer into #orbitFooter container
 * - Displays Zero-DB Vault security credentials, telemetry, and squad pool info
 * - Provides quick navigation links (Home, Dashboard, Specialists, Payments, Portal, GitHub)
 * - Exposes window.updateOrbitFooterStats(stats) for live squad target sync
 */

(function () {
  'use strict';

  function renderFooter(container) {
    if (!container) return;
    const active = (container.getAttribute('data-active') || '').toLowerCase();

    // Quick navigation links based on active page
    let quickLinksHtml = '';
    if (active !== 'dashboard') {
      quickLinksHtml += `
        <a href="/dashboard.html" class="footer-nav-link text-decoration-none" style="font-size: 0.75rem; color: var(--callisto-cyan, #00d2ff);">
          <i class="bi bi-speedometer2 me-1"></i>Dashboard
        </a>
      `;
    }
    if (active !== 'specialists') {
      quickLinksHtml += `
        <a href="/specialists.html" class="footer-nav-link text-decoration-none" style="font-size: 0.75rem; color: var(--callisto-cyan, #00d2ff);">
          <i class="bi bi-people-fill me-1"></i>Specialists
        </a>
      `;
    }
    if (active !== 'payments') {
      quickLinksHtml += `
        <a href="/payments.html" class="footer-nav-link text-decoration-none" style="font-size: 0.75rem; color: #34d399;">
          <i class="bi bi-cash-coin me-1" style="color: #10b981;"></i>Payments
        </a>
      `;
    }

    container.className = 'dash-footer mt-5 py-4';
    container.innerHTML = `
      <div class="container-fluid px-3 px-md-4" style="max-width: 1560px;">
        <div class="row g-4 align-items-center justify-content-between">
          
          <!-- Left: Brand & Architecture -->
          <div class="col-12 col-md-5">
            <div class="d-flex align-items-center gap-2 mb-2">
              <a href="/dashboard.html" class="text-decoration-none d-flex align-items-center">
                <div style="width: 32px; height: 32px; border-radius: 50%; overflow: hidden; border: 1.5px solid rgba(255,85,0,0.6); background: #0c1222; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(255,85,0,0.35);">
                  <img src="/assets/images/callisto-logo.jpg" alt="Logo" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">
                </div>
              </a>
              <span style="font-family: var(--font-display, 'Rajdhani', sans-serif); font-weight: 700; font-size: 1.15rem; letter-spacing: 1px; color: #fff;">
                CALLISTO<span class="phoenix-gradient-text">-ORBIT</span>
              </span>
              <span class="badge" style="background: rgba(255, 85, 0, 0.15); color: #ff9d00; border: 1px solid rgba(255, 85, 0, 0.35); font-size: 0.65rem;">
                v2.6 &bull; Rising Phoenix
              </span>
            </div>
            <p class="mb-0" style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.5;">
              Autonomous Fund &amp; Treasury Command for <strong>Callisto Cyber Security &amp; AI</strong>. Zero-database architecture powered by atomic cryptographic JSON state.
            </p>
          </div>

          <!-- Middle: Live Vault Telemetry & Security Clearance -->
          <div class="col-12 col-sm-6 col-md-4">
            <div class="d-flex flex-column gap-1">
              <div class="d-flex align-items-center gap-2" style="font-size: 0.78rem; color: #cbd5e1;">
                <span class="status-indicator-dot" style="width: 7px; height: 7px; background: #00e676; box-shadow: 0 0 8px #00e676;"></span>
                <span><strong>Zero-DB Vault Ledger:</strong> Live Sync Active</span>
              </div>
              <div class="d-flex align-items-center gap-2" style="font-size: 0.78rem; color: #cbd5e1;">
                <i class="bi bi-shield-check text-warning"></i>
                <span><strong>Security:</strong> Scrypt 256-bit + HMAC-SHA256</span>
              </div>
              <div class="d-flex align-items-center gap-2" style="font-size: 0.78rem; color: #cbd5e1;">
                <i class="bi bi-wallet2 text-info"></i>
                <span id="footerPoolTarget"><strong>Squad Target:</strong> Rs. 100 / month per specialist</span>
              </div>
            </div>
          </div>

          <!-- Right: Copyright & Quick Links -->
          <div class="col-12 col-sm-6 col-md-3 text-sm-end">
            <div class="d-flex flex-column gap-1">
              <div style="font-size: 0.8rem; color: #ffffff; font-weight: 600;">
                &copy; 2026 Callisto Software Solution
              </div>
              <div style="font-size: 0.74rem; color: #94a3b8;">
                Crafted by <strong>Kehan Rajapaksha</strong> &bull; MIT License
              </div>
              <div class="d-flex align-items-center justify-content-sm-end flex-wrap gap-2 gap-sm-3 mt-1">
                ${quickLinksHtml}
                <a href="/" class="footer-nav-link text-decoration-none" style="font-size: 0.75rem; color: var(--callisto-amber, #ff9d00);">
                  <i class="bi bi-house-door-fill me-1"></i>Home
                </a>
                <a href="/login.html" class="footer-nav-link text-decoration-none" style="font-size: 0.75rem; color: #cbd5e1;">
                  <i class="bi bi-shield-lock me-1"></i>Portal
                </a>
                <a href="https://github.com/Callisto-Software-Solution/Callisto-Orbit" target="_blank" rel="noopener" class="footer-nav-link text-decoration-none" style="font-size: 0.75rem; color: #cbd5e1;">
                  <i class="bi bi-github me-1"></i>GitHub
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    `;

    loadFooterStats();
  }

  async function loadFooterStats() {
    try {
      const res = await fetch('/api/collections');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && data.stats) {
        window.updateOrbitFooterStats(data.stats);
      }
    } catch (e) {}
  }

  // Global helper for footer stats sync
  window.updateOrbitFooterStats = function (stats) {
    if (!stats) return;
    const footerPoolTarget = document.getElementById('footerPoolTarget');
    if (!footerPoolTarget) return;

    const count = stats.totalMembers;
    const currency = stats.currency || 'Rs. ';
    const unit = stats.perMember || 100;
    if (count !== undefined && count > 0) {
      footerPoolTarget.innerHTML = `<strong>Squad Target:</strong> ${count} Specialists &times; ${currency}${unit} / month`;
    } else {
      footerPoolTarget.innerHTML = `<strong>Squad Target:</strong> ${currency}${unit} / month per specialist`;
    }
  };

  // Synchronous initialization if container already in DOM, else on DOMContentLoaded
  function init() {
    const container = document.getElementById('orbitFooter');
    if (container && !container.dataset.rendered) {
      container.dataset.rendered = 'true';
      renderFooter(container);
    }
  }

  if (document.getElementById('orbitFooter')) {
    init();
  } else if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
