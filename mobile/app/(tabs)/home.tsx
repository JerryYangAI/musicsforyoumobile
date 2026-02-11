import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/lib/api';
import { useAuth } from '../../src/lib/auth-context';
import { useAudioPlayer } from '../../src/lib/audio-player';
import { colors, spacing, fontSize } from '../../src/lib/theme';

const MUSIC_STYLES = ['Cinematic', 'Lo-Fi', 'Cyberpunk', 'Jazz', 'Classical', 'Rock', 'Pop', 'Ambient'];
const MOODS = ['Happy', 'Sad', 'Energetic', 'Relaxed', 'Focus', 'Dark', 'Romantic'];

export default function HomeScreen() {
  const { user, refreshUser } = useAuth();
  const { playSong, isPlaying, currentSong, pause, resume } = useAudioPlayer();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [mood, setMood] = useState('');
  const [duration, setDuration] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSongId, setGeneratedSongId] = useState<string | null>(null);
  const [generatedSong, setGeneratedSong] = useState<any>(null);

  useEffect(() => {
    if (generatedSongId) {
      const pollSong = setInterval(async () => {
        try {
          const song = await api.music.getSong(generatedSongId);
          if (song.status === 'completed') {
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
      Alert.alert('Generation Failed', error.message);
    }
  };

  const creditsRequired = duration === 30 ? 1 : 2;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Create Music</Text>
          <Text style={styles.subtitle}>Turn your ideas into audio with AI.</Text>
        </View>
        <View style={styles.creditsBadge}>
          <Text style={styles.creditsLabel}>Credits</Text>
          <Text style={styles.creditsValue}>{user?.credits || 0}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.labelRow}>
          <Ionicons name="sparkles" size={16} color={colors.primary} />
          <Text style={styles.label}>Describe your song</Text>
        </View>
        <TextInput
          style={styles.textArea}
          placeholder="e.g. A sad piano track for a rainy night in Tokyo..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          value={prompt}
          onChangeText={setPrompt}
        />
      </View>

      <View style={styles.row}>
        <View style={styles.halfSection}>
          <Text style={styles.label}>Style</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            <View style={styles.chips}>
              {MUSIC_STYLES.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.chip, style === s && styles.chipActive]}
                  onPress={() => setStyle(s)}
                >
                  <Text style={[styles.chipText, style === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Mood</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
          <View style={styles.chips}>
            {MOODS.map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.chip, mood === m && styles.chipActive]}
                onPress={() => setMood(m)}
              >
                <Text style={[styles.chipText, mood === m && styles.chipTextActive]}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.durationHeader}>
          <View style={styles.labelRow}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <Text style={styles.label}>Duration</Text>
          </View>
          <View style={styles.creditCost}>
            <Text style={styles.creditCostText}>{creditsRequired} Credit{creditsRequired > 1 ? 's' : ''}</Text>
          </View>
        </View>
        <View style={styles.durationButtons}>
          <TouchableOpacity
            style={[styles.durationBtn, duration === 30 && styles.durationBtnActive]}
            onPress={() => setDuration(30)}
          >
            <Text style={[styles.durationText, duration === 30 && styles.durationTextActive]}>30s</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.durationBtn, duration === 60 && styles.durationBtnActive]}
            onPress={() => setDuration(60)}
          >
            <Text style={[styles.durationText, duration === 60 && styles.durationTextActive]}>60s</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.generateBtn, (!prompt || isGenerating) && styles.generateBtnDisabled]}
        onPress={handleGenerate}
        disabled={!prompt || isGenerating}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.generateGradient}
        >
          {isGenerating ? (
            <View style={styles.generateContent}>
              <ActivityIndicator color={colors.foreground} size="small" />
              <Text style={styles.generateText}>Generating...</Text>
            </View>
          ) : (
            <View style={styles.generateContent}>
              <Ionicons name="musical-notes" size={24} color={colors.foreground} />
              <Text style={styles.generateText}>Generate Music</Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {generatedSong && (
        <View style={styles.resultCard}>
          <View style={styles.resultCover}>
            <Ionicons name="play-circle" size={32} color={colors.foreground} />
          </View>
          <View style={styles.resultInfo}>
            <Text style={styles.resultTitle} numberOfLines={1}>{generatedSong.title}</Text>
            <Text style={styles.resultMeta}>{generatedSong.style} • {generatedSong.duration}s</Text>
          </View>
          <TouchableOpacity 
            style={styles.resultPlayBtn}
            onPress={() => {
              if (currentSong?.id === generatedSong.id && isPlaying) {
                pause();
              } else if (currentSong?.id === generatedSong.id) {
                resume();
              } else {
                playSong(generatedSong);
              }
            }}
          >
            <Ionicons 
              name={currentSong?.id === generatedSong.id && isPlaying ? "pause" : "play"} 
              size={20} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
    marginTop: spacing.xl,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
  },
  creditsBadge: {
    alignItems: 'flex-end',
  },
  creditsLabel: {
    fontSize: fontSize.xs,
    color: colors.mutedForeground,
  },
  creditsValue: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.primary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  halfSection: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.mutedForeground,
  },
  textArea: {
    backgroundColor: colors.muted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.foreground,
    height: 100,
  },
  chipScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  chips: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
  },
  chipTextActive: {
    color: colors.foreground,
    fontWeight: '600',
  },
  durationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  creditCost: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  creditCostText: {
    fontSize: fontSize.xs,
    color: colors.primary,
    fontWeight: '500',
  },
  durationButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  durationBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  durationBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  durationText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.mutedForeground,
  },
  durationTextActive: {
    color: colors.foreground,
  },
  generateBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: spacing.md,
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateGradient: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  generateContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  generateText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  resultCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  resultCover: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultInfo: {
    flex: 1,
  },
  resultTitle: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 4,
  },
  resultMeta: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
  },
  resultPlayBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  resultPlayText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.primary,
  },
});
