import { EXERCISES } from '../src/exercises';
import { BODY_PARTS, emptyPlan, toggleExercise, withoutPart } from '../src/storage';
import { describePlan } from '../src/notifications';

test('모든 부위(팔 포함)에 머신·맨몸·덤벨 목록이 있음', () => {
  expect(BODY_PARTS).toContain('팔');
  for (const part of BODY_PARTS) {
    expect(EXERCISES[part].groups.map(g => g.key)).toEqual(['machine', 'bodyweight', 'free']);
    EXERCISES[part].groups.forEach(g => expect(g.items.length).toBeGreaterThan(0));
  }
});

test('운동을 누르면 기록되고 부위가 자동 선택, 다시 누르면 해제', () => {
  const rest = { ...emptyPlan(), rest: true };
  const a = toggleExercise(rest, '등', '랫 풀다운');
  expect(a.parts).toEqual(['등']);
  expect(a.rest).toBe(false);
  expect(a.exercises?.등).toEqual(['랫 풀다운']);

  const b = toggleExercise(a, '가슴', '덤벨 플라이');
  expect(b.parts).toEqual(['가슴', '등']); // 부위 순서 유지

  const c = toggleExercise(b, '등', '랫 풀다운');
  expect(c.exercises?.등).toBeUndefined();
  expect(c.parts).toEqual(['가슴', '등']); // 해제해도 부위 선택은 유지
});

test('부위 선택 해제 시 그 부위 운동 기록도 삭제', () => {
  const p = toggleExercise(undefined, '팔', '해머 컬');
  const q = withoutPart(p, '팔');
  expect(q.parts).toEqual([]);
  expect(q.exercises?.팔).toBeUndefined();
});

test('알림 내용에 고른 운동 포함', () => {
  const p = toggleExercise({ ...emptyPlan(), cardio: true }, '어깨', '덤벨 숄더 프레스');
  expect(describePlan(p).body).toBe('근력 운동 [어깨] · 유산소 있음\n덤벨 숄더 프레스');
});

test('모든 운동에 동작 애니메이션이 정의됨', () => {
  const { MOTIONS } = require('../src/figure/motions');
  const missing = BODY_PARTS.flatMap(p => EXERCISES[p].groups.flatMap(g => g.items)).filter(n => !MOTIONS[n]);
  expect(missing).toEqual([]);
});
