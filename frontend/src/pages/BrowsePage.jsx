import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  X,
  RotateCcw,
  Sparkles,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import api from '../api';
import AuctionCard from '../components/AuctionCard';

const categories = [
  'All',
  'Cycle',
  'Calculator',
  'Books',
  'Electronics',
  'Other'
];

const conditions = ['Brand New', 'Like New', 'Good', 'Fair', 'Poor'];

const BrowsePage = ({ initialFilters = {}, onNavigate }) => {
  const [search, setSearch] = useState(initialFilters.search || '');
  const [category, setCategory] = useState(initialFilters.category || 'All');
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [status, setStatus] = useState(initialFilters.status || 'active');
  const [sort, setSort] = useState(initialFilters.sort || 'endingSoon');

  const [auctions, setAuctions] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const params = {
        search: search.trim() || undefined,
        category: category !== 'All' ? category : undefined,
        condition: selectedConditions.length > 0 ? selectedConditions.join(',') : undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        status: status,
        sort: sort
      };

      const res = await api.get('/auctions', { params });
      setAuctions(res.data.auctions || []);
      setTotalCount(res.data.total || 0);
    } catch (err) {
      console.error('Error fetching auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [category, selectedConditions, status, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAuctions();
  };

  const toggleCondition = (cond) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const resetFilters = () => {
    setSearch('');
    setCategory('All');
    setSelectedConditions([]);
    setMinPrice('');
    setMaxPrice('');
    setStatus('active');
    setSort('endingSoon');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Search & Filter Bar */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Browse Campus Auctions</h1>
        <p className="text-xs text-slate-500 mt-1">
          Find used textbooks, campus bikes, dorm furnishings, and tech at verified student prices
        </p>

        <div className="mt-4 flex flex-col sm:flex-row items-center gap-3">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by keywords, title, or item details..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 text-xs font-medium"
            />
          </form>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-100 cursor-pointer"
              >
                <option value="endingSoon">Ending Soonest</option>
                <option value="newest">Newly Listed</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
                <option value="mostBids">Most Active Bids</option>
              </select>
              <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilter(!showMobileFilter)}
              className="sm:hidden px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filter (Desktop) */}
        <div className={`lg:block ${showMobileFilter ? 'block' : 'hidden'} space-y-6`}>
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" /> Filter Listings
              </h3>
              <button
                onClick={resetFilters}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            </div>

            {/* Categories */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-2.5">Category</label>
              <div className="space-y-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                      category === cat
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat}</span>
                    {category === cat && <ChevronRight className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition Checkboxes */}
            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block mb-2.5">Item Condition</label>
              <div className="space-y-2">
                {conditions.map((cond) => {
                  const checked = selectedConditions.includes(cond);
                  return (
                    <label
                      key={cond}
                      className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCondition(cond)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{cond}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block mb-2.5">Price Range (₹)</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
                <span className="text-slate-400 text-xs">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <button
                onClick={fetchAuctions}
                className="mt-2.5 w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
              >
                Apply Price
              </button>
            </div>

            {/* Status Filter */}
            <div className="pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-800 block mb-2.5">Auction Status</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setStatus('active')}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                    status === 'active'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Active Only
                </button>
                <button
                  onClick={() => setStatus('all')}
                  className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                    status === 'all'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  All Statuses
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Grid */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-500">
              Showing <strong>{auctions.length}</strong> {auctions.length === 1 ? 'auction' : 'auctions'}
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200 p-4 h-72 animate-pulse flex flex-col justify-between"
                >
                  <div className="bg-slate-200 rounded-xl aspect-[4/3] w-full" />
                  <div className="space-y-2 mt-4">
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : auctions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">No auctions match your filters</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try clearing your search terms or expanding your category and price range filters.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctions.map((auction) => (
                <AuctionCard
                  key={auction._id}
                  auction={auction}
                  onSelect={(id) => onNavigate('auction-detail', id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrowsePage;
