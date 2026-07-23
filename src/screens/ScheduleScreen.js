import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import AttendanceScreen from './AttendanceScreen';
import NewCallModal from '../components/NewCallModal';
import { supabase } from '../services/supabase';

// Geração dinâmica dos dias da semana (começando 2 dias atrás até 4 dias pra frente)
const generateWeekDays = () => {
  const days = [];
  const today = new Date();
  const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  
  for (let i = -2; i <= 4; i++) {
    const d = new Date();
    d.setDate(today.getDate() + i);
    days.push({
      dayName: dayNames[d.getDay()],
      dayNum: d.getDate().toString().padStart(2, '0'),
      dateStr: d.toLocaleDateString('en-CA'),
      isToday: i === 0,
    });
  }
  return days;
};

const weekDays = generateWeekDays();

export default function ScheduleScreen({ onLogout, teacherName = 'Prof. Carlos Eder', teacherId = null }) {
  // Ajuste para hoje (YYYY-MM-DD local)
  const todayStr = new Date().toLocaleDateString('en-CA');
  
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [schedulesData, setSchedulesData] = useState({});
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeClassForAttendance, setActiveClassForAttendance] = useState(null);
  const [isNewCallModalVisible, setIsNewCallModalVisible] = useState(false);

  useEffect(() => {
    fetchData();
  }, [teacherId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Busca as turmas e professores para relacionar (filtra pelo professor se houver id)
      let schedulesQuery = supabase
        .from('master_schedules')
        .select('*, groups(name), professors(name)');
        
      if (teacherId) {
        schedulesQuery = schedulesQuery.eq('professor_id', teacherId);
      }
      
      const { data: schedules } = await schedulesQuery;
      
      const { data: students } = await supabase
        .from('students')
        .select('*, groups(name)');

      // Busca chamadas já realizadas para não recriar
      const { data: attendances } = await supabase
        .from('attendance_records')
        .select('*');

      // Mapeia alunos
      const mappedStudents = students ? students.map(s => ({
        id: s.id,
        number: s.number,
        name: s.name,
        group: s.groups?.name,
        avatarColor: '#4F46E5', // Padrão
        parentEmail: s.parent_email
      })) : [];
      setAllStudents(mappedStudents);

      // Agrupa horários por data
      const newSchedulesData = {};
      if (schedules) {
        schedules.forEach(sched => {
          const date = sched.date_str;
          if (!newSchedulesData[date]) newSchedulesData[date] = [];
          
          // Verifica se já tem chamada (qualquer registro nesta schedule_id)
          const classAttendances = attendances ? attendances.filter(a => a.schedule_id === sched.id) : [];
          const isCompleted = classAttendances.length > 0;
          const presentCount = classAttendances.filter(a => a.status === 'P').length;

          // Reconstrói records se for completed
          const attendanceRecords = {};
          classAttendances.forEach(a => {
            attendanceRecords[a.student_id] = a.status;
          });

          newSchedulesData[date].push({
            id: sched.id,
            timeStart: sched.time_start.substring(0, 5),
            timeEnd: sched.time_end.substring(0, 5),
            subject: sched.subject,
            topic: sched.topic,
            group: sched.groups?.name,
            groupId: sched.group_id,
            room: sched.room,
            status: isCompleted ? 'completed' : 'pending',
            studentsCount: mappedStudents.filter(s => s.group === sched.groups?.name).length || 1,
            presentCount: isCompleted ? presentCount : null,
            attendanceRecords: isCompleted ? attendanceRecords : null
          });
        });
      }
      setSchedulesData(newSchedulesData);
    } catch (error) {
      console.error('Erro ao buscar dados do Supabase:', error);
    } finally {
      setLoading(false);
    }
  };

  const classesToday = schedulesData[selectedDate] || [];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { label: 'Chamada Concluída', color: '#10B981', bg: '#D1FAE5', icon: 'checkmark-circle' };
      case 'ongoing':
        return { label: 'Em Andamento', color: '#F59E0B', bg: '#FEF3C7', icon: 'time' };
      case 'upcoming':
        return { label: 'Próxima Aula', color: '#3B82F6', bg: '#DBEAFE', icon: 'calendar-outline' };
      case 'pending':
        return { label: 'Chamada Pendente', color: '#EF4444', bg: '#FEE2E2', icon: 'alert-circle' };
      default:
        return { label: 'Agendado', color: colors.textSecondary, bg: '#F3F4F6', icon: 'ellipsis-horizontal' };
    }
  };

  const handleAction = (item) => {
    setActiveClassForAttendance(item);
  };

  const handleSaveAttendance = async (updatedClassItem) => {
    // A tela AttendanceScreen já salvou no Supabase, então só atualizamos a UI localmente ou recarregamos
    await fetchData();
    setActiveClassForAttendance(null);
    Alert.alert(
      'Sucesso!',
      `Chamada salva no Supabase. Os e-mails para os pais foram disparados! (${updatedClassItem.presentCount}/${updatedClassItem.studentsCount} presentes).`
    );
  };

  const confirmDeleteAttendance = (classItemToDelete) => {
    const message = `Tem certeza que deseja excluir a chamada da turma "${classItemToDelete.group}" (${classItemToDelete.subject})?\n\nEsta ação apagará a chamada realizada.`;

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(message);
      if (confirmed) {
        handleDeleteAttendance(classItemToDelete);
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
            onPress: () => handleDeleteAttendance(classItemToDelete),
          },
        ]
      );
    }
  };

  const handleDeleteAttendance = (classItemToDelete) => {
    setSchedulesData((prev) => {
      const dayList = prev[selectedDate] || [];
      const updatedList = dayList.map((item) => {
        if (item.id === classItemToDelete.id) {
          return {
            ...item,
            status: 'pending',
            presentCount: null,
            attendanceRecords: null,
          };
        }
        return item;
      });
      return {
        ...prev,
        [selectedDate]: updatedList,
      };
    });
    setActiveClassForAttendance(null);
    Alert.alert('Chamada Excluída', `O registro de chamada da turma ${classItemToDelete.group} foi apagado.`);
  };

  const handleCreateNewCall = (newClassItem) => {
    setSchedulesData((prev) => {
      const dayList = prev[selectedDate] || [];
      return {
        ...prev,
        [selectedDate]: [newClassItem, ...dayList],
      };
    });
    // Inicia imediatamente a chamada para o novo tempo criado
    setActiveClassForAttendance(newClassItem);
  };

  if (activeClassForAttendance) {
    return (
      <AttendanceScreen
        classItem={activeClassForAttendance}
        allStudents={allStudents}
        onSave={handleSaveAttendance}
        onDelete={handleDeleteAttendance}
        onBack={() => setActiveClassForAttendance(null)}
      />
    );
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.textSecondary }}>Conectando ao Supabase...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header Superior */}
      <View style={styles.topHeader}>
        <View style={styles.userInfo}>
          <View style={styles.logoBadge}>
            <Image
              source={require('../../assets/metodo-logo.png')}
              style={styles.logoImg}
              resizeMode="contain"
            />
          </View>
          <View>
            <Text style={styles.welcomeText}>Bem-vindo,</Text>
            <Text style={styles.teacherNameText}>{teacherName}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={22} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Carrossel de Seleção de Dias */}
        <View style={styles.calendarSection}>
          <View style={styles.calendarHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar" size={18} color={colors.primary} style={{ marginRight: 6 }} />
              <Text style={styles.calendarTitle}>Meus Tempos de Aula</Text>
            </View>
            {selectedDate !== todayStr && (
              <TouchableOpacity onPress={() => setSelectedDate(todayStr)}>
                <Text style={styles.todayButtonText}>Ver Hoje</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysContainer}>
            {weekDays.map((item) => {
              const isSelected = item.dateStr === selectedDate;
              return (
                <TouchableOpacity
                  key={item.dateStr}
                  style={[
                    styles.dayPill,
                    isSelected && styles.dayPillSelected,
                    item.isToday && !isSelected && styles.dayPillToday,
                  ]}
                  onPress={() => setSelectedDate(item.dateStr)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.dayName, isSelected && styles.dayTextSelected]}>
                    {item.dayName}
                  </Text>
                  <Text style={[styles.dayNum, isSelected && styles.dayTextSelected]}>
                    {item.dayNum}
                  </Text>
                  {item.isToday && (
                    <View style={[styles.todayDot, isSelected && { backgroundColor: colors.white }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Resumo de Aulas do Dia */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{classesToday.length}</Text>
            <Text style={styles.summaryLabel}>Tempos no Dia</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: '#10B981' }]}>
              {classesToday.filter((c) => c.status === 'completed').length}
            </Text>
            <Text style={styles.summaryLabel}>Chamadas Feitas</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryNumber, { color: '#F59E0B' }]}>
              {classesToday.filter((c) => c.status !== 'completed').length}
            </Text>
            <Text style={styles.summaryLabel}>Pendentes</Text>
          </View>
        </View>

        {/* Título da Seção de Horários */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Grade de Horários • {selectedDate === todayStr ? 'Hoje' : selectedDate.split('-').reverse().slice(0,2).join('/')}
          </Text>

          <TouchableOpacity
            style={styles.addCallButton}
            onPress={() => setIsNewCallModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={18} color={colors.primary} style={{ marginRight: 4 }} />
            <Text style={styles.addCallButtonText}>Nova Chamada</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Aulas */}
        {classesToday.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cafe-outline" size={48} color={colors.placeholder} />
            <Text style={styles.emptyTitle}>Sem aulas agendadas</Text>
            <Text style={styles.emptySubtitle}>Você não possui tempos de aula cadastrados para este dia.</Text>
          </View>
        ) : (
          classesToday.map((item) => {
            const badge = getStatusBadge(item.status);
            return (
              <View key={item.id} style={styles.classCard}>
                
                {/* Lateral Esquerda - Horário */}
                <View style={styles.timeColumn}>
                  <Text style={styles.timeStart}>{item.timeStart}</Text>
                  <View style={styles.timeDivider} />
                  <Text style={styles.timeEnd}>{item.timeEnd}</Text>
                </View>

                {/* Conteúdo Principal */}
                <View style={styles.cardContent}>
                  
                  {/* Status Badge */}
                  <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                    <Ionicons name={badge.icon} size={14} color={badge.color} style={{ marginRight: 4 }} />
                    <Text style={[styles.statusText, { color: badge.color }]}>{badge.label}</Text>
                  </View>

                  <Text style={styles.subjectText}>{item.subject}</Text>
                  <Text style={styles.topicText}>{item.topic}</Text>

                  <View style={styles.infoRow}>
                    <Ionicons name="people-outline" size={15} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={styles.infoText}>{item.group}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Ionicons name="location-outline" size={15} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={styles.infoText}>{item.room}</Text>
                  </View>

                  {/* Ações da Chamada: Editar / Iniciar / Excluir */}
                  <View style={styles.cardActionsRow}>
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        item.status === 'completed' ? styles.actionButtonEdit : styles.actionButtonPrimary,
                      ]}
                      onPress={() => handleAction(item)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={item.status === 'completed' ? 'create-outline' : 'checkbox-outline'}
                        size={18}
                        color={colors.white}
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.actionButtonText}>
                        {item.status === 'completed' ? 'Editar Chamada' : 'Iniciar Chamada'}
                      </Text>
                    </TouchableOpacity>

                    {item.status === 'completed' ? (
                      <TouchableOpacity
                        style={styles.deleteCardButton}
                        onPress={() => confirmDeleteAttendance(item)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                </View>

              </View>
            );
          })
        )}

      </ScrollView>

      {/* Modal para Nova Chamada */}
      <NewCallModal
        visible={isNewCallModalVisible}
        onClose={() => setIsNewCallModalVisible(false)}
        onCreate={handleCreateNewCall}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  topHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.white,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  logoImg: {
    width: '100%',
    height: '100%',
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
  },
  teacherNameText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  logoutButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  calendarSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  todayButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  daysContainer: {
    flexDirection: 'row',
  },
  dayPill: {
    width: 54,
    height: 64,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayPillSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayPillToday: {
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  dayName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  dayNum: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dayTextSelected: {
    color: colors.white,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
  },
  summaryNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addCallButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  classCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  timeColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 14,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    minWidth: 65,
  },
  timeStart: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  timeDivider: {
    width: 2,
    height: 12,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  timeEnd: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  cardContent: {
    flex: 1,
    paddingLeft: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  subjectText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topicText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    borderRadius: 10,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  actionButtonEdit: {
    backgroundColor: '#059669',
  },
  actionButtonCompleted: {
    backgroundColor: '#10B981',
  },
  deleteCardButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
