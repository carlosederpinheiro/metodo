import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Image,
  TextInput,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { supabase } from '../services/supabase';
import UserModal from '../components/UserModal';
import MasterScheduleModal from '../components/MasterScheduleModal';
import GroupRoomModal from '../components/GroupRoomModal';
import DropdownSelect from '../components/DropdownSelect';
import StudentHistoryModal from '../components/StudentHistoryModal';
import ClassCallDetailsModal from '../components/ClassCallDetailsModal';
import MasterScheduleTable from '../components/MasterScheduleTable';
import TeacherScheduleModal from '../components/TeacherScheduleModal';

export default function AdminHomeScreen({
  professors,
  setProfessors,
  students,
  setStudents,
  admins,
  setAdmins,
  groups,
  setGroups,
  rooms,
  setRooms,
  masterSchedule,
  setMasterSchedule,
  onLogout,
  adminName = 'Diretoria Método',
}) {
  const [activeTab, setActiveTab] = useState('STUDENTS'); // 'STUDENTS', 'PROFESSORS', 'CALLS', 'OTHERS'
  const [othersSubTab, setOthersSubTab] = useState('ADMINS'); // 'ADMINS', 'SCHEDULE', 'INFRA'
  const [searchText, setSearchText] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');

  // Modais de Cadastro
  const [isUserModalVisible, setIsUserModalVisible] = useState(false);
  const [userModalType, setUserModalType] = useState('PROFESSOR');
  const [editingUser, setEditingUser] = useState(null);

  const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
  const [editingScheduleItem, setEditingScheduleItem] = useState(null);

  const [isGroupRoomModalVisible, setIsGroupRoomModalVisible] = useState(false);
  const [groupRoomType, setGroupRoomType] = useState('GROUP'); // 'GROUP' | 'ROOM'
  const [editingGroupRoom, setEditingGroupRoom] = useState(null);

  // Modais de Relatório de Frequência
  const [selectedStudentForHistory, setSelectedStudentForHistory] = useState(null);
  const [isStudentHistoryModalVisible, setIsStudentHistoryModalVisible] = useState(false);

  const [selectedClassForDetails, setSelectedClassForDetails] = useState(null);
  const [isClassCallModalVisible, setIsClassCallModalVisible] = useState(false);

  const [selectedTeacherForModal, setSelectedTeacherForModal] = useState(null);
  const [isTeacherScheduleModalVisible, setIsTeacherScheduleModalVisible] = useState(false);

  const [loadingDb, setLoadingDb] = useState(true);
  const [dbGroups, setDbGroups] = useState([]); // Guarda os objetos completos para pegar ID

  React.useEffect(() => {
    fetchDbData();
  }, []);

  const fetchDbData = async () => {
    setLoadingDb(true);
    try {
      const { data: groupsData } = await supabase.from('groups').select('*');
      if (groupsData) {
        setDbGroups(groupsData);
        setGroups(groupsData.map(g => g.name)); 
      }
      const { data: roomsData } = await supabase.from('rooms').select('*');
      if (roomsData) {
        setRooms(roomsData.map(r => r.name)); 
      }
      const { data: studentsData } = await supabase.from('students').select('*, groups(name)');
      if (studentsData) {
        setStudents(studentsData.map(s => ({
          id: s.id,
          number: s.number || s.id.substring(0,2),
          matricula: s.number || s.id.substring(0,4),
          name: s.name,
          group: s.groups?.name,
          parentEmail: s.parent_email,
        })));
      }
      const { data: professorsData } = await supabase.from('professors').select('*');
      if (professorsData) setProfessors(professorsData);
      
      const { data: adminsData } = await supabase.from('admins').select('*');
      if (adminsData) setAdmins(adminsData);
      
      const { data: schedulesData } = await supabase.from('master_schedules').select('*, groups(name), professors(name)');
      if (schedulesData) {
        setMasterSchedule(schedulesData.map(s => ({
          id: s.id,
          teacherId: s.professor_id,
          teacherName: s.professors?.name,
          dateStr: s.date_str,
          timeStart: s.time_start.substring(0,5),
          timeEnd: s.time_end.substring(0,5),
          subject: s.subject,
          group: s.groups?.name,
          room: s.room,
          status: 'pending',
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDb(false);
    }
  };

  const handleOpenNewUser = (type) => {
    setUserModalType(type);
    setEditingUser(null);
    setIsUserModalVisible(true);
  };

  const handleEditUser = (type, user) => {
    setUserModalType(type);
    setEditingUser(user);
    setIsUserModalVisible(true);
  };

  const handleDeleteUser = async (type, user) => {
    const label = type === 'PROFESSOR' ? 'professor' : type === 'STUDENT' ? 'aluno' : 'administrador';
    const deleteAction = async () => {
      try {
        if (type === 'STUDENT') {
          await supabase.from('attendance_records').delete().eq('student_id', user.id);
          const { error } = await supabase.from('students').delete().eq('id', user.id);
          if (error) throw error;
        } else if (type === 'PROFESSOR') {
          // Remove cascade dependentes do professor
          const schedules = await supabase.from('master_schedules').select('id').eq('professor_id', user.id);
          if (schedules.data && schedules.data.length > 0) {
             const scheduleIds = schedules.data.map(s => s.id);
             await supabase.from('attendance_records').delete().in('schedule_id', scheduleIds);
          }
          await supabase.from('master_schedules').delete().eq('professor_id', user.id);
          const { error } = await supabase.from('professors').delete().eq('id', user.id);
          if (error) throw error;
        } else if (type === 'ADMIN') {
          const { error } = await supabase.from('admins').delete().eq('id', user.id);
          if (error) throw error;
        }
        await fetchDbData();
        Alert.alert('Sucesso', 'Registro removido com sucesso.');
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível remover o registro.');
        console.error(e);
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Tem certeza que deseja excluir o ${label} "${user.name}"?`)) {
        deleteAction();
      }
    } else {
      Alert.alert('Confirmar Exclusão', `Tem certeza que deseja excluir o ${label} "${user.name}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: deleteAction },
      ]);
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      const isUpdate = userData.id && userData.id.length > 20;
      
      if (userModalType === 'STUDENT') {
        const targetGroup = dbGroups.find(g => g.name === userData.group);
        if (!targetGroup) return Alert.alert('Erro', 'Turma não encontrada no Banco de Dados.');

        const payload = {
          name: userData.name,
          number: userData.matricula,
          group_id: targetGroup.id,
          parent_email: userData.parentEmail
        };
        if (isUpdate) await supabase.from('students').update(payload).eq('id', userData.id);
        else await supabase.from('students').insert([payload]);
        
      } else if (userModalType === 'PROFESSOR') {
        const payload = { name: userData.name, username: userData.username, subject: userData.subject };
        if (userData.password && userData.password !== 'Metodo2026@@') payload.password_hash = userData.password;
        else if (!isUpdate) payload.password_hash = 'Metodo2026@@';

        if (isUpdate) await supabase.from('professors').update(payload).eq('id', userData.id);
        else await supabase.from('professors').insert([payload]);

      } else if (userModalType === 'ADMIN') {
        const payload = { name: userData.name, username: userData.username, role: userData.role };
        if (userData.password && userData.password !== 'Metodo2026@@') payload.password_hash = userData.password;
        else if (!isUpdate) payload.password_hash = 'Metodo2026@@';

        if (isUpdate) await supabase.from('admins').update(payload).eq('id', userData.id);
        else await supabase.from('admins').insert([payload]);
      }
      
      await fetchDbData();
      Alert.alert('Sucesso', 'Registro salvo com sucesso!');
    } catch (e) {
      Alert.alert('Erro', 'Ocorreu um erro ao salvar o registro no banco.');
      console.error(e);
    }
  };

  const handleOpenNewSchedule = () => {
    setEditingScheduleItem(null);
    setIsScheduleModalVisible(true);
  };

  const handleEditSchedule = (item) => {
    setEditingScheduleItem(item);
    setIsScheduleModalVisible(true);
  };

  const handleDeleteSchedule = async (item) => {
    const msg = `Remover aula de ${item.subject} (${item.teacherName}) da grade?`;
    const deleteAction = async () => {
      try {
        await supabase.from('attendance_records').delete().eq('schedule_id', item.id);
        const { error } = await supabase.from('master_schedules').delete().eq('id', item.id);
        if (error) throw error;
        await fetchDbData();
        Alert.alert('Sucesso', 'Horário removido da grade.');
      } catch (e) {
        Alert.alert('Erro', 'Não foi possível remover a grade.');
        console.error(e);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(msg)) deleteAction();
    } else {
      Alert.alert('Atenção', msg, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Remover', style: 'destructive', onPress: deleteAction }
      ]);
    }
  };

  const handleSaveSchedule = async (scheduleData) => {
    try {
      const isUpdate = scheduleData.id && scheduleData.id.length > 20;
      const targetGroup = dbGroups.find(g => g.name === scheduleData.group);
      
      const payload = {
        professor_id: scheduleData.teacherId,
        group_id: targetGroup?.id,
        subject: scheduleData.subject,
        room: scheduleData.room,
        date_str: scheduleData.dateStr,
        time_start: scheduleData.timeStart,
        time_end: scheduleData.timeEnd
      };

      if (isUpdate) await supabase.from('master_schedules').update(payload).eq('id', scheduleData.id);
      else await supabase.from('master_schedules').insert([payload]);
      
      await fetchDbData();
      Alert.alert('Sucesso', 'Tempo inserido com sucesso!');
    } catch (e) {
      Alert.alert('Erro', 'Erro ao salvar a grade no banco de dados.');
      console.error(e);
    }
  };

  const handleOpenGroupRoomConfig = () => {
    setIsGroupRoomModalVisible(true);
  };

  const handleDeleteGroupRoom = async (type, itemName) => {
    const table = type === 'GROUP' ? 'groups' : 'rooms';
    const deleteAction = async () => {
      try {
        const { error } = await supabase.from(table).delete().eq('name', itemName);
        if (error) throw error;
        await fetchDbData();
        Alert.alert('Sucesso', 'Removido com sucesso do banco de dados.');
      } catch (e) {
        Alert.alert('Erro', 'Erro ao remover. Pode haver registros dependentes.');
        console.error(e);
      }
    };
    if (Platform.OS === 'web') {
      if (window.confirm(`Excluir permanentemente ${itemName}?`)) deleteAction();
    } else {
      Alert.alert('Confirmar Exclusão', `Excluir permanentemente ${itemName}?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: deleteAction }
      ]);
    }
  };

  const handleSaveGroupRoom = async (type, originalName, newName) => {
    const table = type === 'GROUP' ? 'groups' : 'rooms';
    try {
      if (originalName) {
        await supabase.from(table).update({ name: newName }).eq('name', originalName);
      } else {
        await supabase.from(table).insert([{ name: newName }]);
      }
      await fetchDbData();
      Alert.alert('Sucesso', 'Salvo com sucesso.');
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível salvar no banco.');
      console.error(e);
    }
  };

  const handleOpenGroupRoomModal = (type, item = null) => {
    setGroupRoomType(type);
    setEditingGroupRoom(item);
    setIsGroupRoomModalVisible(true);
  };


  // Filtragens
  const filteredProfessors = professors.filter(
    (p) =>
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.username.toLowerCase().includes(searchText.toLowerCase()) ||
      (p.subject && p.subject.toLowerCase().includes(searchText.toLowerCase()))
  );

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchText.toLowerCase()) ||
      (s.matricula && s.matricula.includes(searchText)) ||
      s.group.toLowerCase().includes(searchText.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedGroupFilter !== 'ALL' && s.group !== selectedGroupFilter) return false;
    return true;
  });

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(searchText.toLowerCase()) ||
      a.username.toLowerCase().includes(searchText.toLowerCase()) ||
      (a.role && a.role.toLowerCase().includes(searchText.toLowerCase()))
  );

  const filteredSchedule = masterSchedule.filter(
    (ms) =>
      ms.teacherName.toLowerCase().includes(searchText.toLowerCase()) ||
      ms.subject.toLowerCase().includes(searchText.toLowerCase()) ||
      ms.group.toLowerCase().includes(searchText.toLowerCase())
  );

  // Lista de Chamadas Concluídas
  const completedCallsList = masterSchedule.filter(
    (ms) =>
      (ms.status === 'completed' || ms.attendanceRecords) &&
      (ms.teacherName.toLowerCase().includes(searchText.toLowerCase()) ||
        ms.subject.toLowerCase().includes(searchText.toLowerCase()) ||
        ms.group.toLowerCase().includes(searchText.toLowerCase()))
  );

  const isInfraActive = activeTab === 'OTHERS' && othersSubTab === 'INFRA';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Top Header Gestão Organizado */}
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
            <View style={styles.adminRoleBadge}>
              <Ionicons name="shield-checkmark" size={12} color={colors.white} style={{ marginRight: 4 }} />
              <Text style={styles.adminRoleText}>PAINEL DO GESTOR</Text>
            </View>
            <Text style={styles.teacherNameText}>{adminName}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={colors.white} style={{ marginRight: 4 }} />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* Seletor SubTab quando na aba OTHRES (Outros) */}
      {activeTab === 'OTHERS' && (
        <View style={styles.subTabBar}>
          <TouchableOpacity
            style={[styles.subTabItem, othersSubTab === 'ADMINS' && styles.subTabItemActive]}
            onPress={() => setOthersSubTab('ADMINS')}
          >
            <Ionicons
              name="shield-outline"
              size={15}
              color={othersSubTab === 'ADMINS' ? colors.primary : colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.subTabText, othersSubTab === 'ADMINS' && styles.subTabTextActive]}>
              Admins
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabItem, othersSubTab === 'SCHEDULE' && styles.subTabItemActive]}
            onPress={() => setOthersSubTab('SCHEDULE')}
          >
            <Ionicons
              name="calendar-outline"
              size={15}
              color={othersSubTab === 'SCHEDULE' ? colors.primary : colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.subTabText, othersSubTab === 'SCHEDULE' && styles.subTabTextActive]}>
              Grade Horária
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabItem, othersSubTab === 'INFRA' && styles.subTabItemActive]}
            onPress={() => setOthersSubTab('INFRA')}
          >
            <Ionicons
              name="business-outline"
              size={15}
              color={othersSubTab === 'INFRA' ? colors.primary : colors.textSecondary}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.subTabText, othersSubTab === 'INFRA' && styles.subTabTextActive]}>
              Turma & Salas
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Painel de Controle e Botão Principal */}
      <View style={styles.controlPanel}>
        {!isInfraActive && (
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar por nome, usuário ou código..."
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

            {activeTab !== 'CALLS' && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  if (activeTab === 'PROFESSORS') handleOpenNewUser('PROFESSOR');
                  else if (activeTab === 'STUDENTS') handleOpenNewUser('STUDENT');
                  else if (activeTab === 'OTHERS' && othersSubTab === 'ADMINS') handleOpenNewUser('ADMIN');
                  else if (activeTab === 'OTHERS' && othersSubTab === 'SCHEDULE') handleOpenNewSchedule();
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="add-circle" size={18} color={colors.white} style={{ marginRight: 6 }} />
                <Text style={styles.addButtonText}>Cadastrar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Filtro por Turma quando na aba Alunos */}
        {activeTab === 'STUDENTS' && (
          <View style={{ marginTop: 10 }}>
            <DropdownSelect
              label="Filtrar por Turma"
              value={selectedGroupFilter}
              options={[
                { label: 'Todas as Turmas', value: 'ALL' },
                ...groups.map((g) => ({ label: g, value: g })),
              ]}
              onSelect={setSelectedGroupFilter}
              placeholder="Selecione a turma..."
            />
          </View>
        )}
      </View>

      {/* Conteúdo Principal */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* ABA ALUNOS */}
        {activeTab === 'STUDENTS' && (
          filteredStudents.map((student) => (
            <View key={student.id} style={styles.itemCard}>
              <TouchableOpacity
                style={styles.itemHeader}
                onPress={() => {
                  setSelectedStudentForHistory(student);
                  setIsStudentHistoryModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.avatarCircle, { backgroundColor: '#4F46E5' }]}>
                  <Text style={styles.avatarLetter}>{student.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.itemName}>{student.name}</Text>
                    <View style={styles.historyPill}>
                      <Ionicons name="analytics" size={12} color={colors.primary} style={{ marginRight: 2 }} />
                      <Text style={styles.historyPillText}>Frequência</Text>
                    </View>
                  </View>
                  <Text style={styles.itemSubtext}>Matrícula: {student.matricula}</Text>
                  <Text style={styles.itemDetailText}>Turma: {student.group}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleEditUser('STUDENT', student)}
                >
                  <Ionicons name="create-outline" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.editBtnText}>Editar Aluno</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteUser('STUDENT', student)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* ABA PROFESSORES */}
        {activeTab === 'PROFESSORS' && (
          filteredProfessors.map((prof) => (
            <View key={prof.id} style={styles.itemCard}>
              <TouchableOpacity
                style={styles.itemHeader}
                onPress={() => {
                  setSelectedTeacherForModal(prof);
                  setIsTeacherScheduleModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>{prof.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={styles.itemName}>{prof.name}</Text>
                    <View style={styles.historyPill}>
                      <Ionicons name="calendar-outline" size={12} color={colors.primary} style={{ marginRight: 2 }} />
                      <Text style={styles.historyPillText}>Horários</Text>
                    </View>
                  </View>
                  <Text style={styles.itemSubtext}>Usuário: @{prof.username}</Text>
                  <Text style={styles.itemDetailText}>Disciplina: {prof.subject}</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.itemActions}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => handleEditUser('PROFESSOR', prof)}
                >
                  <Ionicons name="create-outline" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                  <Text style={styles.editBtnText}>Editar Dados</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDeleteUser('PROFESSOR', prof)}
                >
                  <Ionicons name="trash-outline" size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* ABA CHAMADAS (Histórico Global de Chamadas dos Professores) */}
        {activeTab === 'CALLS' && (
          completedCallsList.length === 0 ? (
            <View style={styles.emptyCallsContainer}>
              <Ionicons name="clipboard-outline" size={48} color={colors.placeholder} />
              <Text style={styles.emptyCallsTitle}>Nenhuma chamada registrada</Text>
              <Text style={styles.emptyCallsSub}>
                As chamadas salvas pelos professores aparecerão automaticamente nesta lista.
              </Text>
            </View>
          ) : (
            completedCallsList.map((item) => {
              const records = item.attendanceRecords || {};
              const groupStudents = students.filter((s) => s.group === item.group);
              const presentCount = groupStudents.filter((s) => (records[s.id] || 'P') === 'P').length;

              return (
                <View key={item.id} style={styles.itemCard}>
                  <View style={styles.scheduleRowTop}>
                    <View style={[styles.badgeTime, { backgroundColor: '#D1FAE5' }]}>
                      <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{ marginRight: 4 }} />
                      <Text style={[styles.badgeTimeText, { color: '#10B981' }]}>Chamada Concluída</Text>
                    </View>
                    <Text style={styles.badgeDay}>{item.dayOfWeek || 'Segunda-feira'}</Text>
                  </View>

                  <Text style={styles.itemName}>{item.subject} • {item.teacherName}</Text>
                  <Text style={styles.itemSubtext}>Turma: {item.group} • {item.room}</Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                    <Ionicons name="people-outline" size={14} color={colors.textSecondary} style={{ marginRight: 4 }} />
                    <Text style={styles.scheduleDetailText}>
                      Presença: {presentCount} / {groupStudents.length} Alunos Presentes
                    </Text>
                  </View>

                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => {
                        setSelectedClassForDetails(item);
                        setIsClassCallModalVisible(true);
                      }}
                    >
                      <Ionicons name="list-outline" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={styles.editBtnText}>Ver Lista da Chamada</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )
        )}

        {/* ABA OUTROS - SUB-ABAS (ADMINS, SCHEDULE, INFRA) */}
        {activeTab === 'OTHERS' && (
          <>
            {/* SUB-ABA ADMINS */}
            {othersSubTab === 'ADMINS' && (
              filteredAdmins.map((adm) => (
                <View key={adm.id} style={styles.itemCard}>
                  <View style={styles.itemHeader}>
                    <View style={[styles.avatarCircle, { backgroundColor: '#DC2626' }]}>
                      <Text style={styles.avatarLetter}>A</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.itemName}>{adm.name}</Text>
                      <Text style={styles.itemSubtext}>Usuário: @{adm.username}</Text>
                      <Text style={styles.itemDetailText}>Cargo: {adm.role}</Text>
                    </View>
                  </View>

                  <View style={styles.itemActions}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => handleEditUser('ADMIN', adm)}
                    >
                      <Ionicons name="create-outline" size={16} color={colors.primary} style={{ marginRight: 4 }} />
                      <Text style={styles.editBtnText}>Editar Gestor</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteUser('ADMIN', adm)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}

            {/* SUB-ABA GRADE HORÁRIA */}
            {othersSubTab === 'SCHEDULE' && (
              <MasterScheduleTable
                masterSchedule={masterSchedule}
                onOpenNewSlot={handleOpenNewSchedule}
                onEditSlot={handleEditSchedule}
                onDeleteSlot={handleDeleteSchedule}
              />
            )}

            {/* SUB-ABA TURMAS & SALAS */}
            {othersSubTab === 'INFRA' && (
              <View>
                {/* Seção Turmas */}
                <View style={styles.sectionHeaderRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="people-circle-outline" size={20} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.sectionTitleText}>Turmas Cadastradas ({groups.length})</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addSmallBtn}
                    onPress={() => handleOpenGroupRoomModal('GROUP')}
                  >
                    <Ionicons name="add" size={16} color={colors.primary} />
                    <Text style={styles.addSmallBtnText}>Nova Turma</Text>
                  </TouchableOpacity>
                </View>

                {groups.map((grp) => (
                  <View key={grp} style={styles.infraCard}>
                    <Text style={styles.infraCardTitle}>{grp}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => handleOpenGroupRoomModal('GROUP', grp)}
                      >
                        <Ionicons name="create-outline" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.iconBtn, { marginLeft: 6 }]}
                        onPress={() => handleDeleteGroupRoom('GROUP', grp)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Seção Salas */}
                <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="easel-outline" size={20} color={colors.primary} style={{ marginRight: 6 }} />
                    <Text style={styles.sectionTitleText}>Salas de Aula ({rooms.length})</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addSmallBtn}
                    onPress={() => handleOpenGroupRoomModal('ROOM')}
                  >
                    <Ionicons name="add" size={16} color={colors.primary} />
                    <Text style={styles.addSmallBtnText}>Nova Sala</Text>
                  </TouchableOpacity>
                </View>

                {rooms.map((rm) => (
                  <View key={rm} style={styles.infraCard}>
                    <Text style={styles.infraCardTitle}>{rm}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => handleOpenGroupRoomModal('ROOM', rm)}
                      >
                        <Ionicons name="create-outline" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.iconBtn, { marginLeft: 6 }]}
                        onPress={() => handleDeleteGroupRoom('ROOM', rm)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

      </ScrollView>

      {/* Barra de Navegação Inferior (BottomBar com EXATAMENTE 4 ÍCONES FIXOS) */}
      <View style={styles.bottomBar} dataSet={{ frozen: 'true' }}>
        <TouchableOpacity
          style={styles.bottomTab}
          onPress={() => { setActiveTab('STUDENTS'); setSearchText(''); }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'STUDENTS' ? 'people' : 'people-outline'}
            size={22}
            color={activeTab === 'STUDENTS' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[styles.bottomTabText, activeTab === 'STUDENTS' && styles.bottomTabTextActive]}
            numberOfLines={1}
          >
            Alunos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomTab}
          onPress={() => { setActiveTab('PROFESSORS'); setSearchText(''); }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'PROFESSORS' ? 'school' : 'school-outline'}
            size={22}
            color={activeTab === 'PROFESSORS' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[styles.bottomTabText, activeTab === 'PROFESSORS' && styles.bottomTabTextActive]}
            numberOfLines={1}
          >
            Profs
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomTab}
          onPress={() => { setActiveTab('CALLS'); setSearchText(''); }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'CALLS' ? 'clipboard' : 'clipboard-outline'}
            size={22}
            color={activeTab === 'CALLS' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[styles.bottomTabText, activeTab === 'CALLS' && styles.bottomTabTextActive]}
            numberOfLines={1}
          >
            Chamadas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomTab}
          onPress={() => { setActiveTab('OTHERS'); setSearchText(''); }}
          activeOpacity={0.7}
        >
          <Ionicons
            name={activeTab === 'OTHERS' ? 'grid' : 'grid-outline'}
            size={22}
            color={activeTab === 'OTHERS' ? colors.primary : colors.textSecondary}
          />
          <Text
            style={[styles.bottomTabText, activeTab === 'OTHERS' && styles.bottomTabTextActive]}
            numberOfLines={1}
          >
            Outros
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modais do Sistema */}
      <UserModal
        visible={isUserModalVisible}
        type={userModalType}
        userToEdit={editingUser}
        availableGroups={groups}
        studentsList={students}
        onSave={handleSaveUser}
        onClose={() => setIsUserModalVisible(false)}
      />

      <MasterScheduleModal
        visible={isScheduleModalVisible}
        professorsList={professors}
        availableGroups={groups}
        availableRooms={rooms}
        itemToEdit={editingScheduleItem}
        onSave={handleSaveSchedule}
        onClose={() => setIsScheduleModalVisible(false)}
      />

      <GroupRoomModal
        visible={isGroupRoomModalVisible}
        type={groupRoomType}
        itemToEdit={editingGroupRoom}
        onSave={(newName, oldName) => handleSaveGroupRoom(groupRoomType, oldName, newName)}
        onClose={() => setIsGroupRoomModalVisible(false)}
      />

      {/* Modais de Relatório de Frequência */}
      <StudentHistoryModal
        visible={isStudentHistoryModalVisible}
        student={selectedStudentForHistory}
        masterSchedule={masterSchedule}
        onClose={() => setIsStudentHistoryModalVisible(false)}
      />

      <ClassCallDetailsModal
        visible={isClassCallModalVisible}
        classItem={selectedClassForDetails}
        studentsList={students}
        onSelectStudent={(st) => {
          setSelectedStudentForHistory(st);
          setIsStudentHistoryModalVisible(true);
        }}
        onClose={() => setIsClassCallModalVisible(false)}
      />

      <TeacherScheduleModal
        visible={isTeacherScheduleModalVisible}
        teacher={selectedTeacherForModal}
        masterSchedule={masterSchedule}
        onClose={() => setIsTeacherScheduleModalVisible(false)}
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
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 42,
    height: 42,
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
  adminRoleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  adminRoleText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '800',
  },
  teacherNameText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 10,
  },
  logoutText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '600',
  },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  subTabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 9,
  },
  subTabItemActive: {
    backgroundColor: colors.background,
  },
  subTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  subTabTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  controlPanel: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: colors.textPrimary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  bottomBar: {
    position: Platform.OS === 'web' ? 'fixed' : 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    overflow: 'hidden',
  },
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  bottomTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 2,
  },
  bottomTabTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarLetter: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  itemSubtext: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  itemDetailText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  historyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  historyPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  editBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  scheduleRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badgeTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeTimeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  badgeDay: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  scheduleDetailText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addSmallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  addSmallBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 2,
  },
  infraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infraCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyCallsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyCallsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptyCallsSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
});
