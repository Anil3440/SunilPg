import React, { useState, useEffect } from 'react';
import { branchApi } from '../api';
import { MapPin, Phone, Check, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useScrollReveal } from '../hooks/useScrollReveal';

export const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    branchApi.getAll()
      .then(res => {
        if (res.data.success) setBranches(res.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  useScrollReveal([branches, loading]);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-12 reveal">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Explore Our PG Branches</h1>
        <p className="mt-3 text-gray-600">
          Strategically located near major transit points, universities, and commercial business districts.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {branches.map((branch, idx) => (
            <div 
              key={branch._id} 
              className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col hover:shadow-xl transition-all duration-300 reveal ${idx % 2 === 0 ? 'reveal-left' : 'reveal-right'}`}
            >
              <div className="h-64 overflow-hidden relative">
                <img
                  src={branch.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'}
                  alt={branch.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-4 left-4 bg-primary-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-xs font-semibold">
                  {branch.rentRange || 'Rent Range: ₹6,000 – ₹10,000'}
                </span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{branch.name}</h2>
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                    <MapPin className="w-4 h-4 text-primary-600 flex-shrink-0 mt-0.5" />
                    <span>{branch.address}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    {branch.description || 'Modern, clean, and fully furnished accommodation with complete student amenities.'}
                  </p>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <Check className="w-4 h-4 text-green-600" /> Daily Morning College Auto Service
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <Check className="w-4 h-4 text-green-600" /> Breakfast, Lunch & Dinner Included
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-700">
                      <Check className="w-4 h-4 text-green-600" /> High-speed Wi-Fi, CCTV, 24/7 Security
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-3">
                  <Link to="/contact" className="btn btn-primary flex-1 text-center justify-center">
                    Book a Visit <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

