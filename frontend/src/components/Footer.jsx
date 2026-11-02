import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-primary-600 text-white p-1.5 rounded-lg font-bold">SP</div>
              <span className="font-extrabold text-xl text-white">
                Sunil<span className="text-primary-400">PG</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Premium paying guest accommodation for students and young professionals across multiple convenient locations.
            </p>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition">Home</Link></li>
              <li><Link to="/branches" className="hover:text-white transition">Our Branches</Link></li>
              <li><Link to="/facilities" className="hover:text-white transition">Facilities & Amenities</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact & Enquiries</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Services</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Daily College Auto Service</li>
              <li>Nutritious 3-Time Meals</li>
              <li>High-speed Fiber Wi-Fi</li>
              <li>Digital Rent & Electricity Bills</li>
              <li>24/7 Power Backup & Security</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span>support@sunilpg.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>Chachoki Colony, Phagwara</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-xs text-center text-gray-500">
          <p>© {new Date().getFullYear()} Sunil PG Management. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

