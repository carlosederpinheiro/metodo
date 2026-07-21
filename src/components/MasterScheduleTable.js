import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const daysList = [
  { label: 'Segunda', full: 'Segunda-feira', dateStr: '2026-07-20' },
  { label: 'Terça', full: 'Terça-feira', dateStr: '2026-07-21' },
  { label: 'Quarta', full: 'Quarta-feira', dateStr: '2026-07-22' },
  { label: 'Quinta', full: 'Quinta-feira', dateStr: '2026-07-23' },
  { label: 'Sexta', full: 'Sexta-feira', dateStr: '2026-07-24' },
  { label: 'Sábado', full: 'Sábado', dateStr: '2026-07-25' },
];

export default function MasterScheduleTable({
  masterSchedule = [],
  onEditSlot,
  onDeleteSlot,
}) {
  const [selectedDay, setSelectedDay] = useState('Segunda-feira');

  // Filtra as aulas do dia selecionado
  const daySchedule = masterSchedule.filter(
    (item) => item.dayOfWeek === selectedDay || item.dateStr === daysList.find((d) => d.full === selectedDay)?.dateStr
  );

  // Agrupa as aulas do dia POR TURMA
  const groupedByGroup = {};
  daySchedule.forEach((item) => {
    const groupName = item.group || 'Geral';
    if (!groupedByGroup[groupName]) groupedByGroup[groupName] = [];
    groupedByGroup[groupName].push(item);
  });

  // Ordena os tempos de cada turma por horário de início
  Object.keys(groupedByGroup).forEach((groupName) => {
    groupedByGroup[groupName].sort((a, b) => a.timeStart.localeCompare(b.timeStart));
  });

  const groupNames = Object.keys(groupedByGroup);

  return (
    <View style={styles.container}>
      
      {/* Seletor de Dias da Semana (Segunda a Sábado) */}
      <View style={styles.dayPickerRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
          {daysList.map((d) => {
            const isSelected = selectedDay === d.full;
            return (
              <TouchableOpacity
                key={d.full}
                style={[styles.dayTab, isSelected && styles.dayTabActive]}
                onPress={() => setSelectedDay(d.full)}
                activeOpacity={0.8}
              >
                <Text style={[styles.dayTabText, isSelected && styles.dayTabTextActive]}>
                  {d.label}
                </Text>
                {isSelected && <View style={styles.activeDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Header da Grade do Dia */}
      <View style={styles.tableHeaderRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="calendar-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={styles.tableHeaderTitle}>
            Grade de {selectedDay} por Turma ({daySchedule.length} Tempos)
          </Text>
        </View>
      </View>

      {/* Grade Organizada POR TURMA */}
      {groupNames.length === 0 ? (
        <View style={styles.emptyTable}>
          <Ionicons name="calendar-outline" size={40} color={colors.placeholder} />
          <Text style={styles.emptyTitle}>Nenhuma aula cadastrada para {selectedDay}</Text>
          <Text style={styles.emptySub}>
            Utilize o botão "+ Cadastrar" no topo para adicionar tempos na grade.
          </Text>
        </View>
      ) : (
        groupNames.map((groupName) => {
          const slotsForGroup = groupedByGroup[groupName];

          return (
            <View key={groupName} style={styles.groupSectionCard}>
              
              {/* Header da Turma */}
              <View style={styles.groupHeaderBar}>
                <Ionicons name="people" size={16} color={colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.groupHeaderTitle}>{groupName}</Text>
                <Text style={styles.groupHeaderBadge}>
                  {slotsForGroup.length} tempo{slotsForGroup.length > 1 ? 's' : ''}
                </Text>
              </View>

              {/* Tempos de Aula desta Turma */}
              {slotsForGroup.map((item) => (
                <View key={item.id} style={styles.slotRow}>
                  {/* Horário */}
                  <View style={styles.timeBadge}>
                    <Ionicons name="time-outline" size={13} color={colors.primary} style={{ marginRight: 3 }} />
                    <Text style={styles.timeText}>{item.timeStart} - {item.timeEnd}</Text>
                  </View>

                  {/* Informações da Aula */}
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.subjectText}>{item.subject}</Text>
                    <Text style={styles.teacherText}>Prof. {item.teacherName}</Text>
                    <Text style={styles.roomText}>Local: {item.room}</Text>
                  </View>

                  {/* Ações no Slot */}
                  <View style={styles.slotActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => onEditSlot(item)}
                    >
                      <Ionicons name="create-outline" size={16} color={colors.primary} />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', marginLeft: 6 }]}
                      onPress={() => onDeleteSlot(item)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

            </View>
          );
        })
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  dayPickerRow: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 6,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayScroll: {
    paddingHorizontal: 8,
  },
  dayTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.background,
    marginRight: 6,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  dayTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayTabText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  dayTabTextActive: {
    color: colors.white,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.white,
    marginTop: 2,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tableHeaderTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyTable: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
  },
  emptySub: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  groupSectionCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  groupHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  groupHeaderTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  groupHeaderBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  teacherText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 1,
  },
  roomText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  slotActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
