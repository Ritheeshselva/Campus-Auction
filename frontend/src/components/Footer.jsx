import React from 'react';
import { ShieldCheck, MapPin, Sparkles, Heart } from 'lucide-react';

const Footer = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                CB
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CampusBid</span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              A simple campus auction demo for browsing items, placing bids, and creating listings.
            </p>
            <div className="flex items-center gap-4 mt-4 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> Demo student accounts
              </span>
              <span className="flex items-center gap-1 text-indigo-400">
                <MapPin className="w-4 h-4" /> Sample campus items
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Safe Campus Zones
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Browse sample items</li>
              <li>• Try a demo bid</li>
              <li>• Create a sample listing</li>
              <li>• Switch demo students</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>• Login and registration</li>
              <li>• Auction browsing</li>
              <li>• Simple bidding</li>
              <li>• Activity tracking</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>CampusBid demo prototype</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Built for demonstration <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
