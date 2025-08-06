import { useState } from 'react';
import { Droplets, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export const Header = () => {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call delay - update when you have actual API logic***
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
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
        <nav className="hidden sm:flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-white/80">
            <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-teal-500"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </Button>
        </nav>
      </div>
    </header>
  );
};
