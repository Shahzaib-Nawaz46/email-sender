// ============================================================
// Reputation Email Dispatcher - Mobile First Human UX Logic
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // Navigation & Drawer Elements
  const openSettingsBtn = document.getElementById('open-settings-btn');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const settingsDrawer = document.getElementById('settings-drawer');
  const drawerOverlay = document.getElementById('drawer-overlay');
  const bannerOpenSettings = document.getElementById('banner-open-settings');
  const smtpWarningBanner = document.getElementById('smtp-warning-banner');

  const tabButtons = document.querySelectorAll('.tab-item, .tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const previewSwitchBtn = document.getElementById('preview-switch-btn');
  const previewTabCount = document.getElementById('preview-tab-count');

  // Header Status
  const headerSmtpDot = document.getElementById('header-smtp-dot');
  const headerSmtpText = document.getElementById('header-smtp-text');

  // Drawer Form Elements
  const smtpEmailInput = document.getElementById('smtp-email');
  const smtpPassInput = document.getElementById('smtp-pass');
  const smtpSenderNameInput = document.getElementById('smtp-sender-name');
  const togglePassBtn = document.getElementById('toggle-pass-visibility');
  const saveSmtpBtn = document.getElementById('save-smtp-btn');
  const testSmtpBtn = document.getElementById('test-smtp-btn');
  const testSpinner = document.getElementById('test-spinner');
  const testIcon = document.getElementById('test-icon');
  const testBtnText = document.getElementById('test-btn-text');
  const clearSmtpBtn = document.getElementById('clear-smtp-btn');

  // Composer Form Elements
  const emailForm = document.getElementById('email-form');
  const recipientEmailInput = document.getElementById('recipient-email');
  const teamNameInput = document.getElementById('team-name');
  const emailSubjectInput = document.getElementById('email-subject');
  const signoffNameInput = document.getElementById('signoff-name');
  const greetingPillText = document.getElementById('greeting-pill-text');
  const linksChip = document.getElementById('links-chip');
  const reviewLinksWrapper = document.getElementById('review-links-wrapper');
  const addLinkBtn = document.getElementById('add-link-btn');
  const sendBtn = document.getElementById('send-btn');
  const sendSpinner = document.getElementById('send-spinner');
  const sendIcon = document.getElementById('send-icon');
  const sendBtnText = document.getElementById('send-btn-text');

  // Preview Elements
  const previewSubjectText = document.getElementById('preview-subject-text');
  const previewSenderName = document.getElementById('preview-sender-name');
  const previewToName = document.getElementById('preview-to-name');
  const previewGreeting = document.getElementById('preview-greeting');
  const previewLinksList = document.getElementById('preview-links-list');
  const previewSignoffName = document.getElementById('preview-signoff-name');

  // History Log
  const historyContainer = document.getElementById('history-container');
  const clearHistoryBtn = document.getElementById('clear-history-btn');

  // State
  let reviewLinks = [''];
  const STORAGE = {
    USER: 'reputation_sender_smtp_user',
    PASS: 'reputation_sender_smtp_pass',
    NAME: 'reputation_sender_smtp_name',
    SUBJECT: 'reputation_sender_subject',
    SIGNOFF: 'reputation_sender_signoff',
    HISTORY: 'reputation_sender_history'
  };

  // ============================================================
  // Toast Notifications
  // ============================================================
  function showToast(message, type = 'info', duration = 3800) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;

    let icon = '';
    if (type === 'success') {
      icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
    } else {
      icon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <div style="flex-shrink:0;">${icon}</div>
      <div style="flex:1; line-height:1.4;">${escapeHtml(message)}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-12px)';
      toast.style.transition = 'all 0.25s ease';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ============================================================
  // Side Drawer Management (Gmail SMTP)
  // ============================================================
  function openDrawer() {
    drawerOverlay.classList.remove('hidden');
    settingsDrawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawerOverlay.classList.add('hidden');
    settingsDrawer.classList.add('hidden');
    document.body.style.overflow = '';
  }

  openSettingsBtn.addEventListener('click', openDrawer);
  closeDrawerBtn.addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);
  if (bannerOpenSettings) {
    bannerOpenSettings.addEventListener('click', openDrawer);
  }

  // Escape key to close drawer
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !settingsDrawer.classList.contains('hidden')) {
      closeDrawer();
    }
  });

  // Password visibility toggle
  togglePassBtn.addEventListener('click', () => {
    if (smtpPassInput.type === 'password') {
      smtpPassInput.type = 'text';
      togglePassBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `;
    } else {
      smtpPassInput.type = 'password';
      togglePassBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `;
    }
  });

  // ============================================================
  // LocalStorage Persistence
  // ============================================================
  function loadSmtp() {
    const user = localStorage.getItem(STORAGE.USER) || '';
    const pass = localStorage.getItem(STORAGE.PASS) || '';
    const name = localStorage.getItem(STORAGE.NAME) || 'Reputation Support Team';
    const savedSubject = localStorage.getItem(STORAGE.SUBJECT);
    const savedSignoff = localStorage.getItem(STORAGE.SIGNOFF);

    if (user) smtpEmailInput.value = user;
    if (pass) smtpPassInput.value = pass;
    if (name) {
      smtpSenderNameInput.value = name;
    }

    // Load saved subject if exists
    if (savedSubject !== null && savedSubject !== undefined) {
      emailSubjectInput.value = savedSubject;
    } else {
      emailSubjectInput.value = 'Removal of negative reviews on your Google profile';
    }

    // Load saved signature name if exists
    if (savedSignoff !== null && savedSignoff !== undefined) {
      signoffNameInput.value = savedSignoff;
    } else if (name) {
      signoffNameInput.value = name;
    } else {
      signoffNameInput.value = 'Reputation Support Team';
    }

    refreshSmtpStatus();
    updateLivePreview();
  }

  function saveSmtp(showNotification = true) {
    const user = smtpEmailInput.value.trim();
    const pass = smtpPassInput.value.trim();
    const name = signoffNameInput.value.trim() || (smtpSenderNameInput ? smtpSenderNameInput.value.trim() : '') || 'Reputation Support Team';

    if (!user || !pass) {
      showToast('Please provide both Gmail and App Password.', 'error');
      return false;
    }

    localStorage.setItem(STORAGE.USER, user);
    localStorage.setItem(STORAGE.PASS, pass);
    localStorage.setItem(STORAGE.NAME, name);
    localStorage.setItem(STORAGE.SIGNOFF, name);
    localStorage.setItem(STORAGE.SUBJECT, emailSubjectInput.value.trim());

    if (smtpSenderNameInput) smtpSenderNameInput.value = name;

    refreshSmtpStatus();
    updateLivePreview();

    if (showNotification) {
      showToast('Gmail credentials & settings saved to LocalStorage!', 'success');
      closeDrawer();
    }
    return true;
  }

  function clearSmtp() {
    if (confirm('Clear saved Gmail settings, subject, and signature from this browser?')) {
      localStorage.removeItem(STORAGE.USER);
      localStorage.removeItem(STORAGE.PASS);
      localStorage.removeItem(STORAGE.NAME);
      localStorage.removeItem(STORAGE.SUBJECT);
      localStorage.removeItem(STORAGE.SIGNOFF);
      smtpEmailInput.value = '';
      smtpPassInput.value = '';
      smtpSenderNameInput.value = 'Reputation Support Team';
      signoffNameInput.value = 'Reputation Support Team';
      emailSubjectInput.value = 'Removal of negative reviews on your Google profile';
      refreshSmtpStatus();
      updateLivePreview();
      showToast('Saved settings cleared.', 'info');
    }
  }

  function refreshSmtpStatus() {
    const user = localStorage.getItem(STORAGE.USER);
    const pass = localStorage.getItem(STORAGE.PASS);

    if (user && pass) {
      headerSmtpDot.className = 'status-dot status-dot--ready';
      headerSmtpText.textContent = `Configured (${user})`;
      if (smtpWarningBanner) smtpWarningBanner.classList.add('hidden');
    } else {
      headerSmtpDot.className = 'status-dot status-dot--warn';
      headerSmtpText.textContent = 'SMTP Not Configured';
      if (smtpWarningBanner) smtpWarningBanner.classList.remove('hidden');
    }
  }

  saveSmtpBtn.addEventListener('click', () => saveSmtp(true));
  clearSmtpBtn.addEventListener('click', clearSmtp);

  // Test Connection
  testSmtpBtn.addEventListener('click', async () => {
    const user = smtpEmailInput.value.trim();
    const pass = smtpPassInput.value.trim();

    if (!user || !pass) {
      showToast('Enter Gmail and App Password to test.', 'error');
      return;
    }

    testSmtpBtn.disabled = true;
    testSpinner.classList.remove('hidden');
    testIcon.classList.add('hidden');
    testBtnText.textContent = 'Verifying with Gmail...';

    try {
      const response = await fetch('/api/verify-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass })
      });
      const data = await response.json();

      if (response.ok && data.success) {
        showToast('Gmail SMTP verified successfully!', 'success');
        saveSmtp(false);
      } else {
        showToast(data.message || 'Verification failed. Check credentials.', 'error', 6000);
      }
    } catch (err) {
      showToast('Could not reach server to test connection.', 'error');
    } finally {
      testSmtpBtn.disabled = false;
      testSpinner.classList.add('hidden');
      testIcon.classList.remove('hidden');
      testBtnText.textContent = 'Test SMTP Connection';
    }
  });

  // ============================================================
  // Mobile Tab Navigation
  // ============================================================
  function switchTab(targetTab) {
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === targetTab);
    });

    tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `section-${targetTab}`);
    });

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      switchTab(btn.dataset.tab);
    });
  });

  if (previewSwitchBtn) {
    previewSwitchBtn.addEventListener('click', () => {
      switchTab('preview');
    });
  }

  // ============================================================
  // Dynamic Review Links
  // ============================================================
  function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  function renderReviewLinks() {
    reviewLinksWrapper.innerHTML = '';

    reviewLinks.forEach((linkValue, index) => {
      const card = document.createElement('div');
      card.className = 'link-row-card';

      const ordinal = getOrdinal(index + 1);

      card.innerHTML = `
        <div class="link-tag-index">${ordinal}</div>
        <input 
          type="url" 
          class="native-input review-link-input" 
          data-index="${index}" 
          placeholder="https://www.google.com/maps/reviews/..." 
          value="${escapeHtml(linkValue)}"
        >
        <button 
          type="button" 
          class="del-link-btn" 
          data-index="${index}" 
          title="Remove link"
          ${reviewLinks.length <= 1 ? 'disabled style="opacity: 0.2; cursor: not-allowed;"' : ''}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      `;

      reviewLinksWrapper.appendChild(card);
    });

    const count = reviewLinks.length;
    const text = count === 1 ? '1 link' : `${count} links`;
    linksChip.textContent = text;
    if (previewTabCount) previewTabCount.textContent = text;

    // Listeners
    const inputs = reviewLinksWrapper.querySelectorAll('.review-link-input');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        reviewLinks[idx] = e.target.value;
        updateLivePreview();
      });
    });

    const delBtns = reviewLinksWrapper.querySelectorAll('.del-link-btn');
    delBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index, 10);
        if (reviewLinks.length > 1) {
          reviewLinks.splice(idx, 1);
          renderReviewLinks();
          updateLivePreview();
        }
      });
    });
  }

  addLinkBtn.addEventListener('click', () => {
    reviewLinks.push('');
    renderReviewLinks();
    updateLivePreview();
    const inputs = reviewLinksWrapper.querySelectorAll('.review-link-input');
    if (inputs.length > 0) {
      inputs[inputs.length - 1].focus();
    }
  });

  // ============================================================
  // Live Email Preview (Faithful Screenshot Replica)
  // ============================================================
  function updateLivePreview() {
    // Subject
    const subject = emailSubjectInput.value.trim() || 'Removal of negative reviews on your Google profile';
    previewSubjectText.textContent = subject;

    // Sender Name
    const sender = (signoffNameInput.value.trim() || smtpSenderNameInput.value.trim() || 'Reputation Support Team');
    previewSenderName.textContent = sender;
    previewSignoffName.textContent = sender;

    // Recipient 'to'
    const recipient = recipientEmailInput.value.trim();
    if (recipient) {
      const username = recipient.split('@')[0];
      previewToName.textContent = username || 'recipient';
    } else {
      previewToName.textContent = 'info';
    }

    // Team Name Greeting logic:
    // If entered: Hello <strong>Holmes Mill Team</strong>,
    // If empty: Hello,
    const teamName = teamNameInput.value.trim();
    if (teamName) {
      previewGreeting.innerHTML = `Hello <strong id="preview-team-name">${escapeHtml(teamName)}</strong>,`;
      greetingPillText.innerHTML = `Greeting will be: <strong>Hello ${escapeHtml(teamName)},</strong>`;
    } else {
      previewGreeting.innerHTML = `Hello,`;
      greetingPillText.innerHTML = `Greeting will be: <strong>Hello,</strong>`;
    }

    // Review Links list
    const activeLinks = reviewLinks
      .map(l => l.trim())
      .filter(l => l.length > 0);

    previewLinksList.innerHTML = '';
    if (activeLinks.length > 0) {
      activeLinks.forEach(link => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link)}</a>`;
        previewLinksList.appendChild(li);
      });
    } else {
      // Authentic placeholder matching screenshot
      const li = document.createElement('li');
      li.innerHTML = `<a href="https://www.google.com/maps/reviews/..." target="_blank" rel="noopener noreferrer">https://www.google.com/maps/reviews/...</a>`;
      previewLinksList.appendChild(li);
    }
  }

  teamNameInput.addEventListener('input', updateLivePreview);
  recipientEmailInput.addEventListener('input', updateLivePreview);

  // Auto-save subject to localStorage
  emailSubjectInput.addEventListener('input', () => {
    localStorage.setItem(STORAGE.SUBJECT, emailSubjectInput.value);
    updateLivePreview();
  });

  // Auto-save signature to localStorage
  signoffNameInput.addEventListener('input', () => {
    const val = signoffNameInput.value;
    localStorage.setItem(STORAGE.SIGNOFF, val);
    localStorage.setItem(STORAGE.NAME, val);
    if (smtpSenderNameInput) smtpSenderNameInput.value = val;
    updateLivePreview();
  });

  if (smtpSenderNameInput) {
    smtpSenderNameInput.addEventListener('input', updateLivePreview);
  }

  // ============================================================
  // Sending Outreach Email
  // ============================================================
  emailForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const smtpUser = localStorage.getItem(STORAGE.USER) || smtpEmailInput.value.trim();
    const smtpPass = localStorage.getItem(STORAGE.PASS) || smtpPassInput.value.trim();
    const senderName = smtpSenderNameInput.value.trim() || 'Reputation Support Team';

    if (!smtpUser || !smtpPass) {
      showToast('Please open Settings & save your Gmail SMTP password first.', 'error');
      openDrawer();
      return;
    }

    const toEmail = recipientEmailInput.value.trim();
    if (!toEmail) {
      showToast('Please enter the recipient email address.', 'error');
      recipientEmailInput.focus();
      return;
    }

    const validLinks = reviewLinks
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (validLinks.length === 0) {
      showToast('Please enter at least one review link.', 'error');
      const firstInput = reviewLinksWrapper.querySelector('.review-link-input');
      if (firstInput) firstInput.focus();
      return;
    }

    const payload = {
      smtp: {
        user: smtpUser,
        pass: smtpPass,
        senderName: senderName
      },
      emailData: {
        to: toEmail,
        teamName: teamNameInput.value.trim(),
        subject: emailSubjectInput.value.trim() || 'Removal of negative reviews on your Google profile',
        reviewLinks: validLinks,
        signOffName: signoffNameInput.value.trim() || senderName
      }
    };

    // UI Feedback
    sendBtn.disabled = true;
    sendSpinner.classList.remove('hidden');
    sendIcon.classList.add('hidden');
    sendBtnText.textContent = 'Sending Outreach...';

    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (response.ok && result.success) {
        showToast(`Email successfully sent to ${toEmail}!`, 'success', 5000);
        
        // Add to temporary session history
        addHistory({
          to: toEmail,
          teamName: payload.emailData.teamName || '(None - Hello)',
          linksCount: validLinks.length,
          status: 'success',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });

      } else {
        showToast(result.message || 'Failed to dispatch email. Check Gmail App Password.', 'error', 7000);
        
        // Log failure in session history so user knows
        addHistory({
          to: toEmail,
          teamName: payload.emailData.teamName || '(None - Hello)',
          linksCount: validLinks.length,
          status: 'failed',
          error: result.message || 'Dispatch failed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      }
    } catch (err) {
      showToast('Network error while dispatching email.', 'error');
      addHistory({
        to: toEmail,
        teamName: payload.emailData.teamName || '(None - Hello)',
        linksCount: validLinks.length,
        status: 'failed',
        error: 'Network connection error',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    } finally {
      sendBtn.disabled = false;
      sendSpinner.classList.add('hidden');
      sendIcon.classList.remove('hidden');
      sendBtnText.textContent = 'Send Email Now';
    }
  });

  // ============================================================
  // Session Storage Logs (Temporary session tracking)
  // ============================================================
  const SESSION_LOGS_KEY = 'reputation_session_logs';

  function loadHistory() {
    try {
      const raw = sessionStorage.getItem(SESSION_LOGS_KEY);
      const history = raw ? JSON.parse(raw) : [];
      renderHistory(history);
    } catch (e) {
      renderHistory([]);
    }
  }

  function addHistory(item) {
    try {
      const raw = sessionStorage.getItem(SESSION_LOGS_KEY);
      const history = raw ? JSON.parse(raw) : [];
      history.unshift(item);
      if (history.length > 50) history.pop();
      sessionStorage.setItem(SESSION_LOGS_KEY, JSON.stringify(history));
      renderHistory(history);
    } catch (e) {
      console.error(e);
    }
  }

  function renderHistory(history) {
    if (!history || history.length === 0) {
      historyContainer.innerHTML = '<p class="empty-history-text">No outreach emails sent yet in this session.</p>';
      return;
    }

    historyContainer.innerHTML = '';
    history.forEach(item => {
      const isSuccess = item.status !== 'failed';
      const row = document.createElement('div');
      row.className = 'history-card-row';
      row.innerHTML = `
        <div>
          <div class="history-card-to">${escapeHtml(item.to)}</div>
          <div class="history-card-sub">
            Team: ${escapeHtml(item.teamName)} &bull; ${item.linksCount} link(s) &bull; ${escapeHtml(item.timestamp)}
            ${item.error ? `<div style="color: var(--brand-red); font-size: 0.72rem; margin-top: 3px; font-weight: 500;">${escapeHtml(item.error)}</div>` : ''}
          </div>
        </div>
        <span class="${isSuccess ? 'sent-tag' : 'failed-tag'}">
          ${isSuccess ? '✓ Sent' : '✕ Failed'}
        </span>
      `;
      historyContainer.appendChild(row);
    });
  }

  clearHistoryBtn.addEventListener('click', () => {
    sessionStorage.removeItem(SESSION_LOGS_KEY);
    loadHistory();
    showToast('Session logs cleared.', 'info');
  });

  // ============================================================
  // Initialize
  // ============================================================
  renderReviewLinks();
  loadSmtp();
  loadHistory();
  updateLivePreview();
});
