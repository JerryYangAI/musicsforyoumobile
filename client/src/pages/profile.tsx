import { MobileLayout } from "@/components/mobile/layout";
import { Button } from "@/components/ui/button";
import { CreditCard, Settings, LogOut, ExternalLink, HelpCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { useLocation } from "wouter";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/auth");
  };

  const phoneDisplay = user?.phone || "+1 (555) 000-0000";
  const initials = phoneDisplay.slice(-4);

  return (
    <MobileLayout>
      <div className="px-6 py-8 pb-32">
        <h1 className="text-3xl font-bold mb-8">Profile</h1>

        <div className="bg-card border border-white/10 rounded-2xl p-6 flex items-center gap-4 mb-8">
          <Avatar className="w-16 h-16 border-2 border-primary">
            <AvatarFallback className="bg-primary/20 text-primary font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold">Music Lover</h2>
            <p className="text-muted-foreground text-sm">{phoneDisplay}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10 rounded-2xl p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CreditCard size={120} />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-muted-foreground text-sm font-medium mb-1">Available Credits</h3>
            <div className="text-5xl font-bold mb-6 text-white tracking-tighter" data-testid="text-credits">
              {user?.credits || 0}
            </div>
            
            <Button className="w-full bg-white text-black hover:bg-white/90 font-bold h-12" data-testid="button-buy-credits">
              Buy More Credits
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          {[
            { icon: Settings, label: "Settings" },
            { icon: HelpCircle, label: "Help & Support" },
            { icon: ExternalLink, label: "Terms of Service" },
          ].map((item) => (
            <button key={item.label} className="w-full flex items-center justify-between p-4 bg-muted/20 hover:bg-muted/40 rounded-xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground">
                  <item.icon size={20} />
                </div>
                <span className="font-medium">{item.label}</span>
              </div>
              <ExternalLink size={16} className="text-muted-foreground opacity-50" />
            </button>
          ))}
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 mt-4 bg-destructive/10 hover:bg-destructive/20 rounded-xl text-destructive transition-colors"
            data-testid="button-logout"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                <LogOut size={20} />
              </div>
              <span className="font-medium">Sign Out</span>
            </div>
          </button>
        </div>
      </div>
    </MobileLayout>
  );
}
