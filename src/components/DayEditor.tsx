import React, { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BODY_PARTS, BodyPart, DayPlan, emptyPlan, exercisesOf, toggleExercise, withoutPart } from '../storage';
import ExerciseListModal from './ExerciseListModal';
import { colors, radius } from '../theme';

type Props = {
  visible: boolean;
  title: string;
  plan?: DayPlan;
  onClose: () => void;
  onSave: (plan: DayPlan) => void;
};

function Toggle({
  label,
  desc,
  value,
  color,
  disabled,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  color: string;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={[
        styles.toggle,
        value && { borderColor: color, backgroundColor: color + '1F' },
        disabled && styles.disabled,
      ]}>
      <View style={[styles.check, value && { backgroundColor: color, borderColor: color }]}>
        {value && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleDesc}>{desc}</Text>
      </View>
    </Pressable>
  );
}

export default function DayEditor({ visible, title, plan, onClose, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const [draft, setDraft] = useState<DayPlan>(emptyPlan());
  const [listPart, setListPart] = useState<BodyPart | null>(null);

  useEffect(() => {
    if (visible) setDraft(plan ? { ...plan, parts: [...plan.parts], exercises: { ...plan.exercises } } : emptyPlan());
  }, [visible, plan]);

  const togglePart = (p: BodyPart) =>
    setDraft(d =>
      d.parts.includes(p)
        ? withoutPart(d, p)
        : { ...d, parts: BODY_PARTS.filter(x => x === p || d.parts.includes(x)) },
    );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { maxHeight: height * 0.88, paddingBottom: Math.min(insets.bottom, 48) + 20 }]}>
        <View style={styles.handle} />
        <Text style={styles.sheetTitle}>{title}</Text>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Toggle
            label="쉬는 날"
            desc="오늘은 운동 없이 휴식"
            value={draft.rest}
            color={colors.rest}
            onChange={v => setDraft(d => ({ ...d, rest: v }))}
          />

          <Text style={[styles.section, draft.rest && styles.disabled]}>근력 운동 부위</Text>
          <Text style={[styles.hint, draft.rest && styles.disabled]}>부위를 눌러 선택 · ☰ 를 눌러 운동 골라 기록</Text>
          <View style={[styles.chips, draft.rest && styles.disabled]}>
            {BODY_PARTS.map(p => {
              const on = draft.parts.includes(p);
              return (
                <View key={p} style={[styles.chip, on && styles.chipOn]}>
                  <Pressable disabled={draft.rest} onPress={() => togglePart(p)} style={styles.chipMain}>
                    <Text style={[styles.chipText, on && styles.chipTextOn]}>
                      {p}
                      {exercisesOf(draft, p).length > 0 ? ` ${exercisesOf(draft, p).length}` : ''}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setListPart(p)}
                    style={[styles.chipList, on && styles.chipListOn]}
                    hitSlop={4}
                    accessibilityLabel={`${p} 운동 목록`}>
                    <Text style={[styles.chipListText, on && styles.chipTextOn]}>☰</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <Text style={[styles.section, draft.rest && styles.disabled]}>복합 운동</Text>
          <Toggle
            label="유산소 포함"
            desc={draft.cardio ? '유산소 있음 · 파란색 마킹' : '체크 안 하면 유산소 없음 · 보라색 마킹'}
            value={draft.cardio}
            color={colors.cardioOn}
            disabled={draft.rest}
            onChange={v => setDraft(d => ({ ...d, cardio: v }))}
          />

          <Text style={styles.section}>식단</Text>
          <Toggle
            label="치팅 데이"
            desc="오늘은 먹고 싶은 거 먹는 날"
            value={draft.cheat}
            color={colors.cheat}
            onChange={v => setDraft(d => ({ ...d, cheat: v }))}
          />
        </ScrollView>

        <View style={styles.actions}>
          <Pressable style={[styles.btn, styles.btnGhost]} onPress={() => setDraft(emptyPlan())}>
            <Text style={styles.btnGhostText}>초기화</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => onSave(draft)}>
            <Text style={styles.btnPrimaryText}>저장</Text>
          </Pressable>
        </View>
      </View>
      <ExerciseListModal
        part={listPart}
        dayLabel={title}
        selected={listPart ? exercisesOf(draft, listPart) : []}
        onToggle={name => listPart && setDraft(d => toggleExercise(d, listPart, name))}
        onClose={() => setListPart(null)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: 14,
  },
  scroll: { flexGrow: 0 },
  sheetTitle: { color: colors.text, fontSize: 22, fontWeight: '800', marginBottom: 16 },
  section: {
    color: colors.textDim,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 18,
    marginBottom: 10,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  hint: { color: colors.textFaint, fontSize: 12, marginTop: -4, marginBottom: 10 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  chipOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipMain: { paddingLeft: 18, paddingRight: 10, paddingVertical: 12 },
  chipList: {
    paddingLeft: 10,
    paddingRight: 14,
    paddingVertical: 12,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  chipListOn: { borderLeftColor: 'rgba(0,0,0,0.15)' },
  chipListText: { color: colors.textDim, fontSize: 14, fontWeight: '700' },
  chipText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  chipTextOn: { color: colors.bg },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceHigh,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 16, fontWeight: '900' },
  toggleText: { flex: 1 },
  toggleLabel: { color: colors.text, fontSize: 16, fontWeight: '700' },
  toggleDesc: { color: colors.textDim, fontSize: 13, marginTop: 2 },
  disabled: { opacity: 0.35 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btn: { height: 54, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  btnGhost: { flex: 1, backgroundColor: colors.surfaceHigh, borderWidth: 1, borderColor: colors.border },
  btnGhostText: { color: colors.textDim, fontSize: 16, fontWeight: '700' },
  btnPrimary: { flex: 2, backgroundColor: colors.accent },
  btnPrimaryText: { color: colors.bg, fontSize: 16, fontWeight: '800' },
});
