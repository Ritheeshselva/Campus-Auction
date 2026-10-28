import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  Key,
  MapPin,
  MessageSquare,
  AlertCircle,
  Star,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import HandoverModal from '../components/HandoverModal';
import { formatRupees } from '../utils/currency';

const SaleManagementPage = ({ onNavigate }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('selling'); // 'selling' or 'buying'
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isHandoverModalOpen, setIsHandoverModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionInProgress, setActionInProgress] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sales');
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const handleApprove = async (txId) => {
    try {
      setActionInProgress(txId);
      const res = await api.post(`/sales/${txId}/approve`, {});
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve sale.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (txId) => {
    const reason = window.prompt('Please enter a brief reason for declining this winning bid:');
    if (reason === null) return;
    try {
      setActionInProgress(txId);
      await api.post(`/sales/${txId}/reject`, { reason });
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to decline bid.');
    } finally {
      setActionInProgress(null);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const userId = user?._id;
    if (activeTab === 'selling') {
      return tx.seller?._id === userId || tx.seller === userId;
    } else {
      return tx.buyer?._id === userId || tx.buyer === userId;
    }
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Module 6: Auction Closure & Handover Verification
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Campus Sales & Handovers</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review winning bids, manage campus handover PIN codes, and confirm completed student transactions
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 gap-4">
        <button
          onClick={() => setActiveTab('selling')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'selling'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Items I'm Selling (Seller Actions)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
            {transactions.filter((tx) => tx.seller?._id === user?._id || tx.seller === user?._id).length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('buying')}
          className={`pb-3 text-xs sm:text-sm font-bold border-b-2 transition flex items-center gap-2 ${
            activeTab === 'buying'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Items I've Won (Buyer PINs)</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-600">
            {transactions.filter((tx) => tx.buyer?._id === user?._id || tx.buyer === user?._id).length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs text-slate-500">Retrieving campus transaction records...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Key className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base">No transactions in this category</h3>
          <p className="text-xs text-slate-500 mt-1">
            {activeTab === 'selling'
              ? 'When your listings reach their closing time with valid bids, they will appear here for your review and approval.'
              : 'When you place the winning bid on an auction that closes, your Handover PIN will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((tx) => {
            const isSeller = tx.seller?._id === user?._id || tx.seller === user?._id;
            const otherParty = isSeller ? tx.buyer : tx.seller;

            return (
              <div
                key={tx._id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Item Thumbnail & Overview */}
                <div className="flex items-start gap-4 flex-1">
                  <img
                    src={
                      tx.auction?.images?.[0] ||
                      'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={tx.auction?.title}
                    className="w-20 h-20 rounded-2xl object-cover border border-slate-100 flex-shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.status === 'approved_awaiting_handover'
                            ? 'bg-blue-100 text-blue-800'
                            : tx.status === 'pending_seller_approval'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {tx.status === 'pending_seller_approval'
                          ? 'Awaiting Seller Approval'
                          : tx.status === 'approved_awaiting_handover'
                          ? 'Approved • Ready for Handover'
                          : tx.status === 'completed'
                          ? 'Handover Completed'
                          : tx.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm">{tx.auction?.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                      <span className="font-semibold text-slate-900">
                        Final Price: <span className="font-mono text-emerald-700">{formatRupees(tx.finalPrice)}</span>
                      </span>
                      <span>•</span>
                      <span>
                        {isSeller ? 'Buyer: ' : 'Seller: '}
                        <strong>{otherParty?.name}</strong> ({otherParty?.dormHall?.split(' ')[0]})
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-500" /> {tx.pickupLocation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status-specific action buttons */}
                <div className="flex flex-wrap items-center gap-3 justify-end">
                  {/* SELLER VIEW: Pending approval */}
                  {isSeller && tx.status === 'pending_seller_approval' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApprove(tx._id)}
                        disabled={actionInProgress === tx._id}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition disabled:opacity-50"
                      >
                        {actionInProgress === tx._id ? 'Approving...' : 'Approve Winning Bid'}
                      </button>
                      <button
                        onClick={() => handleReject(tx._id)}
                        disabled={actionInProgress === tx._id}
                        className="px-3 py-2.5 rounded-xl border border-slate-300 text-rose-600 hover:bg-rose-50 font-bold text-xs transition"
                      >
                        Decline
                      </button>
                    </div>
                  )}

                  {/* SELLER VIEW: Ready for handover */}
                  {isSeller && tx.status === 'approved_awaiting_handover' && (
                    <button
                      onClick={() => {
                        setSelectedTransaction(tx);
                        setIsHandoverModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition flex items-center gap-1.5"
                    >
                      <Key className="w-4 h-4" /> Enter Buyer's PIN to Complete
                    </button>
                  )}

                  {/* BUYER VIEW: Ready for handover - Show PIN */}
                  {!isSeller && tx.status === 'approved_awaiting_handover' && (
                    <button
                      onClick={() => {
                        setSelectedTransaction(tx);
                        setIsHandoverModalOpen(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition flex items-center gap-2 animate-bounce-short"
                    >
                      <Key className="w-4 h-4" /> Show Handover PIN [{tx.handoverCode}]
                    </button>
                  )}

                  {/* BUYER VIEW: Pending seller decision */}
                  {!isSeller && tx.status === 'pending_seller_approval' && (
                    <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl">
                      Waiting for seller confirmation...
                    </span>
                  )}

                  {/* Completed sale info */}
                  {tx.status === 'completed' && (
                    <button
                      onClick={() => {
                        setSelectedTransaction(tx);
                        setIsHandoverModalOpen(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-600" /> View Handover Receipt / Rate
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Handover Verification Modal */}
      {selectedTransaction && (
        <HandoverModal
          transaction={selectedTransaction}
          isOpen={isHandoverModalOpen}
          onClose={() => {
            setIsHandoverModalOpen(false);
            setSelectedTransaction(null);
          }}
          onUpdate={(updatedTx) => {
            setSelectedTransaction(updatedTx);
            fetchTransactions();
          }}
        />
      )}
    </div>
  );
};

export default SaleManagementPage;
