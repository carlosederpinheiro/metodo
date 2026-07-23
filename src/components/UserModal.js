import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { defaultSubjects } from '../services/mockData';
import DropdownSelect from './DropdownSelect';

const adminRoles = ['Secretaria', 'Pedagologia', 'Diretoria'];

export default function UserModal({
  visible,
  type,
  userToEdit,
  availableGroups = [],
  onSave,
  onClose,
}) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('Metodo2026@@');
  const [matricula, setMatricula] = useState('');
  const [subject, setSubject] = useState(defaultSubjects[0]);
  const [group, setGroup] = useState(availableGroups[0] || 'Medicina 1');
  const [role, setRole] = useState(adminRoles[0]);
  const [parentEmail, setParentEmail] = useState('');

  useEffect(() => {
    if (userToEdit) {
      setName(userToEdit.name || '');
      setUsername(userToEdit.username || '');
      setPassword(userToEdit.password || 'Metodo2026@@');
      if (type === 'STUDENT') {
        setMatricula(userToEdit.matricula || '');
        setGroup(userToEdit.group || availableGroups[0] || 'Medicina 1');
        setParentEmail(userToEdit.parentEmail || '');
      } else if (type === 'PROFESSOR') {
        setSubject(userToEdit.subject || defaultSubjects[0]);
      } else if (type === 'ADMIN') {
        setRole(userToEdit.role || adminRoles[0]);
      }
    } else {
      setName('');
      setUsername('');
      setPassword('Metodo2026@@');
      setMatricula(Date.now().toString().slice(-6));
      setSubject(defaultSubjects[0]);
      setGroup(availableGroups[0] || 'Medicina 1');
      setRole(adminRoles[0]);
      setParentEmail('');
    }
  }, [userToEdit, visible, type, availableGroups]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Campo Obrigatório', 'Por favor, informe o Nome Completo.');
      return;
    }

    if (type === 'STUDENT') {
      if (!matricula.trim()) {
        Alert.alert('Campo Obrigatório', 'Por favor, informe a Matrícula do aluno.');
        return;
      }
      if (!parentEmail.trim() || !parentEmail.includes('@')) {
        Alert.alert('Campo Inválido', 'Por favor, informe um E-mail do Responsável válido.');
        return;
      }
      onSave({
        id: userToEdit ? userToEdit.id : null, // ID gerado pelo DB, mas enviamos o original para saber se é UPDATE
        matricula: matricula.trim(),
        name: name.trim(),
        group,
        parentEmail: parentEmail.trim(),
      });
    } else if (type === 'PROFESSOR') {
      if (!username.trim()) {
        Alert.alert('Campo Obrigatório', 'Por favor, informe o Nome de usuário.');
        return;
      }
      onSave({
        id: userToEdit ? userToEdit.id : Date.now().toString(),
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password: password.trim() || 'Metodo2026@@',
        subject,
      });
    } else if (type === 'ADMIN') {
      if (!username.trim()) {
        Alert.alert('Campo Obrigatório', 'Por favor, informe o Nome de usuário.');
        return;
      }
      onSave({
        id: userToEdit ? userToEdit.id : Date.now().toString(),
        name: name.trim(),
        username: username.trim().toLowerCase(),
        password: password.trim() || 'Metodo2026@@',
        role,
      });
    }

    onClose();
  };

  const getModalTitle = () => {
    const action = userToEdit ? 'Editar' : 'Novo';
    if (type === 'PROFESSOR') return `${action} Professor`;
    if (type === 'STUDENT') return `${action} Aluno`;
    return `${action} Administrador`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Platform.OS !== 'web' ? Keyboard.dismiss : undefined}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons
                  name={
                    type === 'PROFESSOR'
                      ? 'school-outline'
                      : type === 'STUDENT'
                      ? 'people-outline'
                      : 'shield-checkmark-outline'
                  }
                  size={22}
                  color={colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.title}>{getModalTitle()}</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              
              {/* FORMULÁRIO DE ALUNO */}
              {type === 'STUDENT' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Matrícula</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ex: 2026001"
                      placeholderTextColor={colors.placeholder}
                      value={matricula}
                      onChangeText={setMatricula}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome Completo</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Digite o nome completo do aluno"
                      placeholderTextColor={colors.placeholder}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>E-mail do Responsável (Avisos de Falta)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Ex: pai@gmail.com"
                      placeholderTextColor={colors.placeholder}
                      value={parentEmail}
                      onChangeText={setParentEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <DropdownSelect
                    label="Turma"
                    value={group}
                    options={availableGroups}
                    onSelect={setGroup}
                    placeholder="Selecione a turma..."
                  />
                </>
              )}

              {/* FORMULÁRIO DE PROFESSOR */}
              {type === 'PROFESSOR' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome Completo</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Digite o nome do professor"
                      placeholderTextColor={colors.placeholder}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome de Usuário (Login)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="ex: carlos.eder"
                      placeholderTextColor={colors.placeholder}
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Senha de Acesso (Padrão: Metodo2026@@)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Metodo2026@@"
                      placeholderTextColor={colors.placeholder}
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>

                  <DropdownSelect
                    label="Disciplina"
                    value={subject}
                    options={defaultSubjects}
                    onSelect={setSubject}
                    placeholder="Selecione a disciplina..."
                  />
                </>
              )}

              {/* FORMULÁRIO DE ADMINISTRADOR */}
              {type === 'ADMIN' && (
                <>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome Completo</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Digite o nome completo do gestor"
                      placeholderTextColor={colors.placeholder}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Nome de Usuário (Login)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="ex: admin.gestor"
                      placeholderTextColor={colors.placeholder}
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Senha de Acesso (Padrão: Metodo2026@@)</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Metodo2026@@"
                      placeholderTextColor={colors.placeholder}
                      value={password}
                      onChangeText={setPassword}
                    />
                  </View>

                  <DropdownSelect
                    label="Cargo"
                    value={role}
                    options={adminRoles}
                    onSelect={setRole}
                    placeholder="Selecione o cargo..."
                  />
                </>
              )}

            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
                <Ionicons name="save-outline" size={18} color={colors.white} style={{ marginRight: 6 }} />
                <Text style={styles.submitButtonText}>Salvar Cadastro</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderRadius: 20,
    maxHeight: '85%',
    padding: 20,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeButton: {
    padding: 4,
  },
  formScroll: {
    marginVertical: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: colors.textPrimary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 8,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  submitButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
