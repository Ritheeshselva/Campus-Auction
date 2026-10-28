import React, { useState } from 'react';
import { X, ShieldCheck, Key, CheckCircle, MapPin, AlertCircle, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../api';
import { formatRupees } from '../utils/currency';
import { useAuth } from '../context/AuthContext';

const HandoverModal = ({ transaction, isOpen, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [pinInput, setPinInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  if (!isOpen || !transaction) return null;

  const isSeller = user?._id === transaction.seller?._id || user?._id === transaction.seller;
  const isBuyer = user?._id === transaction.buyer?._id || user?._id === transaction.buyer;
  const isCompleted = transaction.status === 'completed';

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setError(null);

    if (!pinInput || pinInput.trim().length !== 4) {
      setError('Please enter the 4-digit PIN provided by the buyer.');
      return;
    }

    try {
      setIsVerifying(true);
      const res = await api.post(`/sales/${transaction._id}/confirm-handover`, {
        enteredCode: pinInput.trim()
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (onUpdate) onUpdate(res.data.transaction);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Verification failed. Incorrect PIN.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post(`/sales/${transaction._id}/rate`, {
        rating: ratingVal,
        review: reviewText
      });
      setRatingSubmitted(true);
      if (onUpdate) onUpdate(res.data.transaction);
    } catch (err) {
      setError('Failed to submit rating.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-700 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Campus Handover & Verification</h3>
              <p className="text-xs text-emerald-100 truncate max-w-[280px]">
                {transaction.auction?.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Pickup Details */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 mb-5 text-xs text-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Agreed Final Price:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {formatRupees(transaction.finalPrice)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-500">Pickup Location:</span>
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" /> {transaction.pickupLocation}
              </span>
            </div>
            {transaction.pickupScheduledTime && (
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">Scheduled Time:</span>
                <span className="font-medium text-slate-800">{transaction.pickupScheduledTime}</span>
              </div>
            )}
            {transaction.sellerNotes && (
              <div className="pt-2 border-t border-slate-200/60">
                <span className="font-semibold text-slate-500 block mb-0.5">Seller Notes:</span>
                <p className="italic text-slate-600">"{transaction.sellerNotes}"</p>
              </div>
            )}
          </div>

          {/* Verification Flow */}
          {!isCompleted ? (
            <div>
              {isBuyer ? (
                /* BUYER VIEW: Show Handover Code to give to seller */
                <div className="text-center p-6 bg-emerald-50/70 border border-emerald-200 rounded-2xl mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block mb-2">
                    Your Campus Handover Verification PIN
                  </span>
                  <div className="text-4xl font-black font-mono tracking-widest text-emerald-700 bg-white py-3 px-6 rounded-xl border-2 border-emerald-300 inline-block shadow-inner">
                    {transaction.handoverCode}
                  </div>
                  <p className="text-xs text-emerald-900/80 mt-3 max-w-xs mx-auto">
                    Show this 4-digit code to the seller <strong>only after</strong> you have met at
                    the campus location and inspected your item.
                  </p>
                </div>
              ) : (
                /* SELLER VIEW: Enter Buyer's Handover Code */
                <form onSubmit={handleVerifyPin} className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900">
                    <p className="font-semibold mb-1">Meet Buyer on Campus:</p>
                    <p className="text-slate-600">
                      When the buyer arrives and accepts the item, ask them for their 4-digit Handover
                      PIN and enter it below to mark the transaction completed.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Enter Buyer's 4-Digit Handover PIN
                    </label>
                    <input
                      type="text"
                      maxLength="4"
                      placeholder="e.g. 7429"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value)}
                      className="w-full text-center text-3xl font-mono font-black tracking-widest py-3 border border-slate-300 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-600 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying || pinInput.length !== 4}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition disabled:bg-slate-300 disabled:shadow-none"
                  >
                    {isVerifying ? 'Verifying PIN...' : 'Confirm Handover & Complete Sale'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            /* COMPLETED STATE & RATING */
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-900 text-base">Campus Handover Completed!</h4>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                Confirmed on {new Date(transaction.handoverConfirmedAt || Date.now()).toLocaleDateString()}{' '}
                at{' '}
                {new Date(transaction.handoverConfirmedAt || Date.now()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>

              {/* Rating Section */}
              {!ratingSubmitted ? (
                <form
                  onSubmit={handleSubmitRating}
                  className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-left"
                >
                  <span className="text-xs font-bold text-slate-800 block mb-2">
                    Rate Your Campus Trading Partner ({isSeller ? 'Buyer' : 'Seller'})
                  </span>
                  <div className="flex items-center gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingVal(star)}
                        className="text-amber-400 hover:scale-110 transition"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= ratingVal ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">{ratingVal} / 5 Stars</span>
                  </div>
                  <textarea
                    rows="2"
                    placeholder="Leave a quick note on responsiveness, punctuality, and item condition..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500 mb-3"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
                  >
                    Submit Student Rating
                  </button>
                </form>
              ) : (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl font-semibold">
                  Thank you! Your feedback helps build student trust on campus.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HandoverModal;
