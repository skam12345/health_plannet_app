import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee, {
  AlarmType,
  AndroidImportance,
  AndroidStyle,
  AuthorizationStatus,
  TriggerType,
} from '@notifee/react-native';
import { DayPlan, isEmptyPlan, loadPlans } from './storage';

export type NotifySettings = {
  enabled: boolean;
  hour: number; // 0-23
  minute: number; // 0-59
};

export const DEFAULT_SETTINGS: NotifySettings = { enabled: true, hour: 8, minute: 0 };

const SETTINGS_KEY = '@health_planet/notify/v1';
const CHANNEL_ID = 'daily-plan';
// 날짜별 고정 ID: 같은 날짜는 다시 예약해도 덮어쓰기되어 하루 한 번만 울림
const ID_PREFIX = 'plan-';
// 너무 먼 미래까지 쌓아두지 않도록 예약 범위 제한
const MAX_DAYS_AHEAD = 60;

export async function loadSettings(): Promise<NotifySettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(s: NotifySettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    // 무시
  }
}

export async function requestPermission(): Promise<boolean> {
  try {
    const res = await notifee.requestPermission();
    return res.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  } catch {
    return false;
  }
}

export async function hasPermission(): Promise<boolean> {
  try {
    const res = await notifee.getNotificationSettings();
    return res.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
  } catch {
    return false;
  }
}

/** 알림 제목/내용 문구 */
export function describePlan(plan: DayPlan): { title: string; body: string } {
  const cheat = plan.cheat ? ' · 🍔 치팅 데이' : '';
  if (plan.rest) {
    return { title: '오늘은 쉬는 날 😴', body: `푹 쉬고 회복하세요${cheat}` };
  }
  if (plan.parts.length > 0 || plan.cardio) {
    const parts = plan.parts.length > 0 ? plan.parts.join(' · ') : '미정';
    const title =
      plan.parts.length > 0 ? `오늘은 ${plan.parts.join('·')} 운동 하는 날 💪` : '오늘은 운동하는 날 💪';
    const picked = plan.parts.flatMap(p => plan.exercises?.[p] ?? []);
    return {
      title,
      body:
        `근력 운동 [${parts}] · ${plan.cardio ? '유산소 있음' : '유산소 없음'}${cheat}` +
        (picked.length > 0 ? `
${picked.join(', ')}` : ''),
    };
  }
  return { title: '오늘은 치팅 데이 🍔', body: '맛있게 먹고 내일 다시 달려요!' };
}

async function ensureChannel() {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: '오늘의 운동 알림',
    description: '계획한 날 아침에 오늘 할 운동을 알려줍니다',
    importance: AndroidImportance.HIGH,
  });
}

/**
 * 저장된 계획과 알림 설정을 읽어 예약 알림을 다시 맞춘다.
 * 앱이 꺼져 있어도 시스템 알람으로 지정 시각에 한 번 울린다.
 */
export async function syncReminders(): Promise<void> {
  try {
    const [plans, settings] = await Promise.all([loadPlans(), loadSettings()]);

    const ids = await notifee.getTriggerNotificationIds();
    const ours = ids.filter(id => id.startsWith(ID_PREFIX));
    if (ours.length) await notifee.cancelTriggerNotifications(ours);

    if (!settings.enabled) return;
    await ensureChannel();

    const now = Date.now();
    const limit = now + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000;

    for (const [key, plan] of Object.entries(plans)) {
      if (isEmptyPlan(plan)) continue;
      const [y, m, d] = key.split('-').map(Number);
      const at = new Date(y, m - 1, d, settings.hour, settings.minute, 0, 0).getTime();
      if (at <= now || at > limit) continue;

      const { title, body } = describePlan(plan);
      await notifee.createTriggerNotification(
        {
          id: ID_PREFIX + key,
          title,
          body,
          android: {
            channelId: CHANNEL_ID,
            smallIcon: 'ic_notification',
            color: '#3B82F6',
            pressAction: { id: 'default' },
            // 고른 운동까지 여러 줄로 보이도록
            style: { type: AndroidStyle.BIGTEXT, text: body },
          },
        },
        {
          type: TriggerType.TIMESTAMP,
          timestamp: at,
          // 정확한 알람 권한 없이도 절전(Doze) 상태에서 울리도록
          alarmManager: { type: AlarmType.SET_AND_ALLOW_WHILE_IDLE },
        },
      );
    }
  } catch {
    // 알림 예약 실패가 앱 사용을 막지 않도록
  }
}

/** 설정 화면의 '테스트 알림' */
export async function showTestNotification(plan?: DayPlan): Promise<void> {
  try {
    await ensureChannel();
    const { title, body } = plan && !isEmptyPlan(plan)
      ? describePlan(plan)
      : { title: '헬스 플래닛 알림 테스트', body: '알림이 정상적으로 동작합니다 💪' };
    await notifee.displayNotification({
      title,
      body,
      android: {
        channelId: CHANNEL_ID,
        smallIcon: 'ic_notification',
        color: '#3B82F6',
        pressAction: { id: 'default' },
      },
    });
  } catch {
    // 무시
  }
}

export function formatTime(h: number, m: number): string {
  const ampm = h < 12 ? '오전' : '오후';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${hh}:${String(m).padStart(2, '0')}`;
}
