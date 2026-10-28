import React, { useState, useEffect } from 'react';
import { Gavel, TrendingUp, AlertCircle, CheckCircle, ExternalLink, ArrowRight, ShieldAlert } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from '../components/CountdownTimer';
import { formatRupees } from '../utils/currency';

const MyBidsPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyBids = async () => {
    try {
      setLoading(true);
      const res = await api.get('/bids/my/history');
      setBids(res.data.myBids || []);
    } catch (err) {
      console.error('Error fetching bids:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBids();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Active & Past Bids</h1>
        <p className="text-xs text-slate-500 mt-1">
          Track all campus items you are bidding on, outbid alerts, and provisional winning bids
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-500">Retrieving your bidding records...</p>
        </div>
      ) : bids.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Gavel className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No bids placed yet</h3>
          <p className="text-xs text-slate-500 mt-1">
            Explore live auctions on campus to bid on textbooks, electronics, and dorm furniture!
          </p>
          <button
            onClick={() => onNavigate('browse')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
          >
            Explore Live Auctions
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bids.map((item) => {
            const auction = item.auction;
            const isLeading = item.isLeading;
            const isWon = item.isWon;
            const isClosed = auction.status !== 'active';

            return (
              <div
                key={auction._id}
                className={`bg-white rounded-3xl border p-5 shadow-sm transition hover:shadow-lg flex flex-col justify-between ${
                  isLeading && !isClosed
                    ? 'border-emerald-300 ring-2 ring-emerald-100'
                    : !isLeading && !isClosed
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Status Banner */}
                  <div className="flex items-center justify-between mb-3">
                    {isWon ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-amber-600" /> Auction Won!
                      </span>
                    ) : isLeading && !isClosed ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> You are Highest Bidder
                      </span>
                    ) : !isLeading && !isClosed ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1 animate-pulse">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" /> Outbid!
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600">
                        Auction Concluded
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400 font-medium">
                      {auction.category}
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
                        Seller: {auction.seller?.name} • {auction.seller?.dormHall?.split(' ')[0]}
                      </p>
                    </div>
                  </div>

                  {/* Pricing Comparison */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 mb-4 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Your Bid
                      </span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {formatRupees(item.myHighestBid)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Current Top
                      </span>
                      <span
                        className={`font-mono font-bold text-sm ${
                          isLeading ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatRupees(auction.currentPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Remaining Time */}
                  {!isClosed && (
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-500 font-medium">Closes in:</span>
                      <CountdownTimer endTime={auction.endTime} compact={true} />
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('auction-detail', auction._id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                      !isLeading && !isClosed
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {!isLeading && !isClosed ? (
                      <>
                        <Gavel className="w-3.5 h-3.5" /> Re-Bid to Lead
                      </>
                    ) : (
                      <>
                        <span>View Auction</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>

                  {isWon && (
                    <button
                      onClick={() => onNavigate('sales-management')}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition"
                    >
                      View PIN
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

export default MyBidsPage;
