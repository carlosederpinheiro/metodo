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

export default function ClassCallDetailsModal({
  visible,
  classItem,
  studentsList = [],
  onSelectStudent,
  onClose,
}) {
  if (!classItem) return null;

  const records = classItem.attendanceRecords || {};
  const groupStudents = studentsList.filter((s) => s.group === classItem.group);

  let presentCount = 0;
  let absentCount = 0;

  groupStudents.forEach((student) => {
    const status = records[student.id] || 'P';
    if (status === 'P') presentCount++;
    else absentCount++;
  });

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeGroup}>
                <Ionicons name="people" size={12} color={colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.badgeGroupText}>{classItem.group}</Text>
              </View>
              <Text style={styles.title}>{classItem.subject} • {classItem.teacherName}</Text>
              <Text style={styles.subtext}>
                {classItem.dayOfWeek} ({classItem.dateStr.split('-').reverse().join('/')}) • {classItem.timeStart} às {classItem.timeEnd} • {classItem.room}
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Resumo da Chamada */}
          <View style={styles.summaryBar}>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryNum}>{groupStudents.length}</Text>
              <Text style={styles.summaryLabel}>Total Alunos</Text>
            </View>

            <View style={[styles.summaryBox, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border }]}>
              <Text style={[styles.summaryNum, { color: '#10B981' }]}>{presentCount}</Text>
              <Text style={styles.summaryLabel}>Presentes</Text>
            </View>

            <View style={styles.summaryBox}>
              <Text style={[styles.summaryNum, { color: '#EF4444' }]}>{absentCount}</Text>
              <Text style={styles.summaryLabel}>Faltas</Text>
            </View>
          </View>

          <Text style={styles.sectionHeaderTitle}>Lista de Alunos da Turma (Clique para histórico)</Text>

          {/* Lista de Alunos da Chamada */}
          <ScrollView style={styles.studentsScroll} showsVerticalScrollIndicator={false}>
            {groupStudents.map((student) => {
              const status = records[student.id] || 'P';

              return (
                <TouchableOpacity
                  key={student.id}
                  style={styles.studentRow}
                  onPress={() => {
                    onClose();
                    onSelectStudent(student);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={styles.avatarMini}>
                    <Text style={styles.avatarMiniText}>{student.name.charAt(0)}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentNameText}>{student.name}</Text>
                    <Text style={styles.studentMatText}>Matrícula: {student.matricula}</Text>
                  </View>

                  <View
                    style={[
                      styles.statusPill,
                      status === 'P' ? styles.pillPresent : styles.pillAbsent,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        { color: status === 'P' ? '#10B981' : '#EF4444' },
                      ]}
                    >
                      {status === 'P' ? 'Presente' : 'Falta'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Fechar Detalhes</Text>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  badgeGroupText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeButton: {
    padding: 4,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 12,
    marginVertical: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryNum: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 1,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  studentsScroll: {
    maxHeight: 260,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarMini: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarMiniText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
  studentNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  studentMatText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pillPresent: {
    backgroundColor: '#D1FAE5',
  },
  pillAbsent: {
    backgroundColor: '#FEE2E2',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    marginTop: 12,
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
