/**
 * HD FITNESS STUDIO - INTERACTIVE CLIENT JAVASCRIPT
 * Est. 2022
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Mobile Drawer Navigation
  const menuToggle = document.getElementById('menuToggle');
  const drawerClose = document.getElementById('drawerClose');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openDrawer() {
    mobileDrawer.classList.add('active');
    drawerBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    menuToggle.setAttribute('aria-expanded', 'true');
  }

  function closeDrawer() {
    mobileDrawer.classList.remove('active');
    drawerBackdrop.classList.remove('active');
    document.body.style.overflow = '';
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  if (menuToggle) menuToggle.addEventListener('click', openDrawer);
  if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);
  drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));

  // 3. Dynamic Studio Operating Status
  function updateStudioLiveStatus() {
    const now = new Date();
    const day = now.getDay(); // 0 is Sunday
    const hour = now.getHours();
    const minute = now.getMinutes();
    const currentTime = hour + minute / 60;

    let isOpen = false;
    let timingText = '';
    let statusMsg = '';

    if (day === 0) { // Sunday: Closed
      timingText = 'Sunday: Closed';
      isOpen = false;
      statusMsg = 'Currently Closed • Closed on Sundays (Reopens Mon 5:00 AM)';
    } else { // Monday - Saturday: 5:00 AM - 12:00 PM & 3:00 PM - 10:00 PM
      timingText = 'Mon-Sat: 5:00 AM - 12:00 PM & 3:00 PM - 10:00 PM';
      const isMorning = (currentTime >= 5 && currentTime < 12);
      const isEvening = (currentTime >= 15 && currentTime < 22);
      isOpen = isMorning || isEvening;

      if (isMorning) {
        statusMsg = 'Open Now • Closes at 12:00 PM (Reopens 3:00 PM)';
      } else if (currentTime >= 12 && currentTime < 15) {
        statusMsg = 'Afternoon Break • Reopens at 3:00 PM';
      } else if (isEvening) {
        statusMsg = 'Open Now • Closes at 10:00 PM';
      } else if (currentTime < 5) {
        statusMsg = 'Currently Closed • Opens today at 5:00 AM';
      } else { // >= 22
        statusMsg = day === 6
          ? 'Currently Closed • Closed on Sundays (Reopens Mon 5:00 AM)'
          : 'Currently Closed • Reopens tomorrow at 5:00 AM';
      }
    }

    const liveOperatingText = document.getElementById('liveOperatingText');
    const liveOperatingChip = document.getElementById('liveOperatingChip');
    const drawerLiveStatus = document.getElementById('drawerLiveStatus');

    if (liveOperatingText) {
      liveOperatingText.textContent = statusMsg;
      if (liveOperatingChip) {
        if (isOpen) {
          liveOperatingChip.style.background = 'rgba(16, 185, 129, 0.15)';
          liveOperatingChip.style.color = '#34d399';
        } else {
          liveOperatingChip.style.background = 'rgba(239, 68, 68, 0.15)';
          liveOperatingChip.style.color = '#f87171';
        }
      }
    }

    if (drawerLiveStatus) {
      drawerLiveStatus.innerHTML = `
        <span class="${isOpen ? 'status-indicator-green' : 'status-indicator-red'}"></span>
        <span>${isOpen ? 'Open Now' : 'Closed'} &bull; ${timingText}</span>
      `;
    }
  }
  updateStudioLiveStatus();

  // 4. Interactive Schedule Timetable Data & Filtering
  const scheduleData = {
    mon: [
      { time: '06:00 AM - 07:00 AM', title: 'Morning Olympic Barbell Club', coach: 'Coach Rohan', category: 'Strength', spots: '4 spots left' },
      { time: '07:30 AM - 08:15 AM', title: 'Functional HIIT & Turf Sprint', coach: 'Coach Priya', category: 'HIIT', spots: '2 spots left' },
      { time: '06:00 PM - 07:00 PM', title: 'Hypertrophy Chest & Shoulders', coach: 'Coach Rohan', category: 'Bodybuilding', spots: '5 spots left' },
      { time: '07:30 PM - 08:30 PM', title: 'Endurance MetCon Conditioning', coach: 'Coach Priya', category: 'CrossFit', spots: '3 spots left' }
    ],
    tue: [
      { time: '06:30 AM - 07:15 AM', title: 'Core, Abs & Calisthenics', coach: 'Coach Priya', category: 'Agility', spots: '6 spots left' },
      { time: '07:30 AM - 08:30 AM', title: 'Powerlifting Squat & Deadlift Lab', coach: 'Coach Rohan', category: 'Strength', spots: 'Full' },
      { time: '06:30 PM - 07:15 PM', title: 'Battle Rope & Kettlebell Blast', coach: 'Coach Priya', category: 'HIIT', spots: '4 spots left' },
      { time: '07:45 PM - 08:45 PM', title: 'Heavy Back & Pull Mechanics', coach: 'Coach Rohan', category: 'Bodybuilding', spots: '7 spots left' }
    ],
    wed: [
      { time: '06:00 AM - 07:00 AM', title: 'Cardio Matrix & Sled Pushes', coach: 'Coach Priya', category: 'CrossFit', spots: '5 spots left' },
      { time: '07:30 AM - 08:15 AM', title: 'Functional Bodyweight Agility', coach: 'Coach Priya', category: 'Agility', spots: '3 spots left' },
      { time: '06:00 PM - 07:00 PM', title: 'Leg Day Annihilation (Quads & Hamstrings)', coach: 'Coach Rohan', category: 'Strength', spots: '2 spots left' },
      { time: '07:30 PM - 08:15 PM', title: 'Metabolic Fat Incinerator', coach: 'Coach Priya', category: 'HIIT', spots: '6 spots left' }
    ],
    thu: [
      { time: '06:30 AM - 07:15 AM', title: 'Mobility, Hip Opening & Prehab', coach: 'Coach Priya', category: 'Recovery', spots: '8 spots left' },
      { time: '07:30 AM - 08:30 AM', title: 'Bench Press & Upper Body Mechanics', coach: 'Coach Rohan', category: 'Strength', spots: '3 spots left' },
      { time: '06:30 PM - 07:15 PM', title: 'Tabata Combat & Agility Turf', coach: 'Coach Priya', category: 'HIIT', spots: '4 spots left' },
      { time: '07:30 PM - 08:30 PM', title: 'Arms & Shoulders Giant Sets', coach: 'Coach Rohan', category: 'Bodybuilding', spots: '5 spots left' }
    ],
    fri: [
      { time: '06:00 AM - 07:00 AM', title: 'Full Body Functional Strength', coach: 'Coach Rohan', category: 'Strength', spots: '3 spots left' },
      { time: '07:30 AM - 08:15 AM', title: 'HIIT Sprints & Plyometrics', coach: 'Coach Priya', category: 'HIIT', spots: '1 spot left' },
      { time: '06:00 PM - 07:00 PM', title: 'Friday Night Heavy Iron Club', coach: 'Coach Rohan', category: 'Powerlifting', spots: '4 spots left' },
      { time: '07:30 PM - 08:15 PM', title: 'Glutes, Core & Calisthenics', coach: 'Coach Priya', category: 'Agility', spots: '5 spots left' }
    ],
    sat: [
      { time: '07:00 AM - 08:00 AM', title: 'Saturday Turf War (Team CrossFit Challenge)', coach: 'Coach Rohan & Priya', category: 'Team Challenge', spots: '2 spots left' },
      { time: '08:30 AM - 09:30 AM', title: 'Olympic Clean & Snatch Clinic', coach: 'Coach Rohan', category: 'Strength', spots: '4 spots left' },
      { time: '05:30 PM - 06:30 PM', title: 'Full Body Hypertrophy Circuit', coach: 'Coach Rohan', category: 'Strength', spots: '6 spots left' },
      { time: '06:45 PM - 07:30 PM', title: 'Post-Workout Mobility & Core Flow', coach: 'Coach Priya', category: 'Recovery', spots: 'Open' }
    ],
    sun: []
  };

  const scheduleList = document.getElementById('scheduleList');
  const dayTabs = document.querySelectorAll('.day-tab');

  function renderSchedule(dayKey) {
    if (!scheduleList) return;
    const items = scheduleData[dayKey] || [];
    if (items.length === 0) {
      scheduleList.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 24px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px;">
          <i data-lucide="moon" style="width:36px; height:36px; color: var(--gold); margin-bottom: 12px; display:inline-block;"></i>
          <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 8px; color: #fff;">Studio Closed on Sundays</h3>
          <p style="color: var(--text-muted); max-width: 480px; margin: 0 auto; font-size: 0.95rem;">We take Sundays off for deep facility sanitization, equipment tuning, and rest. Normal operating hours resume Monday at 5:00 AM.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }
    scheduleList.innerHTML = items.map(item => `
      <div class="schedule-card">
        <div>
          <div class="sch-top">
            <span class="sch-time"><i data-lucide="clock" style="width:14px;height:14px;"></i> ${item.time}</span>
            <span class="sch-badge">${item.category}</span>
          </div>
          <h3 class="sch-title">${item.title}</h3>
          <p class="sch-coach">Lead: <strong>${item.coach}</strong></p>
        </div>
        <div class="sch-bot">
          <span class="sch-spots">${item.spots}</span>
          <button class="btn btn-primary btn-sm open-trial-modal" data-pref-class="${item.title}">Reserve</button>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
    attachModalTriggers();
  }

  dayTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      dayTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const day = tab.getAttribute('data-day');
      renderSchedule(day);
    });
  });

  // Render initial day based on current weekday
  const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const todayKey = daysOfWeek[new Date().getDay()] || 'mon';
  const initialActiveTab = document.querySelector(`.day-tab[data-day="${todayKey}"]`) || dayTabs[0];
  if (initialActiveTab) {
    dayTabs.forEach(t => t.classList.remove('active'));
    initialActiveTab.classList.add('active');
    initialActiveTab.setAttribute('aria-selected', 'true');
    renderSchedule(todayKey);
  }

  // 5. Interactive BMI & Calorie Target Calculator
  const bmiForm = document.getElementById('bmiForm');
  const calcResults = document.getElementById('calcResults');
  const genderPills = document.querySelectorAll('.gender-pill');

  genderPills.forEach(pill => {
    pill.addEventListener('click', () => {
      genderPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const radio = pill.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
    });
  });

  if (bmiForm) {
    bmiForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const gender = document.querySelector('input[name="gender"]:checked').value;
      const age = parseFloat(document.getElementById('calcAge').value);
      const height = parseFloat(document.getElementById('calcHeight').value); // cm
      const weight = parseFloat(document.getElementById('calcWeight').value); // kg
      const activity = parseFloat(document.getElementById('calcActivity').value);
      const goal = document.getElementById('calcGoal').value;

      if (!height || !weight || !age) return;

      // BMI Calculation: weight (kg) / (height (m) ^ 2)
      const heightInMeters = height / 100;
      const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);

      let bmiCategory = '';
      let badgeColor = '';
      if (bmi < 18.5) {
        bmiCategory = 'Underweight';
        badgeColor = '#38bdf8';
      } else if (bmi < 25) {
        bmiCategory = 'Normal Weight';
        badgeColor = '#34d399';
      } else if (bmi < 30) {
        bmiCategory = 'Overweight';
        badgeColor = '#fbbf24';
      } else {
        bmiCategory = 'Obese Range';
        badgeColor = '#f87171';
      }

      // BMR Calculation (Mifflin-St Jeor)
      let bmr = (10 * weight) + (6.25 * height) - (5 * age);
      if (gender === 'male') {
        bmr += 5;
      } else {
        bmr -= 161;
      }

      // TDEE
      let tdee = bmr * activity;

      // Adjust for Goal
      let targetCalories = Math.round(tdee);
      let goalRecommendation = '';

      if (goal === 'fat_loss') {
        targetCalories = Math.round(tdee - 500);
        goalRecommendation = `We recommend creating a moderate calorie deficit (~${targetCalories} kcal/day) with 3 strength training sessions + 2 HIIT sprint turf workouts at HD Fitness Studio.`;
      } else if (goal === 'muscle_gain') {
        targetCalories = Math.round(tdee + 350);
        goalRecommendation = `We recommend a clean caloric surplus (~${targetCalories} kcal/day) with progressive overload on our Olympic platforms and 4-5 focused hypertrophy splits.`;
      } else {
        goalRecommendation = `Maintain your baseline intake (~${targetCalories} kcal/day) while focusing on strength progression, mobility, and cardiovascular capacity.`;
      }

      // Protein recommendation: 2.0g per kg
      const dailyProtein = Math.round(weight * 2.0);

      // Render results
      document.getElementById('resBmiValue').textContent = bmi;
      const resBmiBadge = document.getElementById('resBmiBadge');
      resBmiBadge.textContent = bmiCategory;
      resBmiBadge.style.color = badgeColor;
      resBmiBadge.style.background = `${badgeColor}22`;

      document.getElementById('resCaloriesValue').textContent = targetCalories.toLocaleString();
      document.getElementById('resProteinValue').textContent = `${dailyProtein}g`;
      document.getElementById('resRecommendationText').textContent = goalRecommendation;

      calcResults.style.display = 'block';
      calcResults.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      showToast('Personalized fitness metrics calculated!');
    });
  }

  // 6. Pricing Duration Toggle (Monthly vs Annual)
  const pricingToggle = document.getElementById('pricingToggle');
  const lblMonthly = document.getElementById('lblMonthly');
  const lblAnnual = document.getElementById('lblAnnual');
  let isAnnual = false;

  if (pricingToggle) {
    pricingToggle.addEventListener('click', () => {
      isAnnual = !isAnnual;
      pricingToggle.classList.toggle('active', isAnnual);
      pricingToggle.setAttribute('aria-checked', isAnnual.toString());

      if (isAnnual) {
        lblAnnual.style.color = '#fbbf24';
        lblMonthly.style.color = '#94a3b8';
      } else {
        lblMonthly.style.color = '#fbbf24';
        lblAnnual.style.color = '#94a3b8';
      }

      const amounts = document.querySelectorAll('.plan-cost .amount');
      const billedNotes = document.querySelectorAll('.plan-billed-note');

      amounts.forEach(el => {
        const val = isAnnual ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');
        el.textContent = val;
      });

      billedNotes.forEach(el => {
        const note = isAnnual ? el.getAttribute('data-annual') : el.getAttribute('data-monthly');
        el.textContent = note;
      });

      showToast(isAnnual ? 'Switched to Annual Billing (35% OFF applied)' : 'Switched to Monthly Billing');
    });
  }

  // 7. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        faqItems.forEach(i => {
          i.classList.remove('active');
          const btn = i.querySelector('.faq-trigger');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          item.classList.add('active');
          trigger.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // 8. 1-Day Free Trial Modal & Booking Flow
  const trialModal = document.getElementById('trialModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const trialBookingForm = document.getElementById('trialBookingForm');
  const modalSuccessState = document.getElementById('modalSuccessState');
  const closeSuccessBtn = document.getElementById('closeSuccessBtn');
  const selectedPlanInput = document.getElementById('selectedPlanInput');

  function openModal(planName = '1-Day Free Trial') {
    if (!trialModal) return;
    if (selectedPlanInput) selectedPlanInput.value = planName;
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) {
      modalTitle.textContent = planName.includes('Trial')
        ? 'Claim Your Free 1-Day Trial Pass'
        : `Enroll in ${planName}`;
    }
    trialBookingForm.style.display = 'block';
    modalSuccessState.style.display = 'none';
    trialModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!trialModal) return;
    trialModal.style.display = 'none';
    document.body.style.overflow = '';
  }

  function attachModalTriggers() {
    const triggers = document.querySelectorAll('.open-trial-modal');
    triggers.forEach(trigger => {
      // Avoid duplicate event listener
      trigger.onclick = (e) => {
        e.preventDefault();
        const plan = trigger.getAttribute('data-plan') ||
          trigger.getAttribute('data-pref-class') ||
          '1-Day Free Trial';
        openModal(plan);
      };
    });
  }
  attachModalTriggers();

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (closeSuccessBtn) closeSuccessBtn.addEventListener('click', closeModal);
  if (trialModal) {
    trialModal.addEventListener('click', (e) => {
      if (e.target === trialModal) closeModal();
    });
  }

  // Handle Trial Booking Form Submission (Direct to Supabase -> Trial Leads)
  if (trialBookingForm) {
    trialBookingForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('trialName').value.trim();
      const phone = document.getElementById('trialPhone').value.trim();
      const goal = document.getElementById('trialGoal').value;
      const time = document.getElementById('trialTime').value;
      const plan = selectedPlanInput ? selectedPlanInput.value : '1-Day Free Trial';
      const submitBtn = document.getElementById('submitTrialBtn');

      if (!name || !phone) {
        showToast('Please enter your name and phone number');
        return;
      }

      // UI Loading state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i data-lucide="loader"></i> Reserving Your Pass...';
        if (window.lucide) lucide.createIcons();
      }

      try {
        const leadPayload = {
          full_name: name,
          phone: phone,
          goal: goal,
          preferred_slot: time,
          status: 'new',
          notes: `Booked via website (${plan})`
        };

        // Submit directly to Supabase trial_bookings table
        if (window.HD_API && (window.HD_API.createLead || window.HD_API.submitTrialBooking)) {
          const apiMethod = window.HD_API.createLead || window.HD_API.submitTrialBooking;
          await apiMethod.call(window.HD_API, leadPayload);
        }

        // Show success state in modal
        trialBookingForm.style.display = 'none';
        modalSuccessState.style.display = 'block';
        const detailP = document.getElementById('successMessageDetail');
        if (detailP) {
          detailP.textContent = `Great to have you on board, ${name}! Your free VIP trial pass has been registered in our studio system. Simply show your mobile number (${phone}) at the front desk when you arrive.`;
        }

        showToast('Trial pass booked successfully! Registered with HD Fitness Studio.', 'success');
        trialBookingForm.reset();
      } catch (err) {
        console.error('[HD Studio] Lead registration error:', err);
        showToast('Could not book trial pass. Please try again.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i data-lucide="sparkles"></i> Claim Free 1-Day Trial Pass';
          if (window.lucide) lucide.createIcons();
        }
      }
    });
  }

  // 9. Sync Dynamic Offer from Database to Top Announcement Bar
  if (window.HD_API && window.HD_API.getActiveOffer) {
    window.HD_API.getActiveOffer().then(offer => {
      if (offer && offer.is_active && offer.show_top_banner) {
        const topText = document.getElementById('topAnnouncementText');
        const topLink = document.getElementById('topAnnouncementLink');
        const topBar = document.getElementById('topAnnouncement');
        if (topText && offer.banner_text) {
          topText.innerHTML = offer.banner_text;
        }
        if (topLink) {
          if (offer.cta_text) topLink.textContent = offer.cta_text;
          if (offer.cta_link) topLink.href = offer.cta_link;
        }
        if (topBar) topBar.style.display = 'block';
      }
    }).catch(e => {
      console.warn('Could not sync dynamic offer banner', e);
    });
  }

  // 10. Sync Hero Stat Counters from Database
  if (window.HD_API && window.HD_API.getStudioStats) {
    window.HD_API.getStudioStats().then(stats => {
      if (stats) {
        const s1Num = document.getElementById('hero-stat-num-1');
        const s1Lbl = document.getElementById('hero-stat-label-1');
        const s2Num = document.getElementById('hero-stat-num-2');
        const s2Lbl = document.getElementById('hero-stat-label-2');
        const s3Num = document.getElementById('hero-stat-num-3');
        const s3Lbl = document.getElementById('hero-stat-label-3');
        const s4Num = document.getElementById('hero-stat-num-4');
        const s4Lbl = document.getElementById('hero-stat-label-4');

        if (s1Num && stats.stat1_number) s1Num.textContent = stats.stat1_number;
        if (s1Lbl && stats.stat1_label) s1Lbl.textContent = stats.stat1_label;
        if (s2Num && stats.stat2_number) s2Num.textContent = stats.stat2_number;
        if (s2Lbl && stats.stat2_label) s2Lbl.textContent = stats.stat2_label;
        if (s3Num && stats.stat3_number) s3Num.textContent = stats.stat3_number;
        if (s3Lbl && stats.stat3_label) s3Lbl.textContent = stats.stat3_label;
        if (s4Num && stats.stat4_number) s4Num.textContent = stats.stat4_number;
        if (s4Lbl && stats.stat4_label) s4Lbl.textContent = stats.stat4_label;
      }
    }).catch(e => {
      console.warn('[HD Studio] Stats sync fallback:', e);
    });
  }

  // 11. Toast Notification Helper
  function showToast(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
});
