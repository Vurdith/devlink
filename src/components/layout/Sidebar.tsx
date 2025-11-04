"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { BackButton } from "@/components/ui/BackButton";
import { motion } from "framer-motion";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const navigation: NavItem[] = [
  {
    name: "Home",
    href: "/home",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="w-5 h-5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    description: "Your feed and recent posts"
  }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <motion.div 
      className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-slate-900/95 via-purple-900/20 to-slate-900/95 backdrop-blur-2xl border-r border-purple-500/20 z-40 shadow-2xl"
    >
      {/* Static background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10"></div>
      
      <div className="relative flex flex-col h-full">
        {/* Logo Section */}
        <div 
          className="p-6 border-b border-purple-500/20 relative overflow-hidden"
        >
          {/* Background glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5"></div>
          
          <Link href="/" className="flex items-center gap-4 group relative z-10">
            <motion.div 
              className="relative"
              whileHover={{ 
                rotate: [0, -10, 10, -5, 0],
                scale: 1.1
              }}
              transition={{ 
                duration: 0.6,
                ease: "easeInOut"
              }}
            >
              <img
                src="/logo/logo.png"
                alt="DevLink"
                className="w-12 h-12 object-contain drop-shadow-lg"
              />
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </motion.div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
                DevLink
              </h1>
              <p className="text-sm text-purple-300/80 font-medium">
                Roblox Network
              </p>
            </div>
          </Link>
        </div>

        {/* Back Button */}
        <div 
          className="px-6 py-4 border-b border-purple-500/20"
        >
          <BackButton className="w-full justify-start bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 hover:from-purple-500/20 hover:to-blue-500/20 transition-all duration-300" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-6 space-y-3">
          {navigation.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <motion.div
                key={item.name}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                    isActive 
                      ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-400/30 shadow-lg shadow-purple-500/20" 
                      : "text-purple-200/70 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 hover:border hover:border-purple-500/20"
                  )}
                  title={item.description}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-blue-400 rounded-r-full"
                      layoutId="activeIndicator"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  {/* Icon container */}
                  <motion.div 
                    className={cn(
                      "p-2 rounded-lg transition-all duration-300 relative",
                      isActive 
                        ? "bg-gradient-to-br from-purple-500/30 to-blue-500/30 text-white shadow-lg" 
                        : "text-purple-300/70 group-hover:text-white group-hover:bg-gradient-to-br group-hover:from-purple-500/20 group-hover:to-blue-500/20"
                    )}
                    whileHover={{ scale: 1.05, rotate: 2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.icon}
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-purple-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </motion.div>
                  
                  <div className="flex-1">
                    <span className="font-medium text-base">{item.name}</span>
                  </div>
                  
                  {/* Arrow indicator */}
                  <motion.div
                    className={cn(
                      "transition-all duration-300",
                      isActive ? "text-purple-300" : "text-transparent group-hover:text-purple-300/50"
                    )}
                    animate={{ x: isActive ? 0 : -10 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom section */}
        <motion.div 
          className="p-6 border-t border-purple-500/20 relative"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-t from-purple-500/5 to-transparent"></div>
          
          <div className="relative z-10 text-center space-y-3">
            <motion.div
              className="flex justify-center space-x-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              {["Connect", "Collaborate", "Create"].map((word, index) => (
                <motion.span
                  key={word}
                  className="text-xs font-semibold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + index * 0.1, duration: 0.4 }}
                >
                  {word}
                </motion.span>
              ))}
            </motion.div>
            
            <motion.div
              className="w-full h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1.4, duration: 0.8 }}
            />
            
            <motion.p 
              className="text-xs text-purple-300/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.5 }}
            >
              Powered by the Roblox Community
            </motion.p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
