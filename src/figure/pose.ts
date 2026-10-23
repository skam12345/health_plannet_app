/**
 * 운동 동작 애니메이션용 인체 모형 포즈 계산.
 *
 * 각도 규칙(도): 0 = 아래, 90 = 앞(화면 오른쪽), 180 = 위, -90 = 뒤(화면 왼쪽).
 * 정면 보기(view: 'front')에서는 90 = 바깥쪽(몸에서 멀어지는 방향).
 */

export const CANVAS_W = 240;
export const CANVAS_H = 180;
export const GROUND = 168;

export const LEN = {
  torso: 52,
  neck: 6,
  head: 9, // 반지름
  upperArm: 26,
  foreArm: 24,
  thigh: 34,
  shin: 32,
  foot: 10,
};

export type Limb = [number, number]; // [윗마디, 아랫마디] 절대 각도

export type Pose = {
  torso: number; // 엉덩이→어깨 방향
  arm: Limb;
  arm2?: Limb; // 먼 쪽(정면: 화면 왼쪽) 팔, 생략 시 arm과 같음
  leg: Limb;
  leg2?: Limb;
};

export type Fix = 'feet' | 'hands' | 'hip';

export type Equip =
  | { t: 'db' } // 덤벨 (손)
  | { t: 'bb' } // 바벨 원판 (손)
  | { t: 'bbShoulder' } // 어깨 위 바벨
  | { t: 'handle' } // 머신 손잡이
  | { t: 'cable'; from: [number, number] } // 케이블: 고정점 → 손
  | { t: 'rect'; x: number; y: number; w: number; h: number; angle?: number } // 벤치/패드/시트
  | { t: 'bar'; y: number } // 철봉/평행봉 가로대
  | { t: 'rails'; xs: number[] } // 스미스 머신 레일
  | { t: 'footPlate' } // 레그 프레스 발판 (발)
  | { t: 'anklePad' }; // 레그 익스텐션/컬 패드 (발목)

export type Segment = 'torso' | 'upperArm' | 'foreArm' | 'thigh' | 'shin';

export type Motion = {
  view?: 'side' | 'front';
  a: Pose;
  b: Pose;
  fix: Fix;
  at: [number, number];
  equip?: Equip[];
  period?: number; // ms, 한 번 왕복
  ground?: boolean; // 바닥선 표시 (매달리는 동작은 false)
};

type P = [number, number];

const dir = (deg: number): P => {
  const r = (deg * Math.PI) / 180;
  return [Math.sin(r), Math.cos(r)];
};
const add = (p: P, d: P, k: number): P => [p[0] + d[0] * k, p[1] + d[1] * k];

export type Skeleton = {
  head: P;
  neck: P;
  hip: P;
  shoulder: P; // 정면: 화면 오른쪽 어깨
  shoulder2: P;
  hip1: P;
  hip2: P;
  elbow: P;
  hand: P;
  elbow2: P;
  hand2: P;
  knee: P;
  ankle: P;
  toe: P;
  knee2: P;
  ankle2: P;
  toe2: P;
};

const lerp = (x: number, y: number, t: number) => x + (y - x) * t;
const lerpLimb = (x: Limb, y: Limb, t: number): Limb => [lerp(x[0], y[0], t), lerp(x[1], y[1], t)];

export function interpolate(a: Pose, b: Pose, t: number): Pose {
  return {
    torso: lerp(a.torso, b.torso, t),
    arm: lerpLimb(a.arm, b.arm, t),
    arm2: lerpLimb(a.arm2 ?? a.arm, b.arm2 ?? b.arm, t),
    leg: lerpLimb(a.leg, b.leg, t),
    leg2: lerpLimb(a.leg2 ?? a.leg, b.leg2 ?? b.leg, t),
  };
}

/** 포즈 → 관절 좌표 (고정점 기준으로 평행이동) */
export function solve(pose: Pose, view: 'side' | 'front', fix: Fix, at: P): Skeleton {
  const hip: P = [0, 0];
  const td = dir(pose.torso);
  const shoulderC = add(hip, td, LEN.torso);
  const neck = add(shoulderC, td, LEN.neck);
  const head = add(neck, td, LEN.head);
  const arm2 = pose.arm2 ?? pose.arm;
  const leg2 = pose.leg2 ?? pose.leg;

  let shoulder = shoulderC;
  let shoulder2 = shoulderC;
  let hip1 = hip;
  let hip2 = hip;
  // 정면 보기에서 바깥 방향은 좌우 대칭
  let d = dir;
  let d2 = dir;
  if (view === 'front') {
    const side: P = [-td[1], td[0]]; // 몸통에 수직 (화면 오른쪽)
    shoulder = add(shoulderC, side, 13);
    shoulder2 = add(shoulderC, side, -13);
    hip1 = add(hip, side, 7);
    hip2 = add(hip, side, -7);
    d = (deg: number) => dir(deg);
    d2 = (deg: number) => {
      const v = dir(deg);
      return [-v[0], v[1]];
    };
  }

  const elbow = add(shoulder, d(pose.arm[0]), LEN.upperArm);
  const hand = add(elbow, d(pose.arm[1]), LEN.foreArm);
  const elbow2 = add(shoulder2, d2(arm2[0]), LEN.upperArm);
  const hand2 = add(elbow2, d2(arm2[1]), LEN.foreArm);
  const knee = add(hip1, d(pose.leg[0]), LEN.thigh);
  const ankle = add(knee, d(pose.leg[1]), LEN.shin);
  const knee2 = add(hip2, d2(leg2[0]), LEN.thigh);
  const ankle2 = add(knee2, d2(leg2[1]), LEN.shin);
  const toe = view === 'front' ? add(ankle, [1, 0], 6) : add(ankle, dir(pose.leg[1] + 90), LEN.foot);
  const toe2 = view === 'front' ? add(ankle2, [-1, 0], 6) : add(ankle2, dir(leg2[1] + 90), LEN.foot);

  const s: Skeleton = {
    head, neck, hip, shoulder, shoulder2, hip1, hip2,
    elbow, hand, elbow2, hand2, knee, ankle, toe, knee2, ankle2, toe2,
  };

  let ref: P;
  if (fix === 'hands') ref = hand;
  else if (fix === 'hip') ref = hip;
  else ref = [ankle[0], Math.max(ankle[1], toe[1]) + 3]; // 발바닥
  const dx = at[0] - ref[0];
  const dy = at[1] - ref[1];
  (Object.keys(s) as (keyof Skeleton)[]).forEach(k => {
    s[k] = [s[k][0] + dx, s[k][1] + dy];
  });
  return s;
}
