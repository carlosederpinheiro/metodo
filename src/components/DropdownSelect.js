import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function DropdownSelect({
  label,
  value,
  options = [],
  onSelect,
  placeholder = 'Selecione uma opção...',
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Normaliza o label da opção selecionada
  const getSelectedLabel = () => {
    if (!value) return placeholder;
    const found = options.find((opt) => (typeof opt === 'object' ? opt.value === value : opt === value));
    if (!found) return value;
    return typeof found === 'object' ? found.label : found;
  };

  const handleSelectOption = (opt) => {
    const val = typeof opt === 'object' ? opt.value : opt;
    onSelect(val);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[styles.selectText, !value && styles.placeholderText]}>
          {getSelectedLabel()}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Dropdown Menu Modal */}
      <Modal visible={isOpen} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.dropdownCard}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownTitle}>{label || 'Selecione uma opção'}</Text>
                  <TouchableOpacity onPress={() => setIsOpen(false)}>
                    <Ionicons name="close" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ maxHeight: 250 }} showsVerticalScrollIndicator={false}>
                  {options.map((opt, idx) => {
                    const optionValue = typeof opt === 'object' ? opt.value : opt;
                    const optionLabel = typeof opt === 'object' ? opt.label : opt;
                    const isSelected = optionValue === value;

                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                        onPress={() => handleSelectOption(opt)}
                      >
                        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                          {optionLabel}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark" size={18} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 48,
  },
  selectText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  placeholderText: {
    color: colors.placeholder,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: 20,
  },
  dropdownCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    maxHeight: 320,
    elevation: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  dropdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 8,
  },
  dropdownTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  optionItemSelected: {
    backgroundColor: colors.background,
  },
  optionText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
});
