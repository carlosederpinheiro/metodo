import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supabase } from '../services/supabase';

// Lista mockada de alunos da turma
const mockStudentsList = [
  { id: '1', number: '01', name: 'Ana Beatriz Souza', avatarColor: '#4F46E5' },
  { id: '2', number: '02', name: 'Arthur Lima Castro', avatarColor: '#059669' },
  { id: '3', number: '03', name: 'Bernardo Mendes Rocha', avatarColor: '#D97706' },
  { id: '4', number: '04', name: 'Camila Fernandes Viana', avatarColor: '#DC2626' },
  { id: '5', number: '05', name: 'Daniel Oliveira Santos', avatarColor: '#2563EB' },
  { id: '6', number: '06', name: 'Eduarda Ribeiro Silva', avatarColor: '#7C3AED' },
  { id: '7', number: '07', name: 'Enzo Gabriel Pereira', avatarColor: '#0891B2' },
  { id: '8', number: '08', name: 'Felipe Augusto Gomes', avatarColor: '#059669' },
  { id: '9', number: '09', name: 'Gabriela Duarte Martins', avatarColor: '#D97706' },
  { id: '10', number: '10', name: 'Guilherme Henrique Barbosa', avatarColor: '#4F46E5' },
  { id: '11', number: '11', name: 'Heitor Vasconcelos', avatarColor: '#2563EB' },
  { id: '12', number: '12', name: 'Isabela Cristina Costa', avatarColor: '#DC2626' },
  { id: '13', number: '13', name: 'João Pedro Carvalho', avatarColor: '#7C3AED' },
  { id: '14', number: '14', name: 'Julia Maria Alencar', avatarColor: '#0891B2' },
  { id: '15', number: '15', name: 'Lucas Eduardo Fonseca', avatarColor: '#059669' },
  { id: '16', number: '16', name: 'Manuela Nogueira Cruz', avatarColor: '#D97706' },
  { id: '17', number: '17', name: 'Matheus Henrique Ramos', avatarColor: '#4F46E5' },
  { id: '18', number: '18', name: 'Nicolas Ferreira Marques', avatarColor: '#2563EB' },
  { id: '19', number: '19', name: 'Olívia Meireles Pires', avatarColor: '#DC2626' },
  { id: '20', number: '20', name: 'Pedro Henrique Teixeira', avatarColor: '#7C3AED' },
  { id: '21', number: '21', name: 'Rafael Guimarães Paiva', avatarColor: '#0891B2' },
  { id: '22', number: '22', name: 'Sofia Maria Machado', avatarColor: '#059669' },
  { id: '23', number: '23', name: 'Thiago Alexandre Farias', avatarColor: '#D97706' },
  { id: '24', number: '24', name: 'Vinícius Gabriel Abreu', avatarColor: '#4F46E5' },
  { id: '25', number: '25', name: 'Yasmin Vitória Silveira', avatarColor: '#DC2626' },
];

export default function AttendanceScreen({ classItem, allStudents = [], onSave, onDelete, onBack }) {
  const isEditing = classItem.status === 'completed';

  // Filtra os alunos cadastrados para a turma da aula
  const activeStudentsList = allStudents.filter((s) => s.group === classItem.group);

  // Inicialização: Se estiver editando, carrega os registros salvos; senão, todos começam como 'P'
  const [attendance, setAttendance] = useState(() => {
    if (classItem.attendanceRecords) {
      return { ...classItem.attendanceRecords };
    }
    const initial = {};
    activeStudentsList.forEach((student) => {
      initial[student.id] = 'P'; // 'P' = Presente, 'F' = Falta
    });
    return initial;
  });

  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL', 'PRESENT', 'ABSENT'

  // Alterna o status do aluno (P -> F -> P)
  const toggleAttendance = (studentId) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'P' ? 'F' : 'P',
    }));
  };

  // Ações em lote rápidas
  const markAllPresent = () => {
    const updated = {};
    activeStudentsList.forEach((s) => {
      updated[s.id] = 'P';
    });
    setAttendance(updated);
  };

  const markAllAbsent = () => {
    const updated = {};
    activeStudentsList.forEach((s) => {
      updated[s.id] = 'F';
    });
    setAttendance(updated);
  };

  // Estatísticas em tempo real
  const totalStudents = activeStudentsList.length;
  const presentCount = Object.values(attendance).filter((val) => val === 'P').length;
  const absentCount = totalStudents - presentCount;

  // Filtragem da lista
  const filteredStudents = activeStudentsList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (s.number && s.number.includes(searchText));

    if (!matchesSearch) return false;

    if (activeFilter === 'PRESENT') return attendance[s.id] === 'P';
    if (activeFilter === 'ABSENT') return attendance[s.id] === 'F';
    return true;
  });

  const handleSave = async () => {
    const message = isEditing 
      ? `Atualizar chamada para ${classItem.group}?\n\nPresentes: ${presentCount}\nFaltas: ${absentCount}`
      : `Confirmar chamada para ${classItem.group}?\n\nPresentes: ${presentCount}\nFaltas: ${absentCount}`;

    const executeSave = async () => {
      try {
        const recordsToInsert = activeStudentsList.map((student) => ({
          schedule_id: classItem.id,
          student_id: student.id,
          status: attendance[student.id], // 'P' ou 'F'
        }));

        // Usa upsert para não apagar o histórico de quem já estava na chamada, apenas atualiza
        const { error } = await supabase
          .from('attendance_records')
          .upsert(recordsToInsert, { onConflict: 'schedule_id, student_id' });
        
        if (error) throw error;

        onSave({
          ...classItem,
          status: 'completed',
          presentCount,
          studentsCount: totalStudents,
          attendanceRecords: attendance,
        });
      } catch (err) {
        if (Platform.OS === 'web') {
          window.alert('Erro: Não foi possível salvar a chamada no Supabase.');
        } else {
          Alert.alert('Erro', 'Não foi possível salvar a chamada no Supabase.');
        }
        console.error(err);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(message);
      if (confirmed) {
        await executeSave();
      }
    } else {
      Alert.alert(
        isEditing ? 'Atualizar Chamada' : 'Salvar Chamada',
        message,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: isEditing ? 'Salvar Alterações' : 'Salvar Chamada',
            style: 'default',
            onPress: executeSave,
          },
        ]
      );
    }
  };

  const handleDelete = () => {
    const message = `Tem certeza que deseja excluir a chamada da turma "${classItem.group}" (${classItem.subject})?\n\nEsta ação apagará a chamada realizada.`;

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(message);
      if (confirmed && onDelete) {
        onDelete(classItem);
      }
    } else {
      Alert.alert(
        '⚠️ Confirmar Exclusão de Chamada',
        message,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sim, Excluir Chamada',
            style: 'destructive',
            onPress: () => {
              if (onDelete) onDelete(classItem);
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Header Fixo */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Editar Chamada' : 'Nova Chamada'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {classItem.group} • {classItem.subject}
          </Text>
        </View>

        {isEditing && onDelete ? (
          <TouchableOpacity style={styles.deleteHeaderButton} onPress={handleDelete} activeOpacity={0.7}>
            <Ionicons name="trash-outline" size={20} color="#FCA5A5" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Card de Informações e Estatísticas */}
      <View style={styles.summaryBar}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalStudents}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#10B981' }]}>{presentCount}</Text>
          <Text style={styles.statLabel}>Presentes</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: '#EF4444' }]}>{absentCount}</Text>
          <Text style={styles.statLabel}>Faltas</Text>
        </View>
      </View>

      {/* Barra de Busca e Atalhos Rápidos */}
      <View style={styles.controlPanel}>
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nome ou número..."
            placeholderTextColor={colors.placeholder}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Botões de Filtro e Ação Rápida */}
        <View style={styles.quickActionsRow}>
          <View style={styles.filterTabs}>
            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'ALL' && styles.filterTabActive]}
              onPress={() => setActiveFilter('ALL')}
            >
              <Text style={[styles.filterTabText, activeFilter === 'ALL' && styles.filterTabTextActive]}>
                Todos ({totalStudents})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterTab, activeFilter === 'ABSENT' && styles.filterTabActive]}
              onPress={() => setActiveFilter('ABSENT')}
            >
              <Text
                style={[
                  styles.filterTabText,
                  activeFilter === 'ABSENT' && { color: '#EF4444', fontWeight: '700' },
                ]}
              >
                Faltas ({absentCount})
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.batchButton} onPress={markAllPresent} activeOpacity={0.7}>
            <Ionicons name="checkmark-done-outline" size={16} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.batchButtonText}>Todos Presentes</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lista de Alunos para Chamada */}
      <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
        {filteredStudents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="person-remove-outline" size={40} color={colors.placeholder} />
            <Text style={styles.emptyText}>Nenhum aluno encontrado</Text>
          </View>
        ) : (
          filteredStudents.map((student) => {
            const isPresent = attendance[student.id] === 'P';

            return (
              <TouchableOpacity
                key={student.id}
                style={[
                  styles.studentCard,
                  !isPresent && styles.studentCardAbsent,
                ]}
                onPress={() => toggleAttendance(student.id)}
                activeOpacity={0.75}
              >
                <View style={styles.studentInfoLeft}>
                  <Text style={styles.studentNumber}>{student.number}</Text>
                  <View style={[styles.avatar, { backgroundColor: student.avatarColor }]}>
                    <Text style={styles.avatarText}>
                      {student.name.charAt(0)}
                    </Text>
                  </View>
                  <Text style={[styles.studentName, !isPresent && styles.studentNameAbsent]}>
                    {student.name}
                  </Text>
                </View>

                {/* Botão Indicador P (Presente) / F (Falta) */}
                <View style={[styles.statusToggle, isPresent ? styles.statusP : styles.statusF]}>
                  <Ionicons
                    name={isPresent ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={colors.white}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.statusToggleText}>
                    {isPresent ? 'PRESENTE' : 'FALTA'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Rodapé Fixo com Botão Salvar */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.85}>
          <Ionicons name="save-outline" size={22} color={colors.white} style={{ marginRight: 8 }} />
          <Text style={styles.saveButtonText}>Salvar Chamada ({presentCount}/{totalStudents})</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  backButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  deleteHeaderButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    marginLeft: 8,
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    height: '60%',
    alignSelf: 'center',
  },
  controlPanel: {
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  quickActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: colors.background,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  batchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  batchButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 90,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  studentCardAbsent: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  studentInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    width: 24,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  studentName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  studentNameAbsent: {
    color: '#991B1B',
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  statusP: {
    backgroundColor: '#10B981',
  },
  statusF: {
    backgroundColor: '#EF4444',
  },
  statusToggleText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
