import { useState, useEffect } from 'react';
import Logo from './Logo';

interface HeaderProps {
  onNavigate: (sectionId: string) => void;
  onContactClick: () => void;
}

const Header = ({ onNavigate, onContactClick }: HeaderProps) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-darkBlue-950 shadow-xl'
          : 'bg-darkBlue-950 shadow-xl'
      }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Logo 
            onClick={() => onNavigate('comanda')}
            scrolled={scrolled}
          />
          <nav className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('comanda')}
              className="font-medium transition-colors duration-200 text-white hover:text-orange-400"
            >
              Comandă
            </button>
            <button
              onClick={() => onNavigate('preturi')}
              className="font-medium transition-colors duration-200 text-white hover:text-orange-400"
            >
              Prețuri
            </button>
            <button
              onClick={onContactClick}
              className="px-6 py-2 rounded-lg font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Contact
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
