import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import DayCard, { markColor } from '../components/DayCard';
import DayEditor from '../components/DayEditor';
import ExerciseListModal from '../components/ExerciseListModal';
import { WEEKDAYS, formatRange, getThisWeek, toKey } from '../date';
import { syncReminders } from '../notifications';
import {
  BodyPart,
  DayPlan,
  PlanMap,
  exercisesOf,
  isEmptyPlan,
  loadPlans,
  savePlans,
  toggleExercise,
} from '../storage';
import { colors, radius } from '../theme';

export default function WeeklyPlanScreen() {
  const [plans, setPlans] = useState<PlanMap>({});
  const [editing, setEditing] = useState<number | null>(null);
  // 카드에서 부위 이름을 눌러 연 운동 목록: 어느 날짜의 어느 부위인지
  const [listTarget, setListTarget] = useState<{ index: number; part: BodyPart } | null>(null);
  const week = useMemo(() => getThisWeek(), []);
  const todayKey = toKey(new Date());

  useEffect(() => {
    loadPlans().then(setPlans);
  }, []);

  const persist = (index: number, plan: DayPlan) => {
    const key = toKey(week[index]);
    setPlans(prev => {
      const next = { ...prev };
      if (isEmptyPlan(plan)) delete next[key];
      else next[key] = plan;
      savePlans(next).then(syncReminders);
      return next;
    });
  };

  const save = (index: number, plan: DayPlan) => {
    persist(index, plan);
    setEditing(null);
  };

  const weekPlans = week.map(d => plans[toKey(d)]);
  const workoutDays = weekPlans.filter(p => p && !p.rest && (p.parts.length || p.cardio)).length;
  const cardioDays = weekPlans.filter(p => p && !p.rest && p.cardio).length;
  const restDays = weekPlans.filter(p => p?.rest).length;
  const cheatDays = weekPlans.filter(p => p?.cheat).length;

  return (
    <>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>THIS WEEK · {formatRange(week)}</Text>
        <Text style={styles.heading}>이번 주 헬스계획표</Text>

        {/* 주간 달력 스트립 */}
        <View style={styles.strip}>
          {week.map((d, i) => {
            const isToday = toKey(d) === todayKey;
            return (
              <View key={i} style={[styles.stripDay, isToday && styles.stripToday]}>
                <Text style={[styles.stripWd, isToday && styles.stripTextToday]}>{WEEKDAYS[i]}</Text>
                <Text style={[styles.stripDate, isToday && styles.stripTextToday]}>{d.getDate()}</Text>
                <View style={[styles.stripDot, { backgroundColor: markColor(weekPlans[i]) }]} />
              </View>
            );
          })}
        </View>

        {/* 요약 */}
        <View style={styles.stats}>
          <Stat label="운동" value={workoutDays} color={colors.text} />
          <Stat label="유산소" value={cardioDays} color={colors.cardioOn} />
          <Stat label="휴식" value={restDays} color={colors.rest} />
          <Stat label="치팅" value={cheatDays} color={colors.cheat} />
        </View>

        <View style={styles.legend}>
          <Legend color={colors.cardioOn} label="유산소 있음" />
          <Legend color={colors.cardioOff} label="유산소 없음" />
          <Legend color={colors.rest} label="쉬는 날" />
          <Legend color={colors.cheat} label="치팅" />
        </View>

        {week.map((d, i) => (
          <DayCard
            key={toKey(d)}
            date={d}
            weekday={WEEKDAYS[i]}
            plan={weekPlans[i]}
            isToday={toKey(d) === todayKey}
            onPress={() => setEditing(i)}
            onPartPress={part => setListTarget({ index: i, part })}
          />
        ))}
      </ScrollView>

      <DayEditor
        visible={editing !== null}
        title={
          editing !== null
            ? `${week[editing].getMonth() + 1}월 ${week[editing].getDate()}일 (${WEEKDAYS[editing]})`
            : ''
        }
        plan={editing !== null ? weekPlans[editing] : undefined}
        onClose={() => setEditing(null)}
        onSave={p => editing !== null && save(editing, p)}
      />
      <ExerciseListModal
        part={listTarget?.part ?? null}
        dayLabel={
          listTarget
            ? `${week[listTarget.index].getMonth() + 1}월 ${week[listTarget.index].getDate()}일 (${WEEKDAYS[listTarget.index]})`
            : undefined
        }
        selected={listTarget ? exercisesOf(weekPlans[listTarget.index], listTarget.part) : []}
        onToggle={name =>
          listTarget &&
          persist(listTarget.index, toggleExercise(weekPlans[listTarget.index], listTarget.part, name))
        }
        onClose={() => setListTarget(null)}
      />
    </>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  kicker: { color: colors.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginTop: 8 },
  heading: { color: colors.text, fontSize: 30, fontWeight: '900', marginTop: 4, marginBottom: 18 },
  strip: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 6,
    marginBottom: 12,
  },
  stripDay: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radius.md },
  stripToday: { backgroundColor: colors.today },
  stripWd: { color: colors.textDim, fontSize: 12, fontWeight: '600' },
  stripDate: { color: colors.text, fontSize: 18, fontWeight: '800', marginTop: 4 },
  stripTextToday: { color: colors.bg },
  stripDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  stats: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '900' },
  statLabel: { color: colors.textDim, fontSize: 12, fontWeight: '600', marginTop: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 14, paddingHorizontal: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: colors.textDim, fontSize: 12, fontWeight: '600' },
});
