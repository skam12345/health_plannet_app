import AsyncStorage from '@react-native-async-storage/async-storage';

export const BODY_PARTS = ['가슴', '등', '복근', '어깨', '하체'] as const;
export type BodyPart = (typeof BODY_PARTS)[number];

export type DayPlan = {
  parts: BodyPart[];
  cardio: boolean; // 복합 운동 (유산소)
  rest: boolean; // 쉬는 날
  cheat: boolean; // 치팅 데이
};

export type PlanMap = Record<string, DayPlan>; // key: YYYY-MM-DD

const STORAGE_KEY = '@health_planet/plans/v1';

export const emptyPlan = (): DayPlan => ({
  parts: [],
  cardio: false,
  rest: false,
  cheat: false,
});

export async function loadPlans(): Promise<PlanMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PlanMap) : {};
  } catch {
    return {};
  }
}

export async function savePlans(plans: PlanMap): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
  } catch {
    // 저장 실패 시에도 앱 사용은 계속 가능해야 함
  }
}

export function isEmptyPlan(p?: DayPlan): boolean {
  return !p || (!p.rest && !p.cheat && p.parts.length === 0 && !p.cardio);
}
