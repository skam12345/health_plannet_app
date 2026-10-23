import AsyncStorage from '@react-native-async-storage/async-storage';

export const BODY_PARTS = ['가슴', '등', '복근', '어깨', '팔', '하체'] as const;
export type BodyPart = (typeof BODY_PARTS)[number];

export type DayPlan = {
  parts: BodyPart[];
  cardio: boolean; // 복합 운동 (유산소)
  rest: boolean; // 쉬는 날
  cheat: boolean; // 치팅 데이
  exercises?: Partial<Record<BodyPart, string[]>>; // 부위별로 고른 운동 (v1.2~)
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

/** 부위에서 고른 운동 목록 */
export function exercisesOf(plan: DayPlan | undefined, part: BodyPart): string[] {
  return plan?.exercises?.[part] ?? [];
}

/**
 * 운동을 기록/해제한다. 기록 시 해당 부위가 선택되지 않았으면 함께 선택하고,
 * 쉬는 날이었다면 운동하는 날로 바꾼다.
 */
export function toggleExercise(plan: DayPlan | undefined, part: BodyPart, name: string): DayPlan {
  const base = plan ?? emptyPlan();
  const current = exercisesOf(base, part);
  const removing = current.includes(name);
  const nextList = removing ? current.filter(x => x !== name) : [...current, name];
  const exercises = { ...base.exercises, [part]: nextList };
  if (nextList.length === 0) delete exercises[part];
  const parts = removing || base.parts.includes(part)
    ? base.parts
    : BODY_PARTS.filter(x => x === part || base.parts.includes(x));
  return { ...base, rest: removing ? base.rest : false, parts, exercises };
}

/** 부위 선택 해제 시 그 부위의 운동 기록도 지운다 */
export function withoutPart(plan: DayPlan, part: BodyPart): DayPlan {
  const exercises = { ...plan.exercises };
  delete exercises[part];
  return { ...plan, parts: plan.parts.filter(x => x !== part), exercises };
}
