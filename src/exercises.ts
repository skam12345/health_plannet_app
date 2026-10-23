import { BodyPart } from './storage';

export type ExerciseGroup = {
  key: 'machine' | 'bodyweight' | 'free';
  label: string;
  icon: string;
  items: string[];
};

export type PartGuide = {
  title: string; // 모달 제목 (영문 병기)
  desc: string;
  groups: ExerciseGroup[];
};

const group = (key: ExerciseGroup['key'], items: string[]): ExerciseGroup => ({
  key,
  items,
  ...{
    machine: { label: '머신 / 케이블', icon: '🏋️' },
    bodyweight: { label: '맨몸 운동', icon: '🤸' },
    free: { label: '덤벨 / 프리웨이트', icon: '💪' },
  }[key],
});

/** 부위별 운동 목록 (머신 · 맨몸 · 덤벨/프리웨이트) */
export const EXERCISES: Record<BodyPart, PartGuide> = {
  등: {
    title: '등 (Back)',
    desc: '넓은 등판(광배근)과 두꺼운 등 중앙을 만들어주는 운동 모음입니다.',
    groups: [
      group('machine', ['랫 풀다운', '시티드 로우', 'T바 로우', '어시스티드 풀업 머신']),
      group('bodyweight', ['풀업 (턱걸이)', '친업', '슈퍼맨', '인버티드 로우']),
      group('free', ['원 암 덤벨 로우', '덤벨 벤트 오버 로우', '덤벨 풀오버', '바벨 로우']),
    ],
  },
  가슴: {
    title: '가슴 (Chest)',
    desc: '가슴 전체의 볼륨감과 입체적인 라인을 만드는 운동 모음입니다.',
    groups: [
      group('machine', ['체스트 프레스 머신', '인클라인 체스트 프레스', '펙 덱 플라이', '케이블 크로스오버']),
      group('bodyweight', ['푸시업 (팔굽혀펴기)', '인클라인 푸시업', '디클라인 푸시업', '딥스 (평행봉)']),
      group('free', ['덤벨 벤치프레스', '인클라인 덤벨 프레스', '덤벨 플라이', '바벨 벤치프레스']),
    ],
  },
  하체: {
    title: '하체 (Lower Body)',
    desc: '허벅지 전면/후면, 엉덩이(둔근), 종아리를 단련하는 운동 모음입니다.',
    groups: [
      group('machine', [
        '레그 프레스',
        '레그 익스텐션',
        '시티드/라잉 레그 컬',
        '아웃타이 / 인타이',
        '스미스 머신',
        '핵 스쿼트',
      ]),
      group('bodyweight', ['맨몸 스쿼트', '런지', '불가리안 스플릿 스쿼트 (BSS)', '힙 쓰러스트 / 글루트 브릿지']),
      group('free', ['덤벨 고블렛 스쿼트', '덤벨 스티프 레그 데드리프트', '덤벨 런지', '바벨 스쿼트']),
    ],
  },
  어깨: {
    title: '어깨 (Shoulders)',
    desc: '어깨 전면, 측면, 후면(삼각근)을 입체적으로 가꿔주는 운동 모음입니다.',
    groups: [
      group('machine', ['숄더 프레스 머신', '리어 델트 플라이', '케이블 래터럴 레이즈']),
      group('bodyweight', ['파이크 푸시업', '핸드스탠드 푸시업 (물구나무서기)']),
      group('free', ['덤벨 숄더 프레스', '사이드 래터럴 레이즈 (사래레)', '덤벨 프론트 레이즈', '덤벨 리어 델트 플라이']),
    ],
  },
  팔: {
    title: '팔 (Arms - 이두 & 삼두)',
    desc: '팔 앞쪽(이두근)과 뒤쪽(삼두근)을 집중 공략하는 운동 모음입니다.',
    groups: [
      group('machine', ['케이블 푸시다운', '프리처 컬 머신', '케이블 바이셉 컬']),
      group('bodyweight', ['벤치 딥스', '클로즈 그립 푸시업']),
      group('free', ['덤벨 바이셉 컬', '해머 컬', '오버헤드 덤벨 트라이셉스 익스텐션', '덤벨 킥백', '바벨 덤벨 컬']),
    ],
  },
  복근: {
    title: '복근 및 코어 (Abdominals & Core)',
    desc: '복직근, 복사근 및 몸의 중심축인 코어를 강화하는 운동 모음입니다.',
    groups: [
      group('machine', ['앱 크런치 머신', '케이블 크런치', '로만 체어 (하이퍼익스텐션)']),
      group('bodyweight', ['플랭크', '크런치', '레그 레이즈', '행잉 레그 레이즈', '마운틴 클라이머', '사이드 플랭크']),
      group('free', ['덤벨 사이드 벤드', '덤벨 러시안 트위스트', '덤벨 홀드 플랭크']),
    ],
  },
};
