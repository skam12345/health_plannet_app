import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { toKey } from '../date';
import {
  DEFAULT_SETTINGS,
  NotifySettings,
  formatTime,
  hasPermission,
  loadSettings,
  requestPermission,
  saveSettings,
  showTestNotification,
  syncReminders,
} from '../notifications';
import { loadPlans } from '../storage';
import { colors, radius } from '../theme';

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<NotifySettings>(DEFAULT_SETTINGS);
  const [granted, setGranted] = useState<boolean | null>(null);

  useEffect(() => {
    loadSettings().then(setSettings);
    hasPermission().then(setGranted);
  }, []);

  const update = async (next: NotifySettings) => {
    setSettings(next);
    await saveSettings(next);
    if (next.enabled && !granted) setGranted(await requestPermission());
    await syncReminders();
  };

  const shift = (field: 'hour' | 'minute', delta: number) => {
    const max = field === 'hour' ? 24 : 60;
    update({ ...settings, [field]: (settings[field] + delta + max) % max });
  };

  const test = async () => {
    if (!granted) {
      const ok = await requestPermission();
      setGranted(ok);
      if (!ok) return;
    }
    const plans = await loadPlans();
    await showTestNotification(plans[toKey(new Date())]);
  };

  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.kicker}>REMINDER</Text>
      <Text style={styles.heading}>알림 설정</Text>
      <Text style={styles.desc}>
        계획을 세워둔 날, 정한 시각에 오늘 할 운동을 딱 한 번 알려드려요. 앱을 꺼둬도 알림이 와요.
      </Text>

      <Pressable
        style={[styles.card, styles.row, settings.enabled && styles.cardOn]}
        onPress={() => update({ ...settings, enabled: !settings.enabled })}>
        <View style={styles.flex}>
          <Text style={styles.cardTitle}>오늘의 운동 알림</Text>
          <Text style={styles.cardDesc}>{settings.enabled ? '켜짐' : '꺼짐'}</Text>
        </View>
        <View style={[styles.switch, settings.enabled && styles.switchOn]}>
          <View style={[styles.knob, settings.enabled && styles.knobOn]} />
        </View>
      </Pressable>

      <View style={[styles.card, !settings.enabled && styles.disabled]}>
        <Text style={styles.cardTitle}>알림 시각</Text>
        <Text style={styles.time}>{formatTime(settings.hour, settings.minute)}</Text>
        <View style={styles.steppers}>
          <Stepper label="시" onMinus={() => shift('hour', -1)} onPlus={() => shift('hour', 1)} disabled={!settings.enabled} />
          <Stepper label="분" onMinus={() => shift('minute', -10)} onPlus={() => shift('minute', 10)} disabled={!settings.enabled} />
        </View>
      </View>

      {granted === false && settings.enabled && (
        <Pressable style={[styles.card, styles.warn]} onPress={async () => setGranted(await requestPermission())}>
          <Text style={styles.warnTitle}>알림 권한이 꺼져 있어요</Text>
          <Text style={styles.cardDesc}>눌러서 권한을 허용하거나, 휴대폰 설정 › 앱 › 헬스 플래닛 › 알림에서 켜주세요.</Text>
        </Pressable>
      )}

      <Pressable style={styles.testBtn} onPress={test}>
        <Text style={styles.testText}>🔔 테스트 알림 보내기</Text>
      </Pressable>
    </ScrollView>
  );
}

function Stepper({
  label,
  onMinus,
  onPlus,
  disabled,
}: {
  label: string;
  onMinus: () => void;
  onPlus: () => void;
  disabled: boolean;
}) {
  return (
    <View style={styles.stepper}>
      <Pressable style={styles.stepBtn} onPress={onMinus} disabled={disabled} hitSlop={6}>
        <Text style={styles.stepBtnText}>−</Text>
      </Pressable>
      <Text style={styles.stepLabel}>{label}</Text>
      <Pressable style={styles.stepBtn} onPress={onPlus} disabled={disabled} hitSlop={6}>
        <Text style={styles.stepBtnText}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  kicker: { color: colors.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, marginTop: 8 },
  heading: { color: colors.text, fontSize: 30, fontWeight: '900', marginTop: 4, marginBottom: 8 },
  desc: { color: colors.textDim, fontSize: 14, lineHeight: 21, marginBottom: 18 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 12,
  },
  cardOn: { borderColor: colors.cardioOn },
  row: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '800' },
  cardDesc: { color: colors.textDim, fontSize: 13, marginTop: 4, lineHeight: 19 },
  switch: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceHigh,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
  },
  switchOn: { backgroundColor: colors.cardioOn, borderColor: colors.cardioOn },
  knob: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.textDim },
  knobOn: { backgroundColor: '#fff', transform: [{ translateX: 22 }] },
  time: { color: colors.text, fontSize: 40, fontWeight: '900', marginTop: 8, marginBottom: 14 },
  steppers: { flexDirection: 'row', gap: 10 },
  stepper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 6,
  },
  stepBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: { color: colors.text, fontSize: 22, fontWeight: '700' },
  stepLabel: { color: colors.textDim, fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.4 },
  warn: { borderColor: colors.cheat, backgroundColor: 'rgba(245,158,11,0.10)' },
  warnTitle: { color: '#FCD34D', fontSize: 16, fontWeight: '800' },
  testBtn: {
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  testText: { color: colors.bg, fontSize: 16, fontWeight: '800' },
});
