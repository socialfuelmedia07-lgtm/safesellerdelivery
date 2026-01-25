import quilboxLogo from '@/assets/quilbox-logo.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo = ({ size = 'md', showText = true }: LogoProps) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };
  
  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className="flex items-center gap-2">
      <img 
        src={quilboxLogo} 
        alt="QuilBox Logo" 
        className={`${sizes[size]} object-contain rounded-xl`}
      />
      {showText && (
        <span className={`${textSizes[size]} font-extrabold`} style={{ fontFamily: "'Exo 2', sans-serif" }}>
          Quil<span className="text-primary">Box</span>
        </span>
      )}
    </div>
  );
};
