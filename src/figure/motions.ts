import { BodyPart } from '../storage';
import { Equip, GROUND, Motion, Pose, Segment } from './pose';

const G = GROUND;

/** 부위별 강조 근육 */
export const FOCUS: Record<BodyPart, Segment[]> = {
  가슴: ['torso'],
  등: ['torso'],
  복근: ['torso'],
  어깨: ['upperArm'],
  팔: ['upperArm', 'foreArm'],
  하체: ['thigh', 'shin'],
};

// ---------- 기본 자세 ----------
const pose = (o: Partial<Pose>): Pose => ({ torso: 180, arm: [0, 0], leg: [0, 0], ...o });

const SEAT_HIP: [number, number] = [100, 118];
const seat: Equip = { t: 'rect', x: 72, y: 124, w: 46, h: 9 };
const seatBack: Equip = { t: 'rect', x: 76, y: 60, w: 9, h: 64 };
const seatLegs: Equip = { t: 'rect', x: 90, y: 133, w: 8, h: G - 133 };
const seated = (o: Partial<Pose>) => pose({ leg: [90, 0], ...o });

// 벤치에 누운 자세 (머리 왼쪽)
const BENCH_HIP: [number, number] = [148, 120];
const flatBench: Equip[] = [
  { t: 'rect', x: 40, y: 128, w: 116, h: 8 },
  { t: 'rect', x: 52, y: 136, w: 7, h: G - 136 },
  { t: 'rect', x: 138, y: 136, w: 7, h: G - 136 },
];
const supine = (o: Partial<Pose>) => pose({ torso: -90, leg: [70, 0], ...o });
const INCLINE_HIP: [number, number] = [140, 122];
const inclineBench: Equip[] = [
  { t: 'rect', x: 84, y: 66, w: 9, h: 70, angle: 45 },
  { t: 'rect', x: 120, y: 128, w: 40, h: 8 },
  { t: 'rect', x: 132, y: 136, w: 7, h: G - 136 },
];

// 바닥에 누운 자세
const FLOOR_HIP: [number, number] = [130, G - 8];

const STAND: [number, number] = [118, G];

// ---------- 동작 템플릿 ----------
const curl = (equip: Equip[]): Motion => ({
  a: pose({ arm: [3, 5] }),
  b: pose({ arm: [-8, 160] }),
  fix: 'feet',
  at: STAND,
  equip,
  period: 2000,
});

const benchPress = (equip: Equip[]): Motion => ({
  a: supine({ arm: [180, 180] }),
  b: supine({ arm: [-25, 165] }),
  fix: 'hip',
  at: BENCH_HIP,
  equip: [...flatBench, ...equip],
});

const inclinePress = (equip: Equip[]): Motion => ({
  a: supine({ torso: -135, arm: [165, 165] }),
  b: supine({ torso: -135, arm: [-50, 150] }),
  fix: 'hip',
  at: INCLINE_HIP,
  equip: [...inclineBench, ...equip],
});

const bentRow = (equip: Equip[]): Motion => ({
  a: pose({ torso: 112, leg: [18, -8], arm: [0, 0] }),
  b: pose({ torso: 112, leg: [18, -8], arm: [-55, 10] }),
  fix: 'feet',
  at: STAND,
  equip,
  period: 2000,
});

const squat = (arm: [number, number], equip: Equip[] = [], torsoB = 140): Motion => ({
  a: pose({ arm }),
  b: pose({ torso: torsoB, leg: [95, -28], arm }),
  fix: 'feet',
  at: STAND,
  equip,
  period: 2600,
});

const lunge = (equip: Equip[], backOnBench = false): Motion => ({
  a: pose({ leg: [25, -5], leg2: backOnBench ? [-20, -100] : [-25, -25] }),
  b: pose({ torso: 172, leg: [88, -5], leg2: backOnBench ? [5, -110] : [2, -88] }),
  fix: 'feet',
  at: [140, G],
  equip,
  period: 2600,
});

const pushup = (hands: [number, number], incline = 0, equip: Equip[] = []): Motion => ({
  a: pose({ torso: 116 + incline, arm: [0, 0], leg: [-64 + incline, -64 + incline] }),
  b: pose({ torso: 96 + incline, arm: [-115, 15], leg: [-84 + incline, -84 + incline] }),
  fix: 'hands',
  at: hands,
  equip,
  period: 2000,
});

const pullup = (equip: Equip[] = [], kneel = false): Motion => ({
  a: pose({ arm: [178, 180], leg: kneel ? [0, -95] : [3, -5] }),
  b: pose({ torso: 172, arm: [40, 172], leg: kneel ? [0, -95] : [15, -20] }),
  fix: 'hands',
  at: [130, 26],
  equip: [{ t: 'bar', y: 26 }, ...equip],
  period: 2400,
  ground: false,
});

const seatedPress = (equip: Equip[]): Motion => ({
  a: seated({ arm: [35, 172] }),
  b: seated({ arm: [172, 178] }),
  fix: 'hip',
  at: SEAT_HIP,
  equip: [seat, seatBack, seatLegs, ...equip],
});

const lateral = (equip: Equip[], seatedPose = false): Motion => ({
  view: 'front',
  a: pose({ arm: [10, 10], leg: seatedPose ? [8, 0] : [4, 0] }),
  b: pose({ arm: [88, 92], leg: seatedPose ? [8, 0] : [4, 0] }),
  fix: 'feet',
  at: [120, G],
  equip,
  period: 2200,
});

// ---------- 운동별 동작 ----------
export const MOTIONS: Record<string, Motion> = {
  // 등
  '랫 풀다운': {
    a: seated({ arm: [175, 180] }),
    b: seated({ torso: 172, arm: [35, 168] }),
    fix: 'hip',
    at: SEAT_HIP,
    equip: [seat, seatLegs, { t: 'cable', from: [104, 8] }, { t: 'handle' }],
  },
  '시티드 로우': {
    a: seated({ torso: 175, arm: [88, 90] }),
    b: seated({ torso: 186, arm: [-50, 90] }),
    fix: 'hip',
    at: SEAT_HIP,
    equip: [seat, seatLegs, { t: 'cable', from: [225, 90] }, { t: 'handle' }],
  },
  'T바 로우': bentRow([{ t: 'bb' }]),
  '어시스티드 풀업 머신': pullup([], true),
  '풀업 (턱걸이)': pullup(),
  친업: pullup(),
  슈퍼맨: {
    a: pose({ torso: 90, arm: [90, 90], leg: [-90, -90] }),
    b: pose({ torso: 104, arm: [112, 112], leg: [-104, -104] }),
    fix: 'hip',
    at: FLOOR_HIP,
    period: 2400,
  },
  '인버티드 로우': {
    a: pose({ torso: 118, arm: [172, 172], leg: [-62, -62] }),
    b: pose({ torso: 104, arm: [-40, 160], leg: [-76, -76] }),
    fix: 'hands',
    at: [160, 72],
    equip: [{ t: 'bar', y: 72 }],
  },
  '원 암 덤벨 로우': {
    a: pose({ torso: 100, arm: [0, 0], arm2: [12, 12], leg: [10, -5], leg2: [-15, -15] }),
    b: pose({ torso: 100, arm: [-60, 5], arm2: [12, 12], leg: [10, -5], leg2: [-15, -15] }),
    fix: 'feet',
    at: [100, G],
    equip: [{ t: 'db' }, { t: 'rect', x: 140, y: 112, w: 70, h: 8 }],
    period: 2000,
  },
  '덤벨 벤트 오버 로우': bentRow([{ t: 'db' }]),
  '덤벨 풀오버': {
    a: supine({ arm: [175, 175] }),
    b: supine({ arm: [-100, -95] }),
    fix: 'hip',
    at: BENCH_HIP,
    equip: [...flatBench, { t: 'db' }],
    period: 2600,
  },
  '바벨 로우': bentRow([{ t: 'bb' }]),

  // 가슴
  '체스트 프레스 머신': {
    a: seated({ arm: [-35, 90] }),
    b: seated({ arm: [90, 90] }),
    fix: 'hip',
    at: SEAT_HIP,
    equip: [seat, seatBack, seatLegs, { t: 'handle' }],
  },
  '인클라인 체스트 프레스': {
    a: seated({ torso: 195, arm: [-30, 115] }),
    b: seated({ torso: 195, arm: [118, 118] }),
    fix: 'hip',
    at: SEAT_HIP,
    equip: [seat, seatLegs, { t: 'rect', x: 66, y: 64, w: 9, h: 62, angle: -15 }, { t: 'handle' }],
  },
  '펙 덱 플라이': {
    view: 'front',
    a: pose({ arm: [90, 175], leg: [10, 0] }),
    b: pose({ arm: [22, 165], leg: [10, 0] }),
    fix: 'feet',
    at: [120, G],
  },
  '케이블 크로스오버': {
    view: 'front',
    a: pose({ arm: [118, 120], leg: [8, 0] }),
    b: pose({ arm: [25, 10], leg: [8, 0] }),
    fix: 'feet',
    at: [120, G],
    equip: [{ t: 'cable', from: [215, 14] }],
  },
  '푸시업 (팔굽혀펴기)': pushup([160, G - 3]),
  '인클라인 푸시업': pushup([160, 120], 22, [{ t: 'rect', x: 140, y: 122, w: 60, h: 8 }, { t: 'rect', x: 165, y: 130, w: 8, h: G - 130 }]),
  '디클라인 푸시업': {
    a: pose({ torso: 104, arm: [0, 0], leg: [-76, -76] }),
    b: pose({ torso: 88, arm: [-115, 15], leg: [-92, -92] }),
    fix: 'hands',
    at: [170, G - 3],
    equip: [{ t: 'rect', x: 20, y: 124, w: 50, h: 8 }, { t: 'rect', x: 40, y: 132, w: 8, h: G - 132 }],
    period: 2000,
  },
  '딥스 (평행봉)': {
    a: pose({ torso: 175, arm: [0, 0], leg: [25, -50] }),
    b: pose({ torso: 162, arm: [-105, 10], leg: [25, -50] }),
    fix: 'hands',
    at: [126, 84],
    equip: [{ t: 'bar', y: 86 }],
  },
  '덤벨 벤치프레스': benchPress([{ t: 'db' }]),
  '인클라인 덤벨 프레스': inclinePress([{ t: 'db' }]),
  '덤벨 플라이': {
    a: supine({ arm: [178, 175] }),
    b: supine({ arm: [-60, -30] }),
    fix: 'hip',
    at: BENCH_HIP,
    equip: [...flatBench, { t: 'db' }],
    period: 2600,
  },
  '바벨 벤치프레스': benchPress([{ t: 'bb' }]),

  // 하체
  '레그 프레스': {
    a: supine({ torso: -140, leg: [148, 55] }),
    b: supine({ torso: -140, leg: [118, 122] }),
    fix: 'hip',
    at: [92, 128],
    equip: [{ t: 'rect', x: 40, y: 72, w: 9, h: 66, angle: 50 }, { t: 'rect', x: 70, y: 132, w: 40, h: 8 }, { t: 'footPlate' }],
  },
  '레그 익스텐션': {
    a: seated({ leg: [90, 0] }),
    b: seated({ leg: [90, 88] }),
    fix: 'hip',
    at: SEAT_HIP,
    equip: [seat, seatBack, seatLegs, { t: 'anklePad' }],
    period: 2000,
  },
  '시티드/라잉 레그 컬': {
    a: seated({ leg: [90, 75] }),
    b: seated({ leg: [90, -35] }),
    fix: 'hip',
    at: SEAT_HIP,
    equip: [seat, seatBack, seatLegs, { t: 'anklePad' }],
    period: 2000,
  },
  '아웃타이 / 인타이': {
    view: 'front',
    a: pose({ leg: [12, -5], arm: [12, 12] }),
    b: pose({ leg: [42, 5], arm: [12, 12] }),
    fix: 'hip',
    at: [120, 120],
    equip: [{ t: 'rect', x: 92, y: 124, w: 56, h: 9 }],
    period: 2000,
  },
  '스미스 머신': squat([-55, 150], [{ t: 'rails' as const, xs: [70, 170] }, { t: 'bbShoulder' }]),
  '핵 스쿼트': squat([-30, 160], [{ t: 'rect', x: 92, y: 40, w: 9, h: 110, angle: -18 }], 165),
  '맨몸 스쿼트': {
    a: pose({ arm: [10, 10] }),
    b: pose({ torso: 140, leg: [95, -28], arm: [95, 95] }),
    fix: 'feet',
    at: STAND,
    period: 2600,
  },
  런지: lunge([]),
  '불가리안 스플릿 스쿼트 (BSS)': lunge([{ t: 'rect', x: 20, y: 124, w: 56, h: 8 }, { t: 'rect', x: 44, y: 132, w: 8, h: G - 132 }], true),
  '힙 쓰러스트 / 글루트 브릿지': {
    a: pose({ torso: -90, arm: [80, 80], leg: [130, 15] }),
    b: pose({ torso: -72, arm: [70, 70], leg: [95, 0] }),
    fix: 'feet',
    at: [168, G],
    period: 2200,
  },
  '덤벨 고블렛 스쿼트': squat([15, 165], [{ t: 'db' }]),
  '덤벨 스티프 레그 데드리프트': {
    a: pose({ arm: [0, 0] }),
    b: pose({ torso: 98, leg: [6, 0], arm: [0, 0] }),
    fix: 'feet',
    at: STAND,
    equip: [{ t: 'db' }],
    period: 2800,
  },
  '덤벨 런지': lunge([{ t: 'db' }]),
  '바벨 스쿼트': squat([-55, 150], [{ t: 'bbShoulder' }]),

  // 어깨
  '숄더 프레스 머신': seatedPress([{ t: 'handle' }]),
  '리어 델트 플라이': {
    view: 'front',
    a: pose({ arm: [25, 25], leg: [10, 0] }),
    b: pose({ arm: [92, 92], leg: [10, 0] }),
    fix: 'feet',
    at: [120, G],
    equip: [{ t: 'handle' }],
  },
  '케이블 래터럴 레이즈': {
    view: 'front',
    a: pose({ arm: [12, 12], arm2: [8, 8], leg: [5, 0] }),
    b: pose({ arm: [88, 92], arm2: [8, 8], leg: [5, 0] }),
    fix: 'feet',
    at: [120, G],
    equip: [{ t: 'cable', from: [40, G - 8] }],
  },
  '파이크 푸시업': {
    a: pose({ torso: 40, arm: [40, 40], leg: [-40, -40] }),
    b: pose({ torso: 62, arm: [-60, 25], leg: [-35, -35] }),
    fix: 'hands',
    at: [150, G - 3],
    period: 2200,
  },
  '핸드스탠드 푸시업 (물구나무서기)': {
    a: pose({ torso: 0, arm: [0, 0], leg: [178, 125] }),
    b: pose({ torso: 6, arm: [-105, 10], leg: [180, 127] }),
    fix: 'hands',
    at: [120, G - 3],
    period: 2400,
  },
  '덤벨 숄더 프레스': seatedPress([{ t: 'db' }]),
  '사이드 래터럴 레이즈 (사래레)': lateral([{ t: 'db' }]),
  '덤벨 프론트 레이즈': {
    a: pose({ arm: [4, 4] }),
    b: pose({ arm: [92, 92] }),
    fix: 'feet',
    at: STAND,
    equip: [{ t: 'db' }],
    period: 2200,
  },
  '덤벨 리어 델트 플라이': {
    a: pose({ torso: 105, leg: [15, -5], arm: [0, 5] }),
    b: pose({ torso: 105, leg: [15, -5], arm: [-80, -75] }),
    fix: 'feet',
    at: STAND,
    equip: [{ t: 'db' }],
    period: 2200,
  },

  // 팔
  '케이블 푸시다운': {
    a: pose({ torso: 172, arm: [5, 150] }),
    b: pose({ torso: 172, arm: [5, 5] }),
    fix: 'feet',
    at: STAND,
    equip: [{ t: 'cable', from: [150, 10] }, { t: 'handle' }],
    period: 2000,
  },
  '프리처 컬 머신': {
    a: seated({ arm: [55, 65] }),
    b: seated({ arm: [55, 168] }),
    fix: 'hip',
    at: SEAT_HIP,
    equip: [seat, seatLegs, { t: 'rect', x: 108, y: 86, w: 40, h: 8, angle: 35 }, { t: 'handle' }],
    period: 2000,
  },
  '케이블 바이셉 컬': curl([{ t: 'cable', from: [190, G - 6] }, { t: 'handle' }]),
  '벤치 딥스': {
    a: pose({ torso: 178, arm: [-12, -12], leg: [85, 70] }),
    b: pose({ torso: 175, arm: [-110, -5], leg: [80, 65] }),
    fix: 'hands',
    at: [86, 118],
    equip: [{ t: 'rect', x: 30, y: 120, w: 64, h: 8 }, { t: 'rect', x: 50, y: 128, w: 8, h: G - 128 }],
    period: 2000,
  },
  '클로즈 그립 푸시업': pushup([160, G - 3]),
  '덤벨 바이셉 컬': curl([{ t: 'db' }]),
  '해머 컬': curl([{ t: 'db' }]),
  '오버헤드 덤벨 트라이셉스 익스텐션': {
    a: pose({ arm: [172, -25] }),
    b: pose({ arm: [172, 178] }),
    fix: 'feet',
    at: STAND,
    equip: [{ t: 'db' }],
    period: 2200,
  },
  '덤벨 킥백': {
    a: pose({ torso: 102, leg: [15, -5], arm: [-80, 0] }),
    b: pose({ torso: 102, leg: [15, -5], arm: [-80, -84] }),
    fix: 'feet',
    at: STAND,
    equip: [{ t: 'db' }],
    period: 1800,
  },
  '바벨 덤벨 컬': curl([{ t: 'bb' }]),

  // 복근
  '앱 크런치 머신': {
    a: seated({ arm: [25, 172] }),
    b: seated({ torso: 140, arm: [-15, 132] }),
    fix: 'hip',
    at: SEAT_HIP,
    equip: [seat, seatLegs, { t: 'handle' }],
  },
  '케이블 크런치': {
    a: pose({ torso: 162, arm: [150, -150], leg: [0, -90] }),
    b: pose({ torso: 100, arm: [92, -128], leg: [0, -90] }),
    fix: 'hip',
    at: [110, G - 40],
    equip: [{ t: 'cable', from: [150, 10] }],
  },
  '로만 체어 (하이퍼익스텐션)': {
    a: pose({ torso: 40, arm: [40, 40], leg: [-58, -58] }),
    b: pose({ torso: 118, arm: [118, 118], leg: [-58, -58] }),
    fix: 'hip',
    at: [120, 100],
    equip: [{ t: 'rect', x: 104, y: 104, w: 34, h: 10, angle: -30 }, { t: 'rect', x: 40, y: 140, w: 26, h: 10 }],
    period: 2600,
  },
  플랭크: {
    a: pose({ torso: 96, arm: [0, 90], leg: [-84, -84] }),
    b: pose({ torso: 94, arm: [0, 90], leg: [-86, -86] }),
    fix: 'hands',
    at: [170, G - 3],
    period: 3000,
  },
  크런치: {
    a: pose({ torso: -90, arm: [90, 90], leg: [135, 15] }),
    b: pose({ torso: -122, arm: [70, 70], leg: [135, 15] }),
    fix: 'hip',
    at: FLOOR_HIP,
    period: 2000,
  },
  '레그 레이즈': {
    a: pose({ torso: -90, arm: [88, 88], leg: [86, 86] }),
    b: pose({ torso: -90, arm: [88, 88], leg: [178, 178] }),
    fix: 'hip',
    at: [110, G - 8],
    period: 2600,
  },
  '행잉 레그 레이즈': {
    a: pose({ arm: [178, 180], leg: [0, 0] }),
    b: pose({ arm: [178, 180], torso: 172, leg: [92, 92] }),
    fix: 'hands',
    at: [110, 20],
    equip: [{ t: 'bar', y: 20 }],
    period: 2400,
    ground: false,
  },
  '마운틴 클라이머': {
    a: pose({ torso: 112, arm: [0, 0], leg: [-68, -68], leg2: [55, -25] }),
    b: pose({ torso: 112, arm: [0, 0], leg: [55, -25], leg2: [-68, -68] }),
    fix: 'hands',
    at: [170, G - 3],
    period: 900,
  },
  '사이드 플랭크': {
    a: pose({ torso: 104, arm: [0, 0], arm2: [180, 180], leg: [-76, -76] }),
    b: pose({ torso: 112, arm: [0, 0], arm2: [180, 180], leg: [-68, -68] }),
    fix: 'hands',
    at: [168, G - 3],
    period: 2600,
  },
  '덤벨 사이드 벤드': {
    view: 'front',
    a: pose({ torso: 172, arm: [-8, -8], leg: [5, 0] }),
    b: pose({ torso: 190, arm: [8, 8], leg: [5, 0] }),
    fix: 'feet',
    at: [120, G],
    equip: [{ t: 'db' }],
    period: 2400,
  },
  '덤벨 러시안 트위스트': {
    view: 'front',
    a: pose({ torso: 172, arm: [-35, -50], arm2: [55, 40], leg: [60, -20] }),
    b: pose({ torso: 188, arm: [55, 40], arm2: [-35, -50], leg: [60, -20] }),
    fix: 'hip',
    at: [120, G - 10],
    equip: [{ t: 'db' }],
    period: 1800,
  },
  '덤벨 홀드 플랭크': {
    a: pose({ torso: 108, arm: [0, 0], leg: [-72, -72] }),
    b: pose({ torso: 106, arm: [0, 0], leg: [-74, -74] }),
    fix: 'hands',
    at: [168, G - 10],
    equip: [{ t: 'db' }],
    period: 3000,
  },
};
