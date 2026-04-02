export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`flex flex-col h-full rounded-2xl p-5 border backdrop-blur-xl
      bg-white/[0.05] border-white/[0.09]
      shadow-[0_2px_4px_rgba(0,0,0,0.35),0_8px_24px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.07)]
      hover:border-white/[0.14] transition-all duration-200
      ${onClick ? 'cursor-pointer' : ''}
      ${className}`}
  >
    {children}
  </div>
);