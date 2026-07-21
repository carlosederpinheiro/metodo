import React, { useState } from 'react';
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

const defaultGroups = [
  'Turma Medicina 1',
  'Turma Medicina 2',
  'Extensivo Manhã',
  'Semiextensivo Manhã',
  'Turma ITA / IME',
  'Turma Extensiva Noite',
];

const defaultSubjects = ['Física A', 'Física B', 'Física C', 'Plantão de Dúvidas'];

export default function NewCallModal({ visible, onClose, onCreate }) {
  const [group, setGroup] = useState('Turma Medicina 1');
  const [subject, setSubject] = useState('Física A');
  const [topic, setTopic] = useState('');
  const [timeStart, setTimeStart] = useState('14:00');
  const [timeEnd, setTimeEnd] = useState('14:50');
  const [room, setRoom] = useState('Sala 01');

  const handleCreate = () => {
    if (!group || !subject || !timeStart || !timeEnd) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha a turma, disciplina e os horários.');
      return;
    }

    const newClassItem = {
      id: Date.now().toString(),
      timeStart,
      timeEnd,
      subject,
      topic: topic.trim() || 'Aula / Atividade Presencial',
      group,
      room: room.trim() || 'Sala 01',
      status: 'pending',
      studentsCount: 25,
      presentCount: null,
    };

    onCreate(newClassItem);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Platform.OS !== 'web' ? Keyboard.dismiss : undefined}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calendar-number-outline" size={22} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.title}>Criar Nova Chamada</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              
              {/* Seleção de Turma */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Turma</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                  {defaultGroups.map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.pill, group === g && styles.pillSelected]}
                      onPress={() => setGroup(g)}
                    >
                      <Text style={[styles.pillText, group === g && styles.pillTextSelected]}>{g}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Seleção de Disciplina */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Disciplina / Frente</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                  {defaultSubjects.map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.pill, subject === s && styles.pillSelected]}
                      onPress={() => setSubject(s)}
                    >
                      <Text style={[styles.pillText, subject === s && styles.pillTextSelected]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Assunto / Conteúdo */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Assunto / Conteúdo (Opcional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: Cinemática ou Plantão de Dúvidas"
                  placeholderTextColor={colors.placeholder}
                  value={topic}
                  onChangeText={setTopic}
                />
              </View>

              {/* Horários (Início / Fim) */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Horário Início</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="14:00"
                    placeholderTextColor={colors.placeholder}
                    value={timeStart}
                    onChangeText={setTimeStart}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Horário Término</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="14:50"
                    placeholderTextColor={colors.placeholder}
                    value={timeEnd}
                    onChangeText={setTimeEnd}
                  />
                </View>
              </View>

              {/* Sala / Local */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sala / Local</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ex: Sala 02 ou Laboratório"
                  placeholderTextColor={colors.placeholder}
                  value={room}
                  onChangeText={setRoom}
                />
              </View>

            </ScrollView>

            {/* Rodapé do Modal */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitButton} onPress={handleCreate}>
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.white} style={{ marginRight: 6 }} />
                <Text style={styles.submitButtonText}>Criar e Iniciar</Text>
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
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  pillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  pillTextSelected: {
    color: colors.white,
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
  row: {
    flexDirection: 'row',
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
