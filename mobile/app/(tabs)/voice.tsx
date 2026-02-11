import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/lib/api';
import { colors, spacing, fontSize } from '../../src/lib/theme';

const CONSENT_PHRASE = "I verify that I am the owner of this voice and I consent to having it cloned for the purpose of generating music on this platform.";

export default function VoiceScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!permissionResponse?.granted) {
        const permission = await requestPermission();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Please enable microphone access to record voice samples.');
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setIsRecording(true);
      setRecordingTime(0);
      setHasRecording(false);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 30) {
            stopRecording();
            return 30;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Recording Error', 'Failed to start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        setRecordingUri(uri);
        recordingRef.current = null;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      setIsRecording(false);
      setHasRecording(true);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const handleUpload = async () => {
    if (!recordingUri) return;
    
    setIsUploading(true);
    try {
      await api.voice.uploadSample(recordingUri, CONSENT_PHRASE);
      Alert.alert('Success', 'Voice sample uploaded successfully! We will process it and notify you when your custom voice is ready.');
      setHasRecording(false);
      setRecordingUri(null);
      setRecordingTime(0);
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Cloning</Text>
        <Text style={styles.subtitle}>Train AI to sing with your voice.</Text>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.infoTitle}>Requires Approval</Text>
        </View>
        <Text style={styles.infoText}>
          This feature uses OpenAI's custom voice engine and is pending access approval. You can create a sample profile now.
        </Text>
      </View>

      <View style={styles.step}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>1</Text>
          </View>
          <Text style={styles.stepTitle}>Read Consent Phrase</Text>
        </View>
        <View style={styles.consentBox}>
          <Text style={styles.consentText}>"{CONSENT_PHRASE}"</Text>
        </View>
      </View>

      <View style={styles.step}>
        <View style={styles.stepHeader}>
          <View style={styles.stepNumber}>
            <Text style={styles.stepNumberText}>2</Text>
          </View>
          <Text style={styles.stepTitle}>Record Sample</Text>
        </View>
        
        <View style={styles.recorderContainer}>
          <View style={styles.waveformContainer}>
            {isRecording && (
              <View style={styles.waveform}>
                {[...Array(20)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveBar,
                      { height: Math.random() * 60 + 20 }
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          <Text style={styles.timer}>
            00:{recordingTime.toString().padStart(2, '0')}
          </Text>

          <TouchableOpacity
            style={[
              styles.recordBtn,
              isRecording ? styles.recordBtnStop : styles.recordBtnStart
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <Ionicons name="stop" size={32} color={colors.foreground} />
            ) : (
              <Ionicons name="mic" size={32} color={colors.foreground} />
            )}
          </TouchableOpacity>

          <Text style={styles.recordLabel}>
            {isRecording ? 'Recording...' : hasRecording ? 'Recorded' : 'Tap to Record'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.uploadBtn, (!hasRecording || isUploading) && styles.uploadBtnDisabled]}
        onPress={handleUpload}
        disabled={!hasRecording || isUploading}
      >
        <Ionicons name="cloud-upload" size={24} color={colors.foreground} />
        <Text style={styles.uploadText}>
          {isUploading ? 'Uploading Sample...' : 'Create Voice Profile'}
        </Text>
      </TouchableOpacity>
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
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
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
  infoCard: {
    backgroundColor: 'rgba(124, 58, 237, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(124, 58, 237, 0.2)',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: fontSize.sm,
    fontWeight: 'bold',
    color: colors.primary,
  },
  infoText: {
    fontSize: fontSize.xs,
    color: colors.mutedForeground,
    lineHeight: 18,
  },
  step: {
    marginBottom: spacing.xl,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: fontSize.xs,
    color: colors.foreground,
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  consentBox: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
  },
  consentText: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  recorderContainer: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
  },
  waveformContainer: {
    height: 80,
    width: '100%',
    marginBottom: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: '100%',
  },
  waveBar: {
    width: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
    opacity: 0.6,
  },
  timer: {
    fontSize: fontSize['4xl'],
    fontWeight: 'bold',
    color: colors.foreground,
    fontVariant: ['tabular-nums'],
    marginBottom: spacing.lg,
  },
  recordBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  recordBtnStart: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  recordBtnStop: {
    backgroundColor: colors.destructive,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  recordLabel: {
    fontSize: fontSize.xs,
    color: colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
  },
  uploadBtnDisabled: {
    opacity: 0.5,
  },
  uploadText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.foreground,
  },
});
