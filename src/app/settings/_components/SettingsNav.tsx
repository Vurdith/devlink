"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SettingsNav() {
  const pathname = usePathname();
  
  const navItems = [
    { 
      href: "/settings", 
      label: "Profile", 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      href: "/settings/security", 
      label: "Security", 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
          <circle cx="12" cy="16" r="1" stroke="currentColor" strokeWidth="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2"/>
        </svg>
      )
    },
    { 
      href: "/settings/notifications", 
      label: "Notifications", 
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-4 h-4">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  ];

  const link = (href: string, label: string, icon: React.ReactNode) => {
    const active = pathname === href;
    return (
      <Link 
        href={href} 
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-medium ${
          active 
            ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-white shadow-lg" 
            : "text-purple-200 hover:bg-white/5 hover:text-white hover:scale-[1.02]"
        }`}
      >
        <span className="flex items-center justify-center">{icon}</span>
        <span>{label}</span>
        {active && (
          <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full"></div>
        )}
      </Link>
    );
  };

  return (
    <nav className="space-y-2">
      {navItems.map((item) => (
        <div key={item.href}>
          {link(item.href, item.label, item.icon)}
        </div>
      ))}
    </nav>
  );
}


