import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee from '@notifee/react-native';
import { describePlan, syncReminders } from '../src/notifications';

const PLANS_KEY = '@health_planet/plans/v1';
const SETTINGS_KEY = '@health_planet/notify/v1';

describe('describePlan', () => {
  test('운동 + 유산소', () => {
    expect(describePlan({ parts: ['어깨'], cardio: true, rest: false, cheat: false })).toEqual({
      title: '오늘은 어깨 운동 하는 날 💪',
      body: '근력 운동 [어깨] · 유산소 있음',
    });
  });

  test('쉬는 날 + 치팅', () => {
    expect(describePlan({ parts: [], cardio: false, rest: true, cheat: true }).body).toContain('치팅 데이');
  });
});

describe('syncReminders', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    jest.useFakeTimers({ now: new Date(2026, 9, 22, 12, 0) }); // 10/22 정오
  });
  afterEach(() => jest.useRealTimers());

  test('계획이 있는 미래 날짜만 날짜별 고정 ID로 한 번씩 예약', async () => {
    await AsyncStorage.setItem(
      PLANS_KEY,
      JSON.stringify({
        '2026-10-21': { parts: ['등'], cardio: false, rest: false, cheat: false }, // 지난 날
        '2026-10-22': { parts: ['가슴'], cardio: true, rest: false, cheat: false }, // 오늘 8시는 이미 지남
        '2026-10-23': { parts: ['하체'], cardio: false, rest: false, cheat: false },
        '2026-10-24': { parts: [], cardio: false, rest: false, cheat: false }, // 빈 계획
        '2026-10-25': { parts: [], cardio: false, rest: true, cheat: false },
      }),
    );

    await syncReminders();

    const calls = (notifee.createTriggerNotification as jest.Mock).mock.calls;
    expect(calls.map(c => c[0].id)).toEqual(['plan-2026-10-23', 'plan-2026-10-25']);
    expect(calls[0][1].timestamp).toBe(new Date(2026, 9, 23, 8, 0).getTime());
  });

  test('알림을 끄면 예약하지 않음', async () => {
    await AsyncStorage.setItem(
      PLANS_KEY,
      JSON.stringify({ '2026-10-23': { parts: ['하체'], cardio: false, rest: false, cheat: false } }),
    );
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify({ enabled: false, hour: 8, minute: 0 }));

    await syncReminders();

    expect(notifee.createTriggerNotification).not.toHaveBeenCalled();
  });
});
