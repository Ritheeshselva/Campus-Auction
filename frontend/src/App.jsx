import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import BrowsePage from './pages/BrowsePage';
import AuctionDetailPage from './pages/AuctionDetailPage';
import CreateAuctionPage from './pages/CreateAuctionPage';
import AuthPage from './pages/AuthPage';
import MyBidsPage from './pages/MyBidsPage';
import MyAuctionsPage from './pages/MyAuctionsPage';

const pages = {
  home: (props) => <BrowsePage {...props} />,
  browse: (props) => <BrowsePage initialFilters={props.pageParam || {}} {...props} />,
  'auction-detail': (props) => <AuctionDetailPage auctionId={props.pageParam} {...props} />,
  'create-auction': (props) => <CreateAuctionPage {...props} />,
  'my-bids': (props) => <MyBidsPage {...props} />,
  'my-auctions': (props) => <MyAuctionsPage {...props} />,
  auth: (props) => <AuthPage {...props} />
};

const MainApp = () => {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('browse');
  const [pageParam, setPageParam] = useState(null);

  const navigateTo = (page, param = null) => {
    setCurrentPage(page);
    setPageParam(param);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPage = () => {
    if (!user) return <AuthPage />;
    if (user.role === 'seller' && !['create-auction', 'my-auctions', 'auction-detail'].includes(currentPage)) {
      return <MyAuctionsPage onNavigate={navigateTo} />;
    }
    if (user.role === 'user' && currentPage === 'create-auction') {
      return <BrowsePage onNavigate={navigateTo} />;
    }
    const Page = pages[currentPage] || pages.home;
    return <Page pageParam={pageParam} onNavigate={navigateTo} user={user} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {user && <Navbar onNavigate={navigateTo} currentPage={currentPage} />}

      <main className="flex-1">{renderPage()}</main>

      {user && <Footer onNavigate={navigateTo} />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <MainApp />
      </NotificationProvider>
    </AuthProvider>
  );
}
