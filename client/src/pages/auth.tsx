import { useState } from "react";
import { useLocation } from "wouter";
import { MobileLayout } from "@/components/mobile/layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smartphone, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import heroMusic from "@/assets/hero-music.png";

export default function AuthPage() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      await api.auth.sendCode(phone);
      setStep("otp");
      toast({
        title: "Code Sent",
        description: `Verification code sent to ${phone}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length < 4) return;
    setLoading(true);
    try {
      await login(phone, code);
      setLocation("/home");
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout hideNav>
      <div className="flex flex-col h-full">
        <div className="relative h-[40%] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
          <img src={heroMusic} className="w-full h-full object-cover opacity-80" alt="Music" />
          
          <div className="absolute bottom-8 left-6 z-20">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter">
              musics<span className="text-primary">foryou</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Your personal AI music composer.
            </p>
          </div>
        </div>

        <div className="flex-1 px-6 pt-8 flex flex-col gap-6">
          {step === "phone" ? (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="+1 (555) 000-0000" 
                    className="pl-10 h-12 bg-muted/50 border-white/10 text-lg"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    data-testid="input-phone"
                  />
                </div>
              </div>
              <Button 
                className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90"
                onClick={handleSendCode}
                disabled={loading}
                data-testid="button-send-code"
              >
                {loading ? "Sending Code..." : "Continue"}
              </Button>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-500">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-bold">Verify Number</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Enter the code sent to {phone}
                </p>
              </div>

              <Input 
                placeholder="Enter 4-digit code" 
                className="h-14 text-center text-2xl font-bold bg-muted/50 border-white/10" 
                maxLength={4}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                data-testid="input-otp"
              />

              <Button 
                className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 mt-4"
                onClick={handleVerify}
                disabled={loading || code.length < 4}
                data-testid="button-verify"
              >
                {loading ? "Verifying..." : "Start Listening"}
              </Button>
              
              <button 
                onClick={() => setStep("phone")}
                className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-white"
              >
                Wrong number? Go back
              </button>
            </div>
          )}

          <div className="mt-auto mb-8 text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>
            
            <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 h-12">
              WeChat
            </Button>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
}
