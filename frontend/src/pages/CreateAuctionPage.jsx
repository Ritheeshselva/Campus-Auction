import React, { useState } from 'react';
import {
  PlusCircle,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const categoryOptions = ['Cycle', 'Calculator', 'Books', 'Electronics', 'Other'];

const conditionOptions = ['Brand New', 'Like New', 'Good', 'Fair', 'Poor'];

const campusPickupSpots = [
  'Student Union Main Lobby',
  'Campus Library - 1st Floor Cafe',
  'North Quad Residence Hall Lounge',
  'East Commons Dining Hall Entrance',
  'West Tower Quad / Bike Racks',
  'Engineering Center Atrium',
  'Campus Recreation Center Desk'
];

const presetPhotos = [
  {
    name: 'TI Graphing Calculator',
    url: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Textbook Stack',
    url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Dorm Refrigerator',
    url: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Campus Bike',
    url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Mechanical Keyboard',
    url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'iPad / Tablet',
    url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80'
  }
];

const CreateAuctionPage = ({ onNavigate }) => {
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Textbooks');
  const [condition, setCondition] = useState('Like New');
  const [startingPrice, setStartingPrice] = useState('');
  const [minBidIncrement, setMinBidIncrement] = useState('5');
  const [endTime, setEndTime] = useState(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [pickupLocation, setPickupLocation] = useState(campusPickupSpots[0]);
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(presetPhotos[0].url);
  const [customPhotoFile, setCustomPhotoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUploading(true);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedPhoto(res.data.imageUrl);
    } catch (err) {
      setError('Failed to upload image. Using preset photo instead.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !startingPrice) {
      setError('Please fill out all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
        startingPrice: Number(startingPrice),
        minBidIncrement: Number(minBidIncrement) || 5,
        endTime: new Date(endTime).toISOString(),
        pickupLocation,
        pickupInstructions: pickupInstructions.trim() || 'Flexible on campus weekdays.',
        images: [selectedPhoto]
      };

      const res = await api.post('/auctions', payload);
      setSuccess(true);
      setTimeout(() => {
        onNavigate('auction-detail', res.data.auction._id);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to list auction.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold mb-2">
            <PlusCircle className="w-3.5 h-3.5" /> Sell to College Students
          </div>
          <h1 className="text-2xl font-black">List an Item for Campus Auction</h1>
          <p className="text-xs text-blue-100 mt-1">
            Fair price discovery with anti-sniping protection and transparent student bidding
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
              <span>Auction listed successfully! Redirecting to live auction page...</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Item Title *
            </label>
            <input
              type="text"
              placeholder="e.g. TI-84 Plus CE Graphing Calculator (Rose Gold)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xs font-medium text-slate-900"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Closing date and time *
              </label>
              <input
                type="datetime-local"
                value={endTime}
                min={new Date().toISOString().slice(0, 16)}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Item Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                {conditionOptions.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Detailed Description *
            </label>
            <textarea
              rows="4"
              placeholder="Mention semester used, course codes (e.g. MATH 101), cosmetic condition, accessories included, or battery health..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xs font-medium text-slate-900"
            />
          </div>

          {/* Pricing & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Starting Price (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  step="any"
                  placeholder="25.00"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  required
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100 font-mono text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Min Bid Increment (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  ₹
                </span>
                <input
                  type="number"
                  min="1"
                  placeholder="5"
                  value={minBidIncrement}
                  onChange={(e) => setMinBidIncrement(e.target.value)}
                  className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100 font-mono text-xs font-bold"
                />
              </div>
            </div>

          </div>

          {/* Photo Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Item Photograph
            </label>

            {/* Curated Presets for Instant Demo */}
            <div className="mb-3">
              <span className="text-[11px] text-slate-500 block mb-2 font-medium">
                Choose a realistic campus preset or upload your photo:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {presetPhotos.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setSelectedPhoto(preset.url)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition ${
                      selectedPhoto === preset.url
                        ? 'border-blue-600 ring-2 ring-blue-200'
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom File Upload */}
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition">
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : 'Upload Image File'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-slate-400">PNG, JPG, or WEBP up to 5MB</span>
            </div>
          </div>

          {/* Campus Pickup Spot */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> Campus Safe Pickup Zone
              </label>
              <select
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              >
                {campusPickupSpots.map((spot) => (
                  <option key={spot} value={spot}>
                    {spot}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Pickup Notes & Availability
              </label>
              <input
                type="text"
                placeholder="e.g. Available weekdays after 3 PM or outside the library coffee shop."
                value={pickupInstructions}
                onChange={(e) => setPickupInstructions(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || success}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition active:scale-98 disabled:bg-slate-300 disabled:shadow-none"
          >
            {isSubmitting ? 'Publishing Auction...' : 'Publish Campus Auction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateAuctionPage;
