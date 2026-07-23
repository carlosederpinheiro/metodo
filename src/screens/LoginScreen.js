import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import PWAInstallPrompt from '../components/PWAInstallPrompt';

export default function LoginScreen({ onLogin }) {
  const [role, setRole] = useState('teacher'); // 'teacher' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validate = () => {
    let valid = true;
    setEmailError('');
    setPasswordError('');

    if (!email.trim()) {
      setEmailError('Informe seu e-mail ou usuário.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Informe sua senha.');
      valid = false;
    } else if (password.length < 3) {
      setPasswordError('A senha deve ter pelo menos 3 caracteres.');
      valid = false;
    }

    return valid;
  };

  const handleLogin = () => {
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (onLogin) {
        onLogin({ email: email.trim(), role });
      } else {
        Alert.alert(
          'Sucesso',
          `Bem-vindo ao Método Pré-Vestibular! Login realizado com sucesso.`
        );
      }
    }, 600);
  };

  const renderContent = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
      style={styles.keyboardView}
    >
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/metodo-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>Método</Text>
        <Text style={styles.subtitle}>Pré-Vestibular</Text>
        <Text style={styles.description}>
          {role === 'admin'
            ? 'Painel Gestor • Controle Geral e Cadastros'
            : 'Portal do Professor • Gestão de horários e presença'}
        </Text>
      </View>

      <View style={styles.card}>
        {/* Seletor de Perfil (Professor vs Administrador) */}
        <View style={styles.roleToggleContainer}>
          <TouchableOpacity
            style={[styles.roleTab, role === 'teacher' && styles.roleTabActive]}
            onPress={() => setRole('teacher')}
          >
            <Ionicons
              name="school-outline"
              size={16}
              color={role === 'teacher' ? colors.primary : colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.roleTabText, role === 'teacher' && styles.roleTabTextActive]}>
              Professor
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleTab, role === 'admin' && styles.roleTabActive]}
            onPress={() => setRole('admin')}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={role === 'admin' ? colors.primary : colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.roleTabText, role === 'admin' && styles.roleTabTextActive]}>
              Administrador
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.cardTitle}>
          {role === 'admin' ? 'Acesso Administrativo' : 'Acesso do Docente'}
        </Text>

        {/* Input E-mail / Usuário */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-mail ou Usuário</Text>
          <View
            style={[
              styles.inputContainer,
              emailError ? styles.inputErrorBorder : null,
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={emailError ? colors.error : colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="exemplo@metodo.com.br"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>
          {emailError ? (
            <Text style={styles.errorText}>{emailError}</Text>
          ) : null}
        </View>

        {/* Input Senha */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha</Text>
          <View
            style={[
              styles.inputContainer,
              passwordError ? styles.inputErrorBorder : null,
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={passwordError ? colors.error : colors.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? (
            <Text style={styles.errorText}>{passwordError}</Text>
          ) : null}
        </View>

        {/* Link Esqueceu a senha */}
        <TouchableOpacity
          style={styles.forgotPasswordContainer}
          onPress={() =>
            Alert.alert(
              'Recuperação de Senha',
              'Entre em contato com o suporte do Método Pré-Vestibular para redefinir sua senha.'
            )
          }
        >
          <Text style={styles.forgotPasswordText}>
            Esqueceu sua senha?
          </Text>
        </TouchableOpacity>

        {/* Botão de Login */}
        <TouchableOpacity
          style={[styles.button, loading ? styles.buttonDisabled : null]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Entrar</Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.white}
                style={{ marginLeft: 8 }}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Rodapé / Suporte */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © Método Pré-Vestibular • Todos os direitos reservados
        </Text>
      </View>
      
      {/* Banner de Instalação PWA (Fica flutuante sobre a tela) */}
      <PWAInstallPrompt />
    </KeyboardAvoidingView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      {Platform.OS === 'web' ? (
        renderContent()
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {renderContent()}
        </TouchableWithoutFeedback>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: -2,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 24,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  roleTabActive: {
    backgroundColor: colors.card,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  roleTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  roleTabTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputErrorBorder: {
    borderColor: colors.error,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.textPrimary,
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 4,
    marginLeft: 2,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
