import React, { useState, useEffect } from 'react';
import {
  Gavel,
  ShieldCheck,
  MapPin,
  Clock,
  Eye,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Star,
  Zap,
  ArrowLeft,
  Share2,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from '../components/CountdownTimer';
import BidModal from '../components/BidModal';
import { formatRupees } from '../utils/currency';

const conditionColors = {
  'Brand New': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Like New': 'bg-blue-100 text-blue-800 border-blue-200',
  Good: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  Fair: 'bg-amber-100 text-amber-800 border-amber-200',
  Poor: 'bg-rose-100 text-rose-800 border-rose-200'
};

const AuctionDetailPage = ({ auctionId, onNavigate }) => {
  const { user } = useAuth();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);
  const [extensionAlert, setExtensionAlert] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const fetchAuction = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/auctions/${auctionId}`);
      setAuction(res.data.auction);
      setBids(res.data.bids || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load auction details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auctionId) {
      fetchAuction();
    }

  }, [auctionId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-500">Loading auction details...</p>
      </div>
    );
  }

  if (error || !auction) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">{error || 'Item not found'}</h2>
        <button
          onClick={() => onNavigate('browse')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
        >
          Return to Browse
        </button>
      </div>
    );
  }

  const isSeller = user?._id === auction.seller?._id;
  const isHighestBidder = user?._id === auction.highestBidder?._id;
  const isClosed = auction.status !== 'active';
  const minRequiredBid =
    auction.totalBids === 0
      ? auction.startingPrice
      : auction.currentPrice + auction.minBidIncrement;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => onNavigate('browse')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Auctions
        </button>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {auction.views || 1} views
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-mono">
            ID: #{auction._id.slice(-6).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Anti-Sniping Live Extension Banner */}
      {extensionAlert && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-xl flex items-center gap-3 animate-pulse">
          <Zap className="w-6 h-6 flex-shrink-0 animate-bounce" />
          <div className="flex-1">
            <h4 className="font-extrabold text-sm">Anti-Sniping Rule Triggered!</h4>
            <p className="text-xs text-amber-100">{extensionAlert}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Photos & Details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Gallery */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="relative aspect-[16/10] bg-slate-900 flex items-center justify-center">
              <img
                src={
                  auction.images?.[activeImageIndex] ||
                  'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'
                }
                alt={auction.title}
                className="w-full h-full object-cover"
              />

              {/* Status Badge */}
              <div className="absolute top-4 left-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md ${
                    auction.status === 'active'
                      ? 'bg-emerald-600 text-white animate-pulse'
                      : auction.status === 'pending_approval'
                      ? 'bg-amber-500 text-slate-950'
                      : auction.status === 'sold'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-white'
                  }`}
                >
                  {auction.status === 'active'
                    ? '● Live Auction'
                    : auction.status === 'pending_approval'
                    ? 'Awaiting Seller Decision'
                    : auction.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            {auction.images?.length > 1 && (
              <div className="p-3 flex items-center gap-2 border-t border-slate-100 overflow-x-auto">
                {auction.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition ${
                      activeImageIndex === idx ? 'border-blue-600' : 'border-transparent opacity-70'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item Description & Campus Details */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {auction.category}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    conditionColors[auction.condition] || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Condition: {auction.condition}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                {auction.title}
              </h1>
            </div>

            <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {auction.description}
            </div>

            {/* Campus Handover & Pickup Info */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500" /> Campus Pickup & Handover Location
              </h4>
              <p className="text-slate-700 font-semibold">{auction.pickupLocation}</p>
              {auction.pickupInstructions && (
                <p className="text-slate-500 italic">"{auction.pickupInstructions}"</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Live Bidding Console (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Price & Bidding Box */}
          <div className="bg-white rounded-3xl border-2 border-blue-500/30 p-6 shadow-xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full pointer-events-none" />

            {/* Countdown Header */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                {isClosed ? 'Auction Concluded' : 'Time Remaining'}
              </span>
              <CountdownTimer
                endTime={auction.endTime}
                onExpire={() => setAuction((prev) => ({ ...prev, status: 'pending_approval' }))}
              />
            </div>

            {/* Current Price Display */}
            <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  {isClosed ? 'Winning / Final Price' : 'Current Leading Price'}
                </span>
                <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900 mt-1">
                  {formatRupees(auction.currentPrice)}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Total Activity
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-slate-700 text-sm mt-1">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  {auction.totalBids} {auction.totalBids === 1 ? 'bid' : 'bids'}
                </span>
              </div>
            </div>

            {/* Leading Bidder Indicator */}
            {auction.highestBidder && (
              <div
                className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                  isHighestBidder
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    Current Leader:{' '}
                    <strong>{isHighestBidder ? 'You (Highest Bidder!)' : auction.highestBidder.name}</strong>
                  </span>
                </div>
                {isHighestBidder && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold">
                    In the Lead
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div>
              {auction.status === 'active' ? (
                <div>
                  <button
                    onClick={() => setIsBidModalOpen(true)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm shadow-xl shadow-blue-500/30 transition transform active:scale-98 flex items-center justify-center gap-2"
                  >
                    <Gavel className="w-5 h-5 text-amber-300" />
                    <span>Place Bid • Min {formatRupees(minRequiredBid)}</span>
                  </button>

                  <p className="text-center text-[11px] text-slate-400 mt-2">
                    Minimum increment: {formatRupees(auction.minBidIncrement)} • Server time
                  </p>
                </div>
              ) : (
                <div className="text-center p-4 bg-slate-100 rounded-2xl">
                  <span className="text-xs font-bold text-slate-600 block">
                    This auction is closed for new bids.
                  </span>
                  {auction.status === 'pending_approval' && (
                    <span className="text-[11px] text-amber-600 font-semibold block mt-1">
                      Seller is currently reviewing the winning bid.
                    </span>
                  )}
                  {auction.status === 'sold' && (
                    <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
                      Campus handover confirmed and verified!
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Seller Trust Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Seller Information
            </h4>
            <div className="flex items-center gap-3">
              <img
                src={
                  auction.seller?.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                }
                alt={auction.seller?.name}
                className="w-12 h-12 rounded-full border border-slate-200 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h5 className="font-bold text-slate-900 text-sm truncate">{auction.seller?.name}</h5>
                  <ShieldCheck className="w-4 h-4 text-blue-600" title="Verified Campus Student" />
                </div>
                <div className="text-xs text-slate-500">
                  {auction.seller?.department} • {auction.seller?.dormHall}
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{auction.seller?.rating || 5.0}</span>
                  <span className="text-slate-400 font-normal">
                    ({auction.seller?.ratingCount || 1} trades)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Transparent Live Bid History Stream */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Live Bidding Activity
              </h4>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Stream
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
              {bids.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No bids placed yet. Be the first to start the auction!
                </div>
              ) : (
                bids.map((bid, index) => {
                  const isTop = index === 0;
                  return (
                    <div key={bid._id || index} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={
                            bid.bidder?.avatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
                          }
                          alt={bid.bidder?.name}
                          className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <span className="font-bold text-slate-800 block truncate max-w-[130px]">
                            {bid.bidder?.name || 'Anonymous Student'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(bid.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 block">
                          {formatRupees(bid.amount)}
                        </span>
                        {isTop && (
                          <span className="text-[10px] font-bold text-emerald-600 uppercase">
                            Leading Bid
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bid Modal */}
      <BidModal
        auction={auction}
        isOpen={isBidModalOpen}
        onClose={() => setIsBidModalOpen(false)}
        onBidSuccess={(data) => {
          setAuction(data.auction);
        }}
      />
    </div>
  );
};

export default AuctionDetailPage;
