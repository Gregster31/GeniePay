export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = '', onClick }) => (
  <div
    onClick={onClick}
    className={`flex flex-col h-full rounded-2xl p-5 border backdrop-blur-xl
      dark:bg-white/[0.05] dark:border-white/[0.09] bg-[#FCFAFF] border-black/[0.07]
      dark:shadow-[0_2px_4px_rgba(0,0,0,0.35),0_8px_24px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.07)]
      shadow-[0_2px_8px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]
      dark:hover:border-white/[0.14] hover:border-black/[0.12] transition-all duration-200
      ${onClick ? 'cursor-pointer' : ''}
      ${className}`}
  >
    {children}
  </div>
);