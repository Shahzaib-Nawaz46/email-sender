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

  // Header & Drawer Tab Controls
  const openLogsBtn = document.getElementById('open-logs-btn');
  const tabBtnSettings = document.getElementById('tab-btn-settings');
  const tabBtnLogs = document.getElementById('tab-btn-logs');
  const drawerPaneSettings = document.getElementById('drawer-pane-settings');
  const drawerPaneLogs = document.getElementById('drawer-pane-logs');
  const drawerHistoryContainer = document.getElementById('drawer-history-container');
  const clearDrawerHistoryBtn = document.getElementById('clear-drawer-history-btn');
  const headerLogCount = document.getElementById('header-log-count');
  const drawerLogCount = document.getElementById('drawer-log-count');

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

  // Additional Premium Controls
  const resetFormBtn = document.getElementById('reset-form-btn');
  const deviceBtnDesktop = document.getElementById('device-btn-desktop');
  const deviceBtnMobile = document.getElementById('device-btn-mobile');
  const emailPreviewFrame = document.getElementById('email-preview-frame');
  const copyEmailTextBtn = document.getElementById('copy-email-text-btn');
  const previewBackBtn = document.getElementById('preview-back-btn');
  const previewSendMobileBtn = document.getElementById('preview-send-mobile-btn');
  const previewSheetBody = document.getElementById('preview-sheet-body');
  const previewFormatTag = document.getElementById('preview-format-tag');

  // Format Switcher Elements
  const pillFormatSimple = document.getElementById('pill-format-simple');
  const pillFormatStandard = document.getElementById('pill-format-standard');
  const settingFormatSimple = document.getElementById('setting-format-simple');
  const settingFormatStandard = document.getElementById('setting-format-standard');

  const FORMATS = {
    simple: {
      id: 'simple',
      name: 'Simple (Screenshot)',
      defaultSubject: 'Regarding negative reviews on your Google profile',
      defaultSignoff: 'Shahzaib'
    },
    standard: {
      id: 'standard',
      name: 'Standard',
      defaultSubject: 'Removal of negative reviews on your Google profile',
      defaultSignoff: 'Reputation Support Team'
    }
  };

  // State
  let currentFormat = 'simple';
  let reviewLinks = [''];
  const STORAGE = {
    USER: 'reputation_sender_smtp_user',
    PASS: 'reputation_sender_smtp_pass',
    NAME: 'reputation_sender_smtp_name',
    SUBJECT: 'reputation_sender_subject',
    SIGNOFF: 'reputation_sender_signoff',
    HISTORY: 'reputation_sender_history',
    FORMAT: 'reputation_sender_format'
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
  // Side Drawer Management (Settings & Logs)
  // ============================================================
  function switchDrawerTab(targetTab) {
    if (targetTab === 'settings') {
      if (tabBtnSettings) tabBtnSettings.classList.add('active');
      if (tabBtnLogs) tabBtnLogs.classList.remove('active');
      if (drawerPaneSettings) drawerPaneSettings.classList.remove('hidden');
      if (drawerPaneLogs) drawerPaneLogs.classList.add('hidden');
    } else {
      if (tabBtnSettings) tabBtnSettings.classList.remove('active');
      if (tabBtnLogs) tabBtnLogs.classList.add('active');
      if (drawerPaneSettings) drawerPaneSettings.classList.add('hidden');
      if (drawerPaneLogs) drawerPaneLogs.classList.remove('hidden');
    }
  }

  if (tabBtnSettings) {
    tabBtnSettings.addEventListener('click', () => switchDrawerTab('settings'));
  }
  if (tabBtnLogs) {
    tabBtnLogs.addEventListener('click', () => switchDrawerTab('logs'));
  }

  function openDrawer(tab = 'settings') {
    switchDrawerTab(tab);
    drawerOverlay.classList.remove('hidden');
    settingsDrawer.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawerOverlay.classList.add('hidden');
    settingsDrawer.classList.add('hidden');
    document.body.style.overflow = '';
  }

  openSettingsBtn.addEventListener('click', () => openDrawer('settings'));
  if (openLogsBtn) {
    openLogsBtn.addEventListener('click', () => openDrawer('logs'));
  }
  closeDrawerBtn.addEventListener('click', closeDrawer);
  drawerOverlay.addEventListener('click', closeDrawer);
  if (bannerOpenSettings) {
    bannerOpenSettings.addEventListener('click', () => openDrawer('settings'));
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
  // Format Selection Logic (Simple vs Standard)
  // ============================================================
  function setFormat(newFormat, autoUpdateSubject = false) {
    currentFormat = newFormat === 'standard' ? 'standard' : 'simple';

    // Update Composer Quick Pills
    if (pillFormatSimple) pillFormatSimple.classList.toggle('active', currentFormat === 'simple');
    if (pillFormatStandard) pillFormatStandard.classList.toggle('active', currentFormat === 'standard');

    // Update Settings Drawer Radio Cards
    if (settingFormatSimple) settingFormatSimple.checked = (currentFormat === 'simple');
    if (settingFormatStandard) settingFormatStandard.checked = (currentFormat === 'standard');

    // Update Radio Card wrapper active styles
    const cardSimple = settingFormatSimple?.closest('.format-choice-card');
    const cardStandard = settingFormatStandard?.closest('.format-choice-card');
    if (cardSimple) cardSimple.classList.toggle('active', currentFormat === 'simple');
    if (cardStandard) cardStandard.classList.toggle('active', currentFormat === 'standard');

    // Update Preview Header Tag
    if (previewFormatTag) {
      previewFormatTag.textContent = currentFormat === 'simple' ? 'Simple Format' : 'Standard Format';
    }

    // Toggle borderless mode on email sheet
    const emailSheet = document.querySelector('.email-sheet');
    if (emailSheet) {
      emailSheet.classList.toggle('mode-simple', currentFormat === 'simple');
    }
    if (emailPreviewFrame) {
      emailPreviewFrame.classList.toggle('mode-simple', currentFormat === 'simple');
    }

    // Auto-update default subject line if not custom edited
    if (autoUpdateSubject) {
      const curSubj = emailSubjectInput.value.trim();
      if (!curSubj || curSubj === FORMATS.simple.defaultSubject || curSubj === FORMATS.standard.defaultSubject) {
        emailSubjectInput.value = FORMATS[currentFormat].defaultSubject;
        localStorage.setItem(STORAGE.SUBJECT, emailSubjectInput.value);
      }
    }

    localStorage.setItem(STORAGE.FORMAT, currentFormat);
    updateLivePreview();
  }

  if (pillFormatSimple) {
    pillFormatSimple.addEventListener('click', () => setFormat('simple', true));
  }
  if (pillFormatStandard) {
    pillFormatStandard.addEventListener('click', () => setFormat('standard', true));
  }
  if (settingFormatSimple) {
    settingFormatSimple.addEventListener('change', () => setFormat('simple', true));
  }
  if (settingFormatStandard) {
    settingFormatStandard.addEventListener('change', () => setFormat('standard', true));
  }

  // ============================================================
  // LocalStorage Persistence
  // ============================================================
  function loadSmtp() {
    const user = localStorage.getItem(STORAGE.USER) || '';
    const pass = localStorage.getItem(STORAGE.PASS) || '';
    const name = localStorage.getItem(STORAGE.NAME) || 'Shahzaib';
    const savedSubject = localStorage.getItem(STORAGE.SUBJECT);
    const savedSignoff = localStorage.getItem(STORAGE.SIGNOFF);
    const savedFormat = localStorage.getItem(STORAGE.FORMAT) || 'simple';

    setFormat(savedFormat, false);

    if (user) smtpEmailInput.value = user;
    if (pass) smtpPassInput.value = pass;
    if (name) {
      smtpSenderNameInput.value = name;
    }

    // Load saved subject if exists, else format default
    if (savedSubject !== null && savedSubject !== undefined) {
      emailSubjectInput.value = savedSubject;
    } else {
      emailSubjectInput.value = FORMATS[currentFormat].defaultSubject;
    }

    // Load saved signature name if exists
    if (savedSignoff !== null && savedSignoff !== undefined) {
      signoffNameInput.value = savedSignoff;
    } else if (name) {
      signoffNameInput.value = name;
    } else {
      signoffNameInput.value = 'Shahzaib';
    }

    refreshSmtpStatus();
    updateLivePreview();
  }

  function saveSmtp(showNotification = true) {
    const user = smtpEmailInput.value.trim();
    const pass = smtpPassInput.value.trim();
    const name = signoffNameInput.value.trim() || (smtpSenderNameInput ? smtpSenderNameInput.value.trim() : '') || 'Shahzaib';

    if (!user || !pass) {
      showToast('Please provide both Gmail and App Password.', 'error');
      return false;
    }

    localStorage.setItem(STORAGE.USER, user);
    localStorage.setItem(STORAGE.PASS, pass);
    localStorage.setItem(STORAGE.NAME, name);
    localStorage.setItem(STORAGE.SIGNOFF, name);
    localStorage.setItem(STORAGE.SUBJECT, emailSubjectInput.value.trim());
    localStorage.setItem(STORAGE.FORMAT, currentFormat);

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
    if (confirm('Clear saved Gmail settings, format, subject, and signature from this browser?')) {
      localStorage.removeItem(STORAGE.USER);
      localStorage.removeItem(STORAGE.PASS);
      localStorage.removeItem(STORAGE.NAME);
      localStorage.removeItem(STORAGE.SUBJECT);
      localStorage.removeItem(STORAGE.SIGNOFF);
      localStorage.removeItem(STORAGE.FORMAT);
      smtpEmailInput.value = '';
      smtpPassInput.value = '';
      smtpSenderNameInput.value = 'Shahzaib';
      signoffNameInput.value = 'Shahzaib';
      setFormat('simple', false);
      emailSubjectInput.value = FORMATS.simple.defaultSubject;
      refreshSmtpStatus();
      updateLivePreview();
      showToast('Saved settings cleared.', 'info');
    }
  }

  function refreshSmtpStatus() {
    const user = localStorage.getItem(STORAGE.USER);
    const pass = localStorage.getItem(STORAGE.PASS);
    const badge = document.getElementById('header-smtp-badge');

    if (user && pass) {
      headerSmtpDot.className = 'dot dot--ready';
      headerSmtpText.textContent = user;
      if (badge) {
        badge.className = 'header-status-pill header-status-pill--ready';
        badge.title = `Gmail Connected: ${user} (Click to change)`;
      }
      if (smtpWarningBanner) smtpWarningBanner.classList.add('hidden');
    } else {
      headerSmtpDot.className = 'dot dot--warn';
      headerSmtpText.textContent = 'Setup Gmail';
      if (badge) {
        badge.className = 'header-status-pill header-status-pill--warn';
        badge.title = 'Click to configure Gmail credentials';
      }
      if (smtpWarningBanner) smtpWarningBanner.classList.remove('hidden');
    }
  }

  const headerSmtpBadge = document.getElementById('header-smtp-badge');
  if (headerSmtpBadge) {
    headerSmtpBadge.addEventListener('click', openDrawer);
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
  // Mobile Tab Navigation (Clean View Switching, No Preview Underneath)
  // ============================================================
  function switchTab(targetTab) {
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === targetTab);
    });

    tabPanes.forEach(pane => {
      pane.classList.toggle('active', pane.id === `section-${targetTab}`);
    });

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

  if (previewBackBtn) {
    previewBackBtn.addEventListener('click', () => {
      switchTab('compose');
    });
  }

  if (previewSendMobileBtn) {
    previewSendMobileBtn.addEventListener('click', () => {
      emailForm.requestSubmit();
    });
  }

  // ============================================================
  // Dynamic Review Links (Smart & Compact)
  // ============================================================
  function renderReviewLinks() {
    reviewLinksWrapper.innerHTML = '';

    reviewLinks.forEach((linkValue, index) => {
      const card = document.createElement('div');
      card.className = 'link-row-card';
      const cleanVal = (linkValue || '').trim();

      card.innerHTML = `
        <div class="link-tag-index">#${index + 1}</div>
        <div class="link-field-inner">
          <svg class="link-field-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </svg>
          <input 
            type="url" 
            class="review-link-input" 
            data-index="${index}" 
            placeholder="https://www.google.com/maps/reviews/..." 
            value="${escapeHtml(linkValue)}"
          >
          ${cleanVal ? `
            <a href="${escapeHtml(cleanVal)}" target="_blank" rel="noopener noreferrer" class="test-link-btn" title="Open and test review link">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </a>
          ` : ''}
        </div>
        <button 
          type="button" 
          class="del-link-btn" 
          data-index="${index}" 
          title="Remove this review link"
          ${reviewLinks.length <= 1 ? 'disabled style="opacity: 0.2; cursor: not-allowed;"' : ''}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
    if (previewTabCount) previewTabCount.textContent = count;

    // Listeners for input and smart multi-link paste
    const inputs = reviewLinksWrapper.querySelectorAll('.review-link-input');
    inputs.forEach(input => {
      input.addEventListener('input', (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        reviewLinks[idx] = e.target.value;
        updateLivePreview();
      });

      // Smart Paste: splits multiple lines into separate link inputs!
      input.addEventListener('paste', (e) => {
        const pasteData = (e.clipboardData || window.clipboardData)?.getData('text');
        if (pasteData && (pasteData.includes('\n') || pasteData.includes('\r'))) {
          e.preventDefault();
          const splitUrls = pasteData
            .split(/\r?\n/)
            .map(s => s.trim())
            .filter(s => s.length > 0);

          if (splitUrls.length > 1) {
            const idx = parseInt(e.target.dataset.index, 10);
            reviewLinks.splice(idx, 1, ...splitUrls);
            renderReviewLinks();
            updateLivePreview();
            showToast(`Added ${splitUrls.length} review links automatically!`, 'info');
          } else if (splitUrls.length === 1) {
            e.target.value = splitUrls[0];
            reviewLinks[parseInt(e.target.dataset.index, 10)] = splitUrls[0];
            updateLivePreview();
          }
        }
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
  // Live Email Preview (Faithful Screenshot Replica or Standard)
  // ============================================================
  function updateLivePreview() {
    // Subject
    const defaultSubject = FORMATS[currentFormat].defaultSubject;
    const subject = emailSubjectInput.value.trim() || defaultSubject;
    previewSubjectText.textContent = subject;

    // Sender Name
    const sender = (signoffNameInput.value.trim() || smtpSenderNameInput.value.trim() || 'Shahzaib');
    previewSenderName.textContent = sender;

    // Recipient 'to'
    const recipient = recipientEmailInput.value.trim();
    if (recipient) {
      const username = recipient.split('@')[0];
      previewToName.textContent = username || 'recipient';
    } else {
      previewToName.textContent = 'contact';
    }

    const cleanTeamName = teamNameInput.value.trim();

    // Active review links
    const activeLinks = reviewLinks
      .map(l => l.trim())
      .filter(l => l.length > 0);

    const linksToDisplay = activeLinks.length > 0
      ? activeLinks
      : ['https://www.google.com/maps/reviews/data=!4m8!14m7!1m6!2m5!1sCi9DQUIRGUNvZENodHljRjlvT25oVk1qSk9hbXhOU1RoUVFGZlJvUGxldzE...'];

    const linksHtml = linksToDisplay.map(link => `
      <li style="margin-bottom:8px; word-break:break-all;">
        <a href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link)}</a>
      </li>
    `).join('');

    // Dynamic Render Based on currentFormat
    if (currentFormat === 'simple') {
      let greetingHtml = 'Hello,';
      let greetingPill = 'Greeting: <strong>Hello,</strong>';

      if (cleanTeamName) {
        const formattedBiz = cleanTeamName.toLowerCase().endsWith('team')
          ? cleanTeamName
          : `${cleanTeamName} Team`;
        greetingHtml = `Hello <strong>${escapeHtml(formattedBiz)}</strong>,`;
        greetingPill = `Greeting: <strong>Hello ${escapeHtml(formattedBiz)},</strong>`;
      }

      greetingPillText.innerHTML = greetingPill;

      if (previewSheetBody) {
        previewSheetBody.innerHTML = `
          <p>${greetingHtml}</p>
          <p>We have noticed some negative reviews on your profile. We can completely remove them for you. <strong>You only pay AFTER successful removal!</strong></p>
          <p><strong>Review links:</strong></p>
          <ol style="margin-left: 20px; padding-left: 0;">
            ${linksHtml}
          </ol>
          <p>Best regards,<br><strong>${escapeHtml(sender)}</strong></p>
        `;
      }
    } else {
      // Standard Format
      const greetingHtml = cleanTeamName
        ? `Hello <strong>${escapeHtml(cleanTeamName)}</strong>,`
        : `Hello,`;

      greetingPillText.innerHTML = `Greeting: <strong>${cleanTeamName ? `Hello ${escapeHtml(cleanTeamName)},` : 'Hello,'}</strong>`;

      if (previewSheetBody) {
        previewSheetBody.innerHTML = `
          <p class="msg-greeting" style="margin:0 0 16px 0; font-size:16px; line-height:1.6; color:#000000;">
            ${cleanTeamName ? `Hello <strong>${escapeHtml(cleanTeamName)}</strong>,` : 'Hello,'}
          </p>

          <p class="msg-p" style="margin:0 0 18px 0; font-size:15px; line-height:1.7; color:#000000;">
            We noticed some negative reviews on your Google profile. We can completely remove them for you &mdash; and <strong>you only pay AFTER successful removal</strong> (zero upfront payment).
          </p>

          <p class="msg-links-head" style="margin:0 0 8px 0; font-size:15px; font-weight:700; color:#000000;">
            Review link(s):
          </p>

          <ol class="msg-ol" style="margin:0 0 20px 22px; padding:0; font-size:14px; line-height:1.7; color:#000000;">
            ${linksHtml}
          </ol>

          <p class="msg-p" style="margin:0 0 20px 0; font-size:15px; line-height:1.7; color:#000000;">
            If you'd like us to take care of this for you, simply reply to this email and let us know.
          </p>

          <div class="msg-signoff" style="font-size:14px; line-height:1.6; color:#000000;">
            <p class="signoff-reg" style="margin:0 0 2px 0;">Best regards,</p>
            <p class="signoff-name" style="margin:0; font-weight:700; color:#000000;">${escapeHtml(sender)}</p>
          </div>
        `;
      }
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
        subject: emailSubjectInput.value.trim() || FORMATS[currentFormat].defaultSubject,
        reviewLinks: validLinks,
        signOffName: signoffNameInput.value.trim() || senderName,
        format: currentFormat
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
    const list = history || [];
    const count = list.length;
    if (headerLogCount) headerLogCount.textContent = count;
    if (drawerLogCount) drawerLogCount.textContent = count;

    const generateHtml = () => {
      if (list.length === 0) {
        return '<p class="empty-history-text">No outreach emails sent yet in this session.</p>';
      }
      return list.map(item => {
        const isSuccess = item.status !== 'failed';
        return `
          <div class="history-card-row">
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
          </div>
        `;
      }).join('');
    };

    const htmlContent = generateHtml();
    if (historyContainer) historyContainer.innerHTML = htmlContent;
    if (drawerHistoryContainer) drawerHistoryContainer.innerHTML = htmlContent;
  }

  function clearLogs() {
    sessionStorage.removeItem(SESSION_LOGS_KEY);
    loadHistory();
    showToast('Session logs cleared.', 'info');
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', clearLogs);
  }
  if (clearDrawerHistoryBtn) {
    clearDrawerHistoryBtn.addEventListener('click', clearLogs);
  }

  // ============================================================
  // Additional Premium Features: Reset, Copy, Device Toggle, Shortcuts
  // ============================================================
  if (resetFormBtn) {
    resetFormBtn.addEventListener('click', () => {
      const hasContent = recipientEmailInput.value || teamNameInput.value || reviewLinks.some(l => l.trim().length > 0);
      if (hasContent) {
        recipientEmailInput.value = '';
        teamNameInput.value = '';
        reviewLinks = [''];
        renderReviewLinks();
        updateLivePreview();
        recipientEmailInput.focus();
        showToast('Form cleared for next business.', 'info');
      } else {
        recipientEmailInput.focus();
      }
    });
  }

  // Device simulation toggle (Desktop / Mobile Preview)
  if (deviceBtnDesktop && deviceBtnMobile && emailPreviewFrame) {
    deviceBtnDesktop.addEventListener('click', () => {
      deviceBtnDesktop.classList.add('active');
      deviceBtnMobile.classList.remove('active');
      emailPreviewFrame.classList.remove('device-mobile');
    });

    deviceBtnMobile.addEventListener('click', () => {
      deviceBtnMobile.classList.add('active');
      deviceBtnDesktop.classList.remove('active');
      emailPreviewFrame.classList.add('device-mobile');
    });
  }

  // Copy plain text email (matching current selected format)
  if (copyEmailTextBtn) {
    copyEmailTextBtn.addEventListener('click', () => {
      const defaultSubject = FORMATS[currentFormat].defaultSubject;
      const subject = emailSubjectInput.value.trim() || defaultSubject;
      const cleanTeam = teamNameInput.value.trim();
      const sender = signoffNameInput.value.trim() || 'Shahzaib';
      const validLinks = reviewLinks.filter(l => l && l.trim().length > 0);
      const linksList = validLinks.length > 0
        ? validLinks.map((l, i) => `${i + 1}. ${l.trim()}`).join('\n')
        : '1. https://www.google.com/maps/reviews/...';

      let plainText = '';

      if (currentFormat === 'simple') {
        let greetingText = 'Hello,';
        if (cleanTeam) {
          const formattedBiz = cleanTeam.toLowerCase().endsWith('team')
            ? cleanTeam
            : `${cleanTeam} Team`;
          greetingText = `Hello ${formattedBiz},`;
        }

        plainText = `${greetingText}\n\nWe have noticed some negative reviews on your profile. We can completely remove them for you. You only pay AFTER successful removal!\n\nReview links:\n${linksList}\n\nBest regards,\n${sender}`;
      } else {
        const greeting = cleanTeam ? `Hello ${cleanTeam},` : 'Hello,';
        plainText = `Subject: ${subject}\n\n${greeting}\n\nWe noticed some negative reviews on your Google profile. We can completely remove them for you — and you only pay AFTER successful removal (zero upfront payment).\n\nReview link(s):\n${linksList}\n\nIf you'd like us to take care of this for you, simply reply to this email and let us know.\n\nBest regards,\n${sender}`;
      }

      navigator.clipboard.writeText(plainText).then(() => {
        showToast(`Email (${FORMATS[currentFormat].name}) copied to clipboard!`, 'success');
      }).catch(() => {
        showToast('Could not copy to clipboard.', 'error');
      });
    });
  }

  // Global Keyboard Shortcut: Ctrl + Enter / Cmd + Enter to dispatch
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      if (!sendBtn.disabled) {
        e.preventDefault();
        emailForm.requestSubmit();
      }
    }
  });

  // ============================================================
  // Initialize
  // ============================================================
  renderReviewLinks();
  loadSmtp();
  loadHistory();
  updateLivePreview();
});
