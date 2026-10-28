import React, { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';

const CountdownTimer = ({ endTime, compact = false, onExpire = null }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isUrgent: false, // under 2 minutes (anti-sniping threshold)
    totalSeconds: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      if (!endTime) return;

      const difference = new Date(endTime).getTime() - Date.now();

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          isUrgent: false,
          totalSeconds: 0
        });
        if (onExpire) onExpire();
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      // Urgent if less than 2 minutes remaining (120 seconds)
      const isUrgent = totalSeconds <= 120;

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        isUrgent,
        totalSeconds
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  if (timeLeft.isExpired) {
    return (
      <div className={`inline-flex items-center gap-1.5 font-semibold text-slate-500 ${compact ? 'text-xs' : 'text-sm'}`}>
        <Clock className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span>Auction Ended</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
          timeLeft.isUrgent
            ? 'bg-rose-100 text-rose-700 animate-pulse'
            : timeLeft.days === 0 && timeLeft.hours < 1
            ? 'bg-amber-100 text-amber-800'
            : 'bg-slate-100 text-slate-700'
        }`}
      >
        {timeLeft.isUrgent ? (
          <Zap className="w-3 h-3 text-rose-600 animate-bounce-short" />
        ) : (
          <Clock className="w-3 h-3" />
        )}
        <span>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  // Detailed view for Auction Detail page
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <div
          className={`flex items-center justify-center p-2 rounded-lg font-mono text-center min-w-[50px] ${
            timeLeft.isUrgent ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-slate-900 text-white'
          }`}
        >
          <div>
            <div className="text-xl font-bold leading-none">{String(timeLeft.days).padStart(2, '0')}</div>
            <div className="text-[10px] text-slate-300 uppercase tracking-wider mt-1">Days</div>
          </div>
        </div>
        <span className="font-bold text-slate-400">:</span>
        <div
          className={`flex items-center justify-center p-2 rounded-lg font-mono text-center min-w-[50px] ${
            timeLeft.isUrgent ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-slate-900 text-white'
          }`}
        >
          <div>
            <div className="text-xl font-bold leading-none">{String(timeLeft.hours).padStart(2, '0')}</div>
            <div className="text-[10px] text-slate-300 uppercase tracking-wider mt-1">Hours</div>
          </div>
        </div>
        <span className="font-bold text-slate-400">:</span>
        <div
          className={`flex items-center justify-center p-2 rounded-lg font-mono text-center min-w-[50px] ${
            timeLeft.isUrgent ? 'bg-rose-600 text-white shadow-lg shadow-rose-200' : 'bg-slate-900 text-white'
          }`}
        >
          <div>
            <div className="text-xl font-bold leading-none">{String(timeLeft.minutes).padStart(2, '0')}</div>
            <div className="text-[10px] text-slate-300 uppercase tracking-wider mt-1">Mins</div>
          </div>
        </div>
        <span className="font-bold text-slate-400">:</span>
        <div
          className={`flex items-center justify-center p-2 rounded-lg font-mono text-center min-w-[50px] ${
            timeLeft.isUrgent
              ? 'bg-rose-600 text-white shadow-lg shadow-rose-200 animate-pulse'
              : 'bg-indigo-600 text-white'
          }`}
        >
          <div>
            <div className="text-xl font-bold leading-none">{String(timeLeft.seconds).padStart(2, '0')}</div>
            <div className="text-[10px] text-slate-200 uppercase tracking-wider mt-1">Secs</div>
          </div>
        </div>
      </div>

      {timeLeft.isUrgent && (
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 mt-1">
          <Zap className="w-3.5 h-3.5 text-rose-600 animate-bounce" />
          <span>Anti-Sniping Active: Bids placed now automatically extend time by 2 minutes!</span>
        </div>
      )}
    </div>
  );
};

export default CountdownTimer;
