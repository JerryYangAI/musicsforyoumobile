import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile/layout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Mic, UploadCloud, CheckCircle, AlertCircle, Play, Square } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

export default function VoicePage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => {
           if (prev >= 30) {
             setIsRecording(false);
             setHasRecording(true);
             return 30;
           }
           return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setHasRecording(true);
    } else {
      setRecordingTime(0);
      setHasRecording(false);
      setIsRecording(true);
    }
  };

  const handleUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      // In a real app, this would trigger the backend
    }, 2500);
  };

  return (
    <MobileLayout>
      <div className="px-6 py-8 pb-32">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Voice Cloning</h1>
          <p className="text-muted-foreground">Train AI to sing with your voice.</p>
        </header>

        {/* Info Card */}
        <Alert className="bg-primary/5 border-primary/20 mb-8">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary font-bold">Requires Approval</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground mt-1">
            This feature uses OpenAI's custom voice engine and is pending access approval. You can create a sample profile now.
          </AlertDescription>
        </Alert>

        <div className="space-y-8">
          {/* Step 1: Consent */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs">1</span>
              Read Consent Phrase
            </h3>
            <div className="bg-card border border-white/5 p-4 rounded-xl text-center italic text-muted-foreground text-sm leading-relaxed">
              "I verify that I am the owner of this voice and I consent to having it cloned for the purpose of generating music on this platform."
            </div>
          </div>

          {/* Step 2: Record */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-xs">2</span>
              Record Sample
            </h3>
            
            <div className="flex flex-col items-center justify-center py-8 bg-muted/20 rounded-2xl border border-white/5 relative overflow-hidden">
               {/* Waveform Animation Placeholder */}
               <div className={cn("absolute inset-0 flex items-center justify-center opacity-20 transition-opacity", isRecording ? "opacity-100" : "opacity-0")}>
                  <div className="flex gap-1 items-center h-full">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="w-2 bg-primary animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s` }} />
                    ))}
                  </div>
               </div>

               <div className="z-10 text-center space-y-4">
                 <div className="text-4xl font-mono font-bold tracking-widest tabular-nums">
                   00:{recordingTime.toString().padStart(2, '0')}
                 </div>
                 
                 <Button 
                   size="icon" 
                   className={cn(
                     "w-20 h-20 rounded-full border-4 transition-all duration-300",
                     isRecording 
                       ? "bg-destructive border-destructive/30 hover:bg-destructive shadow-[0_0_40px_rgba(239,68,68,0.4)]" 
                       : "bg-primary border-primary/30 hover:bg-primary shadow-[0_0_40px_rgba(109,40,217,0.4)]"
                   )}
                   onClick={toggleRecording}
                 >
                   {isRecording ? <Square fill="currentColor" size={32} /> : <Mic size={32} />}
                 </Button>

                 <p className="text-xs text-muted-foreground uppercase tracking-widest">
                   {isRecording ? "Recording..." : hasRecording ? "Recorded" : "Tap to Record"}
                 </p>
               </div>
            </div>
          </div>

          {/* Step 3: Upload */}
          <Button 
            className="w-full h-14 text-lg font-bold" 
            disabled={!hasRecording || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? (
              "Uploading Sample..."
            ) : (
              <span className="flex items-center gap-2"><UploadCloud /> Create Voice Profile</span>
            )}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}
