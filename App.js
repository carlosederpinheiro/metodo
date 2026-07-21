import React, { useState } from 'react';
import { Platform } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import AdminHomeScreen from './src/screens/AdminHomeScreen';
import {
  initialProfessors,
  initialStudents,
  initialAdmins,
  initialGroups,
  initialRooms,
  initialMasterSchedule,
} from './src/services/mockData';

// Injeção de CSS global para congelar a janela inteira e eliminar qualquer scrollbar de página
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'global-viewport-freeze-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      html, body, #root, #root > div {
        width: 100vw !important;
        height: 100vh !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        box-sizing: border-box !important;
      }
      ::-webkit-scrollbar {
        display: none !important;
        width: 0px !important;
        height: 0px !important;
      }
      * {
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
        box-sizing: border-box !important;
      }
      .frozen-bottom-bar, [data-frozen="true"] {
        position: fixed !important;
        bottom: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100vw !important;
        max-width: 100vw !important;
        height: 64px !important;
        max-height: 64px !important;
        min-height: 64px !important;
        overflow: hidden !important;
        touch-action: none !important;
        z-index: 99999 !important;
        box-sizing: border-box !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null); // { email, role: 'teacher' | 'admin' }

  // Estados Centrais do Sistema
  const [professors, setProfessors] = useState(initialProfessors);
  const [students, setStudents] = useState(initialStudents);
  const [admins, setAdmins] = useState(initialAdmins);
  const [groups, setGroups] = useState(initialGroups);
  const [rooms, setRooms] = useState(initialRooms);
  const [masterSchedule, setMasterSchedule] = useState(initialMasterSchedule);

  const handleLogin = (userInfo) => {
    setUser(userInfo);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (user?.role === 'admin') {
    return (
      <AdminHomeScreen
        professors={professors}
        setProfessors={setProfessors}
        students={students}
        setStudents={setStudents}
        admins={admins}
        setAdmins={setAdmins}
        groups={groups}
        setGroups={setGroups}
        rooms={rooms}
        setRooms={setRooms}
        masterSchedule={masterSchedule}
        setMasterSchedule={setMasterSchedule}
        onLogout={handleLogout}
        adminName={user?.email ? `Admin (${user.email.split('@')[0]})` : 'Diretoria Método'}
      />
    );
  }

  return (
    <ScheduleScreen
      onLogout={handleLogout}
      teacherName={user?.email ? `Prof. ${user.email.split('@')[0]}` : 'Prof. Carlos Eder'}
      allStudents={students}
    />
  );
}
