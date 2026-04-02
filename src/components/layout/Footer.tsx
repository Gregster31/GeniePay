import { Github, Linkedin, Twitter } from "lucide-react";

const SOCIAL_LINKS = [
  { href: 'https://github.com/Gregster31/GeniePay',         icon: Github,   label: 'GitHub' },
  { href: 'https://www.linkedin.com/company/geniepayworks', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://x.com/pay_genie',                        icon: Twitter,  label: 'X' },
];

export const Footer: React.FC = () => (
  <footer className="mt-[52px] border-t border-white/[0.07]">
    <div className="flex justify-between items-center flex-wrap gap-3 py-4 border-t border-white/[0.07]">
      <span className="text-[12px] text-gray-600">&copy; 2026 GeniePay. All Rights Reserved.</span>
      <div className="flex gap-1.5">
        {SOCIAL_LINKS.map(({ href, icon: Icon, label }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
            className="w-[30px] h-[30px] rounded-lg flex items-center justify-center text-gray-500 border border-white/[0.09] hover:text-purple-300 hover:border-[#5D00F2]/35 transition-all">
            <Icon size={14} />
          </a>
        ))}
      </div>
    </div>
  </footer>
);