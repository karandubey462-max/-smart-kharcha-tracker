import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

export default function Onboarding() {
  const { completeOnboarding } = useStore();
  const navigate = useNavigate();

  const slides = [
    {
      icon: '💸',
      gradient: 'linear-gradient(135deg, #6C63FF 0%, #A78BFA 100%)',
      title: 'Track Every Rupee',
      subtitle: 'Know exactly where your money goes — daily, monthly, and yearly.',
    },
    {
      icon: '🤝',
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
      title: 'Never Forget Who Owes You',
      subtitle: 'Track money you lent or borrowed with smart reminders.',
    },
    {
      icon: '📊',
      gradient: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
      title: 'Stay on Your Budget',
      subtitle: 'Set monthly budgets, get alerts, and save more every month.',
    },
  ];

  const [slide, setSlide] = useState(0);
  const isLast = slide === slides.length - 1;

  const handleNext = () => {
    if (isLast) {
      completeOnboarding();
      navigate('/login');
    } else {
      setSlide(s => s + 1);
    }
  };

  const { icon, gradient, title, subtitle } = slides[slide];

  return (
    <div className="onboarding-page" style={{ 
      background: 'var(--bg-primary)',
      minHeight: '100vh',
      minHeight: '-webkit-fill-available',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Skip */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 'max(calc(env(safe-area-inset-top) + 12px), 20px) 24px 0' }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => { completeOnboarding(); navigate('/login'); }}
        >Skip</button>
      </div>

      {/* Slide illustration */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{
          width: 160, height: 160, borderRadius: '50%',
          background: gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 72, marginBottom: 40,
          boxShadow: '0 20px 60px rgba(108,99,255,0.4)',
          animation: 'scaleIn 0.4s ease',
        }}>{icon}</div>

        <h1 style={{ fontSize: 28, fontWeight: 800, textAlign: 'center', marginBottom: 14, lineHeight: 1.2 }}>
          {title}
        </h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: 16, lineHeight: 1.6, maxWidth: 300 }}>
          {subtitle}
        </p>
      </div>

      {/* Dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 24 }}>
        {slides.map((_, i) => (
          <div key={i} style={{
            width: i === slide ? 24 : 8,
            height: 8, borderRadius: 999,
            background: i === slide ? 'var(--accent-primary)' : 'var(--border-default)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '0 24px 40px' }}>
        <button className="btn btn-primary btn-lg btn-full" onClick={handleNext}>
          {isLast ? 'Get Started 🚀' : 'Next →'}
        </button>
      </div>
    </div>
  );
}

