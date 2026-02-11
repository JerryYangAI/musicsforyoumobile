import { useQuery } from "@tanstack/react-query";
import { MobileLayout } from "@/components/mobile/layout";
import { api } from "@/lib/api";
import { PlayCircle, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function LibraryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["library"],
    queryFn: () => api.music.getLibrary(),
  });

  const songs = data?.songs || [];

  return (
    <MobileLayout>
      <div className="px-6 py-8 pb-32">
        <header className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Works</h1>
            <p className="text-muted-foreground text-sm">Your generated library</p>
          </div>
          <span className="text-xs font-mono bg-muted px-2 py-1 rounded text-muted-foreground">
            {songs.length} TRACKS
          </span>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No tracks yet. Start creating!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {songs.map((song) => (
              <div 
                key={song.id} 
                className="group bg-card/50 hover:bg-card border border-white/5 hover:border-white/10 rounded-xl p-3 flex items-center gap-4 transition-all active:scale-[0.99]"
                data-testid={`card-song-${song.id}`}
              >
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted shrink-0 shadow-lg">
                  {song.coverUrl ? (
                    <img src={song.coverUrl} alt={song.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-secondary/30" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayCircle className="text-white w-8 h-8 drop-shadow-lg" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white truncate text-base mb-1">{song.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {song.style && (
                      <>
                        <span className="px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary font-medium">{song.style}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}</span>
                    <span>•</span>
                    <span>{new Date(song.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                    <MoreVertical size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
