import React from 'react';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-center bg-[var(--bg-canvas)]">
      <h1 className="text-6xl font-bold text-[var(--bg-chrome)] mb-4">404</h1>
      <p className="text-xl text-[var(--text-secondary)] mb-8">Page not found</p>
      <Button onClick={() => navigate('/')}>Return Home</Button>
    </div>
  );
};
