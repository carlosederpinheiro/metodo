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

const weekDayOptions = [
  { label: 'Segunda-feira', dateStr: '2026-07-20' },
  { label: 'Terça-feira', dateStr: '2026-07-21' },
  { label: 'Quarta-feira', dateStr: '2026-07-22' },
  { label: 'Quinta-feira', dateStr: '2026-07-23' },
  { label: 'Sexta-feira', dateStr: '2026-07-24' },
  { label: 'Sábado', dateStr: '2026-07-25' },
];

export default function MasterScheduleModal({
  visible,
  professorsList = [],
  availableGroups = [],
  availableRooms = [],
  itemToEdit,
  onSave,
  onClose,
}) {
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Segunda-feira');
  const [dateStr, setDateStr] = useState('2026-07-20');
  const [timeStart, setTimeStart] = useState('07:15');
  const [timeEnd, setTimeEnd] = useState('08:05');
  const [subject, setSubject] = useState(defaultSubjects[0]);
  const [group, setGroup] = useState(availableGroups[0] || 'Medicina 1');
  const [room, setRoom] = useState(availableRooms[0] || 'Sala 01');

  useEffect(() => {
    if (professorsList.length > 0 && !selectedTeacherId) {
      setSelectedTeacherId(professorsList[0].id);
    }
  }, [professorsList]);

  useEffect(() => {
    if (itemToEdit) {
      setSelectedTeacherId(itemToEdit.teacherId || (professorsList[0]?.id || ''));
      setDayOfWeek(itemToEdit.dayOfWeek || 'Segunda-feira');
      setDateStr(itemToEdit.dateStr || '2026-07-20');
      setTimeStart(itemToEdit.timeStart || '07:15');
      setTimeEnd(itemToEdit.timeEnd || '08:05');
      setSubject(itemToEdit.subject || defaultSubjects[0]);
      setGroup(itemToEdit.group || availableGroups[0] || 'Medicina 1');
      setRoom(itemToEdit.room || availableRooms[0] || 'Sala 01');
    } else {
      setDayOfWeek('Segunda-feira');
      setDateStr('2026-07-20');
      setTimeStart('07:15');
      setTimeEnd('08:05');
      setSubject(defaultSubjects[0]);
      setGroup(availableGroups[0] || 'Medicina 1');
      setRoom(availableRooms[0] || 'Sala 01');
    }
  }, [itemToEdit, visible, availableGroups, availableRooms]);

  const handleSelectDay = (dayLabel) => {
    setDayOfWeek(dayLabel);
    const foundObj = weekDayOptions.find((d) => d.label === dayLabel);
    if (foundObj) setDateStr(foundObj.dateStr);
  };

  const handleSave = () => {
    const selectedTeacher = professorsList.find((p) => p.id === selectedTeacherId);

    if (!selectedTeacher) {
      Alert.alert('Erro', 'Por favor, selecione um professor responsável.');
      return;
    }

    if (!timeStart.trim() || !timeEnd.trim()) {
      Alert.alert('Erro', 'Por favor, preencha os horários de início e término.');
      return;
    }

    const scheduleData = {
      id: itemToEdit ? itemToEdit.id : Date.now().toString(),
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      dayOfWeek,
      dateStr,
      timeStart: timeStart.trim(),
      timeEnd: timeEnd.trim(),
      subject,
      group,
      room,
      status: itemToEdit?.status || 'pending',
    };

    onSave(scheduleData);
    onClose();
  };

  const teacherOptions = professorsList.map((p) => ({ label: p.name, value: p.id }));
  const dayOptions = weekDayOptions.map((d) => d.label);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <TouchableWithoutFeedback onPress={Platform.OS !== 'web' ? Keyboard.dismiss : undefined}>
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            
            {/* Header */}
            <View style={styles.header}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calendar-outline" size={22} color={colors.primary} style={{ marginRight: 8 }} />
                <Text style={styles.title}>
                  {itemToEdit ? 'Editar Tempo na Grade' : 'Novo Tempo na Grade'}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
              
              {/* Professor Responsável */}
              <DropdownSelect
                label="Professor Responsável"
                value={selectedTeacherId}
                options={teacherOptions}
                onSelect={setSelectedTeacherId}
                placeholder="Selecione o professor..."
              />

              {/* Dia da Semana */}
              <DropdownSelect
                label="Dia da Semana"
                value={dayOfWeek}
                options={dayOptions}
                onSelect={handleSelectDay}
                placeholder="Selecione o dia..."
              />

              {/* Horários de Início e Término */}
              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.label}>Horário de Início</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="07:15"
                    placeholderTextColor={colors.placeholder}
                    value={timeStart}
                    onChangeText={setTimeStart}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.label}>Horário de Término</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="08:05"
                    placeholderTextColor={colors.placeholder}
                    value={timeEnd}
                    onChangeText={setTimeEnd}
                  />
                </View>
              </View>

              {/* Disciplina */}
              <DropdownSelect
                label="Disciplina"
                value={subject}
                options={defaultSubjects}
                onSelect={setSubject}
                placeholder="Selecione a disciplina..."
              />

              {/* Turma */}
              <DropdownSelect
                label="Turma"
                value={group}
                options={availableGroups}
                onSelect={setGroup}
                placeholder="Selecione a turma..."
              />

              {/* Sala */}
              <DropdownSelect
                label="Sala"
                value={room}
                options={availableRooms}
                onSelect={setRoom}
                placeholder="Selecione a sala..."
              />

            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.submitButton} onPress={handleSave}>
                <Ionicons name="save-outline" size={18} color={colors.white} style={{ marginRight: 6 }} />
                <Text style={styles.submitButtonText}>Salvar Tempo</Text>
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
  row: {
    flexDirection: 'row',
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
