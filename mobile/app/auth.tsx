import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../src/lib/api';
import { useAuth } from '../src/lib/auth-context';
import { colors, spacing, fontSize } from '../src/lib/theme';

export default function AuthScreen() {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      await api.auth.sendCode(phone);
      setStep('otp');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length < 4) return;
    setLoading(true);
    try {
      await login(phone, code);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      Alert.alert('Verification Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.heroContainer}>
        <LinearGradient
          colors={['transparent', colors.background]}
          style={styles.gradient}
        />
        <View style={styles.heroContent}>
          <Text style={styles.logo}>
            musics<Text style={styles.logoAccent}>foryou</Text>
          </Text>
          <Text style={styles.tagline}>Your personal AI music composer.</Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        {step === 'phone' ? (
          <View style={styles.form}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.mutedForeground} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="+1 (555) 000-0000"
                placeholderTextColor={colors.mutedForeground}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
            </View>
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={loading}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Sending Code...' : 'Continue'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.otpHeader}>
              <View style={styles.checkCircle}>
                <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
              </View>
              <Text style={styles.otpTitle}>Verify Number</Text>
              <Text style={styles.otpSubtitle}>Enter the code sent to {phone}</Text>
            </View>

            <TextInput
              style={styles.otpInput}
              placeholder="Enter 4-digit code"
              placeholderTextColor={colors.mutedForeground}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={4}
              textAlign="center"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={loading || code.length < 4}
            >
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Verifying...' : 'Start Listening'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep('phone')}>
              <Text style={styles.backLink}>Wrong number? Go back</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  heroContainer: {
    height: '40%',
    justifyContent: 'flex-end',
    backgroundColor: colors.card,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
    zIndex: 1,
  },
  heroContent: {
    padding: spacing.lg,
    zIndex: 2,
  },
  logo: {
    fontSize: fontSize['4xl'],
    fontWeight: 'bold',
    color: colors.foreground,
    letterSpacing: -1,
  },
  logoAccent: {
    color: colors.primary,
  },
  tagline: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  formContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.muted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputIcon: {
    paddingLeft: spacing.md,
  },
  input: {
    flex: 1,
    height: 52,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.lg,
    color: colors.foreground,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  buttonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.foreground,
  },
  otpHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  checkCircle: {
    marginBottom: spacing.md,
  },
  otpTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.foreground,
  },
  otpSubtitle: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  otpInput: {
    backgroundColor: colors.muted,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 60,
    fontSize: fontSize['2xl'],
    fontWeight: 'bold',
    color: colors.foreground,
  },
  backLink: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    marginTop: spacing.lg,
  },
});
