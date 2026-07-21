// Central de Dados Simulados do Método Pré-Vestibular

export const initialGroups = [
  'Medicina 1',
  'Medicina 2',
  'Extensivo Manhã',
  'Semiextensivo Manhã',
  'Turma ITA / IME',
];

export const initialRooms = [
  'Sala 01',
  'Sala 02',
  'Sala 03',
  'Auditório Principal',
  'Laboratório de Ciências',
];

export const defaultSubjects = [
  'Física A',
  'Física B',
  'Física C',
  'Matemática I',
  'Matemática II',
  'Química Geral',
  'Química Orgânica',
  'Biologia I',
  'Gramática & Redação',
  'História Geral',
];

export const initialProfessors = [
  {
    id: 'p1',
    name: 'Carlos Eder',
    username: 'carlos.eder',
    password: 'Metodo2026@@',
    subject: 'Física A',
  },
  {
    id: 'p2',
    name: 'Ana Paula Santos',
    username: 'ana.santos',
    password: 'Metodo2026@@',
    subject: 'Química Geral',
  },
  {
    id: 'p3',
    name: 'Marcos Vinícius',
    username: 'marcos.vinicius',
    password: 'Metodo2026@@',
    subject: 'Matemática I',
  },
];

export const initialStudents = [
  { id: 's1', matricula: '2026001', name: 'Ana Beatriz Souza', group: 'Medicina 1' },
  { id: 's2', matricula: '2026002', name: 'Arthur Lima Castro', group: 'Medicina 1' },
  { id: 's3', matricula: '2026003', name: 'Bernardo Mendes Rocha', group: 'Medicina 1' },
  { id: 's4', matricula: '2026004', name: 'Camila Fernandes Viana', group: 'Medicina 1' },
  { id: 's5', matricula: '2026005', name: 'Daniel Oliveira Santos', group: 'Medicina 1' },
  { id: 's6', matricula: '2026006', name: 'Eduarda Ribeiro Silva', group: 'Medicina 1' },
  { id: 's7', matricula: '2026007', name: 'Enzo Gabriel Pereira', group: 'Medicina 1' },
  { id: 's8', matricula: '2026008', name: 'Felipe Augusto Gomes', group: 'Medicina 1' },
  { id: 's9', matricula: '2026009', name: 'Gabriela Duarte Martins', group: 'Medicina 1' },
  { id: 's10', matricula: '2026010', name: 'Guilherme Henrique Barbosa', group: 'Medicina 1' },
  { id: 's11', matricula: '2026011', name: 'Heitor Vasconcelos', group: 'Extensivo Manhã' },
  { id: 's12', matricula: '2026012', name: 'Isabela Cristina Costa', group: 'Extensivo Manhã' },
  { id: 's13', matricula: '2026013', name: 'João Pedro Carvalho', group: 'Extensivo Manhã' },
  { id: 's14', matricula: '2026014', name: 'Julia Maria Alencar', group: 'Extensivo Manhã' },
  { id: 's15', matricula: '2026015', name: 'Lucas Eduardo Fonseca', group: 'Extensivo Manhã' },
  { id: 's16', matricula: '2026016', name: 'Manuela Nogueira Cruz', group: 'Turma ITA / IME' },
  { id: 's17', matricula: '2026017', name: 'Matheus Henrique Ramos', group: 'Turma ITA / IME' },
  { id: 's18', matricula: '2026018', name: 'Nicolas Ferreira Marques', group: 'Turma ITA / IME' },
];

export const initialAdmins = [
  {
    id: 'a1',
    name: 'Carlos Eder Gestor',
    username: 'admin',
    password: 'Metodo2026@@',
    role: 'Diretoria',
  },
  {
    id: 'a2',
    name: 'Mariana Silva',
    username: 'mariana.pedagogia',
    password: 'Metodo2026@@',
    role: 'Pedagologia',
  },
  {
    id: 'a3',
    name: 'Roberto Lima',
    username: 'roberto.secretaria',
    password: 'Metodo2026@@',
    role: 'Secretaria',
  },
];

export const initialMasterSchedule = [
  {
    id: 'ms1',
    teacherId: 'p1',
    teacherName: 'Carlos Eder',
    dateStr: '2026-07-20',
    dayOfWeek: 'Segunda-feira',
    timeStart: '07:15',
    timeEnd: '08:05',
    subject: 'Física A',
    group: 'Medicina 1',
    room: 'Sala 02',
    status: 'pending',
  },
  {
    id: 'ms2',
    teacherId: 'p1',
    teacherName: 'Carlos Eder',
    dateStr: '2026-07-20',
    dayOfWeek: 'Segunda-feira',
    timeStart: '08:05',
    timeEnd: '08:55',
    subject: 'Física A',
    group: 'Medicina 1',
    room: 'Sala 02',
    status: 'pending',
  },
  {
    id: 'ms3',
    teacherId: 'p1',
    teacherName: 'Carlos Eder',
    dateStr: '2026-07-20',
    dayOfWeek: 'Segunda-feira',
    timeStart: '09:15',
    timeEnd: '10:05',
    subject: 'Física B',
    group: 'Extensivo Manhã',
    room: 'Auditório Principal',
    status: 'pending',
  },
  {
    id: 'ms4',
    teacherId: 'p2',
    teacherName: 'Ana Paula Santos',
    dateStr: '2026-07-20',
    dayOfWeek: 'Segunda-feira',
    timeStart: '10:05',
    timeEnd: '10:55',
    subject: 'Química Geral',
    group: 'Medicina 1',
    room: 'Sala 02',
    status: 'pending',
  },
];
