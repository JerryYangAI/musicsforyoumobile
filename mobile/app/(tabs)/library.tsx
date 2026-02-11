import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, type Song } from '../../src/lib/api';
import { useAudioPlayer } from '../../src/lib/audio-player';
import { colors, spacing, fontSize } from '../../src/lib/theme';

export default function LibraryScreen() {
  const { playSong, isPlaying, currentSong, pause, resume } = useAudioPlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLibrary = async () => {
    try {
      const data = await api.music.getLibrary();
      setSongs(data.songs);
    } catch (error) {
      console.error('Failed to fetch library:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLibrary();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id && isPlaying) {
      pause();
    } else if (currentSong?.id === song.id) {
      resume();
    } else {
      playSong(song);
    }
  };

  const renderSong = ({ item }: { item: Song }) => (
    <TouchableOpacity style={styles.songCard} onPress={() => handlePlaySong(item)}>
      <View style={styles.coverContainer}>
        {item.coverUrl ? (
          <View style={styles.cover}>
            <Ionicons name="musical-notes" size={24} color={colors.foreground} />
          </View>
        ) : (
          <View style={styles.coverPlaceholder}>
            <Ionicons name="musical-notes" size={24} color={colors.mutedForeground} />
          </View>
        )}
        <View style={[styles.playOverlay, currentSong?.id === item.id && styles.playOverlayActive]}>
          <Ionicons 
            name={currentSong?.id === item.id && isPlaying ? "pause-circle" : "play-circle"} 
            size={32} 
            color={colors.foreground} 
          />
        </View>
      </View>

      <View style={styles.songInfo}>
        <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.songMeta}>
          {item.style && (
            <>
              <View style={styles.styleBadge}>
                <Text style={styles.styleBadgeText}>{item.style}</Text>
              </View>
              <Text style={styles.separator}>•</Text>
            </>
          )}
          <Text style={styles.metaText}>{formatDuration(item.duration)}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.metaText}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.moreBtn}>
        <Ionicons name="ellipsis-vertical" size={20} color={colors.mutedForeground} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Works</Text>
          <Text style={styles.subtitle}>Your generated library</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{songs.length} TRACKS</Text>
        </View>
      </View>

      {songs.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="musical-notes-outline" size={64} color={colors.muted} />
          <Text style={styles.emptyText}>No tracks yet. Start creating!</Text>
        </View>
      ) : (
        <FlatList
          data={songs}
          renderItem={renderSong}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl + spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
  },
  countBadge: {
    backgroundColor: colors.muted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  countText: {
    fontSize: fontSize.xs,
    color: colors.mutedForeground,
    fontFamily: 'monospace',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  songCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  coverContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlayActive: {
    backgroundColor: 'rgba(124, 58, 237, 0.6)',
  },
  songInfo: {
    flex: 1,
    minWidth: 0,
  },
  songTitle: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 4,
  },
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  styleBadge: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  styleBadgeText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '500',
  },
  separator: {
    color: colors.mutedForeground,
    fontSize: fontSize.xs,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.mutedForeground,
  },
  moreBtn: {
    padding: spacing.sm,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
  },
});
