import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { 
  Car, 
  Dumbbell, 
  Zap, 
  TreePine, 
  Flame, 
  Sparkles, 
  ShieldCheck, 
  HeartHandshake, 
  Home as HomeIcon,
  Play,
  CheckCircle2,
  Video,
  X,
  PhoneCall,
  ArrowRight
} from 'lucide-react';

export const Facilities = () => {
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [activeVideo, setActiveVideo] = useState({ title: '', desc: '' });

  useScrollReveal([]);

  const openVideoTour = (title, desc) => {
    setActiveVideo({ title, desc });
    setVideoModalOpen(true);
  };

  const officialFacilities = [
    {
      id: 1,
      title: '2 BHK & 1 BHK with Spacious Lobby',
      highlightBadge: 'PREMIUM FLATS',
      highlightType: 'amber',
      desc: 'Fully furnished luxury 1 BHK & 2 BHK apartments with massive halls, plush sofas, study areas, and open balconies.',
      videoAvailable: true,
      videoTitle: '1 BHK & 2 BHK Flat Walkthrough Video',
      icon: <HomeIcon className="w-6 h-6 text-amber-500" />,
      features: ['Spacious furnished lobby', 'Big common hall with sofa', 'Attached balconies & washrooms']
    },
    {
      id: 2,
      title: 'Free Auto From PG to LPU Gate Daily',
      highlightBadge: '100% FREE',
      highlightType: 'free',
      desc: 'Punctual morning auto drops to LPU gate and return evening pickup service with digital attendance poll on dashboard.',
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
      desc: 'Zero electricity charges during winter months (October to March). Huge savings for students with zero hidden charges.',
      videoAvailable: false,
      icon: <Zap className="w-6 h-6 text-emerald-600" />,
      features: ['6 full months free electricity', 'Zero hidden meter bills', 'Huge annual savings']
    },
    {
      id: 4,
      title: 'Free In-House Fitness Gym',
      highlightBadge: '100% FREE',
      highlightType: 'free',
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
      desc: 'We provide a large commercial/domestic empty LPG cylinder in every apartment kitchen. No expensive cylinder security deposits.',
      videoAvailable: false,
      icon: <Flame className="w-6 h-6 text-orange-500" />,
      features: ['Big cylinder provided', 'No security deposit needed', 'Dedicated kitchen setup']
    },
    {
      id: 6,
      title: 'Free Private Park for Games & Sports',
      highlightBadge: '100% FREE',
      highlightType: 'green',
      desc: 'Exclusive lush green private park right beside the PG building for cricket, badminton, volleyball, and morning jogging.',
      videoAvailable: true,
      videoTitle: 'Private Resident Park Video Tour',
      icon: <TreePine className="w-6 h-6 text-teal-600" />,
      features: ['Cricket & badminton ground', 'Jogging & walking track', 'Fresh green environment']
    },
    {
      id: 7,
      title: 'Free Daily Room Service & Cleaning',
      highlightBadge: '100% FREE',
      highlightType: 'free',
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
      desc: 'Located in an upscale, quiet, and highly secure family neighborhood. Peaceful study environment with 24/7 CCTV surveillance.',
      videoAvailable: false,
      icon: <HeartHandshake className="w-6 h-6 text-pink-600" />,
      features: ['Peaceful family surroundings', 'Strict safety & CCTV security', 'Warden & owner on-site']
    }
  ];

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

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto reveal">
        <span className="badge-glow-free mb-4">
          🔥 Sunil PG Official Inclusions
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight mt-2">
          Fully Furnished Rooms With Exceptional Facilities
        </h1>
        <p className="mt-4 text-base sm:text-lg text-gray-600">
          Everything designed for student comfort, parental peace of mind, and zero hidden costs.
        </p>
      </div>

      {/* 9 Facilities Grid with Glowing Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {officialFacilities.map((f, idx) => {
          const delayClass = idx % 3 === 0 ? 'delay-75' : idx % 3 === 1 ? 'delay-150' : 'delay-250';
          return (
          <div 
            key={f.id} 
            className={`bg-white rounded-3xl p-6 sm:p-7 border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group hover:-translate-y-1.5 reveal ${delayClass}`}
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-5">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
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
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
                      ✨ {f.highlightBadge}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-extrabold text-gray-900 mb-2 leading-snug">
                {f.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-5">
                {f.desc}
              </p>

              <ul className="space-y-2 mb-6 border-t border-gray-50 pt-4">
                {f.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              {f.videoAvailable ? (
                <button
                  onClick={() => openVideoTour(f.videoTitle, f.desc)}
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
                Enquire <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        );
      })}
      </div>

      {/* Premium Inclusions Grid */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-10 reveal reveal-scale">
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-gray-950 uppercase tracking-wider mb-2">
            🛋️ Big Hall & Room Appliances
          </span>
          <h2 className="text-3xl sm:text-4xl font-black">
            What Is Included Inside Every Room
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {roomSpecifications.map((spec, i) => (
            <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-amber-400/40 transition-colors">
              <div className="text-2xl mb-2">{spec.icon}</div>
              <h4 className="text-sm font-bold text-white">{spec.title}</h4>
              <p className="text-xs text-gray-400 mt-1">{spec.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 text-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">{activeVideo.title}</h3>
              </div>
              <button 
                onClick={() => setVideoModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80" 
                alt="Video Tour Preview" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-14 h-14 rounded-full bg-amber-400 text-gray-950 flex items-center justify-center shadow-xl mb-2">
                  <Play className="w-6 h-6 fill-gray-950 ml-1" />
                </div>
                <h4 className="text-base font-bold text-white">Full HD Video Tour Ready</h4>
                <p className="text-xs text-gray-300 mt-1">{activeVideo.desc}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <a
                href="https://wa.me/919876543210?text=Hello%20Sunil%20PG,%20please%20send%20me%20the%20video%20tour."
                target="_blank"
                rel="noreferrer"
                className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl"
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
      )}
    </div>
  );
};
