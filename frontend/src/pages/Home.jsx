import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { branchApi } from '../api';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { 
  Building2, 
  Car, 
  Dumbbell, 
  Utensils, 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  ArrowRight, 
  Wifi, 
  Flame, 
  TreePine, 
  Sparkles, 
  Play, 
  X, 
  PhoneCall, 
  CheckCircle2, 
  Tv, 
  Coffee, 
  HeartHandshake, 
  Users, 
  Video, 
  Home as HomeIcon, 
  Clock, 
  MapPin, 
  Star,
  GraduationCap,
  Code2,
  Laptop,
  MessageCircle
} from 'lucide-react';

export const Home = () => {
  const [branches, setBranches] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState({ title: '', desc: '', tag: '' });

  // Load branches
  useEffect(() => {
    branchApi.getAll()
      .then(res => {
        if (res.data.success) setBranches(res.data.data);
      })
      .catch(console.error);
  }, []);

  // Hook to animate elements smoothly as the user scrolls
  useScrollReveal([branches]);

  // Premise Activities Slideshow Data (User can easily swap URLs with local PG photos)
  const activitySlides = [
    {
      id: 1,
      tag: 'Apartment Tour',
      title: 'Spacious 1 BHK & 2 BHK Apartments with Big Lobby',
      desc: 'Massive hall with modern sofa set, dining area, split AC, and sun-lit balconies for comfortable living.',
      image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      badge: '1BHK & 2BHK Available',
      videoText: 'See Video Tour of 2 BHK'
    },
    {
      id: 2,
      tag: 'Sports & Recreation',
      title: 'Free Private Park for Games & Evening Strolls',
      desc: 'Lush green private park right next to premises for cricket matches, badminton, jogging, and relaxation.',
      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80',
      badge: '100% Free for Residents',
      videoText: 'See Video of Resident Park'
    },
    {
      id: 3,
      tag: 'Fitness & Health',
      title: 'Free In-House Modern Fitness Gym',
      desc: 'Fully equipped workout area with cardio stations, free weights, and multi-gym equipment open daily.',
      image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=1200&q=80',
      badge: 'Zero Gym Fees',
      videoText: 'See Video of In-House Gym'
    },
    {
      id: 4,
      tag: 'College Commute',
      title: 'Free Auto Drop from PG to LPU Gate Daily',
      desc: 'Punctual morning auto drops and evening return rides directly from PG gates so you never miss a lecture.',
      image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
      badge: 'Daily LPU Gate Auto Drop',
      videoText: 'Watch Auto Commute Video'
    },
    {
      id: 5,
      tag: 'Resident Life & Festivals',
      title: 'Festive Celebrations & Weekend Community Gatherings',
      desc: 'Diwali feasts, Holi celebrations, birthday bashes, and community movie nights with like-minded students.',
      image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80',
      badge: 'Friendly Student Community',
      videoText: 'Watch Festival Celebrations'
    },
    {
      id: 6,
      tag: 'Hygienic Dining',
      title: 'Nutritious 3-Time Fresh Home-Style Meals',
      desc: 'Wholesome breakfast, lunch, and dinner prepared in clean certified kitchens with seasonal healthy menus.',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
      badge: '3-Times Daily Fresh Meals',
      videoText: 'Watch Kitchen & Dining Video'
    }
  ];

  // Auto-play slideshow every 4.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activitySlides.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused, activitySlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activitySlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + activitySlides.length) % activitySlides.length);
  };

  const openVideoTour = (title, desc, tag) => {
    setActiveVideo({ title, desc, tag });
    setVideoModalOpen(true);
  };

  // 9 Explicit Facilities with Glowing FREE Badges
  const officialFacilities = [
    {
      id: 1,
      title: '2 BHK & 1 BHK with Spacious Lobby',
      highlightBadge: 'SPACIOUS LIVING',
      highlightType: 'amber',
      glowText: 'PREMIUM FLATS',
      desc: 'Huge 1 BHK & 2 BHK apartments featuring a spacious common hall, luxury sofa set, study area, and airy balconies.',
      videoAvailable: true,
      videoTitle: '1 BHK & 2 BHK Flat Walkthrough Video',
      icon: <HomeIcon className="w-6 h-6 text-amber-500" />,
      features: ['Big furnished hall', 'Spacious lobby area', 'Attached balcony & washroom']
    },
    {
      id: 2,
      title: 'Free Auto From PG to LPU Gate Daily',
      highlightBadge: '100% FREE',
      highlightType: 'free',
      glowText: 'DAILY AUTO DROP',
      desc: 'Guaranteed morning pickup directly to LPU gate and return evening service. Digital daily attendance poll included.',
      videoAvailable: true,
      videoTitle: 'Daily LPU Gate Auto Service Video',
      icon: <Car className="w-6 h-6 text-purple-600" />,
      features: ['Morning drop to LPU Gate', 'Return college pickup', 'Online auto poll on dashboard']
    },
    {
      id: 3,
      title: 'Free Electricity from October to March',
      highlightBadge: '100% FREE',
      highlightType: 'green',
      glowText: 'OCTOBER TO MARCH',
      desc: 'Zero electricity charges during winter months (October through March). Save thousands on winter power bills.',
      videoAvailable: false,
      icon: <Zap className="w-6 h-6 text-emerald-600" />,
      features: ['6 full months free electricity', 'Zero hidden meter bills', 'Huge annual savings']
    },
    {
      id: 4,
      title: 'Free In-House Gym for Residents',
      highlightBadge: '100% FREE',
      highlightType: 'free',
      glowText: 'ZERO GYM FEES',
      desc: 'Modern on-premise fitness gym equipped with dumbbells, bench press, cardio stations, and multi-trainers.',
      videoAvailable: true,
      videoTitle: 'In-House Fitness Gym Tour Video',
      icon: <Dumbbell className="w-6 h-6 text-rose-600" />,
      features: ['Free daily gym access', 'Cardio & strength machines', 'Open morning & evening']
    },
    {
      id: 5,
      title: 'Free Big Gas Cylinder (Empty)',
      highlightBadge: '100% FREE',
      highlightType: 'free',
      glowText: 'GAS CYLINDER GIVEN',
      desc: 'We provide a large commercial/domestic empty LPG cylinder in every apartment kitchen. No expensive cylinder security deposits.',
      videoAvailable: false,
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      features: ['Big cylinder provided', 'No security deposit needed', 'Dedicated kitchen slab']
    },
    {
      id: 6,
      title: 'Free Private Park for Games & Sports',
      highlightBadge: '100% FREE',
      highlightType: 'green',
      glowText: 'SPORTS & GAMES PARK',
      desc: 'Exclusive lush green private park right beside the PG building for cricket, badminton, volleyball, and morning jogging.',
      videoAvailable: true,
      videoTitle: 'Private Resident Park Video Tour',
      icon: <TreePine className="w-6 h-6 text-teal-600" />,
      features: ['Cricket & badminton ground', 'Jogging & walking track', 'Fresh green environment']
    },
    {
      id: 7,
      title: 'Free Room Service & Housekeeping Daily',
      highlightBadge: '100% FREE',
      highlightType: 'free',
      glowText: 'DAILY ROOM SERVICE',
      desc: 'Professional housekeeping team cleans your rooms, halls, and washrooms daily so you can focus completely on your studies.',
      videoAvailable: false,
      icon: <Sparkles className="w-6 h-6 text-blue-500" />,
      features: ['Daily dusting & mopping', 'Sanitized washrooms', 'Garbage collection daily']
    },
    {
      id: 8,
      title: 'Zero Brokerage — Deal Direct with Owner',
      highlightBadge: 'ZERO BROKERAGE',
      highlightType: 'amber',
      glowText: 'NO AGENT COMMISSION',
      desc: 'Direct transparent deal directly with Sunil PG management. No broker fees, no commission agents, and no surprise charges.',
      videoAvailable: false,
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      features: ['100% direct owner contract', 'Save ₹5,000–₹10,000 broker fees', 'Transparent agreement']
    },
    {
      id: 9,
      title: "Every Parent's Favorite Place (Family Residential Area)",
      highlightBadge: '100% SAFE',
      highlightType: 'green',
      glowText: 'FAMILY RESIDENTIAL',
      desc: 'Located in an upscale, quiet, and highly secure family neighborhood. Peaceful study environment with 24/7 CCTV surveillance.',
      videoAvailable: false,
      icon: <HeartHandshake className="w-6 h-6 text-pink-600" />,
      features: ['Peaceful family surroundings', 'Strict safety & CCTV security', 'Warden & owner on-site']
    }
  ];

  // Premium Room & Big Hall Included Specifications
  const roomSpecifications = [
    { title: 'Split Air Conditioners (ACs)', icon: '❄️', desc: 'Powerful cooling in all bedrooms' },
    { title: 'High-Speed Fiber Wi-Fi', icon: '📶', desc: 'Unlimited gigabit internet coverage' },
    { title: 'Refrigerator (Freeze)', icon: '🧊', desc: 'Double door fridge for food & milk' },
    { title: 'Hot Water Geyser (Geezer)', icon: '🚿', desc: '24/7 instant hot water in washroom' },
    { title: '100% RO Filtered Water', icon: '💧', desc: 'Pure mineral drinking water on tap' },
    { title: 'Personal Wooden Almira', icon: '🚪', desc: 'Spacious lockable wardrobe storage' },
    { title: 'Ergonomic Chairs & Tables', icon: '🪑', desc: 'Dedicated comfortable study desk' },
    { title: 'Bed Set & Soft Mattresses', icon: '🛏️', desc: 'Thick orthopedic sleep mattress' },
    { title: 'High Air-Flow Ceiling Fans', icon: '💨', desc: 'Fitted in all rooms and big hall' },
    { title: 'Exide New Heavy Inverter', icon: '🔋', desc: '24/7 power backup for lights & fans' },
    { title: '24-Hours HD CCTV Security', icon: '🎥', desc: 'Constant surveillance & gate monitoring' },
    { title: 'Big Hall & Dining Area', icon: '🛋️', desc: 'Spacious lobby with sofas & dining table' },
  ];

  // 4 Core Student Creators & Developers from Lovely Professional University
  const creators = [
    {
      name: 'Anil Kumar Choudhary',
      role: 'Full Stack Engineer & Core Architect',
      degree: 'B.Tech CSE',
      university: 'Lovely Professional University',
      tag: 'Sunil PG Resident',
      initials: 'AK',
      image: '', // User can paste local photo path or URL here
      gradient: 'from-blue-600 to-indigo-600',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      skills: ['Full Stack', 'Node.js', 'React.js', 'System Architecture']
    },
    {
      name: 'Pratibha Banerjee',
      role: 'Frontend Architect & UI/UX Specialist',
      degree: 'B.Tech CSE',
      university: 'Lovely Professional University',
      tag: 'Sunil PG Resident',
      initials: 'PB',
      image: '',
      gradient: 'from-purple-600 to-pink-600',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      skills: ['UI/UX Design', 'Tailwind CSS', 'React.js', 'Frontend']
    },
    {
      name: 'Aditya Raj Pourush',
      role: 'Backend & Systems Engineer',
      degree: 'B.Tech CSE',
      university: 'Lovely Professional University',
      tag: 'Sunil PG Resident',
      initials: 'AR',
      image: '',
      gradient: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      skills: ['Backend APIs', 'Express.js', 'Database', 'Security']
    },
    {
      name: 'Sayan Nayek',
      role: 'Full Stack & Feature Engineer',
      degree: 'B.Tech CSE',
      university: 'Lovely Professional University',
      tag: 'Sunil PG Resident',
      initials: 'SN',
      image: '',
      gradient: 'from-emerald-600 to-teal-600',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      skills: ['Full Stack', 'REST APIs', 'React', 'Integration']
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen text-gray-900 overflow-x-hidden">
      {/* 1. HERO SECTION WITH LUXURY BACKGROUND SPANNING COMPLETE 1ST PAGE */}
      <section className="relative w-full h-[100dvh] min-h-[620px] flex flex-col justify-between text-white overflow-hidden">
        {/* Background Image with High Trust & Dark Gradient Overlay Spanning Complete 1st Page */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1920&q=80')` 
          }}
        />
        {/* Multilayer gradient for extreme readability & luxury mood */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-950/95 via-primary-900/85 to-indigo-950/90 backdrop-blur-[1px]" />
        
        {/* Decorative ambient glowing orbs */}
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Main Content (Properly Formatted 2-Column Balanced Grid Below Floating Navbar) */}
        <div className="flex-1 flex flex-col justify-center pt-22 sm:pt-24 lg:pt-26 pb-3 sm:pb-4 px-4 sm:px-6 lg:px-8 relative z-10 w-full max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center w-full">
            {/* Left Column: Clean, Editorial Left-Aligned Content */}
            <div className="lg:col-span-7 text-left space-y-3 sm:space-y-3.5">
              {/* Top Banner & Verified Location Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/40 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-xs font-black text-amber-300 tracking-wide uppercase">
                    ✨ Premium 1 & 2 BHK Living • 0% Brokerage
                  </span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-primary-100 font-bold shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Chachoki Colony, Near Choti Pulli, Phagwara</span>
                </div>
              </div>

              {/* Main Hero Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black tracking-tight leading-[1.12] text-white">
                Live Better, Study Smarter at <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 drop-shadow-sm">
                  Sunil PG & Apartments
                </span>
              </h1>

              {/* Subtext highlighting user's exact offerings */}
              <p className="max-w-xl text-sm sm:text-base lg:text-lg text-primary-100/90 font-medium leading-relaxed">
                Fully furnished luxury <strong>1 BHK & 2 BHK</strong> with spacious lobby, <strong>Free Auto to LPU gate</strong> daily, <strong>Free Electricity</strong> (Oct to Mar), <strong>Free Gym</strong>, <strong>Free Park</strong>, and <strong>Free Daily Room Service</strong>.
              </p>

              {/* Floating Trust Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="badge-glow-free">
                  🔥 Free LPU Auto Daily
                </span>
                <span className="badge-glow-green">
                  ⚡ Free Electricity (Oct–Mar)
                </span>
                <span className="badge-glow-purple">
                  🌳 Free Games Park & Gym
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                  👨‍👩‍👧‍👦 Family Residential Area
                </span>
              </div>

              {/* Hero CTAs */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1.5">
                <a 
                  href="https://wa.me/919876703899?text=Hello%20Sunil%20PG,%20I%20am%20interested%20in%20room%20inquiry%20and%20booking."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-xs sm:text-sm whitespace-nowrap border border-emerald-400/40 group"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-100 group-hover:scale-110 transition-transform fill-white/20" />
                  <span>Chat on WhatsApp</span>
                </a>

                <a 
                  href="#facilities-section"
                  className="px-5 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-gray-950 font-black rounded-xl shadow-lg hover:shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-1.5 text-xs sm:text-sm whitespace-nowrap"
                >
                  Explore 9 Free Facilities <ArrowRight className="w-4 h-4" />
                </a>
                
                <button
                  onClick={() => openVideoTour('Sunil PG Campus & 2 BHK Video Tour', 'Take an inside walkthrough of our spacious hall, split AC rooms, gym, and park.', 'Virtual Walkthrough')}
                  className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl border border-white/30 backdrop-blur-md transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm group whitespace-nowrap"
                >
                  <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400 group-hover:scale-110 transition-transform" />
                  Video Tour
                </button>

                <Link 
                  to="/register" 
                  className="px-4 py-3 bg-primary-700/80 hover:bg-primary-600 text-white font-bold rounded-xl border border-primary-400/30 transition text-xs sm:text-sm whitespace-nowrap"
                >
                  Register
                </Link>
              </div>
            </div>

            {/* Right Column: Glassmorphic Campus Preview & Feature Snapshot */}
            <div className="lg:col-span-5 hidden lg:block relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 to-primary-600/30 rounded-3xl blur-xl group-hover:blur-2xl transition duration-500" />
              
              <div className="relative rounded-3xl bg-slate-900/75 backdrop-blur-xl border border-white/20 p-5 shadow-2xl space-y-3.5 text-left">
                <div className="flex items-start justify-between pb-3 border-b border-white/10 gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Verified Living Near LPU</span>
                    <h3 className="text-base font-black text-white">Sunil PG & Flats</h3>
                    <p className="text-[11px] text-gray-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      Chachoki Colony, Near Choti Pulli, Phagwara
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 flex-shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Admissions Open
                  </span>
                </div>

                {/* 4 Quick Highlights */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <Car className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="font-semibold text-gray-200">Free Daily Auto</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="font-semibold text-gray-200">Free Electricity</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-rose-400 flex-shrink-0" />
                    <span className="font-semibold text-gray-200">In-House Gym</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <HomeIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="font-semibold text-gray-200">1 & 2 BHK Lobby</span>
                  </div>
                </div>

                {/* Video Walkthrough Trigger */}
                <button
                  onClick={() => openVideoTour('Sunil PG Campus & 2 BHK Video Tour', 'Take an inside walkthrough of our spacious hall, split AC rooms, gym, and park.', 'Virtual Walkthrough')}
                  className="w-full p-3 rounded-xl bg-gradient-to-r from-amber-400/20 to-amber-500/10 hover:from-amber-400/30 hover:to-amber-500/20 border border-amber-400/40 flex items-center justify-between transition-all group/btn"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber-400 text-gray-950 flex items-center justify-center font-bold shadow-md group-hover/btn:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-gray-950 ml-0.5" />
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black text-white block">See Video Tour</span>
                      <span className="text-[10px] text-amber-200">Hall, Split AC, Gym & Park Tour</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-300 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>

                {/* Trust Badge Footer with Direct Call Action */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-gray-400">
                  <a 
                    href="tel:+919876703899"
                    className="flex items-center gap-1.5 text-amber-300 hover:text-amber-200 font-bold transition"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Call: 98767 03899</span>
                  </a>
                  <span className="text-emerald-400 font-bold">0% Brokerage</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 pt-4 mt-3 w-full border-t border-white/10 text-left reveal reveal-scale">
            <div className="p-2 sm:p-2.5 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="text-xl sm:text-2xl font-black text-amber-400 block leading-tight">500+</span>
              <span className="text-[11px] sm:text-xs text-primary-200">Happy LPU Residents</span>
            </div>
            <div className="p-2 sm:p-2.5 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="text-xl sm:text-2xl font-black text-emerald-400 block leading-tight">0%</span>
              <span className="text-[11px] sm:text-xs text-primary-200">Brokerage Guarantee</span>
            </div>
            <div className="p-2 sm:p-2.5 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="text-xl sm:text-2xl font-black text-purple-400 block leading-tight">100% Free</span>
              <span className="text-[11px] sm:text-xs text-primary-200">Daily LPU Gate Auto</span>
            </div>
            <div className="p-2 sm:p-2.5 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="text-xl sm:text-2xl font-black text-yellow-300 block leading-tight">4.9 / 5</span>
              <span className="text-[11px] sm:text-xs text-primary-200">Rated by Parents</span>
            </div>
          </div>
        </div>

        {/* 2. CONTINUOUS SCROLLING MARQUEE BANNER DOCKED RIGHT AT FIRST SCREEN FOOTER */}
        <div className="w-full relative z-20 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-gray-950 py-2.5 sm:py-3 overflow-hidden shadow-2xl font-black text-xs sm:text-sm tracking-wider uppercase border-y border-amber-300 flex-shrink-0">
          <div className="animate-marquee flex items-center space-x-8 whitespace-nowrap">
            <span className="flex items-center gap-2">🔥 Free Auto to LPU Gate Daily</span>
            <span className="text-amber-800">•</span>
            <span className="flex items-center gap-2">⚡ Free Electricity Oct to March</span>
            <span className="text-amber-800">•</span>
            <span className="flex items-center gap-2">🏋️ Free In-House Fitness Gym</span>
            <span className="text-amber-800">•</span>
            <span className="flex items-center gap-2">🌳 Free Private Park for Games & Sports</span>
            <span className="text-amber-800">•</span>
            <span className="flex items-center gap-2">🍳 Free Big Gas Cylinder Given</span>
            <span className="text-amber-800">•</span>
            <span className="flex items-center gap-2">🧹 Free Daily Room Service & Cleaning</span>
            <span className="text-amber-800">•</span>
            <span className="flex items-center gap-2">🚫 100% Zero Brokerage</span>
            <span className="text-amber-800">•</span>
            <span className="flex items-center gap-2">👨‍👩‍👧‍👦 Family Residential Area • Parents #1 Choice</span>
            <span className="text-amber-800">•</span>
            <span className="flex items-center gap-2">🛋️ Luxury 1 BHK & 2 BHK with Big Hall</span>
            <span className="text-amber-800">•</span>
          </div>
        </div>
      </section>

      {/* 3. AUTO-PLAYING PREMISES & ACTIVITIES SLIDESHOW */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 reveal">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-100 text-primary-800 mb-3">
            📸 Life Inside Sunil PG
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
            See Our Premises & Resident Activities
          </h2>
          <p className="mt-3 text-base text-gray-600">
            Explore our spacious rooms, park tournaments, fitness workouts, festive celebrations, and campus drops.
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border border-gray-100 group reveal reveal-scale delay-150"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Slide Image & Content */}
          <div className="relative h-[420px] sm:h-[520px] lg:h-[580px] w-full overflow-hidden">
            {activitySlides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000"
                />
                
                {/* Gradient Overlays for readable text */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />

                {/* Slide Caption Box */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-12 text-white max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-400 text-gray-950 uppercase tracking-wider">
                      {slide.tag}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                      {slide.badge}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2 leading-tight">
                    {slide.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-200 line-clamp-2 sm:line-clamp-3 mb-4">
                    {slide.desc}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => openVideoTour(slide.title, slide.desc, slide.tag)}
                      className="btn bg-white hover:bg-gray-100 text-gray-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2"
                    >
                      <Play className="w-4 h-4 text-amber-500 fill-amber-500" />
                      {slide.videoText}
                    </button>
                    <a
                      href="#facilities-section"
                      className="btn bg-white/20 hover:bg-white/30 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-white/20 backdrop-blur-sm"
                    >
                      View Facility Details
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={handlePrevSlide}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleNextSlide}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-2xl bg-black/40 hover:bg-black/70 text-white border border-white/20 backdrop-blur-md flex items-center justify-center transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Progress Indicators & Dots */}
          <div className="absolute bottom-4 right-6 z-20 flex items-center gap-2">
            {activitySlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full h-2.5 ${
                  idx === currentSlide ? 'w-8 bg-amber-400' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE 9 OFFICIAL FACILITIES WITH GLOWING FREE BADGES */}
      <section id="facilities-section" className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <span className="badge-glow-free mb-4">
              🔥 100% Free Included Amenities
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
              Fully Furnished Rooms With Exceptional Facilities
            </h2>
            <p className="mt-4 text-base sm:text-lg text-gray-600">
              No hidden charges. Enjoy free daily college transport, free winter electricity, free gym, park, and housekeeping.
            </p>
          </div>

          {/* 9 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {officialFacilities.map((f, idx) => {
              const delayClass = idx % 3 === 0 ? 'delay-75' : idx % 3 === 1 ? 'delay-150' : 'delay-250';
              return (
              <div 
                key={f.id} 
                className={`bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group hover:-translate-y-1.5 reveal ${delayClass}`}
              >
                <div>
                  {/* Card Header with Glowing Badge */}
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 group-hover:scale-110 transition-transform">
                      {f.icon}
                    </div>

                    {/* Shouting Glowing Free Badge */}
                    <div>
                      {f.highlightType === 'free' ? (
                        <span className="badge-glow-free">
                          🔥 {f.highlightBadge}
                        </span>
                      ) : f.highlightType === 'green' ? (
                        <span className="badge-glow-green">
                          ⚡ {f.highlightBadge}
                        </span>
                      ) : (
                        <span className="badge-glow-amber inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
                          ✨ {f.highlightBadge}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2 leading-snug">
                    {f.title}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-5">
                    {f.desc}
                  </p>

                  {/* Key bullet perks */}
                  <ul className="space-y-2 mb-6 border-t border-gray-50 pt-4">
                    {f.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card Action: Watch Video Button if requested by user */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  {f.videoAvailable ? (
                    <button
                      onClick={() => openVideoTour(f.videoTitle, f.desc, f.title)}
                      className="text-xs font-extrabold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 border border-amber-200"
                    >
                      <Play className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
                      See Video Tour
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                      Guaranteed Facility
                    </span>
                  )}

                  <Link 
                    to="/contact" 
                    className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    Enquire <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
          </div>
        </div>
      </section>

      {/* 5. PREMIUM ROOM SPECIFICATIONS (BIG HALL, SPLIT AC, INVERTER, WIFI, ETC.) */}
      <section className="py-20 bg-slate-900 text-white px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 reveal">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-gray-950 uppercase tracking-wider mb-3">
              🛋️ Premium Room Inclusions
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
              What Is Included In Your Room & Big Hall
            </h2>
            <p className="mt-3 text-base text-gray-300">
              Move in with your bags. Every flat is loaded with brand-new appliances, power backup, study setups, and furniture.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {roomSpecifications.map((spec, i) => {
              const delayClass = (i % 4 === 0) ? 'delay-75' : (i % 4 === 1) ? 'delay-150' : (i % 4 === 2) ? 'delay-200' : 'delay-300';
              return (
              <div 
                key={i} 
                className={`p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm transition-all duration-300 hover:border-amber-400/40 group reveal reveal-scale ${delayClass}`}
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {spec.icon}
                </div>
                <h4 className="text-base font-extrabold text-white mb-1 group-hover:text-amber-300 transition-colors">
                  {spec.title}
                </h4>
                <p className="text-xs text-gray-400">
                  {spec.desc}
                </p>
              </div>
            );
          })}
          </div>

          {/* Quick Notice Banner on Hall & Inverter */}
          <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-primary-900/60 to-indigo-900/60 border border-primary-500/30 flex flex-col md:flex-row items-center justify-between gap-4 reveal reveal-scale delay-150">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-amber-400 text-gray-950 rounded-xl font-bold">
                ⚡
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  24/7 Exide Heavy Duty Inverter Power Backup + 24 Hours CCTV
                </h4>
                <p className="text-xs text-gray-300">
                  Never suffer through summer electricity cuts or Wi-Fi interruptions during study and exam time.
                </p>
              </div>
            </div>
            <Link 
              to="/branches"
              className="btn bg-amber-400 hover:bg-amber-500 text-gray-950 font-black text-xs sm:text-sm px-5 py-2.5 rounded-xl whitespace-nowrap"
            >
              Check Availability Across Branches
            </Link>
          </div>
        </div>
      </section>

      {/* 6. OUR BRANCHES PREVIEW */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 reveal">
          <div>
            <span className="text-xs font-bold text-primary-600 uppercase tracking-wider block mb-1">
              Locations & Properties
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              Sunil PG Branches Near LPU
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Conveniently located in peaceful residential neighborhoods with free auto drops right to the university gate.
            </p>
          </div>
          <Link to="/branches" className="mt-4 md:mt-0 text-primary-600 font-bold flex items-center gap-1 hover:text-primary-700">
            View All Branches & Pricing <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {branches.map((b, idx) => (
            <div 
              key={b._id} 
              className={`bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-300 reveal ${idx % 2 === 0 ? 'reveal-left' : 'reveal-right'}`}
            >
              <div className="h-60 bg-gray-200 overflow-hidden relative">
                <img 
                  src={b.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'} 
                  alt={b.name} 
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-primary-700 font-black px-3.5 py-1.5 rounded-full text-xs shadow-md">
                  {b.rentRange || 'Affordable Pricing'}
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="badge-glow-free">
                    🔥 Free Daily LPU Auto
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{b.name}</h3>
                  <p className="text-xs text-primary-600 font-semibold mt-1 mb-3 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" /> {b.address}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{b.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500">
                    1 BHK & 2 BHK Available
                  </span>
                  <Link to="/contact" className="btn bg-primary-50 text-primary-700 hover:bg-primary-100 text-xs font-bold py-2 px-4 rounded-xl">
                    Book Room Visit
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6.5 CREATORS / ENGINEERING TEAM SHOWCASE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3.5 reveal reveal-slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase bg-primary-50 text-primary-700 border border-primary-200/80 shadow-sm">
            <Laptop className="w-3.5 h-3.5 text-primary-600" />
            <span>Built by Students • Powered by Innovation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
            Meet the Creators Behind This Platform
          </h2>

          <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
            Crafted with passion, modern architecture, and first-hand hostel experience by B.Tech Computer Science & Engineering students at <span className="font-semibold text-primary-700">Lovely Professional University</span>, who live right here as residents of <span className="font-semibold text-primary-700">Sunil PG</span>.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {creators.map((creator, index) => (
            <div 
              key={creator.name}
              className={`group relative bg-white rounded-3xl p-6 border border-gray-200/80 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between overflow-hidden reveal reveal-slide-up delay-${(index + 1) * 75}`}
            >
              {/* Subtle top ambient accent banner */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${creator.gradient}`} />

              <div>
                {/* Photo / Initials Placeholder Frame */}
                <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 rounded-2xl p-1 bg-gradient-to-tr from-slate-200 via-primary-200 to-amber-200 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  {creator.image ? (
                    <img 
                      src={creator.image} 
                      alt={creator.name} 
                      className="w-full h-full object-cover rounded-xl shadow-sm"
                    />
                  ) : (
                    <div className={`w-full h-full rounded-xl bg-gradient-to-br ${creator.gradient} flex flex-col items-center justify-center text-white shadow-sm relative overflow-hidden select-none`}>
                      <span className="text-2xl font-black tracking-wider drop-shadow-md">
                        {creator.initials}
                      </span>
                      <span className="text-[10px] font-bold text-amber-200 uppercase tracking-widest mt-0.5">
                        Photo
                      </span>
                    </div>
                  )}

                  {/* PG Resident Mini Badge on Avatar */}
                  <span className="absolute -bottom-1.5 -right-1.5 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-full shadow-md flex items-center gap-1 border-2 border-white">
                    <HomeIcon className="w-2.5 h-2.5" />
                    Resident
                  </span>
                </div>

                {/* Name & Role */}
                <div className="text-center mt-4 space-y-1">
                  <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-primary-600 transition-colors tracking-tight">
                    {creator.name}
                  </h3>
                  <p className="text-xs font-semibold text-primary-700">
                    {creator.role}
                  </p>
                </div>

                {/* Education and Resident Badges */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    <Code2 className="w-3 h-3 text-blue-600" />
                    {creator.degree}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    {creator.tag}
                  </span>
                </div>

                {/* University Info */}
                <div className="mt-3.5 pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-600 font-medium text-center">
                  <GraduationCap className="w-4 h-4 text-primary-600 shrink-0" />
                  <span>{creator.university}</span>
                </div>

                <div className="flex items-center justify-center gap-1 text-[11px] text-gray-400 mt-1">
                  <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>Sunil PG & Flats, Phagwara</span>
                </div>
              </div>

              {/* Skills / Tech Tags */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                <div className="flex flex-wrap justify-center gap-1">
                  {creator.skills.map((skill) => (
                    <span 
                      key={skill}
                      className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. BOTTOM HIGH-TRUST CALL TO ACTION */}
      <section className="bg-gradient-to-r from-primary-900 via-primary-800 to-indigo-950 text-white py-16 px-4 sm:px-6 lg:px-8 my-12 max-w-7xl mx-auto rounded-3xl text-center shadow-2xl relative overflow-hidden reveal reveal-scale">
        <div className="max-w-2xl mx-auto relative z-10 space-y-6">
          <span className="badge-glow-free">
            🔥 Instant Booking Open For New Semester
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Reserve Your Dream Room with 0% Brokerage
          </h2>

          <p className="text-primary-100 text-sm sm:text-base leading-relaxed">
            Every parent's preferred choice due to peaceful family surroundings, 24/7 power backup, free daily auto service, and fresh meals.
          </p>

          <div className="flex flex-wrap justify-center gap-3.5 pt-2">
            <Link 
              to="/register" 
              className="px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-gray-950 font-black rounded-xl transition text-sm sm:text-base shadow-lg"
            >
              Create Student Account
            </Link>
            
            <a 
              href="tel:+919876703899" 
              className="px-7 py-3.5 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition text-sm sm:text-base flex items-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-emerald-600" />
              Call Owner: 9876703899
            </a>

            <Link 
              to="/login" 
              className="px-7 py-3.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl border border-white/20 transition text-sm sm:text-base"
            >
              Existing Resident Login
            </Link>
          </div>
        </div>
      </section>

      {/* 8. VIDEO TOUR MODAL (See Video Feature) */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-400 text-gray-950 rounded-xl">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{activeVideo.title}</h3>
                  <span className="text-xs text-amber-300 font-medium">{activeVideo.tag} • Sunil PG Walkthrough</span>
                </div>
              </div>
              <button 
                onClick={() => setVideoModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Preview Container */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center group">
              <img 
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80" 
                alt="Video Tour Preview" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-400 text-gray-950 flex items-center justify-center shadow-2xl mb-3 group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 fill-gray-950 ml-1" />
                </div>
                <h4 className="text-lg font-extrabold text-white">Full HD Video Walkthrough Ready</h4>
                <p className="text-xs text-gray-300 max-w-md mt-1">
                  {activeVideo.desc || 'Explore our fully furnished 1 BHK & 2 BHK apartments, in-house gym, and private games park.'}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-xs text-gray-400">
                Want this walkthrough sent to your WhatsApp?
              </span>
              <div className="flex items-center gap-2">
                <a
                  href="https://wa.me/919876703899?text=Hello%20Sunil%20PG,%20please%20send%20me%20the%20video%20tour%20of%201BHK/2BHK%20rooms."
                  target="_blank"
                  rel="noreferrer"
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5"
                >
                  Get Video on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="btn bg-white/10 hover:bg-white/20 text-white text-xs py-2 px-4 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
