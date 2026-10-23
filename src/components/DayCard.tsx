import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BodyPart, DayPlan, exercisesOf } from '../storage';
import { colors, radius } from '../theme';

type Props = {
  date: Date;
  weekday: string;
  plan?: DayPlan;
  isToday: boolean;
  onPress: () => void;
  onPartPress?: (part: BodyPart) => void; // 부위 이름 탭 → 운동 목록
};

export function markColor(plan?: DayPlan): string {
  if (!plan) return colors.border;
  if (plan.rest) return colors.rest;
  if (plan.parts.length > 0 || plan.cardio) {
    return plan.cardio ? colors.cardioOn : colors.cardioOff;
  }
  if (plan.cheat) return colors.cheat;
  return colors.border;
}

export default function DayCard({ date, weekday, plan, isToday, onPress, onPartPress }: Props) {
  const stripe = markColor(plan);
  const hasWorkout = !!plan && !plan.rest && (plan.parts.length > 0 || plan.cardio);
  const isWeekend = weekday === '토' || weekday === '일';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isToday && styles.cardToday,
        pressed && styles.pressed,
      ]}>
      <View style={[styles.stripe, { backgroundColor: stripe }]} />

      <View style={styles.dateCol}>
        <Text style={[styles.weekday, isWeekend && styles.weekend]}>{weekday}</Text>
        <View style={[styles.dateBubble, isToday && styles.dateBubbleToday]}>
          <Text style={[styles.date, isToday && styles.dateToday]}>{date.getDate()}</Text>
        </View>
        {isToday && <Text style={styles.todayLabel}>TODAY</Text>}
      </View>

      <View style={styles.body}>
        {plan?.rest ? (
          <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: colors.rest }]} />
            <Text style={styles.title}>쉬는 날</Text>
          </View>
        ) : hasWorkout ? (
          <>
            <Text style={styles.title} numberOfLines={2}>
              근력 운동{' '}
              <Text style={styles.parts}>
                [
                {plan!.parts.length > 0
                  ? plan!.parts.map((p, i) => (
                      <Text key={p}>
                        {i > 0 && ' · '}
                        <Text style={styles.partLink} onPress={onPartPress && (() => onPartPress(p))}>
                          {p}
                        </Text>
                      </Text>
                    ))
                  : '미정'}
                ]
              </Text>
            </Text>
            {plan!.parts.map(p => {
              const list = exercisesOf(plan, p);
              return list.length > 0 ? (
                <Text key={p} style={styles.exLine} numberOfLines={2}>
                  <Text style={styles.exPart}>{p}</Text>  {list.join(' · ')}
                </Text>
              ) : null;
            })}
            <View
              style={[
                styles.cardioTag,
                plan!.cardio ? styles.cardioOnTag : styles.cardioOffTag,
              ]}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: plan!.cardio ? colors.cardioOn : colors.cardioOff },
                ]}
              />
              <Text
                style={[
                  styles.cardioText,
                  plan!.cardio ? styles.cardioOnText : styles.cardioOffText,
                ]}>
                {plan!.cardio ? '유산소 있음' : '유산소 없음'}
              </Text>
            </View>
          </>
        ) : (
          !plan?.cheat && <Text style={styles.empty}>탭해서 계획 추가</Text>
        )}

        {plan?.cheat && (
          <View style={styles.cheatTag}>
            <Text style={styles.cheatText}>🍔 치팅 데이</Text>
          </View>
        )}
      </View>

      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 104,
    paddingVertical: 16,
    paddingRight: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardToday: {
    borderColor: '#4A4A56',
    backgroundColor: colors.surfaceHigh,
  },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
  stripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  dateCol: { width: 76, alignItems: 'center' },
  weekday: { color: colors.textDim, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  weekend: { color: '#F87171' },
  dateBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBubbleToday: { backgroundColor: colors.today },
  date: { color: colors.text, fontSize: 24, fontWeight: '800' },
  dateToday: { color: colors.bg },
  todayLabel: {
    color: colors.textDim,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  body: { flex: 1, paddingLeft: 4, gap: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { color: colors.text, fontSize: 17, fontWeight: '700' },
  parts: { color: colors.accent, fontWeight: '800' },
  exLine: { color: colors.textDim, fontSize: 13, lineHeight: 19, marginTop: -2 },
  exPart: { color: colors.text, fontWeight: '800' },
  partLink: { textDecorationLine: 'underline', textDecorationColor: colors.textFaint },
  cardioTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  cardioOnTag: { backgroundColor: 'rgba(59,130,246,0.16)', borderColor: colors.cardioOn },
  cardioOffTag: { backgroundColor: 'rgba(139,92,246,0.16)', borderColor: colors.cardioOff },
  cardioText: { fontSize: 13, fontWeight: '700' },
  cardioOnText: { color: '#93C5FD' },
  cardioOffText: { color: '#C4B5FD' },
  dot: { width: 8, height: 8, borderRadius: 4 },
  cheatTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderWidth: 1,
    borderColor: colors.cheat,
  },
  cheatText: { color: '#FCD34D', fontSize: 13, fontWeight: '700' },
  empty: { color: colors.textFaint, fontSize: 15, fontWeight: '500' },
  chevron: { color: colors.textFaint, fontSize: 28, marginLeft: 8 },
});
