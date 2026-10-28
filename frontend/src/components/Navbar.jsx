import React, { useState } from 'react';
import {
  Gavel,
  Bell,
  PlusCircle,
  ShoppingBag,
  Clock,
  UserCheck,
  ChevronDown,
  CheckCheck,
  X,
  ExternalLink,
  ShieldCheck,
  Building,
  UserRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Navbar = ({ onNavigate, currentPage }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, activeToast, setActiveToast, markAsRead, markAllAsRead } =
    useNotifications();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      {/* Toast Alert for Real-time events */}
      {activeToast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm w-full bg-white rounded-xl shadow-2xl border border-blue-100 p-4 animate-in slide-in-from-top-4 transition duration-300">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Bell className="w-5 h-5 animate-bounce-short" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900">{activeToast.title}</h4>
                <button
                  onClick={() => setActiveToast(null)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 mt-1">{activeToast.message}</p>
              {activeToast.link && (
                <button
                  onClick={() => {
                    const page = activeToast.link.startsWith('/auctions/')
                      ? 'auction-detail'
                      : activeToast.link.replace('/', '');
                    const param = activeToast.link.startsWith('/auctions/')
                      ? activeToast.link.replace('/auctions/', '')
                      : null;
                    onNavigate(page, param);
                    setActiveToast(null);
                  }}
                  className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  View Details <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand Logo */}
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 cursor-pointer select-none group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Gavel className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-blue-900 to-indigo-700 bg-clip-text text-transparent">
                  CampusBid
                </span>
                <span className="block text-[10px] font-medium text-slate-500 -mt-1">
                  Campus auction demo
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  currentPage === 'home'
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Home
              </button>
              {user?.role === 'user' && (
                <button
                  onClick={() => onNavigate('browse')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentPage === 'browse'
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Browse Auctions
                </button>
              )}
              <button
                onClick={() => onNavigate(user?.role === 'seller' ? 'my-auctions' : 'my-bids')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                  ['activity', 'my-bids', 'my-auctions', 'sales-management'].includes(currentPage)
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {user?.role === 'seller' ? 'My Listings' : 'My Bids'}
              </button>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Post Auction Button */}
              {user?.role === 'seller' && (
                <button
                  onClick={() => onNavigate('create-auction')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition shadow-blue-600/30 active:scale-95"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Listing</span>
                </button>
              )}

              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifMenu(!showNotifMenu);
                    setShowUserMenu(false);
                  }}
                  className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifMenu && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">Notifications</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif._id}
                            onClick={() => {
                              if (!notif.isRead) markAsRead(notif._id);
                              if (notif.link) {
                                const page = notif.link.startsWith('/auctions/')
                                  ? 'auction-detail'
                                  : notif.link.replace('/', '');
                                const param = notif.link.startsWith('/auctions/')
                                  ? notif.link.replace('/auctions/', '')
                                  : null;
                                onNavigate(page, param);
                                setShowNotifMenu(false);
                              }
                            }}
                            className={`p-3.5 hover:bg-slate-50 cursor-pointer transition ${
                              !notif.isRead ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div
                                className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                  !notif.isRead ? 'bg-blue-600' : 'bg-transparent'
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <h5 className="text-xs font-bold text-slate-900 truncate">
                                  {notif.title}
                                </h5>
                                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                                  {notif.message}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {new Date(notif.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowPersonaMenu(false);
                    setShowNotifMenu(false);
                  }}
                  className="flex items-center gap-2 p-1 rounded-full border-2 border-transparent hover:border-slate-200 transition"
                >
                  <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                    <UserRound className="w-4 h-4" />
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="text-xs font-bold text-slate-900">{user?.name}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                      <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-semibold">
                        <ShieldCheck className="w-3 h-3" /> Verified Student ID
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onNavigate('profile');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Student Profile
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('my-auctions');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      My Listed Auctions
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('my-bids');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      My Bids & Bidding History
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('sales-management');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Handover PINs & Sales
                    </button>
                    <div className="border-t border-slate-100 mt-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                        onNavigate('auth');
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Navbar;
