interface LogoProps {
  className?: string;
  onClick?: () => void;
  scrolled?: boolean;
}

const Logo = ({ className = '', onClick, scrolled = false }: LogoProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
    >
      <svg 
        width="280" 
        height="48" 
        viewBox="0 0 280 48" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={`h-12 w-auto transition-all duration-300`}
      >
        <defs>
          <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8"/>
            <stop offset="50%" stopColor="#0ea5e9"/>
            <stop offset="100%" stopColor="#0284c7"/>
          </linearGradient>
          <linearGradient id="eGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c"/>
            <stop offset="100%" stopColor="#f97316"/>
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle for letter E */}
        <circle 
          cx="20" 
          cy="24" 
          r="16" 
          fill="rgba(14, 165, 233, 0.15)" 
          stroke="rgba(14, 165, 233, 0.3)" 
          strokeWidth="1"
        />
        
        {/* Letter E - large, with bright blue gradient and glow */}
        <text 
          x="20" 
          y="32" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontSize="36" 
          fontWeight="900" 
          fill="url(#iconGradient)" 
          textAnchor="middle" 
          letterSpacing="-1"
          filter="url(#glow)"
        >
          E
        </text>
        
        {/* Letter "o" - white/gray for better visibility */}
        <text 
          x="42" 
          y="32" 
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
          fontSize="26" 
          fontWeight="600" 
          fill="#e0f2fe" 
          textAnchor="start" 
          letterSpacing="0"
        >
          o
        </text>
        
        {/* Letter "r" */}
        <text 
          x="56" 
          y="32" 
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
          fontSize="26" 
          fontWeight="600" 
          fill="#e0f2fe" 
          textAnchor="start" 
          letterSpacing="0"
        >
          r
        </text>
        
        {/* Letter "i" */}
        <text 
          x="66" 
          y="32" 
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
          fontSize="26" 
          fontWeight="600" 
          fill="#e0f2fe" 
          textAnchor="start" 
          letterSpacing="0"
        >
          i
        </text>
        
        {/* Space between Eori and Cod */}
        
        {/* Background circle for letter C */}
        <circle 
          cx="95" 
          cy="24" 
          r="14" 
          fill="rgba(249, 115, 22, 0.15)" 
          stroke="rgba(249, 115, 22, 0.3)" 
          strokeWidth="1"
        />
        
        {/* Letter "C" - capital, with bright orange gradient */}
        <text 
          x="95" 
          y="32" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontSize="32" 
          fontWeight="800" 
          fill="url(#eGradient)" 
          textAnchor="middle" 
          letterSpacing="-0.5"
          filter="url(#glow)"
        >
          C
        </text>
        
        {/* Letters "od" - white/gray for better visibility */}
        <text 
          x="115" 
          y="32" 
          fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" 
          fontSize="26" 
          fontWeight="600" 
          fill="#e0f2fe" 
          textAnchor="start" 
          letterSpacing="0"
        >
          od
        </text>
      </svg>
    </button>
  );
};

export default Logo;

