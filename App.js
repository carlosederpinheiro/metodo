import React, { useState } from 'react';
import { Platform } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import ScheduleScreen from './src/screens/ScheduleScreen';
import AdminHomeScreen from './src/screens/AdminHomeScreen';
// Dados removidos (100% via banco)

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
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Estados Centrais do Sistema
  const [professors, setProfessors] = useState([]);
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [groups, setGroups] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [masterSchedule, setMasterSchedule] = useState([]);

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      try {
        const savedSession = window.localStorage.getItem('metodo_session');
        if (savedSession) {
          const parsedUser = JSON.parse(savedSession);
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (e) {
        console.error('Erro ao ler sessão:', e);
      }
    }
    setIsCheckingSession(false);
  }, []);

  const handleLogin = (userInfo) => {
    setUser(userInfo);
    setIsAuthenticated(true);
    if (Platform.OS === 'web') {
      window.localStorage.setItem('metodo_session', JSON.stringify(userInfo));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    if (Platform.OS === 'web') {
      window.localStorage.removeItem('metodo_session');
    }
  };

  if (isCheckingSession) {
    return null; // Pode colocar uma tela de loading aqui se quiser
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // Verifica se é administrador (tem cargo no DB)
  if (user?.role) {
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
        adminName={user?.name ? user.name : 'Diretoria Método'}
      />
    );
  }

  // Se não tem role, é professor
  return (
    <ScheduleScreen
      onLogout={handleLogout}
      teacherName={user?.name ? user.name : 'Prof. Carlos Eder'}
      teacherId={user?.id}
      allStudents={students}
    />
  );
}
