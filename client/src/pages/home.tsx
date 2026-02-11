import { useState, useEffect } from "react";
import { MobileLayout } from "@/components/mobile/layout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Wand2, Clock, Loader2, PlayCircle, AlertCircle } from "lucide-react";
import { MUSIC_STYLES, MOODS } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function HomePage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("");
  const [mood, setMood] = useState("");
  const [duration, setDuration] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSongId, setGeneratedSongId] = useState<string | null>(null);
  const [generatedSong, setGeneratedSong] = useState<any>(null);

  useEffect(() => {
    if (generatedSongId) {
      const pollSong = setInterval(async () => {
        try {
          const song = await api.music.getSong(generatedSongId);
          if (song.status === "completed") {
            setGeneratedSong(song);
            setIsGenerating(false);
            clearInterval(pollSong);
            await refreshUser();
          }
        } catch (error) {
          clearInterval(pollSong);
        }
      }, 1000);

      return () => clearInterval(pollSong);
    }
  }, [generatedSongId]);

  const handleGenerate = async () => {
    if (!prompt) return;
    setIsGenerating(true);
    setGeneratedSong(null);

    try {
      const response = await api.music.generate({
        prompt,
        style,
        mood,
        duration,
      });
      setGeneratedSongId(response.song.id);
    } catch (error: any) {
      setIsGenerating(false);
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const creditsRequired = duration === 30 ? 1 : 2;

  return (
    <MobileLayout>
      <div className="px-6 py-8 pb-32">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">Create Music</h1>
            <p className="text-muted-foreground">Turn your ideas into audio with AI.</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Credits</div>
            <div className="text-2xl font-bold text-primary">{user?.credits || 0}</div>
          </div>
        </header>

        {user && user.credits < creditsRequired && (
          <Alert className="mb-6 bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              Insufficient credits. You need {creditsRequired} credits to generate this track.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Wand2 size={16} className="text-primary" />
              Describe your song
            </label>
            <textarea 
              className="w-full h-24 bg-muted/30 border border-white/10 rounded-xl p-4 text-base focus:outline-none focus:ring-1 focus:ring-primary resize-none placeholder:text-muted-foreground/50"
              placeholder="e.g. A sad piano track for a rainy night in Tokyo..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              data-testid="input-prompt"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Style</label>
              <Select onValueChange={setStyle}>
                <SelectTrigger className="bg-muted/30 border-white/10 h-12" data-testid="select-style">
                  <SelectValue placeholder="Select Style" />
                </SelectTrigger>
                <SelectContent>
                  {MUSIC_STYLES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Mood</label>
              <Select onValueChange={setMood}>
                <SelectTrigger className="bg-muted/30 border-white/10 h-12" data-testid="select-mood">
                  <SelectValue placeholder="Select Mood" />
                </SelectTrigger>
                <SelectContent>
                  {MOODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                Duration: <span className="text-white font-bold">{duration}s</span>
              </label>
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                {creditsRequired} {creditsRequired === 1 ? "Credit" : "Credits"}
              </span>
            </div>
            <Slider 
              value={[duration]} 
              onValueChange={(vals) => setDuration(vals[0])}
              max={60} 
              min={30} 
              step={30}
              className="py-4"
            />
          </div>

          <Button 
            size="lg" 
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-[0.98]"
            onClick={handleGenerate}
            disabled={isGenerating || !prompt || (user ? user.credits < creditsRequired : false)}
            data-testid="button-generate"
          >
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" /> Generating...
              </span>
            ) : (
              "Generate Music"
            )}
          </Button>
        </div>

        {generatedSong && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-card border border-white/10 rounded-2xl p-4 flex gap-4 items-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
              
              <div className="w-16 h-16 rounded-lg bg-black overflow-hidden relative shrink-0 z-10">
                <img src={generatedSong.coverUrl || ""} alt="Cover" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <PlayCircle className="text-white w-8 h-8" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0 z-10">
                <h3 className="font-bold text-white truncate">{generatedSong.title}</h3>
                <p className="text-sm text-muted-foreground">{generatedSong.style} • {generatedSong.duration}s</p>
              </div>

              <div className="z-10">
                 <Button size="sm" variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                   Play
                 </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
