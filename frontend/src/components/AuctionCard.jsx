import React from 'react';
import { Tag, MapPin, TrendingUp, UserCheck, Flame } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { formatRupees } from '../utils/currency';

const conditionColors = {
  'Brand New': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Like New': 'bg-blue-100 text-blue-800 border-blue-200',
  Good: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Fair: 'bg-amber-100 text-amber-800 border-amber-200',
  Poor: 'bg-rose-100 text-rose-800 border-rose-200'
};

const AuctionCard = ({ auction, onSelect }) => {
  const isEndingSoon =
    new Date(auction.endTime).getTime() - Date.now() < 30 * 60 * 1000 &&
    new Date(auction.endTime).getTime() > Date.now();

  const isClosed = auction.status !== 'active';

  return (
    <div
      onClick={() => onSelect(auction._id)}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-blue-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden cursor-pointer relative"
    >
      {/* Top Media */}
      <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
        <img
          src={
            auction.images?.[0] ||
            'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=600&q=80'
          }
          alt={auction.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
            {auction.category}
          </span>
          {isEndingSoon && (
            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-sm flex items-center gap-1 animate-pulse">
              <Flame className="w-3 h-3 fill-white" /> Hot
            </span>
          )}
        </div>

        {/* Condition Tag */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
              conditionColors[auction.condition] || 'bg-slate-100 text-slate-700'
            }`}
          >
            {auction.condition}
          </span>
        </div>

        {/* Countdown Floating Pill at Bottom of Image */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          <div className="bg-white/95 backdrop-blur-md rounded-full px-2 py-0.5 shadow-sm">
            <CountdownTimer endTime={auction.endTime} compact={true} />
          </div>
          {auction.totalBids > 0 && (
            <span className="bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              {auction.totalBids} {auction.totalBids === 1 ? 'bid' : 'bids'}
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
            {auction.title}
          </h3>

          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="truncate">{auction.pickupLocation || 'Campus Pickup'}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              {isClosed ? 'Final Price' : 'Current Bid'}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-extrabold text-slate-900 font-mono">
                {formatRupees(auction.currentPrice || auction.startingPrice)}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect(auction._id);
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-colors"
          >
            {isClosed ? 'View Result' : 'Place Bid'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionCard;
