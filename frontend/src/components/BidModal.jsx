import React, { useState } from 'react';
import { X, Gavel, AlertCircle, Zap, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { formatRupees } from '../utils/currency';

const BidModal = ({ auction, isOpen, onClose, onBidSuccess }) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !auction) return null;

  const isFirstBid = auction.totalBids === 0;
  const minRequired = isFirstBid
    ? auction.startingPrice
    : auction.currentPrice + auction.minBidIncrement;

  const isSeller = user && auction.seller && (auction.seller._id === user._id || auction.seller === user._id);
  const isHighestBidder =
    user && auction.highestBidder && (auction.highestBidder._id === user._id || auction.highestBidder === user._id);

  const handlePreset = (increment) => {
    const currentBase = Number(amount) || minRequired;
    setAmount((currentBase + increment).toString());
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < minRequired) {
      setError(`Minimum bid required is ${formatRupees(minRequired)}`);
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post(`/bids/${auction._id}`, { amount: numAmount });

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      if (onBidSuccess) {
        onBidSuccess(res.data);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to place bid.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-blue-700 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <Gavel className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Place Your Campus Bid</h3>
              <p className="text-xs text-blue-200 truncate max-w-[260px]">{auction.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Item Price Summary */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Current Price
              </span>
              <span className="text-2xl font-black font-mono text-slate-900">
                {formatRupees(auction.currentPrice)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Min Bid Needed
              </span>
              <span className="text-lg font-bold font-mono text-emerald-600">
                {formatRupees(minRequired)}
              </span>
            </div>
          </div>

          {/* Validation Warnings */}
          {isSeller && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>You are the seller of this auction and cannot bid on your own item.</span>
            </div>
          )}

          {isHighestBidder && (
            <div className="mb-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-blue-600" />
              <span>You currently hold the leading bid! No need to outbid yourself.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Your Bid Amount (INR)
            </label>
            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-lg">
                ₹
              </span>
              <input
                type="number"
                step="any"
                min={minRequired}
                placeholder={minRequired.toFixed(2)}
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError(null);
                }}
                disabled={isSeller || isHighestBidder}
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 font-mono font-bold text-lg text-slate-900 outline-none transition disabled:bg-slate-100 disabled:cursor-not-allowed"
                autoFocus
              />
            </div>

            {/* Quick Increment Buttons */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-[11px] text-slate-400 font-semibold">Quick add:</span>
              <button
                type="button"
                onClick={() => handlePreset(5)}
                disabled={isSeller || isHighestBidder}
                className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
              >
                +₹5
              </button>
              <button
                type="button"
                onClick={() => handlePreset(10)}
                disabled={isSeller || isHighestBidder}
                className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
              >
                +₹10
              </button>
              <button
                type="button"
                onClick={() => handlePreset(25)}
                disabled={isSeller || isHighestBidder}
                className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition disabled:opacity-50"
              >
                +₹25
              </button>
            </div>

            {/* Anti-Sniping Notice */}
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/60 mb-5 text-[11px] text-amber-800 flex items-start gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Anti-Sniping Protection:</strong> Bids placed within the final 2 minutes will
                extend the auction by 2 minutes to ensure fair competition.
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isSeller || isHighestBidder}
                className="flex-1 py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition active:scale-95 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Confirming Bid...' : 'Confirm Bid'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BidModal;
