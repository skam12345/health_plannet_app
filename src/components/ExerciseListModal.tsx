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
import { EXERCISES } from '../exercises';
import ExerciseFigure from '../figure/ExerciseFigure';
import { FOCUS, MOTIONS } from '../figure/motions';
import { BodyPart } from '../storage';
import { colors, radius } from '../theme';

type Props = {
  part: BodyPart | null;
  onClose: () => void;
  /** 기록 대상 날짜 표시 (예: '10월 23일 (금)') */
  dayLabel?: string;
  /** 이미 기록된 운동 */
  selected?: string[];
  /** 있으면 운동을 눌러 기록/해제할 수 있음 */
  onToggle?: (name: string) => void;
};

const GROUP_COLORS = {
  machine: colors.cardioOn,
  bodyweight: colors.rest,
  free: colors.cheat,
};

export default function ExerciseListModal({ part, onClose, dayLabel, selected = [], onToggle }: Props) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const guide = part ? EXERCISES[part] : null;
  // 동작 애니메이션은 한 번에 하나만 펼침
  const [demo, setDemo] = useState<string | null>(null);
  useEffect(() => setDemo(null), [part]);

  return (
    <Modal visible={!!guide} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      {guide && (
        <View style={[styles.sheet, { maxHeight: height * 0.85, paddingBottom: Math.min(insets.bottom, 48) + 20 }]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <View style={styles.flex}>
              <Text style={styles.kicker}>{dayLabel ? `${dayLabel} 계획에 기록` : '운동 목록'}</Text>
              <Text style={styles.title}>{guide.title}</Text>
            </View>
            <Pressable style={styles.close} onPress={onClose} hitSlop={8}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          <Text style={styles.desc}>{guide.desc}</Text>
          {onToggle && (
            <Text style={styles.tip}>
              운동을 누르면 계획에 기록 · ▶ 를 누르면 동작 보기 {selected.length > 0 ? `· ${selected.length}개 선택됨` : ''}
            </Text>
          )}

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {guide.groups.map(g => (
              <View key={g.key} style={styles.group}>
                <View style={styles.groupHeader}>
                  <View style={[styles.groupBar, { backgroundColor: GROUP_COLORS[g.key] }]} />
                  <Text style={styles.groupTitle}>
                    {g.icon} {g.label}
                  </Text>
                  <Text style={styles.count}>{g.items.length}</Text>
                </View>
                {g.items.map((item, i) => {
                  const on = selected.includes(item);
                  const open = demo === item;
                  const last = i === g.items.length - 1;
                  return (
                    <View key={item} style={[styles.itemWrap, last && styles.itemLast]}>
                      <View style={styles.item}>
                        <Pressable
                          onPress={() => setDemo(open ? null : item)}
                          style={[styles.play, open && styles.playOn]}
                          hitSlop={6}
                          accessibilityLabel={`${item} 동작 보기`}>
                          <Text style={[styles.playText, open && styles.playTextOn]}>{open ? '■' : '▶'}</Text>
                        </Pressable>
                        <Pressable
                          disabled={!onToggle}
                          onPress={() => onToggle?.(item)}
                          style={({ pressed }) => [styles.itemMain, pressed && styles.itemPressed]}>
                          <Text style={[styles.num, on && styles.numOn]}>{i + 1}</Text>
                          <Text style={[styles.itemText, on && styles.itemTextOn]}>{item}</Text>
                          {onToggle && (
                            <View style={[styles.check, on && styles.checkOn]}>
                              {on && <Text style={styles.checkMark}>✓</Text>}
                            </View>
                          )}
                        </Pressable>
                      </View>
                      {open && MOTIONS[item] && part && (
                        <View style={styles.demo}>
                          <ExerciseFigure motion={MOTIONS[item]} focus={FOCUS[part]} />
                          <Text style={styles.demoCaption}>
                            파란색이 주로 쓰는 근육이에요 · 동작 참고용이니 정확한 자세는 트레이너에게 확인하세요
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            ))}
          </ScrollView>
          {onToggle && (
            <Pressable style={styles.done} onPress={onClose}>
              <Text style={styles.doneText}>완료</Text>
            </Pressable>
          )}
        </View>
      )}
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
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  flex: { flex: 1 },
  kicker: { color: colors.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  title: { color: colors.text, fontSize: 22, fontWeight: '900', marginTop: 2 },
  close: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: colors.textDim, fontSize: 16, fontWeight: '700' },
  desc: { color: colors.textDim, fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 14 },
  scroll: { flexGrow: 0 },
  group: {
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  groupHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  groupBar: { width: 4, height: 16, borderRadius: 2, marginRight: 8 },
  groupTitle: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '800' },
  count: { color: colors.textFaint, fontSize: 13, fontWeight: '700' },
  itemWrap: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  item: { flexDirection: 'row', alignItems: 'center' },
  itemMain: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 11 },
  play: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  playOn: { backgroundColor: colors.cardioOn, borderColor: colors.cardioOn },
  playText: { color: colors.textDim, fontSize: 11, fontWeight: '900' },
  playTextOn: { color: '#fff' },
  demo: {
    alignItems: 'center',
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  demoCaption: { color: colors.textFaint, fontSize: 11, textAlign: 'center', marginTop: 4, lineHeight: 16 },
  itemLast: { borderBottomWidth: 0 },
  itemPressed: { opacity: 0.6 },
  num: { width: 24, color: colors.textFaint, fontSize: 13, fontWeight: '800' },
  itemText: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600' },
  itemTextOn: { color: '#93C5FD', fontWeight: '800' },
  numOn: { color: colors.cardioOn },
  check: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.textFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: colors.cardioOn, borderColor: colors.cardioOn },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: '900' },
  tip: { color: colors.textFaint, fontSize: 12, marginTop: -6, marginBottom: 12 },
  done: {
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  doneText: { color: colors.bg, fontSize: 16, fontWeight: '800' },
});
