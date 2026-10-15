/**
 * HD FITNESS STUDIO - SUPABASE CLIENT & DATA LAYER
 * Handles connection, CRUD operations, and offline fallbacks.
 */

const DEFAULT_CONFIG = {
    // HD Fitness Studio primary Supabase project
    url: 'https://rxunwbwcgbcistubdngp.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4dW53YndjZ2JjaXN0dWJkbmdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3ODI2NzksImV4cCI6MjEwNzM1ODY3OX0.lKgK2bhasMEW7ETtt9WDBK4q4U3LC48A-HsHMZEpSoA',
    publishableKey: 'sb_publishable_J9apx2SEGcTeBTQZ643ogA_gW1gBHxL'
};

const SUPABASE_CONFIG = {
    url: DEFAULT_CONFIG.url,
    anonKey: DEFAULT_CONFIG.anonKey
};

// Initialize Supabase client
let supabaseClient = null;
function initSupabase(url = SUPABASE_CONFIG.url, key = SUPABASE_CONFIG.anonKey) {
    try {
        if (window.supabase) {
            supabaseClient = window.supabase.createClient(url, key);
            console.log('[HD Supabase] Client connected to:', url);
            return true;
        } else {
            console.warn('[HD Supabase] window.supabase not detected, using fallback.');
            return false;
        }
    } catch (err) {
        console.error('[HD Supabase] Initialization error:', err);
        return false;
    }
}
initSupabase();

// Authentication Layer
window.HD_AUTH = {
    async getSession() {
        if (!supabaseClient) return { session: null };
        try {
            const { data, error } = await supabaseClient.auth.getSession();
            if (error) throw error;
            return { session: data?.session || null };
        } catch (e) {
            console.warn('[HD_AUTH] getSession error:', e);
            return { session: null };
        }
    },

    async getUser() {
        if (!supabaseClient) return null;
        try {
            const { data, error } = await supabaseClient.auth.getUser();
            if (error) throw error;
            return data.user;
        } catch (e) {
            console.warn('[HD_AUTH] getUser error:', e);
            return null;
        }
    },

    async signIn(email, password) {
        if (!supabaseClient) throw new Error('Supabase client not initialized');
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: (email || '').trim(),
            password: password
        });
        if (error) throw error;
        return data;
    },

    async signUp() {
        throw new Error('Public registration is restricted. Contact studio administrator.');
    },

    async signOut() {
        if (!supabaseClient) return;
        const { error } = await supabaseClient.auth.signOut();
        if (error) console.warn('[HD_AUTH] signOut error:', error);
        return true;
    },

    onAuthStateChange(callback) {
        if (!supabaseClient) return { data: { subscription: { unsubscribe: () => { } } } };
        return supabaseClient.auth.onAuthStateChange((event, session) => {
            callback(event, session);
        });
    }
};

// Fallback seed data in case network is down or client offline
const HD_FALLBACKS = {
    coaches: [
        {
            id: 'coach-1',
            name: 'Vikram "Vick" Sharma',
            role: 'Head Strength & Conditioning Coach',
            specialties: 'Olympic Weightlifting, Hypertrophy, Athlete Prep',
            experience: '9+ Years',
            certifications: 'CSCS, NSCA, K-11 Master',
            image_url: 'assets/images/trainer_head.png',
            instagram: '@vick_hd_fitness',
            display_order: 1,
            is_active: true
        },
        {
            id: 'coach-2',
            name: 'Ananya Roy',
            role: 'Lead HIIT & Functional Performance',
            specialties: 'Metabolic Conditioning, Functional Turf, Fat Loss',
            experience: '6+ Years',
            certifications: 'ACE Certified, CrossFit L2',
            image_url: 'assets/images/trainer_coach.png',
            instagram: '@ananya_roy_fit',
            display_order: 2,
            is_active: true
        },
        {
            id: 'coach-3',
            name: 'Rahul Das',
            role: 'CrossFit & Mobility Specialist',
            specialties: 'Kettlebells, Movement Flow, Joint Prehab',
            experience: '5+ Years',
            certifications: 'CrossFit L1, FMS Level 2',
            image_url: 'assets/images/trainer_head.png',
            instagram: '@rahul_movement',
            display_order: 3,
            is_active: true
        }
    ],
    programs: [
        {
            id: 'prog-1',
            title: 'Hypertrophy & Strength',
            category: 'Strength & Conditioning',
            badge: 'Most Popular',
            description: 'Engineered compound lifting, periodized progression, and targeted muscle hypertrophy with competition-grade Eleiko bars.',
            features: ['Deadlift & Squat Platforms', 'Bilateral Barbell Work', 'Progressive Overload Tracking', 'Form Video Breakdown'],
            intensity: 'High',
            duration: '60 Mins',
            image_url: 'assets/images/zone_strength.png',
            display_order: 1,
            is_active: true
        },
        {
            id: 'prog-2',
            title: 'Metabolic HIIT & Turf',
            category: 'Endurance & Fat Loss',
            badge: 'High Intensity',
            description: 'Sprint intervals, battle ropes, prowler sled pushes, and plyometrics on our 30-meter high-friction turf field.',
            features: ['30m Functional Turf Arena', 'Prowler Sleds & Battle Ropes', 'Heart Rate Zone Tracking', 'Calorie Burn Maximizer'],
            intensity: 'Extreme',
            duration: '45 Mins',
            image_url: 'assets/images/zone_turf.png',
            display_order: 2,
            is_active: true
        },
        {
            id: 'prog-3',
            title: 'CrossFit WOD & Kettlebells',
            category: 'Functional Fitness',
            badge: 'All Levels',
            description: 'Constant functional variation across gymnastics, Olympic lifting, and metabolic conditioning in our open rig.',
            features: ['Custom Rogue Pull-up Rig', 'Competition Kettlebells', 'Daily WOD Leaderboard', 'Scalable for Beginners'],
            intensity: 'High',
            duration: '55 Mins',
            image_url: 'assets/images/hero_gym.png',
            display_order: 3,
            is_active: true
        },
        {
            id: 'prog-4',
            title: 'Athletic Conditioning & Core',
            category: 'Functional Fitness',
            badge: 'All Levels',
            description: 'Dynamic core work, mobility restoration, and calisthenic endurance circuits to maximize overall athletic output.',
            features: ['Core Stability & Rig Work', 'Kettlebell Movement Flows', 'Joint Prehab & Stretching', 'Active Movement Restoration'],
            intensity: 'Moderate',
            duration: '45 Mins',
            image_url: 'assets/images/wellness.png',
            display_order: 4,
            is_active: true
        }
    ],
    classes: [
        { id: 'c-1', title: 'Morning Barbell Strength', day_of_week: 'Monday', start_time: '06:30 AM', end_time: '07:30 AM', coach_name: 'Vikram Sharma', zone: 'Lifting Deck', capacity: 16, intensity: 'High', category: 'strength', is_active: true },
        { id: 'c-2', title: 'HIIT Turf Inferno', day_of_week: 'Monday', start_time: '08:00 AM', end_time: '08:45 AM', coach_name: 'Ananya Roy', zone: 'Turf Zone', capacity: 20, intensity: 'Extreme', category: 'hiit', is_active: true },
        { id: 'c-3', title: 'Evening CrossFit WOD', day_of_week: 'Monday', start_time: '06:30 PM', end_time: '07:30 PM', coach_name: 'Rahul Das', zone: 'CrossFit Rig', capacity: 18, intensity: 'Extreme', category: 'crossfit', is_active: true },
        { id: 'c-4', title: 'Mobility & Prehab Flow', day_of_week: 'Tuesday', start_time: '07:00 AM', end_time: '07:45 AM', coach_name: 'Rahul Das', zone: 'Recovery Area', capacity: 15, intensity: 'Moderate', category: 'mobility', is_active: true },
        { id: 'c-5', title: 'Olympic Clean & Snatch', day_of_week: 'Tuesday', start_time: '06:00 PM', end_time: '07:15 PM', coach_name: 'Vikram Sharma', zone: 'Lifting Deck', capacity: 12, intensity: 'High', category: 'strength', is_active: true },
        { id: 'c-6', title: 'Prowler Sled Cardio Blast', day_of_week: 'Wednesday', start_time: '07:00 AM', end_time: '07:50 AM', coach_name: 'Ananya Roy', zone: 'Turf Zone', capacity: 20, intensity: 'Extreme', category: 'hiit', is_active: true },
        { id: 'c-7', title: 'Deadlift Precision Clinic', day_of_week: 'Wednesday', start_time: '06:30 PM', end_time: '07:30 PM', coach_name: 'Vikram Sharma', zone: 'Lifting Deck', capacity: 14, intensity: 'High', category: 'strength', is_active: true },
        { id: 'c-8', title: 'CrossFit Engine & Rowers', day_of_week: 'Thursday', start_time: '06:30 AM', end_time: '07:30 AM', coach_name: 'Rahul Das', zone: 'CrossFit Rig', capacity: 18, intensity: 'High', category: 'crossfit', is_active: true },
        { id: 'c-9', title: 'Glute & Core Forge', day_of_week: 'Thursday', start_time: '06:00 PM', end_time: '06:50 PM', coach_name: 'Ananya Roy', zone: 'Functional Turf', capacity: 20, intensity: 'Moderate', category: 'strength', is_active: true },
        { id: 'c-10', title: 'Friday Heavy Compound PRs', day_of_week: 'Friday', start_time: '06:30 PM', end_time: '07:45 PM', coach_name: 'Vikram Sharma', zone: 'Lifting Deck', capacity: 16, intensity: 'Extreme', category: 'strength', is_active: true },
        { id: 'c-11', title: 'Saturday Super Turf Team Challenge', day_of_week: 'Saturday', start_time: '08:00 AM', end_time: '09:15 AM', coach_name: 'Vikram & Ananya', zone: 'Main Floor', capacity: 28, intensity: 'Extreme', category: 'hiit', is_active: true },
        { id: 'c-12', title: 'Saturday Mobility & Core Workshop', day_of_week: 'Saturday', start_time: '05:30 PM', end_time: '06:30 PM', coach_name: 'Rahul Das', zone: 'Main Floor', capacity: 18, intensity: 'Moderate', category: 'mobility', is_active: true }
    ],
    membership_plans: [
        {
            id: 'plan-1',
            name: 'Standard Pass',
            badge: '',
            price_monthly: 2499,
            price_annual_monthly: 1999,
            billing_period_text: 'per month',
            description: 'Full access to gym floor, cardio deck, and locker rooms during all operating hours.',
            features: ['Unlimited gym floor & strength arena access', 'Free 1-on-1 coach fitness induction', 'Locker room & high-pressure showers', 'Standard HD fitness mobile tracking', 'No long-term lock-in contract'],
            is_featured: false,
            display_order: 1,
            is_active: true
        },
        {
            id: 'plan-2',
            name: 'Pro Performance',
            badge: 'Most Popular',
            price_monthly: 3999,
            price_annual_monthly: 3199,
            billing_period_text: 'per month',
            description: 'Complete all-inclusive fitness package with group classes and functional turf arena.',
            features: ['Everything in Standard Pass', 'Unlimited HIIT, CrossFit & group classes', 'Functional turf & Olympic platform access', 'Monthly personalized coach consultation', 'Complimentary locker & shower access', 'Exclusive HD Athletic Tee upon signup'],
            is_featured: true,
            display_order: 2,
            is_active: true
        },
        {
            id: 'plan-3',
            name: 'VIP Elite Coaching',
            badge: 'VIP Exclusive',
            price_monthly: 6999,
            price_annual_monthly: 5599,
            billing_period_text: 'per month',
            description: 'Dedicated personal coach, bespoke nutrition programming, and priority floor support.',
            features: ['Everything in Pro Performance', '8x 1-on-1 Personal Training sessions / mo', 'Personalized macro & nutrition protocol', 'Priority locker & VIP booking privileges', 'Priority booking for workshops & events', 'Guaranteed body transformation timeline'],
            is_featured: false,
            display_order: 3,
            is_active: true
        }
    ],
    offers: [
        {
            id: 'offer-1',
            title: 'Silapathar Fitness Launch: Free 1-Day Trial Pass',
            banner_text: 'LIMITED PASSES: Claim your Free 1-Day Trial Pass this week!',
            cta_text: 'Claim Now →',
            cta_link: '#trial-modal',
            discount_code: 'HDFREE',
            discount_percentage: 100,
            valid_until: 'End of Month',
            is_active: true,
            show_top_banner: true
        }
    ]
};

// Data Layer API
window.HD_API = {
    // Test connection
    async checkConnection() {
        if (!supabaseClient) return { connected: false, error: 'Supabase client not loaded' };
        try {
            const { data, error } = await supabaseClient.from('offers').select('id').limit(1);
            if (error) throw error;
            return { connected: true, data };
        } catch (err) {
            return { connected: false, error: err.message };
        }
    },

    // COACHES
    async getCoaches() {
        if (!supabaseClient) return HD_FALLBACKS.coaches;
        try {
            const { data, error } = await supabaseClient
                .from('coaches')
                .select('*')
                .order('display_order', { ascending: true });
            if (error) throw error;
            return data && data.length > 0 ? data : HD_FALLBACKS.coaches;
        } catch (e) {
            console.warn('[HD_API] getCoaches error, using fallback:', e);
            return HD_FALLBACKS.coaches;
        }
    },

    async saveCoach(coach) {
        if (!supabaseClient) throw new Error('Supabase client not initialized');
        try {
            if (coach.id) {
                const { id, ...updates } = coach;
                const { data, error } = await supabaseClient
                    .from('coaches')
                    .update(updates)
                    .eq('id', id)
                    .select();
                if (error) throw error;
                return { success: true, data: data[0] };
            } else {
                const { data, error } = await supabaseClient
                    .from('coaches')
                    .insert(coach)
                    .select();
                if (error) throw error;
                return { success: true, data: data[0] };
            }
        } catch (err) {
            console.error('[HD_API] saveCoach error:', err);
            return { success: false, error: err };
        }
    },

    async upsertCoach(coach) {
        return this.saveCoach(coach);
    },

    async deleteCoach(id) {
        if (!supabaseClient) throw new Error('Supabase client not initialized');
        try {
            const { error } = await supabaseClient.from('coaches').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('[HD_API] deleteCoach error:', err);
            return { success: false, error: err };
        }
    },

    // PROGRAMS
    async getPrograms() {
        if (!supabaseClient) return HD_FALLBACKS.programs;
        try {
            const { data, error } = await supabaseClient
                .from('programs')
                .select('*')
                .order('display_order', { ascending: true });
            if (error) throw error;
            return data && data.length > 0 ? data : HD_FALLBACKS.programs;
        } catch (e) {
            console.warn('[HD_API] getPrograms error, using fallback:', e);
            return HD_FALLBACKS.programs;
        }
    },

    async saveProgram(prog) {
        if (!supabaseClient) throw new Error('Supabase client not initialized');
        try {
            if (prog.id) {
                const { id, ...updates } = prog;
                const { data, error } = await supabaseClient
                    .from('programs')
                    .update(updates)
                    .eq('id', id)
                    .select();
                if (error) throw error;
                return { success: true, data: data[0] };
            } else {
                const { data, error } = await supabaseClient
                    .from('programs')
                    .insert(prog)
                    .select();
                if (error) throw error;
                return { success: true, data: data[0] };
            }
        } catch (err) {
            console.error('[HD_API] saveProgram error:', err);
            return { success: false, error: err };
        }
    },

    async upsertProgram(prog) {
        return this.saveProgram(prog);
    },

    async deleteProgram(id) {
        if (!supabaseClient) throw new Error('Supabase client not initialized');
        try {
            const { error } = await supabaseClient.from('programs').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('[HD_API] deleteProgram error:', err);
            return { success: false, error: err };
        }
    },

    // CLASSES / SCHEDULE
    async getClasses(day = null) {
        if (!supabaseClient) {
            return day ? HD_FALLBACKS.classes.filter(c => c.day_of_week.toLowerCase() === day.toLowerCase()) : HD_FALLBACKS.classes;
        }
        try {
            let query = supabaseClient.from('classes').select('*').order('display_order', { ascending: true });
            if (day) query = query.eq('day_of_week', day);
            const { data, error } = await query;
            if (error) throw error;
            return data && data.length > 0 ? data : HD_FALLBACKS.classes.filter(c => !day || c.day_of_week.toLowerCase() === day.toLowerCase());
        } catch (e) {
            console.warn('[HD_API] getClasses error, using fallback:', e);
            return day ? HD_FALLBACKS.classes.filter(c => c.day_of_week.toLowerCase() === day.toLowerCase()) : HD_FALLBACKS.classes;
        }
    },

    async saveClass(classItem) {
        if (!supabaseClient) throw new Error('Supabase client not initialized');
        try {
            if (classItem.id) {
                const { id, ...updates } = classItem;
                const { data, error } = await supabaseClient
                    .from('classes')
                    .update(updates)
                    .eq('id', id)
                    .select();
                if (error) throw error;
                return { success: true, data: data[0] };
            } else {
                const { data, error } = await supabaseClient
                    .from('classes')
                    .insert(classItem)
                    .select();
                if (error) throw error;
                return { success: true, data: data[0] };
            }
        } catch (err) {
            console.error('[HD_API] saveClass error:', err);
            return { success: false, error: err };
        }
    },

    async upsertClass(classItem) {
        return this.saveClass(classItem);
    },

    async deleteClass(id) {
        if (!supabaseClient) throw new Error('Supabase client not initialized');
        try {
            const { error } = await supabaseClient.from('classes').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('[HD_API] deleteClass error:', err);
            return { success: false, error: err };
        }
    },

    // PRICING / PLANS
    async getPlans() {
        if (!supabaseClient) return HD_FALLBACKS.membership_plans;
        try {
            const { data, error } = await supabaseClient
                .from('membership_plans')
                .select('*')
                .order('display_order', { ascending: true });
            if (error) throw error;
            return data && data.length > 0 ? data : HD_FALLBACKS.membership_plans;
        } catch (e) {
            console.warn('[HD_API] getPlans error, using fallback:', e);
            return HD_FALLBACKS.membership_plans;
        }
    },

    async savePlan(plan) {
        if (!supabaseClient) throw new Error('Supabase client not initialized');
        try {
            if (plan.id) {
                const { id, ...updates } = plan;
                const { data, error } = await supabaseClient
                    .from('membership_plans')
                    .update(updates)
                    .eq('id', id)
                    .select();
                if (error) throw error;
                return { success: true, data: data[0] };
            } else {
                const { data, error } = await supabaseClient
                    .from('membership_plans')
                    .insert(plan)
                    .select();
                if (error) throw error;
                return { success: true, data: data[0] };
            }
        } catch (err) {
            console.error('[HD_API] savePlan error:', err);
            return { success: false, error: err };
        }
    },

    async upsertPlan(plan) {
        return this.savePlan(plan);
    },

    async deletePlan(id) {
        if (!supabaseClient) throw new Error('Supabase client not initialized');
        try {
            const { error } = await supabaseClient.from('membership_plans').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('[HD_API] deletePlan error:', err);
            return { success: false, error: err };
        }
    },

    // OFFERS / ANNOUNCEMENTS
    async getOffers() {
        if (!supabaseClient) return HD_FALLBACKS.offers;
        try {
            const { data, error } = await supabaseClient
                .from('offers')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data && data.length > 0 ? data : HD_FALLBACKS.offers;
        } catch (e) {
            console.warn('[HD_API] getOffers error, using fallback:', e);
            return HD_FALLBACKS.offers;
        }
    },

    async getActiveOffer() {
        const offers = await this.getOffers();
        return offers.find(o => o.is_active && o.show_top_banner) || offers[0] || null;
    },

    async saveOffer(offer) {
        if (!supabaseClient) throw new Error('Supabase client not initialized');
        try {
            if (offer.id) {
                const { id, ...updates } = offer;
                const { data, error } = await supabaseClient
                    .from('offers')
                    .update(updates)
                    .eq('id', id)
                    .select();
                if (error) throw error;
                return { success: true, data: data[0] };
            } else {
                const { data, error } = await supabaseClient
                    .from('offers')
                    .insert(offer)
                    .select();
                if (error) throw error;
                return { success: true, data: data[0] };
            }
        } catch (err) {
            console.error('[HD_API] saveOffer error:', err);
            return { success: false, error: err };
        }
    },

    async upsertOffer(offer) {
        return this.saveOffer(offer);
    },

    async deleteOffer(id) {
        if (!supabaseClient) throw new Error('Supabase client not initialized');
        try {
            const { error } = await supabaseClient.from('offers').delete().eq('id', id);
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('[HD_API] deleteOffer error:', err);
            return { success: false, error: err };
        }
    },

    // LEADS / TRIAL BOOKINGS
    async getLeads() {
        if (!supabaseClient) return [];
        try {
            const { data, error } = await supabaseClient
                .from('trial_bookings')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.warn('[HD_API] getLeads error:', e);
            return [];
        }
    },

    async getTrialBookings() {
        return this.getLeads();
    },

    async createLead(lead) {
        if (!supabaseClient) {
            console.warn('[HD_API] Offline lead capture:', lead);
            return { success: true, data: lead };
        }
        try {
            const { data, error } = await supabaseClient
                .from('trial_bookings')
                .insert([lead])
                .select();
            if (error) throw error;
            return { success: true, data: data ? data[0] : lead };
        } catch (e) {
            console.error('[HD_API] Error recording lead in Supabase:', e);
            throw e;
        }
    },

    async submitTrialBooking(booking) {
        return this.createLead(booking);
    },

    async updateLeadStatus(id, status, notes = null) {
        if (!supabaseClient) throw new Error('Supabase client not initialized');
        const updatePayload = { status };
        if (notes !== null) updatePayload.notes = notes;
        const { data, error } = await supabaseClient
            .from('trial_bookings')
            .update(updatePayload)
            .eq('id', id)
            .select();
        if (error) throw error;
        return data[0];
    },

    async deleteLead(id) {
        if (!supabaseClient) throw new Error('Supabase client not initialized');
        const { error } = await supabaseClient.from('trial_bookings').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    }
};
