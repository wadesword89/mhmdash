import { useState } from 'react';
import { Droplets, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export const Header = () => {
  return (
    <header className="bg-teal-600 text-white px-4 sm:px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center">
            <Droplets className="h-5 w-5 text-teal-700" />
          </div>
          <h1 className="text-lg sm:text-xl font-bold">
            Level Monitoring Dashboard
          </h1>
        </div>
        <nav className="hidden sm:flex items-center space-x-4"></nav>
      </div>
    </header>
  );
};
