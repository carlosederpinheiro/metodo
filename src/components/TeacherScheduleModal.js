import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const daysOfWeek = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

export default function TeacherScheduleModal({
  visible,
  teacher,
  masterSchedule = [],
  onClose,
}) {
  const [selectedDay, setSelectedDay] = useState('Segunda-feira');

  if (!teacher) return null;

  // Filtra as aulas do professor na grade horária
  const teacherSchedule = masterSchedule.filter((item) => item.teacherId === teacher.id || item.teacherName === teacher.name);
  const daySchedule = teacherSchedule.filter((item) => item.dayOfWeek === selectedDay);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>{teacher.name.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.teacherName}>{teacher.name}</Text>
                <Text style={styles.teacherSub}>
                  @{teacher.username} • Disciplina: {teacher.subject}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Seletor de Dia */}
          <View style={styles.daySelectorRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {daysOfWeek.map((day) => {
                const isSelected = selectedDay === day;
                const shortLabel = day.replace('-feira', '');

                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayTab, isSelected && styles.dayTabActive]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={[styles.dayTabText, isSelected && styles.dayTabTextActive]}>
                      {shortLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          <Text style={styles.sectionTitle}>
            Grade Horária de {selectedDay} ({daySchedule.length} Aulas)
          </Text>

          {/* Lista de Aulas do Professor no Dia */}
          <ScrollView style={styles.scheduleScroll} showsVerticalScrollIndicator={false}>
            {daySchedule.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="calendar-outline" size={36} color={colors.placeholder} />
                <Text style={styles.emptyText}>
                  Nenhuma aula agendada para {teacher.name} em {selectedDay}.
                </Text>
              </View>
            ) : (
              daySchedule.map((item) => (
                <View key={item.id} style={styles.slotCard}>
                  <View style={styles.timeBadge}>
                    <Ionicons name="time-outline" size={14} color={colors.primary} style={{ marginRight: 4 }} />
                    <Text style={styles.timeBadgeText}>{item.timeStart} - {item.timeEnd}</Text>
                  </View>

                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.slotSubject}>{item.subject}</Text>
                    <View style={{ flexDirection: 'row', marginTop: 4 }}>
                      <Text style={styles.slotDetailText}>Turma: {item.group}</Text>
                      <Text style={[styles.slotDetailText, { marginLeft: 12 }]}>Sala: {item.room}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Fechar Horários</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
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
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarLetter: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  teacherSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  daySelectorRow: {
    marginVertical: 14,
  },
  dayTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.background,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dayTabTextActive: {
    color: colors.white,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  scheduleScroll: {
    maxHeight: 280,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  slotSubject: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  slotDetailText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footer: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-end',
  },
  closeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  closeBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
});
