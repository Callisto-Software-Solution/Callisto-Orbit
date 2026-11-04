/**
 * Callisto-Orbit Dashboard Logic
 * Handles session verification, metrics loading, member contribution display & logout
 */

document.addEventListener('DOMContentLoaded', async () => {
  const userNameElem = document.getElementById('userName');
  const userRoleElem = document.getElementById('userRole');
  const userAvatarElem = document.getElementById('userAvatar');
  const logoutBtn = document.getElementById('logoutBtn');

  const statTotalCollected = document.getElementById('statTotalCollected');
  const statMonthlyTarget = document.getElementById('statMonthlyTarget');
  const statProgressPercentage = document.getElementById('statProgressPercentage');
  const statProgressBar = document.getElementById('statProgressBar');
  const membersGrid = document.getElementById('membersGrid');
  const historyList = document.getElementById('historyList');

  // Verify authentication
  let currentUser = null;
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) {
      window.location.replace('/');
      return;
    }
    const data = await res.json();
    if (data.success && data.user) {
      currentUser = data.user;
      renderUserData(currentUser);
    } else {
      window.location.replace('/');
      return;
    }
  } catch (err) {
    console.error('Session check failed:', err);
    window.location.replace('/');
    return;
  }

  function renderUserData(user) {
    if (userNameElem) userNameElem.textContent = user.name;
    if (userRoleElem) userRoleElem.textContent = user.role === 'admin' ? 'Lead & Admin' : (user.title || 'Team Member');
    if (userAvatarElem && user.avatar) userAvatarElem.src = user.avatar;
  }

  // Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        sessionStorage.removeItem('callisto_active_user');
        window.location.href = '/';
      } catch (e) {
        window.location.href = '/';
      }
    });
  }

  // Fetch Collections Data
  async function loadDashboardData() {
    try {
      const [colRes, memRes] = await Promise.all([
        fetch('/api/collections'),
        fetch('/api/members')
      ]);

      const colData = await colRes.json();
      const memData = await memRes.json();

      if (colData.success) {
        const stats = colData.stats;
        const currency = stats.currency || '$';
        if (statTotalCollected) statTotalCollected.textContent = `${currency}${stats.totalCollected.toLocaleString()}`;
        if (statMonthlyTarget) statMonthlyTarget.textContent = `${currency}${stats.monthlyTarget.toLocaleString()}`;

        // Latest month calculation
        const collections = colData.collections || [];
        const activeMonth = collections[collections.length - 1];

        if (activeMonth) {
          const collected = activeMonth.collected || 0;
          const target = activeMonth.target || 600;
          const pct = Math.min(100, Math.round((collected / target) * 100));
          if (statProgressPercentage) statProgressPercentage.textContent = `${pct}%`;
          if (statProgressBar) statProgressBar.style.width = `${pct}%`;

          // Render active month member contributions
          renderActiveMembers(activeMonth.contributions, memData.members || []);
        }

        // Render collection history
        renderHistory(collections, currency);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }

  function renderActiveMembers(contributions = [], members = []) {
    if (!membersGrid) return;

    // Map contributions by userId
    const contribMap = {};
    contributions.forEach(c => { contribMap[c.userId] = c; });

    membersGrid.innerHTML = members.map(m => {
      const contrib = contribMap[m.id] || { status: 'pending', amount: 0 };
      const isPaid = contrib.status === 'paid';

      return `
        <div class="col-12 col-md-6">
          <div class="member-card d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-3">
              <img src="${m.avatar}" alt="${m.name}" style="width: 44px; height: 44px; border-radius: 12px; background: #131c31; border: 1px solid rgba(255,255,255,0.1);">
              <div>
                <div class="d-flex align-items-center gap-2">
                  <span style="font-weight: 600; color: #fff; font-size: 0.92rem;">${m.name}</span>
                  ${m.role === 'admin' ? '<span class="badge" style="background: rgba(255,85,0,0.18); color: #ff8c00; font-size: 0.65rem;">Admin</span>' : ''}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${m.title || 'Squad Member'}</div>
                <div style="font-size: 0.72rem; color: var(--text-dim); margin-top: 2px;">
                  ${isPaid ? `<i class="bi bi-calendar-check text-success me-1"></i> Paid on ${contrib.paidDate}` : '<i class="bi bi-clock-history text-warning me-1"></i> Awaiting 100 unit transfer'}
                </div>
              </div>
            </div>

            <div class="text-end">
              <div>
                <span class="${isPaid ? 'member-badge-paid' : 'member-badge-pending'}">
                  ${isPaid ? '<i class="bi bi-check-circle-fill me-1"></i> PAID $100' : '<i class="bi bi-hourglass-split me-1"></i> PENDING $100'}
                </span>
              </div>
              <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 4px;">
                ${isPaid && contrib.method ? `${contrib.method} • ${contrib.txRef || 'Ref Verified'}` : 'Target: $100/mo'}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderHistory(collections, currency) {
    if (!historyList) return;
    historyList.innerHTML = collections.slice().reverse().map(c => `
      <div class="p-2 px-3 glass-panel d-flex justify-content-between align-items-center" style="border-radius: 10px; font-size: 0.82rem;">
        <div>
          <strong class="text-white">${c.month}</strong>
          <span class="text-dim ms-2">${c.status === 'completed' ? 'Fully Completed' : 'In Progress'}</span>
        </div>
        <div>
          <span style="font-weight: 700; color: ${c.collected >= c.target ? '#00e676' : '#ff9d00'};">
            ${currency}${c.collected}
          </span>
          <span class="text-dim">/ ${currency}${c.target}</span>
        </div>
      </div>
    `).join('');
  }

  loadDashboardData();
});
