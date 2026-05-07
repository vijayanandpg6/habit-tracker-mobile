import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackParamList } from '@/navigation/types';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { Text, Button, Input } from '@/components/common';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

export function VerifyEmailScreen({ route, navigation }: Props) {
  const { verifyEmail, login, isLoading, error, clearError } = useAuth();
  const { colors, spacing } = useTheme();
  const { email, token: deepLinkToken } = route.params;

  const [token, setToken] = useState('');
  const [tokenError, setTokenError] = useState<string | undefined>();
  const [step, setStep] = useState<'verifying' | 'verify' | 'login'>('verify');
  const [password, setPassword] = useState('');

  // Auto-verify when token arrives via deep link
  useEffect(() => {
    if (deepLinkToken) {
      setStep('verifying');
      clearError();
      verifyEmail({ token: deepLinkToken })
        .then(() => setStep('login'))
        .catch(() => setStep('verify'));
    }
  }, [deepLinkToken]);

  async function handleVerify() {
    clearError();
    if (!token.trim()) {
      setTokenError('Verification token is required');
      return;
    }
    try {
      await verifyEmail({ token: token.trim() });
      setStep('login');
    } catch {
      // error surfaced via context
    }
  }

  async function handleLoginAfterVerify() {
    clearError();
    try {
      await login({ email, password });
    } catch {
      // error surfaced via context
    }
  }

  if (step === 'verifying') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text variant="body" color={colors.textSecondary} style={{ marginTop: spacing[4] }}>
            Verifying your email...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'login') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing[6] }]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.successBadge, { backgroundColor: colors.successSurface, borderRadius: 12 }]}>
              <Text variant="body" weight="semibold" color={colors.success} align="center">
                Email verified successfully
              </Text>
            </View>

            <Text variant="h3" weight="bold" color={colors.text} style={styles.loginTitle}>
              Log in to continue
            </Text>

            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="done"
              placeholder="Enter your password"
              onSubmitEditing={handleLoginAfterVerify}
            />

            {error && (
              <View style={[styles.errorBox, { backgroundColor: colors.dangerSurface, borderRadius: 10 }]}>
                <Text variant="bodySmall" color={colors.danger}>{error}</Text>
              </View>
            )}

            <Button
              label="Log in"
              onPress={handleLoginAfterVerify}
              loading={isLoading}
              fullWidth
              style={styles.submitButton}
              size="lg"
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing[6] }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
            <Text variant="body" color={colors.primary}>Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text variant="h2" weight="bold" color={colors.text}>
              Check your email
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
              We sent a verification link to{' '}
              <Text variant="body" weight="semibold" color={colors.text}>{email}</Text>
              {'. Tap the link in the email to verify, or paste the token below.'}
            </Text>
          </View>

          <Input
            label="Verification token"
            value={token}
            onChangeText={(t) => { setToken(t); setTokenError(undefined); }}
            error={tokenError}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            placeholder="Paste token from email"
            onSubmitEditing={handleVerify}
          />

          {error && (
            <View style={[styles.errorBox, { backgroundColor: colors.dangerSurface, borderRadius: 10 }]}>
              <Text variant="bodySmall" color={colors.danger}>{error}</Text>
            </View>
          )}

          <Button
            label="Verify email"
            onPress={handleVerify}
            loading={isLoading}
            fullWidth
            style={styles.submitButton}
            size="lg"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  kav: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: 40 },
  backButton: { position: 'absolute', top: 0, left: 0 },
  header: { marginBottom: 32 },
  subtitle: { marginTop: 8, lineHeight: 22 },
  errorBox: { marginTop: 16, padding: 12 },
  submitButton: { marginTop: 24 },
  successBadge: { padding: 14, marginBottom: 24 },
  loginTitle: { marginBottom: 24 },
});
