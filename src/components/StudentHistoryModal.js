import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import DropdownSelect from './DropdownSelect';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { logoBase64 } from '../theme/logoBase64';

export default function StudentHistoryModal({
  visible,
  student,
  masterSchedule = [],
  onClose,
}) {
  const [selectedMonth, setSelectedMonth] = useState('Todos');

  // Obtém os meses disponíveis com base nas aulas da turma do aluno
  const availableMonths = useMemo(() => {
    if (!student) return [];
    const months = new Set();
    masterSchedule.forEach((sched) => {
      if (sched.group === student.group && sched.attendanceRecords) {
        const [year, month] = sched.dateStr.split('-');
        months.add(`${year}-${month}`);
      }
    });
    const sorted = Array.from(months).sort((a, b) => b.localeCompare(a)); // Mais recentes primeiro
    const options = [
      { label: 'Todos os Meses', value: 'Todos' },
      ...sorted.map((m) => {
        const [y, mm] = m.split('-');
        const monthNames = [
          'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
          'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return { label: `${monthNames[parseInt(mm, 10) - 1]} de ${y}`, value: m };
      }),
    ];
    return options;
  }, [masterSchedule, student]);

  if (!student) return null;

  // Filtra aulas registradas
  const studentAttendanceList = [];
  let totalPresent = 0;
  let totalAbsent = 0;

  masterSchedule.forEach((sched) => {
    if (sched.group === student.group && sched.attendanceRecords) {
      const [year, month] = sched.dateStr.split('-');
      const classMonth = `${year}-${month}`;
      
      // Aplica o filtro de mês
      if (selectedMonth !== 'Todos' && classMonth !== selectedMonth) {
        return;
      }

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
  const absencesList = studentAttendanceList.filter(item => item.status === 'F');

  const generatePDF = () => {
    try {
      const doc = new jsPDF();
      const monthLabel = availableMonths.find(m => m.value === selectedMonth)?.label || 'Todos os Meses';
      
      // Cores da marca
      const brandColor = [241, 51, 63]; // #F1333F

      // Cabeçalho Oficial com Logo
      // Desenha a logo no canto superior esquerdo
      doc.addImage(logoBase64, 'PNG', 14, 12, 40, 16);

      doc.setFontSize(22);
      doc.setTextColor(...brandColor);
      doc.setFont('helvetica', 'bold');
      doc.text("Método Pré-Vestibular", 60, 20);
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.setFont('helvetica', 'normal');
      doc.text("Relatório Oficial de Frequência Escolar", 60, 28);
      
      // Linha divisória
      doc.setDrawColor(...brandColor);
      doc.setLineWidth(0.5);
      doc.line(14, 34, 196, 34);

      // Caixa de Informações do Aluno
      doc.setFillColor(249, 249, 249);
      doc.roundedRect(14, 40, 182, 35, 3, 3, 'F');
      
      doc.setFontSize(11);
      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'bold');
      doc.text("Dados do Aluno", 18, 48);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Nome: ${student.name}`, 18, 56);
      doc.text(`Matrícula: ${student.matricula}`, 18, 63);
      doc.text(`Turma: ${student.group}`, 110, 56);
      doc.text(`Período de Referência: ${monthLabel}`, 110, 63);

      // Resumo de Frequência
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.text("Resumo de Frequência", 14, 88);

      // Tabela de Resumo (Stats)
      autoTable(doc, {
        startY: 94,
        head: [['Aulas Dadas', 'Presenças', 'Faltas', 'Frequência']],
        body: [[
          totalClasses.toString(),
          totalPresent.toString(),
          totalAbsent.toString(),
          `${attendanceRate}%`
        ]],
        theme: 'grid',
        headStyles: { fillColor: [240, 240, 240], textColor: [50, 50, 50], halign: 'center' },
        bodyStyles: { halign: 'center', fontSize: 12, fontStyle: 'bold' },
        columnStyles: {
          1: { textColor: [16, 185, 129] },
          2: { textColor: [239, 68, 68] },
          3: { textColor: attendanceRate >= 75 ? [16, 185, 129] : [239, 68, 68] }
        }
      });

      // Detalhamento das Faltas
      const finalY = doc.lastAutoTable.finalY || 120;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(50, 50, 50);
      doc.text("Detalhamento de Faltas", 14, finalY + 15);

      if (absencesList.length > 0) {
        const tableData = absencesList.map(item => [
          `${item.dateStr.split('-').reverse().join('/')} - ${item.dayOfWeek}`,
          item.subject,
          item.teacherName,
          item.time
        ]);

        autoTable(doc, {
          startY: finalY + 22,
          head: [['Data', 'Matéria', 'Professor', 'Horário']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: brandColor, textColor: [255, 255, 255] },
          styles: { fontSize: 10 }
        });
      } else {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(16, 185, 129); // Verde
        doc.text("O aluno não possui nenhuma falta registrada neste período. Excelente!", 14, finalY + 25);
      }

      // Rodapé
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(9);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Documento gerado pelo Método System em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} - Página ${i} de ${pageCount}`,
          105,
          290,
          { align: 'center' }
        );
      }

      // Download do Arquivo
      doc.save(`Relatorio_Frequencia_${student.name.replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      if (Platform.OS === 'web') {
        alert('Não foi possível gerar o PDF. Verifique o console.');
      } else {
        Alert.alert('Erro', 'Não foi possível gerar o PDF.');
      }
    }
  };

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

          {/* Filtro e Exportação */}
          <View style={styles.actionsRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <DropdownSelect
                label="Período de Referência"
                options={availableMonths}
                value={selectedMonth}
                onSelect={setSelectedMonth}
              />
            </View>
            
            <TouchableOpacity style={styles.exportButton} onPress={generatePDF}>
              <Ionicons name="document-text" size={20} color={colors.white} />
              <Text style={styles.exportButtonText}>Exportar PDF</Text>
            </TouchableOpacity>
          </View>

          {/* Cards de Resumo de Frequência */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{totalClasses}</Text>
              <Text style={styles.statLabel}>Aulas</Text>
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
              <Text style={styles.statLabel}>Freq.</Text>
            </View>
          </View>

          {/* Histórico Detalhado */}
          <Text style={styles.sectionTitle}>Histórico de Frequência Aula a Aula</Text>

          <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
            {studentAttendanceList.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={32} color={colors.placeholder} />
                <Text style={styles.emptyText}>Nenhuma chamada encontrada para o período selecionado.</Text>
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
    maxHeight: '90%',
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
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 16,
    marginBottom: 4,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    marginBottom: 16, // To align with DropdownSelect's internal margin
  },
  exportButtonText: {
    color: colors.white,
    fontWeight: '700',
    marginLeft: 8,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 14,
    marginVertical: 10,
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
    marginTop: 10,
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
    backgroundColor: colors.textSecondary,
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
