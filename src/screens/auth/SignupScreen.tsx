import React, { useState } from 'react';
import {
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthStackParamList } from '@/navigation/types';
import { useAuth } from '@/services/AuthContext';
import { useTheme } from '@/theme';
import { Text, Button, Input } from '@/components/common';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export function SignupScreen({ navigation }: Props) {
  const { signup, isLoading, error, clearError } = useAuth();
  const { colors, spacing } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  function validate() {
    const errs: typeof fieldErrors = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Password is required';
    else if (password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSignup() {
    clearError();
    if (!validate()) return;
    try {
      await signup({ email: email.trim().toLowerCase(), password });
      navigation.navigate('VerifyEmail', { email: email.trim().toLowerCase() });
    } catch {
      // error surfaced via context
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.kav}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: spacing[6] }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text variant="h2" weight="bold" color={colors.text}>
              Create account
            </Text>
            <Text variant="body" color={colors.textSecondary} style={styles.subtitle}>
              Start tracking your habits and tasks
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={(t) => { setEmail(t); setFieldErrors((e) => ({ ...e, email: undefined })); }}
              error={fieldErrors.email}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              returnKeyType="next"
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              value={password}
              onChangeText={(t) => { setPassword(t); setFieldErrors((e) => ({ ...e, password: undefined })); }}
              error={fieldErrors.password}
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="next"
              placeholder="At least 8 characters"
              containerStyle={styles.fieldGap}
            />

            <Input
              label="Confirm password"
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); setFieldErrors((e) => ({ ...e, confirmPassword: undefined })); }}
              error={fieldErrors.confirmPassword}
              secureTextEntry
              autoCapitalize="none"
              returnKeyType="done"
              placeholder="Repeat password"
              onSubmitEditing={handleSignup}
              containerStyle={styles.fieldGap}
            />

            {error && (
              <View style={[styles.errorBox, { backgroundColor: colors.dangerSurface, borderRadius: 10 }]}>
                <Text variant="bodySmall" color={colors.danger}>
                  {error}
                </Text>
              </View>
            )}

            <Button
              label="Create account"
              onPress={handleSignup}
              loading={isLoading}
              fullWidth
              style={styles.submitButton}
              size="lg"
            />
          </View>

          <View style={styles.footer}>
            <Text variant="body" color={colors.textSecondary}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text variant="body" weight="semibold" color={colors.primary}>
                Log in
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    marginBottom: 36,
  },
  subtitle: {
    marginTop: 6,
  },
  form: {},
  fieldGap: {
    marginTop: 16,
  },
  errorBox: {
    marginTop: 16,
    padding: 12,
  },
  submitButton: {
    marginTop: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
});
