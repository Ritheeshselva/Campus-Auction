import React, { useState, useEffect } from 'react';
import { PlusCircle, MapPin, TrendingUp, AlertTriangle, ArrowRight, Eye } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from '../components/CountdownTimer';
import { formatRupees } from '../utils/currency';

const MyAuctionsPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyAuctions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auctions/my-listings');
      setAuctions(res.data.auctions || []);
    } catch (err) {
      console.error('Error fetching my auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyAuctions();
  }, [user]);

  const handleCancelAuction = async (auctionId) => {
    if (!window.confirm('Are you sure you want to cancel this auction listing?')) return;
    try {
      await api.delete(`/auctions/${auctionId}`);
      fetchMyAuctions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel auction.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Campus Listings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your active items, review provisional winning bids, and track completed sales
          </p>
        </div>
        <button
          onClick={() => onNavigate('create-auction')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/25 transition flex items-center gap-1.5"
        >
          <PlusCircle className="w-4 h-4" /> Post New Item
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-500">Loading your listings...</p>
        </div>
      ) : auctions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No items listed yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Have old textbooks, electronics, dorm furniture, or a bike? List them for campus auction now!
          </p>
          <button
            onClick={() => onNavigate('create-auction')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
          >
            Create Your First Listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => {
            const isClosed = auction.status !== 'active';
            return (
              <div
                key={auction._id}
                className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Status Tag */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        auction.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : auction.status === 'pending_approval'
                          ? 'bg-amber-100 text-amber-800'
                          : auction.status === 'sold'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {auction.status === 'active' ? 'Active Auction' : auction.status.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {auction.totalBids} {auction.totalBids === 1 ? 'bid' : 'bids'}
                    </span>
                  </div>

                  {/* Thumbnail & Title */}
                  <div className="flex items-start gap-3 mb-4">
                    <img
                      src={
                        auction.images?.[0] ||
                        'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={auction.title}
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-2">{auction.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Category: {auction.category} • {auction.condition}
                      </p>
                    </div>
                  </div>

                  {/* Price Box */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-4 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {isClosed ? 'Final Bid' : 'Current Leading Price'}
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-base">
                        {formatRupees(auction.currentPrice)}
                      </span>
                    </div>
                    {auction.highestBidder && (
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Leading Bidder
                        </span>
                        <span className="text-xs font-bold text-blue-600 truncate block max-w-[120px]">
                          {auction.highestBidder.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {!isClosed && (
                    <div className="flex items-center justify-between text-xs mb-3">
                      <span className="text-slate-500 font-medium">Time left:</span>
                      <CountdownTimer endTime={auction.endTime} compact={true} />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('auction-detail', auction._id)}
                    className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Listing
                  </button>

                  {auction.status === 'pending_approval' && (
                    <button
                      onClick={() => onNavigate('sales-management')}
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition"
                    >
                      Review Bid
                    </button>
                  )}

                  {auction.status === 'active' && (
                    <button
                      onClick={() => handleCancelAuction(auction._id)}
                      className="px-3 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 font-bold text-xs rounded-xl transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAuctionsPage;
