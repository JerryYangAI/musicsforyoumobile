import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/lib/auth-context';
import { colors, spacing, fontSize } from '../../src/lib/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth');
          },
        },
      ]
    );
  };

  const phoneDisplay = user?.phone || '+1 (555) 000-0000';
  const initials = phoneDisplay.slice(-4);

  const menuItems = [
    { icon: 'settings-outline' as const, label: 'Settings' },
    { icon: 'help-circle-outline' as const, label: 'Help & Support' },
    { icon: 'document-text-outline' as const, label: 'Terms of Service' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Music Lover</Text>
          <Text style={styles.userPhone}>{phoneDisplay}</Text>
        </View>
      </View>

      <View style={styles.creditsCard}>
        <LinearGradient
          colors={['rgba(124, 58, 237, 0.2)', 'rgba(219, 39, 119, 0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.creditsGradient}
        >
          <View style={styles.creditsIcon}>
            <Ionicons name="card-outline" size={80} color={colors.mutedForeground} />
          </View>
          
          <Text style={styles.creditsLabel}>Available Credits</Text>
          <Text style={styles.creditsValue}>{user?.credits || 0}</Text>
          
          <TouchableOpacity style={styles.buyBtn}>
            <Text style={styles.buyBtnText}>Buy More Credits</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.label} style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={20} color={colors.mutedForeground} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
          <View style={styles.menuItemLeft}>
            <View style={styles.logoutIcon}>
              <Ionicons name="log-out-outline" size={20} color={colors.destructive} />
            </View>
            <Text style={styles.logoutLabel}>Sign Out</Text>
          </View>
        </TouchableOpacity>
      </View>
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
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: 'bold',
    color: colors.foreground,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  userCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(124, 58, 237, 0.2)',
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 4,
  },
  userPhone: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
  },
  creditsCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  creditsGradient: {
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  creditsIcon: {
    position: 'absolute',
    top: 0,
    right: 0,
    opacity: 0.1,
  },
  creditsLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
  },
  creditsValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: spacing.lg,
    letterSpacing: -2,
  },
  buyBtn: {
    backgroundColor: colors.foreground,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buyBtnText: {
    fontSize: fontSize.base,
    fontWeight: 'bold',
    color: colors.background,
  },
  menu: {
    gap: spacing.sm,
  },
  menuItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.foreground,
  },
  logoutItem: {
    backgroundColor: 'rgba(127, 29, 29, 0.1)',
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(127, 29, 29, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutLabel: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.destructive,
  },
});
