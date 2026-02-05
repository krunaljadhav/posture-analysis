import React, { useState } from 'react';
import { Zap, History, FileText, Loader2, Menu, X } from 'lucide-react';

interface HeaderProps {
  activeTab: 'assess' | 'history';
  onTabChange: (tab: 'assess' | 'history') => void;
  isModelLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange, isModelLoading }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: 'assess' | 'history') => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-gradient-dark text-primary-foreground sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-accent to-cyan-400 flex items-center justify-center shadow-lg">
              <Zap className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight">Posture Code</h1>
              <p className="text-[10px] sm:text-xs text-primary-foreground/70 hidden xs:block">Physio AI Analysis</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center space-x-1 bg-primary-foreground/10 rounded-lg p-1">
            <button
              onClick={() => handleTabChange('assess')}
              className={`flex items-center px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'assess'
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10'
              }`}
            >
              <FileText className="w-4 h-4 mr-1.5 md:mr-2" />
              <span className="hidden md:inline">New </span>Assessment
            </button>
            <button
              onClick={() => handleTabChange('history')}
              className={`flex items-center px-3 md:px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-accent text-accent-foreground shadow-sm'
                  : 'text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10'
              }`}
            >
              <History className="w-4 h-4 mr-1.5 md:mr-2" />
              History
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 rounded-lg hover:bg-primary-foreground/10 transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          
          {/* Status - Desktop */}
          {isModelLoading && (
            <div className="hidden md:flex items-center space-x-2 text-sm text-primary-foreground/70">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading AI...</span>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden pb-4 animate-fade-in">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => handleTabChange('assess')}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'assess'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-primary-foreground/80 hover:bg-primary-foreground/10'
                }`}
              >
                <FileText className="w-5 h-5 mr-3" />
                New Assessment
              </button>
              <button
                onClick={() => handleTabChange('history')}
                className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-accent text-accent-foreground'
                    : 'text-primary-foreground/80 hover:bg-primary-foreground/10'
                }`}
              >
                <History className="w-5 h-5 mr-3" />
                History
              </button>
            </nav>
            {isModelLoading && (
              <div className="flex items-center space-x-2 text-sm text-primary-foreground/70 mt-3 px-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading AI Model...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
