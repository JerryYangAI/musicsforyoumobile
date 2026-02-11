import { Link, useLocation } from "wouter";
import { Home, Music2, Mic, User, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export function MobileLayout({ children, hideNav = false }: MobileLayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", href: "/home" },
    { icon: Music2, label: "Library", href: "/library" },
    { icon: Mic, label: "Voice", href: "/voice" },
    { icon: User, label: "Profile", href: "/profile" },
  ];

  return (
    <div id="app-container" className="flex flex-col h-screen relative bg-background text-foreground overflow-hidden">
      {/* Status Bar Spacer (Simulated) */}
      <div className="h-safe-top w-full bg-background/90 backdrop-blur-md z-50 fixed top-0 left-0 right-0 border-b border-white/5 hidden sm:block h-[20px]" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide no-scrollbar">
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideNav && (
        <nav className="glass-nav absolute bottom-0 left-0 right-0 px-6 py-4 pb-6 z-40">
          <div className="flex justify-between items-center">
            {navItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <button className={cn(
                    "flex flex-col items-center gap-1 transition-all duration-200 active:scale-95",
                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  )}>
                    <item.icon 
                      size={24} 
                      className={cn(isActive && "fill-current opacity-20")}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                  </button>
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
