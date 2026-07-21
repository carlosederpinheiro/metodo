import React from 'react';
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

export default function StudentHistoryModal({
  visible,
  student,
  masterSchedule = [],
  onClose,
}) {
  if (!student) return null;

  // Filtra aulas registradas em que a chamada foi realizada para a turma deste aluno
  const studentAttendanceList = [];
  let totalPresent = 0;
  let totalAbsent = 0;

  masterSchedule.forEach((sched) => {
    if (sched.group === student.group && sched.attendanceRecords) {
      const recordStatus = sched.attendanceRecords[student.id] || 'P'; // Default 'P' se não marcado
      if (recordStatus === 'P') totalPresent++;
      else totalAbsent++;

      studentAttendanceList.push({
        id: sched.id,
        dateStr: sched.dateStr,
        dayOfWeek: sched.dayOfWeek,
        subject: sched.subject,
        teacherName: sched.teacherName,
        time: `${sched.timeStart} - ${sched.timeEnd}`,
        status: recordStatus,
      });
    }
  });

  const totalClasses = studentAttendanceList.length;
  const attendanceRate = totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 100;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>{student.name.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentSub}>
                  Matrícula: {student.matricula} • {student.group}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Cards de Resumo de Frequência */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalClasses}</Text>
              <Text style={styles.statLabel}>Aulas Dadas</Text>
            </View>

            <View style={[styles.statBox, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border }]}>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>{totalPresent}</Text>
              <Text style={styles.statLabel}>Presenças</Text>
            </View>

            <View style={[styles.statBox, { borderRightWidth: 1, borderColor: colors.border }]}>
              <Text style={[styles.statNumber, { color: '#EF4444' }]}>{totalAbsent}</Text>
              <Text style={styles.statLabel}>Faltas</Text>
            </View>

            <View style={styles.statBox}>
              <Text
                style={[
                  styles.statNumber,
                  { color: attendanceRate >= 75 ? colors.primary : '#EF4444' },
                ]}
              >
                {attendanceRate}%
              </Text>
              <Text style={styles.statLabel}>Frequência</Text>
            </View>
          </View>

          {/* Histórico Detalhado */}
          <Text style={styles.sectionTitle}>Histórico de Frequência Aula a Aula</Text>

          <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
            {studentAttendanceList.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={32} color={colors.placeholder} />
                <Text style={styles.emptyText}>Nenhuma chamada registrada para esta turma ainda.</Text>
              </View>
            ) : (
              studentAttendanceList.map((item) => (
                <View key={item.id} style={styles.historyCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.historySubject}>
                      {item.subject} • {item.teacherName}
                    </Text>
                    <Text style={styles.historySubtext}>
                      {item.dayOfWeek} ({item.dateStr.split('-').reverse().join('/')}) • {item.time}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      item.status === 'P' ? styles.badgePresent : styles.badgeAbsent,
                    ]}
                  >
                    <Ionicons
                      name={item.status === 'P' ? 'checkmark-circle' : 'close-circle'}
                      size={14}
                      color={item.status === 'P' ? '#10B981' : '#EF4444'}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: item.status === 'P' ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {item.status === 'P' ? 'Presente' : 'Falta'}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeBtnFooter} onPress={onClose}>
              <Text style={styles.closeBtnText}>Fechar Histórico</Text>
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
    width: 40,
    height: 40,
    borderRadius: 20,
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
  studentName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  studentSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 14,
    marginVertical: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
  },
  historyList: {
    maxHeight: 280,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historySubject: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  historySubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgePresent: {
    backgroundColor: '#D1FAE5',
  },
  badgeAbsent: {
    backgroundColor: '#FEE2E2',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-end',
  },
  closeBtnFooter: {
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
