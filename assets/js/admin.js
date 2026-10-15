/**
 * HD FITNESS STUDIO - ADMIN CONTROLLER
 * Full CRUD operations, Tab Switching, Lead Management, Offer Launching, and Supabase integration
 */

const adminApp = {
    activeTab: 'dashboard',
    selectedDay: 'Monday',
    schemaSql: '',
    currentUser: null,
    isAuthenticated: false,
    currentHeroStats: null,
    async init() {
        this.setupEventListeners();
        this.setupAuthListeners();
        this.loadSchemaSqlText();

        // Listen for live auth state changes from Supabase (sign-in / sign-out)
        if (window.HD_AUTH) {
            window.HD_AUTH.onAuthStateChange((event, newSession) => {
                if (newSession && newSession.user) {
                    this.setAuthenticatedUser(newSession.user);
                } else if (event === 'SIGNED_OUT') {
                    this.showAuthGate();
                }
            });
        }

        // Verify active Supabase session before loading protected data
        await this.checkAuthSession();

        // Support direct tab linking via hash (e.g. admin.html#schedule)
        const hashTab = window.location.hash.replace('#', '');
        if (hashTab && document.getElementById(`pane-${hashTab}`)) {
            this.switchTab(hashTab);
        }
    },

    // ================= AUTHENTICATION MANAGEMENT =================
    async checkAuthSession() {
        if (!window.HD_AUTH) {
            this.showAuthGate();
            return;
        }

        try {
            // Check for an existing valid Supabase session on page load
            const { session } = await window.HD_AUTH.getSession();
            if (session && session.user) {
                this.setAuthenticatedUser(session.user);
            } else {
                this.showAuthGate();
            }
        } catch (err) {
            console.warn('[HD Admin] Session verification error:', err);
            this.showAuthGate();
        }
    },

    setAuthenticatedUser(user) {
        const wasAuthenticated = this.isAuthenticated;
        this.currentUser = user;
        this.isAuthenticated = true;

        const gate = document.getElementById('adminAuthGate');
        if (gate) gate.style.display = 'none';

        const userPill = document.getElementById('adminUserPill');
        const userEmail = document.getElementById('adminUserEmail');
        const userInitial = document.getElementById('adminUserInitial');
        const signOutBtn = document.getElementById('adminSignOutBtn');

        if (userPill) userPill.style.display = 'flex';
        if (signOutBtn) signOutBtn.style.display = 'inline-flex';
        if (userEmail) userEmail.textContent = user.email || 'Admin User';
        if (userInitial) userInitial.textContent = (user.email ? user.email[0].toUpperCase() : 'A');

        // Check connection and load data once authenticated
        if (!wasAuthenticated) {
            this.checkConnectionStatus();
            this.loadAllData();
        }

        if (window.lucide) lucide.createIcons();
    },

    showAuthGate() {
        this.currentUser = null;
        this.isAuthenticated = false;

        const gate = document.getElementById('adminAuthGate');
        if (gate) gate.style.display = 'flex';

        const userPill = document.getElementById('adminUserPill');
        if (userPill) userPill.style.display = 'none';

        const signOutBtn = document.getElementById('adminSignOutBtn');
        if (signOutBtn) signOutBtn.style.display = 'none';

        const pwdInput = document.getElementById('auth-signin-password');
        if (pwdInput) pwdInput.value = '';

        if (window.lucide) lucide.createIcons();
    },

    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        input.type = input.type === 'password' ? 'text' : 'password';
    },

    showAuthAlert(type, message) {
        const alertBox = document.getElementById('auth-alert-box');
        if (!alertBox) return;
        alertBox.className = `auth-alert ${type}`;
        alertBox.textContent = message;
        alertBox.style.display = 'block';
    },

    setupAuthListeners() {
        const signinForm = document.getElementById('form-auth-signin');
        if (signinForm) {
            signinForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const emailInput = document.getElementById('auth-signin-email');
                const pwdInput = document.getElementById('auth-signin-password');
                const submitBtn = document.getElementById('btn-signin-submit');

                const email = emailInput ? emailInput.value.trim() : '';
                const pwd = pwdInput ? pwdInput.value : '';

                if (!email || !pwd) {
                    this.showAuthAlert('error', 'Please enter your admin email and password.');
                    return;
                }

                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i data-lucide="loader"></i> Authenticating with Supabase...';
                if (window.lucide) lucide.createIcons();

                try {
                    const sessionData = await window.HD_AUTH.signIn(email, pwd);
                    this.showAuthAlert('success', 'Authentication verified! Opening Studio Console...');
                    setTimeout(() => {
                        const user = sessionData?.user || sessionData;
                        this.setAuthenticatedUser(user);
                        this.showToast(`Authenticated as ${user.email}`, 'success');
                    }, 350);
                } catch (err) {
                    console.error('[HD Admin] Sign in error:', err);
                    let errMsg = err.message || 'Invalid credentials. Please verify your email and password.';
                    if (errMsg.toLowerCase().includes('invalid login credentials')) {
                        errMsg = 'Invalid email or password. Please verify your Supabase admin credentials.';
                    }
                    this.showAuthAlert('error', errMsg);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = '<i data-lucide="shield-check"></i> Sign In to Studio Console';
                    if (window.lucide) lucide.createIcons();
                }
            });
        }
    },

    async signOut() {
        try {
            if (window.HD_AUTH) {
                await window.HD_AUTH.signOut();
            }
        } catch (e) {
            console.error('[HD Admin] Sign out error:', e);
        }
        this.showAuthGate();
        this.showToast('Logged out successfully.', 'info');
    },


    async loadSchemaSqlText() {
        try {
            let res = await fetch('supabase_schema.sql');
            if (!res.ok) {
                res = await fetch('../supabase_schema.sql');
            }
            if (res.ok) {
                this.schemaSql = await res.text();
            }
        } catch (e) {
            try {
                const res = await fetch('../supabase_schema.sql');
                if (res.ok) this.schemaSql = await res.text();
            } catch (err) {
                console.warn('Could not load schema sql text:', err);
            }
        }
    },

    async checkConnectionStatus() {
        const pill = document.getElementById('supabase-status-pill');
        const text = document.getElementById('supabase-status-text');
        const dot = pill.querySelector('.status-dot');

        if (!window.HD_API) {
            text.textContent = 'Offline Mode';
            return;
        }

        try {
            // Check if we can fetch from Supabase
            const coaches = await window.HD_API.getCoaches();
            dot.classList.add('connected');
            text.textContent = `Supabase Connected (${coaches.length} coaches)`;
        } catch (err) {
            dot.classList.remove('connected');
            text.textContent = 'Supabase Sync Ready';
        }
    },

    setupEventListeners() {
        // Desktop Nav tabs
        document.querySelectorAll('.admin-nav .nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Mobile tabs
        document.querySelectorAll('.admin-mobile-tabs .mobile-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Day tabs
        document.querySelectorAll('#admin-day-tabs .filter-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#admin-day-tabs .filter-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedDay = btn.getAttribute('data-day');
                this.renderScheduleTable();
            });
        });

        // Refresh button
        const refreshBtn = document.getElementById('refresh-dashboard-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.disabled = true;
                this.showToast('Refreshing studio dashboard...', 'info');
                await this.loadAllData();
                this.showToast('Dashboard data updated!', 'success');
                refreshBtn.disabled = false;
            });
        }
        // Direct Logout button listener
        const logoutBtn = document.getElementById('adminSignOutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.signOut();
            });
        }

        // Modal close handlers (outside backdrop click, cancel/x buttons, Escape key)
        document.querySelectorAll('.admin-modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeAllModals();
            });
        });
        document.querySelectorAll('[data-close-modal], .modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeAllModals();
            });
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeAllModals();
        });

        // Edit Hero Stats button
        document.getElementById('btn-edit-hero-stats')?.addEventListener('click', () => this.openHeroStatsModal());

        // Quick Offer button
        const quickOfferBtn = document.getElementById('btn-quick-offer');
        if (quickOfferBtn) {
            quickOfferBtn.addEventListener('click', () => {
                this.openOfferModal();
            });
        }

        // Add buttons
        document.getElementById('btn-add-class')?.addEventListener('click', () => this.openClassModal());
        document.getElementById('btn-add-program')?.addEventListener('click', () => this.openProgramModal());
        document.getElementById('btn-add-coach')?.addEventListener('click', () => this.openCoachModal());
        document.getElementById('btn-add-plan')?.addEventListener('click', () => this.openPlanModal());
        document.getElementById('btn-create-offer')?.addEventListener('click', () => this.openOfferModal());

        // Forms
        this.setupFormSubmits();

        // Export Leads
        document.getElementById('btn-export-leads')?.addEventListener('click', () => this.exportLeadsCSV());

        // Copy SQL Schema
        document.getElementById('btn-copy-schema-sql')?.addEventListener('click', () => this.copySqlSchema());
    },

    switchTab(tabId) {
        this.activeTab = tabId;

        // Update Nav buttons
        document.querySelectorAll('.admin-nav .nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });
        document.querySelectorAll('.admin-mobile-tabs .mobile-tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });

        // Update Panes
        document.querySelectorAll('.admin-tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        const targetPane = document.getElementById(`pane-${tabId}`);
        if (targetPane) {
            targetPane.classList.add('active');
        }

        // Automatically refresh data when switching tabs so views are always up-to-date
        if (tabId === 'dashboard') {
            this.loadDashboardStats();
        } else if (tabId === 'schedule') {
            this.renderScheduleTable();
        } else if (tabId === 'programs') {
            this.renderProgramsGrid();
        } else if (tabId === 'pricing') {
            this.renderPricingGrid();
        } else if (tabId === 'coaches') {
            this.renderCoachesGrid();
        } else if (tabId === 'offers') {
            this.renderOffersList();
        } else if (tabId === 'leads') {
            this.renderLeadsTable();
        }

        if (window.lucide) lucide.createIcons();
    },

    async loadAllData() {
        await Promise.all([
            this.loadDashboardStats(),
            this.loadStudioStats(),
            this.renderScheduleTable(),
            this.renderProgramsGrid(),
            this.renderPricingGrid(),
            this.renderCoachesGrid(),
            this.renderOffersList(),
            this.renderLeadsTable()
        ]);
        if (window.lucide) lucide.createIcons();
    },

    // 1. DASHBOARD
    async loadDashboardStats() {
        try {
            const [classes, programs, coaches, offers, leads] = await Promise.all([
                window.HD_API.getClasses().catch(e => { console.warn('Classes load error:', e); return []; }),
                window.HD_API.getPrograms().catch(e => { console.warn('Programs load error:', e); return []; }),
                window.HD_API.getCoaches().catch(e => { console.warn('Coaches load error:', e); return []; }),
                window.HD_API.getOffers().catch(e => { console.warn('Offers load error:', e); return []; }),
                window.HD_API.getLeads().catch(e => { console.warn('Leads load error:', e); return []; })
            ]);

            const classesCount = Array.isArray(classes) ? classes.length : 0;
            const programsCount = Array.isArray(programs) ? programs.length : 0;
            const coachesCount = Array.isArray(coaches) ? coaches.length : 0;
            const offersArr = Array.isArray(offers) ? offers : [];
            const activeOffersCount = offersArr.filter(o => o && o.is_active).length;
            const leadsArr = Array.isArray(leads) ? leads : [];
            const leadsCount = leadsArr.length;

            const statClasses = document.getElementById('stat-classes');
            if (statClasses) statClasses.textContent = classesCount;

            const statPrograms = document.getElementById('stat-programs');
            if (statPrograms) statPrograms.textContent = programsCount;

            const statCoaches = document.getElementById('stat-coaches');
            if (statCoaches) statCoaches.textContent = coachesCount;

            const statOffers = document.getElementById('stat-offers');
            if (statOffers) statOffers.textContent = activeOffersCount;

            const statLeads = document.getElementById('stat-leads');
            if (statLeads) statLeads.textContent = leadsCount;

            const leadsBadge = document.getElementById('leads-count-badge');
            if (leadsBadge) leadsBadge.textContent = leadsCount;

            // Active Top Offer preview
            const activeOffer = offersArr.find(o => o && o.is_active && o.show_top_banner) || offersArr[0];
            const dashOfferTitle = document.getElementById('dash-offer-title');
            const dashOfferBanner = document.getElementById('dash-offer-banner');
            if (activeOffer) {
                if (dashOfferTitle) dashOfferTitle.textContent = activeOffer.title || 'Studio Special';
                if (dashOfferBanner) dashOfferBanner.textContent = activeOffer.banner_text || '';
            } else {
                if (dashOfferTitle) dashOfferTitle.textContent = 'No Active Offers';
                if (dashOfferBanner) dashOfferBanner.textContent = 'Launch a promo offer from the Offers & Promos tab.';
            }

            // Recent leads preview (top 5)
            const tbody = document.getElementById('dash-recent-leads-tbody');
            if (tbody) {
                if (leadsCount === 0) {
                    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">No leads recorded yet.</td></tr>`;
                } else {
                    tbody.innerHTML = leadsArr.slice(0, 5).map(lead => `
            <tr>
              <td><strong>${this.escape(lead.full_name)}</strong></td>
              <td>${this.escape(lead.phone)}</td>
              <td><span class="badge-role">${this.escape(lead.goal || 'General')}</span></td>
              <td>${this.escape(lead.preferred_slot || 'Anytime')}</td>
              <td>${new Date(lead.created_at || Date.now()).toLocaleDateString()}</td>
              <td>
                <a href="https://wa.me/91${(lead.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${lead.full_name}, thank you for requesting a Free Pass at HD Fitness Studio!`)}" target="_blank" class="btn btn-sm btn-outline">
                  <i data-lucide="message-circle"></i> Chat
                </a>
              </td>
            </tr>
          `).join('');
                }
            }
            await this.loadStudioStats();
            if (window.lucide) lucide.createIcons();
        } catch (err) {
            console.error('Error loading dashboard stats:', err);
        }
    },

    // 2. SCHEDULE
    async renderScheduleTable() {
        const tbody = document.getElementById('schedule-tbody');
        if (!tbody) return;

        try {
            const classes = await window.HD_API.getClasses(this.selectedDay);
            if (!classes || classes.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4">No classes scheduled for ${this.selectedDay}. Click "Add New Class" to create one.</td></tr>`;
                return;
            }

            tbody.innerHTML = classes.map(c => `
        <tr>
          <td><strong>${c.start_time} - ${c.end_time}</strong></td>
          <td><span style="font-weight:700; color: #fff;">${this.escape(c.title)}</span></td>
          <td>${this.escape(c.coach_name)}</td>
          <td><span style="color: var(--text-dim);">${this.escape(c.zone)}</span></td>
          <td>${c.capacity || 20} Spots</td>
          <td><span class="badge-role" style="background: rgba(245, 158, 11, 0.2); color: var(--gold);">${c.intensity}</span></td>
          <td>
            <span style="color: ${c.is_active !== false ? '#10b981' : '#ef4444'}; font-weight:600;">
              ${c.is_active !== false ? 'Active' : 'Paused'}
            </span>
          </td>
          <td>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-secondary" onclick="adminApp.editClass('${c.id}')">
                <i data-lucide="edit-2"></i>
              </button>
              <button class="btn btn-sm btn-outline" style="color:#ef4444; border-color: rgba(239, 68, 68, 0.4);" onclick="adminApp.deleteClass('${c.id}')">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
            if (window.lucide) lucide.createIcons();
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-red">Error loading schedule.</td></tr>`;
        }
    },

    // 3. PROGRAMS
    async renderProgramsGrid() {
        const container = document.getElementById('programs-cards-grid');
        if (!container) return;

        try {
            const programs = await window.HD_API.getPrograms();
            container.innerHTML = programs.map(p => `
        <div class="admin-item-card">
          ${p.badge ? `<span class="card-badge">${this.escape(p.badge)}</span>` : ''}
          <h3 class="item-card-title">${this.escape(p.title)}</h3>
          <div class="item-card-sub">${this.escape(p.category)} • ${p.duration} (${p.intensity})</div>
          <p class="item-card-desc">${this.escape(p.description)}</p>
          <div class="item-card-footer">
            <span style="font-size: 0.75rem; color: var(--text-muted);">${(p.features || []).length} Features Included</span>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-secondary" onclick="adminApp.editProgram('${p.id}')">
                <i data-lucide="edit-2"></i> Edit
              </button>
              <button class="btn btn-sm btn-outline" style="color:#ef4444;" onclick="adminApp.deleteProgram('${p.id}')">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
            if (window.lucide) lucide.createIcons();
        } catch (err) {
            container.innerHTML = `<p>Error loading programs.</p>`;
        }
    },

    // 4. PRICING
    async renderPricingGrid() {
        const container = document.getElementById('pricing-cards-grid');
        if (!container) return;

        try {
            const plans = await window.HD_API.getPlans();
            container.innerHTML = plans.map(p => `
        <div class="admin-item-card" style="${p.is_featured ? 'border-color: rgba(245, 158, 11, 0.6); background: rgba(245, 158, 11, 0.04);' : ''}">
          ${p.badge ? `<span class="card-badge">${this.escape(p.badge)}</span>` : ''}
          <h3 class="item-card-title">${this.escape(p.name)}</h3>
          <div class="item-card-sub">
            Monthly: <strong style="color:#fff;">₹${p.price_monthly}</strong> | Annual: <strong style="color:var(--gold);">₹${p.price_annual_monthly}</strong>/mo
          </div>
          <p class="item-card-desc">${this.escape(p.description)}</p>
          <div class="item-card-footer">
            <span style="font-size: 0.75rem; color: var(--text-muted);">${(p.features || []).length} Features</span>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-secondary" onclick="adminApp.editPlan('${p.id}')">
                <i data-lucide="edit-2"></i> Edit
              </button>
              <button class="btn btn-sm btn-outline" style="color:#ef4444;" onclick="adminApp.deletePlan('${p.id}')">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
            if (window.lucide) lucide.createIcons();
        } catch (err) {
            container.innerHTML = `<p>Error loading plans.</p>`;
        }
    },

    // 5. COACHES
    async renderCoachesGrid() {
        const container = document.getElementById('coaches-cards-grid');
        if (!container) return;

        try {
            const coaches = await window.HD_API.getCoaches();
            container.innerHTML = coaches.map(c => `
        <div class="admin-item-card">
          <div style="display:flex; gap:14px; align-items:center; margin-bottom: 12px;">
            <img src="${c.image_url || 'assets/images/trainer_head.png'}" alt="${c.name}" style="width:60px; height:60px; border-radius:50%; object-fit:cover; border: 2px solid var(--gold);">
            <div>
              <h3 class="item-card-title" style="margin:0;">${this.escape(c.name)}</h3>
              <div style="font-size:0.75rem; color:var(--gold);">${this.escape(c.role)}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${c.experience} Exp • ${this.escape(c.instagram || '')}</div>
            </div>
          </div>
          <p class="item-card-desc" style="font-size:0.8rem;">
            <strong>Specialties:</strong> ${this.escape(c.specialties)}<br>
            <strong>Certifications:</strong> ${this.escape(c.certifications)}
          </p>
          <div class="item-card-footer">
            <span style="font-size:0.75rem; color:var(--text-muted);">Order: #${c.display_order || 1}</span>
            <div style="display:flex; gap:6px;">
              <button class="btn btn-sm btn-secondary" onclick="adminApp.editCoach('${c.id}')">
                <i data-lucide="edit-2"></i> Edit
              </button>
              <button class="btn btn-sm btn-outline" style="color:#ef4444;" onclick="adminApp.deleteCoach('${c.id}')">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
            if (window.lucide) lucide.createIcons();
        } catch (err) {
            container.innerHTML = `<p>Error loading coaches.</p>`;
        }
    },

    // 6. OFFERS & FLASH SALES
    async renderOffersList() {
        const container = document.getElementById('offers-list-container');
        if (!container) return;

        try {
            const offers = await window.HD_API.getOffers();
            container.innerHTML = offers.map(o => `
        <div class="section-card" style="${o.is_active ? 'border-color: rgba(245, 158, 11, 0.4);' : 'opacity: 0.7;'}">
          <div class="card-header-flex">
            <div>
              <div style="display:flex; align-items:center; gap:8px;">
                <h3 class="card-title">${this.escape(o.title)}</h3>
                ${o.is_active ? `<span class="badge-live"><span class="pulse"></span> LIVE</span>` : `<span style="font-size:0.7rem; color:var(--text-muted);">INACTIVE</span>`}
                ${o.show_top_banner ? `<span class="badge-role" style="font-size:0.65rem;">TOP BANNER</span>` : ''}
              </div>
              <p class="card-subtitle" style="margin-top:4px;">Promo Code: <strong>${o.discount_code || 'NONE'}</strong> ${o.discount_percentage ? `(${o.discount_percentage}% OFF)` : ''} • Expires: ${o.valid_until || 'Ongoing'}</p>
            </div>
            <div style="display:flex; gap:8px;">
              <button class="btn btn-sm ${o.is_active ? 'btn-outline' : 'btn-primary'}" onclick="adminApp.toggleOfferActive('${o.id}', ${!o.is_active})">
                ${o.is_active ? 'Pause Offer' : 'Activate Live'}
              </button>
              <button class="btn btn-sm btn-secondary" onclick="adminApp.editOffer('${o.id}')">
                <i data-lucide="edit-2"></i> Edit
              </button>
              <button class="btn btn-sm btn-outline" style="color:#ef4444;" onclick="adminApp.deleteOffer('${o.id}')">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
          <div style="background: rgba(0,0,0,0.3); padding: 12px 16px; border-radius: var(--radius-sm); border-left: 3px solid var(--gold);">
            <div style="font-size:0.72rem; color:var(--text-dim); text-transform:uppercase; margin-bottom:2px;">Live Banner Preview:</div>
            <div style="color:var(--gold-light); font-size:0.9rem; font-weight:600;">${this.escape(o.banner_text)} <span style="text-decoration:underline; font-weight:700;">${this.escape(o.cta_text || 'Claim Now →')}</span></div>
          </div>
        </div>
      `).join('');
            if (window.lucide) lucide.createIcons();
        } catch (err) {
            container.innerHTML = `<p>Error loading offers.</p>`;
        }
    },

    // 7. LEADS & TRIAL BOOKINGS
    async renderLeadsTable() {
        const tbody = document.getElementById('leads-tbody');
        if (!tbody) return;

        try {
            const leads = await window.HD_API.getTrialBookings();
            const leadsBadge = document.getElementById('leads-count-badge');
            if (leadsBadge) leadsBadge.textContent = leads ? leads.length : 0;

            if (!leads || leads.length === 0) {
                tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4">No trial booking leads submitted yet.</td></tr>`;
                return;
            }

            tbody.innerHTML = leads.map(l => {
                const cleanPhone = (l.phone || '').replace(/[^0-9]/g, '');
                const whatsappMsg = encodeURIComponent(`Hi ${l.full_name}, thank you for claiming your Free 1-Day Trial Pass at HD Fitness Studio! When are you planning to visit?`);
                return `
          <tr>
            <td><strong>${this.escape(l.full_name)}</strong></td>
            <td><a href="tel:${cleanPhone}" class="gold-link">${this.escape(l.phone)}</a></td>
            <td><span class="badge-role">${this.escape(l.goal || 'General Fitness')}</span></td>
            <td>${this.escape(l.preferred_slot || 'Anytime')}</td>
            <td>
              <select class="form-control" style="padding:4px 8px; font-size:0.75rem; width:auto;" onchange="adminApp.updateLeadStatus('${l.id}', this.value)">
                <option value="new" ${l.status === 'new' ? 'selected' : ''}>New Lead</option>
                <option value="contacted" ${l.status === 'contacted' ? 'selected' : ''}>Contacted</option>
                <option value="enrolled" ${l.status === 'enrolled' ? 'selected' : ''}>Enrolled Member</option>
                <option value="lost" ${l.status === 'lost' ? 'selected' : ''}>Lost</option>
              </select>
            </td>
            <td>${new Date(l.created_at || Date.now()).toLocaleDateString()}</td>
            <td>
              <div style="display:flex; gap:6px;">
                <a href="https://wa.me/91${cleanPhone}?text=${whatsappMsg}" target="_blank" class="btn btn-sm btn-primary">
                  <i data-lucide="message-circle"></i> WhatsApp
                </a>
                <button class="btn btn-sm btn-outline" style="color:#ef4444;" onclick="adminApp.deleteLead('${l.id}')">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
            }).join('');
            if (window.lucide) lucide.createIcons();
        } catch (err) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-red">Error loading leads.</td></tr>`;
        }
    },

    // 8. SCHEMA


    async copySqlSchema() {
        try {
            if (!this.schemaSql) {
                const res = await fetch('supabase_schema.sql');
                this.schemaSql = await res.text();
            }
            await navigator.clipboard.writeText(this.schemaSql);
            this.showToast('SQL Schema script copied to clipboard! Paste in Supabase SQL editor.', 'success');
        } catch (err) {
            this.showToast('Failed to copy to clipboard. View supabase_schema.sql directly.', 'error');
        }
    },

    // MODAL HANDLERS
    closeAllModals() {
        document.querySelectorAll('.admin-modal').forEach(m => m.classList.remove('active'));
    },

    openClassModal(cls = null) {
        document.getElementById('modal-class').classList.add('active');
        document.getElementById('class-modal-title').textContent = cls ? 'Edit Class' : 'Add New Class';
        document.getElementById('class-id').value = cls ? cls.id : '';
        document.getElementById('class-title').value = cls ? cls.title : '';
        document.getElementById('class-day').value = cls ? cls.day_of_week : this.selectedDay;
        document.getElementById('class-category').value = cls ? cls.category : 'strength';
        document.getElementById('class-start').value = cls ? cls.start_time : '07:00 AM';
        document.getElementById('class-end').value = cls ? cls.end_time : '08:00 AM';
        document.getElementById('class-coach').value = cls ? cls.coach_name : 'Vikram Sharma';
        document.getElementById('class-zone').value = cls ? cls.zone : 'Lifting Deck';
        document.getElementById('class-capacity').value = cls ? cls.capacity : 20;
        document.getElementById('class-intensity').value = cls ? cls.intensity : 'High';
        if (window.lucide) lucide.createIcons();
    },

    openProgramModal(prog = null) {
        document.getElementById('modal-program').classList.add('active');
        document.getElementById('program-modal-title').textContent = prog ? 'Edit Program' : 'Add Program';
        document.getElementById('prog-id').value = prog ? prog.id : '';
        document.getElementById('prog-title').value = prog ? prog.title : '';
        document.getElementById('prog-category').value = prog ? prog.category : 'Strength & Conditioning';
        document.getElementById('prog-badge').value = prog ? (prog.badge || '') : '';
        document.getElementById('prog-duration').value = prog ? prog.duration : '60 Mins';
        document.getElementById('prog-intensity').value = prog ? prog.intensity : 'High';
        document.getElementById('prog-description').value = prog ? prog.description : '';
        document.getElementById('prog-features').value = prog ? (prog.features || []).join('\n') : '';
        document.getElementById('prog-image').value = prog ? (prog.image_url || '') : 'assets/images/zone_strength.png';
        if (window.lucide) lucide.createIcons();
    },

    openCoachModal(coach = null) {
        document.getElementById('modal-coach').classList.add('active');
        document.getElementById('coach-modal-title').textContent = coach ? 'Edit Coach' : 'Add Coach';
        document.getElementById('coach-id').value = coach ? coach.id : '';
        document.getElementById('coach-name').value = coach ? coach.name : '';
        document.getElementById('coach-role').value = coach ? coach.role : '';
        document.getElementById('coach-experience').value = coach ? coach.experience : '5+ Years';
        document.getElementById('coach-instagram').value = coach ? (coach.instagram || '') : '@hdfitness';
        document.getElementById('coach-certifications').value = coach ? coach.certifications : '';
        document.getElementById('coach-specialties').value = coach ? coach.specialties : '';
        document.getElementById('coach-image').value = coach ? (coach.image_url || '') : 'assets/images/trainer_head.png';
        if (window.lucide) lucide.createIcons();
    },

    openPlanModal(plan = null) {
        document.getElementById('modal-plan').classList.add('active');
        document.getElementById('plan-modal-title').textContent = plan ? 'Edit Membership Plan' : 'Add Membership Plan';
        document.getElementById('plan-id').value = plan ? plan.id : '';
        document.getElementById('plan-name').value = plan ? plan.name : '';
        document.getElementById('plan-monthly').value = plan ? plan.price_monthly : '';
        document.getElementById('plan-annual').value = plan ? plan.price_annual_monthly : '';
        document.getElementById('plan-badge').value = plan ? (plan.badge || '') : '';
        document.getElementById('plan-featured').value = plan && plan.is_featured ? 'true' : 'false';
        document.getElementById('plan-desc').value = plan ? plan.description : '';
        document.getElementById('plan-features').value = plan ? (plan.features || []).join('\n') : '';
        if (window.lucide) lucide.createIcons();
    },

    openOfferModal(offer = null) {
        document.getElementById('modal-offer').classList.add('active');
        document.getElementById('offer-modal-title').textContent = offer ? 'Edit Offer' : 'Launch Promotional Offer';
        document.getElementById('offer-id').value = offer ? offer.id : '';
        document.getElementById('offer-title').value = offer ? offer.title : '';
        document.getElementById('offer-banner').value = offer ? offer.banner_text : '';
        document.getElementById('offer-cta').value = offer ? offer.cta_text : 'Claim Now →';
        document.getElementById('offer-link').value = offer ? offer.cta_link : '#trial-modal';
        document.getElementById('offer-code').value = offer ? (offer.discount_code || '') : '';
        document.getElementById('offer-discount').value = offer ? (offer.discount_percentage || '') : '';
        document.getElementById('offer-valid').value = offer ? (offer.valid_until || '') : '';
        document.getElementById('offer-active').value = offer && !offer.is_active ? 'false' : 'true';
        if (window.lucide) lucide.createIcons();
    },

    // HERO STATS (HOMEPAGE STAT COUNTERS)
    async loadStudioStats() {
        if (!window.HD_API || !window.HD_API.getStudioStats) return;
        try {
            const stats = await window.HD_API.getStudioStats();
            this.currentHeroStats = stats;
            const s1n = document.getElementById('dash-stat1-num');
            const s1l = document.getElementById('dash-stat1-label');
            const s2n = document.getElementById('dash-stat2-num');
            const s2l = document.getElementById('dash-stat2-label');
            const s3n = document.getElementById('dash-stat3-num');
            const s3l = document.getElementById('dash-stat3-label');
            const s4n = document.getElementById('dash-stat4-num');
            const s4l = document.getElementById('dash-stat4-label');

            if (s1n && stats.stat1_number) s1n.textContent = stats.stat1_number;
            if (s1l && stats.stat1_label) s1l.textContent = stats.stat1_label;
            if (s2n && stats.stat2_number) s2n.textContent = stats.stat2_number;
            if (s2l && stats.stat2_label) s2l.textContent = stats.stat2_label;
            if (s3n && stats.stat3_number) s3n.textContent = stats.stat3_number;
            if (s3l && stats.stat3_label) s3l.textContent = stats.stat3_label;
            if (s4n && stats.stat4_number) s4n.textContent = stats.stat4_number;
            if (s4l && stats.stat4_label) s4l.textContent = stats.stat4_label;
        } catch (e) {
            console.warn('Error loading studio stats:', e);
        }
    },

    async openHeroStatsModal() {
        if (!this.currentHeroStats && window.HD_API && window.HD_API.getStudioStats) {
            this.currentHeroStats = await window.HD_API.getStudioStats();
        }
        const s = this.currentHeroStats || {
            stat1_number: '1,800+', stat1_label: 'Active Members',
            stat2_number: '2 Floors', stat2_label: 'Spacious Arena',
            stat3_number: '15+', stat3_label: 'Elite Coaches',
            stat4_number: '100%', stat4_label: 'Results Driven'
        };

        const modal = document.getElementById('modal-hero-stats');
        if (modal) modal.classList.add('active');

        const el = id => document.getElementById(id);
        if (el('stat1-number-input')) el('stat1-number-input').value = s.stat1_number || '1,800+';
        if (el('stat1-label-input')) el('stat1-label-input').value = s.stat1_label || 'Active Members';
        if (el('stat2-number-input')) el('stat2-number-input').value = s.stat2_number || '2 Floors';
        if (el('stat2-label-input')) el('stat2-label-input').value = s.stat2_label || 'Spacious Arena';
        if (el('stat3-number-input')) el('stat3-number-input').value = s.stat3_number || '15+';
        if (el('stat3-label-input')) el('stat3-label-input').value = s.stat3_label || 'Elite Coaches';
        if (el('stat4-number-input')) el('stat4-number-input').value = s.stat4_number || '100%';
        if (el('stat4-label-input')) el('stat4-label-input').value = s.stat4_label || 'Results Driven';

        if (window.lucide) lucide.createIcons();
    },

    // EDIT ACTIONS
    async editClass(id) {
        const classes = await window.HD_API.getClasses();
        const cls = classes.find(c => String(c.id) === String(id));
        if (cls) this.openClassModal(cls);
    },

    async deleteClass(id) {
        if (confirm('Are you sure you want to delete this class?')) {
            const res = await window.HD_API.deleteClass(id);
            if (res.success) {
                this.showToast('Class deleted.', 'success');
                this.renderScheduleTable();
                this.loadDashboardStats();
            } else {
                this.showToast('Failed to delete class: ' + (res.error?.message || 'Error'), 'error');
            }
        }
    },

    async editProgram(id) {
        const progs = await window.HD_API.getPrograms();
        const prog = progs.find(p => String(p.id) === String(id));
        if (prog) this.openProgramModal(prog);
    },

    async deleteProgram(id) {
        if (confirm('Delete this fitness program?')) {
            const res = await window.HD_API.deleteProgram(id);
            if (res.success) {
                this.showToast('Program deleted.', 'success');
                this.renderProgramsGrid();
                this.loadDashboardStats();
            }
        }
    },

    async editCoach(id) {
        const coaches = await window.HD_API.getCoaches();
        const coach = coaches.find(c => String(c.id) === String(id));
        if (coach) this.openCoachModal(coach);
    },

    async deleteCoach(id) {
        if (confirm('Remove this coach?')) {
            const res = await window.HD_API.deleteCoach(id);
            if (res.success) {
                this.showToast('Coach removed.', 'success');
                this.renderCoachesGrid();
                this.loadDashboardStats();
            }
        }
    },

    async editPlan(id) {
        const plans = await window.HD_API.getPlans();
        const plan = plans.find(p => String(p.id) === String(id));
        if (plan) this.openPlanModal(plan);
    },

    async deletePlan(id) {
        if (confirm('Delete this membership plan?')) {
            const res = await window.HD_API.deletePlan(id);
            if (res.success) {
                this.showToast('Plan deleted.', 'success');
                this.renderPricingGrid();
            }
        }
    },

    async editOffer(id) {
        const offers = await window.HD_API.getOffers();
        const offer = offers.find(o => String(o.id) === String(id));
        if (offer) this.openOfferModal(offer);
    },

    async deleteOffer(id) {
        if (confirm('Delete this offer banner?')) {
            const res = await window.HD_API.deleteOffer(id);
            if (res.success) {
                this.showToast('Offer deleted.', 'success');
                this.renderOffersList();
                this.loadDashboardStats();
            }
        }
    },

    async toggleOfferActive(id, newState) {
        const res = await window.HD_API.saveOffer({ id, is_active: newState, show_top_banner: newState });
        if (res.success) {
            this.showToast(newState ? 'Offer activated on website banner!' : 'Offer paused.', 'success');
            this.renderOffersList();
            this.loadDashboardStats();
        }
    },

    async updateLeadStatus(id, newStatus) {
        const res = await window.HD_API.updateLeadStatus(id, newStatus);
        if (res.success) {
            this.showToast(`Lead marked as ${newStatus}`, 'success');
        }
    },

    async deleteLead(id) {
        if (confirm('Delete this lead record?')) {
            const res = await window.HD_API.deleteLead(id);
            if (res && (res.success || res === true)) {
                this.showToast('Lead deleted.', 'success');
                this.renderLeadsTable();
                this.loadDashboardStats();
            }
        }
    },

    exportLeadsCSV() {
        window.HD_API.getTrialBookings().then(leads => {
            if (!leads || leads.length === 0) {
                this.showToast('No leads to export.', 'error');
                return;
            }
            let csv = 'Full Name,Phone,Fitness Goal,Preferred Slot,Status,Date\n';
            leads.forEach(l => {
                csv += `"${l.full_name}","${l.phone}","${l.goal || ''}","${l.preferred_slot || ''}","${l.status || ''}","${l.created_at || ''}"\n`;
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `HD_Fitness_Leads_${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            this.showToast('Leads CSV exported successfully!', 'success');
        });
    },

    // FORM SUBMISSIONS
    setupFormSubmits() {
        // 1. Class
        document.getElementById('form-class')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('class-id').value;
            const data = {
                title: document.getElementById('class-title').value.trim(),
                day_of_week: document.getElementById('class-day').value,
                category: document.getElementById('class-category').value,
                start_time: document.getElementById('class-start').value.trim(),
                end_time: document.getElementById('class-end').value.trim(),
                coach_name: document.getElementById('class-coach').value.trim(),
                zone: document.getElementById('class-zone').value.trim(),
                capacity: parseInt(document.getElementById('class-capacity').value, 10) || 20,
                intensity: document.getElementById('class-intensity').value
            };
            if (id) data.id = id;

            try {
                const res = await window.HD_API.saveClass(data);
                if (res && res.success) {
                    this.showToast('Class saved successfully!', 'success');
                    this.closeAllModals();
                    this.renderScheduleTable();
                    this.loadDashboardStats();
                } else {
                    this.showToast('Error saving class: ' + (res?.error?.message || 'Save failed'), 'error');
                }
            } catch (err) {
                this.showToast('Error: ' + err.message, 'error');
            }
        });

        // 2. Program
        document.getElementById('form-program')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('prog-id').value;
            const features = document.getElementById('prog-features').value.split('\n').map(s => s.trim()).filter(Boolean);
            const data = {
                title: document.getElementById('prog-title').value.trim(),
                category: document.getElementById('prog-category').value.trim(),
                badge: document.getElementById('prog-badge').value.trim(),
                duration: document.getElementById('prog-duration').value.trim(),
                intensity: document.getElementById('prog-intensity').value.trim(),
                description: document.getElementById('prog-description').value.trim(),
                features: features,
                image_url: document.getElementById('prog-image').value.trim() || 'assets/images/zone_strength.png'
            };
            if (id) data.id = id;

            try {
                const res = await window.HD_API.saveProgram(data);
                if (res && res.success) {
                    this.showToast('Program saved!', 'success');
                    this.closeAllModals();
                    this.renderProgramsGrid();
                    this.loadDashboardStats();
                } else {
                    this.showToast('Error saving program: ' + (res?.error?.message || 'Save failed'), 'error');
                }
            } catch (err) {
                this.showToast('Error: ' + err.message, 'error');
            }
        });

        // 3. Coach
        document.getElementById('form-coach')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('coach-id').value;
            const data = {
                name: document.getElementById('coach-name').value.trim(),
                role: document.getElementById('coach-role').value.trim(),
                experience: document.getElementById('coach-experience').value.trim(),
                instagram: document.getElementById('coach-instagram').value.trim(),
                certifications: document.getElementById('coach-certifications').value.trim(),
                specialties: document.getElementById('coach-specialties').value.trim(),
                image_url: document.getElementById('coach-image').value.trim() || 'assets/images/trainer_head.png'
            };
            if (id) data.id = id;

            try {
                const res = await window.HD_API.saveCoach(data);
                if (res && res.success) {
                    this.showToast('Coach saved!', 'success');
                    this.closeAllModals();
                    this.renderCoachesGrid();
                    this.loadDashboardStats();
                } else {
                    this.showToast('Error saving coach: ' + (res?.error?.message || 'Save failed'), 'error');
                }
            } catch (err) {
                this.showToast('Error: ' + err.message, 'error');
            }
        });

        // 4. Plan
        document.getElementById('form-plan')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('plan-id').value;
            const features = document.getElementById('plan-features').value.split('\n').map(s => s.trim()).filter(Boolean);
            const data = {
                name: document.getElementById('plan-name').value.trim(),
                price_monthly: parseFloat(document.getElementById('plan-monthly').value) || 0,
                price_annual_monthly: parseFloat(document.getElementById('plan-annual').value) || 0,
                badge: document.getElementById('plan-badge').value.trim(),
                is_featured: document.getElementById('plan-featured').value === 'true',
                description: document.getElementById('plan-desc').value.trim(),
                features: features
            };
            if (id) data.id = id;

            try {
                const res = await window.HD_API.savePlan(data);
                if (res && res.success) {
                    this.showToast('Membership plan saved!', 'success');
                    this.closeAllModals();
                    this.renderPricingGrid();
                } else {
                    this.showToast('Error saving plan: ' + (res?.error?.message || 'Save failed'), 'error');
                }
            } catch (err) {
                this.showToast('Error: ' + err.message, 'error');
            }
        });

        // 5. Offer
        document.getElementById('form-offer')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('offer-id').value;
            const isActive = document.getElementById('offer-active').value === 'true';
            const data = {
                title: document.getElementById('offer-title').value.trim(),
                banner_text: document.getElementById('offer-banner').value.trim(),
                cta_text: document.getElementById('offer-cta').value.trim() || 'Claim Now →',
                cta_link: document.getElementById('offer-link').value.trim() || '#trial-modal',
                discount_code: document.getElementById('offer-code').value.trim(),
                discount_percentage: parseInt(document.getElementById('offer-discount').value, 10) || 0,
                valid_until: document.getElementById('offer-valid').value.trim(),
                is_active: isActive,
                show_top_banner: isActive
            };
            if (id) data.id = id;

            try {
                const res = await window.HD_API.saveOffer(data);
                if (res && res.success) {
                    this.showToast('Offer banner published!', 'success');
                    this.closeAllModals();
                    this.renderOffersList();
                    this.loadDashboardStats();
                } else {
                    this.showToast('Error saving offer: ' + (res?.error?.message || 'Save failed'), 'error');
                }
            } catch (err) {
                this.showToast('Error: ' + err.message, 'error');
            }
        });

        // 6. Hero Stats
        document.getElementById('form-hero-stats')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const payload = {
                stat1_number: document.getElementById('stat1-number-input').value.trim(),
                stat1_label: document.getElementById('stat1-label-input').value.trim(),
                stat2_number: document.getElementById('stat2-number-input').value.trim(),
                stat2_label: document.getElementById('stat2-label-input').value.trim(),
                stat3_number: document.getElementById('stat3-number-input').value.trim(),
                stat3_label: document.getElementById('stat3-label-input').value.trim(),
                stat4_number: document.getElementById('stat4-number-input').value.trim(),
                stat4_label: document.getElementById('stat4-label-input').value.trim()
            };

            try {
                const res = await window.HD_API.saveStudioStats(payload);
                if (res && res.success) {
                    this.showToast('Homepage hero stats updated successfully!', 'success');
                    this.closeAllModals();
                    this.loadStudioStats();
                } else {
                    this.showToast('Error updating hero stats: ' + (res?.error?.message || 'Save failed'), 'error');
                }
            } catch (err) {
                this.showToast('Error: ' + err.message, 'error');
            }
        });
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle' : 'alert-circle'}"></i>
      <span>${this.escape(message)}</span>
    `;
        container.appendChild(toast);
        if (window.lucide) lucide.createIcons();
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    escape(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
};
window.adminApp = adminApp;

document.addEventListener('DOMContentLoaded', () => {
    adminApp.init();
});
