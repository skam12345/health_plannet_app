import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { colors } from '../theme';
import { CANVAS_H, CANVAS_W, GROUND, LEN, Motion, Segment, Skeleton, interpolate, solve } from './pose';

const BODY = '#E5E7EB';
const BODY_FAR = '#6B7280';
const FOCUS = colors.cardioOn;
const FOCUS_FAR = '#1E40AF';
const METAL = '#9CA3AF';
const PLATE = '#F59E0B';
const FURNITURE = '#374151';

type P = [number, number];

/** 두 점을 잇는 둥근 막대 */
function Seg({ a, b, w, color, z }: { a: P; b: P; w: number; color: string; z?: number }) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.max(Math.hypot(dx, dy), 0.01);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (
    <View
      style={[styles.abs, {
        left: (a[0] + b[0]) / 2 - (len + w) / 2,
        top: (a[1] + b[1]) / 2 - w / 2,
        width: len + w,
        height: w,
        borderRadius: w / 2,
        backgroundColor: color,
        transform: [{ rotate: `${angle}deg` }],
        zIndex: z,
      }]}
    />
  );
}

function Dot({ p, r, color, z, ring }: { p: P; r: number; color: string; z?: number; ring?: string }) {
  const border = ring ? 2 : 0;
  return (
    <View
      style={[styles.abs, {
        left: p[0] - r,
        top: p[1] - r,
        width: r * 2,
        height: r * 2,
        borderRadius: r,
        backgroundColor: color,
        borderWidth: border,
        borderColor: ring,
        zIndex: z,
      }]}
    />
  );
}

function useLoop(period: number, frozen?: number) {
  const [t, setT] = useState(frozen ?? 0);
  useEffect(() => {
    if (frozen !== undefined) return;
    let raf = 0;
    let last = 0;
    const start = Date.now();
    const tick = () => {
      const now = Date.now();
      if (now - last > 33) {
        last = now;
        const phase = ((now - start) % period) / period;
        // 부드러운 왕복 (0 → 1 → 0)
        setT((1 - Math.cos(phase * 2 * Math.PI)) / 2);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [period, frozen]);
  return frozen ?? t;
}

type Props = {
  motion: Motion;
  focus: Segment[];
  scale?: number;
  /** 고정 프레임(0~1). 지정하면 애니메이션하지 않음 */
  frozen?: number;
};

export default function ExerciseFigure({ motion, focus, scale = 1, frozen }: Props) {
  const t = useLoop(motion.period ?? 2400, frozen);
  const view = motion.view ?? 'side';
  const s: Skeleton = solve(interpolate(motion.a, motion.b, t), view, motion.fix, motion.at);
  const f = (seg: Segment, far = false) =>
    focus.includes(seg) ? (far ? FOCUS_FAR : FOCUS) : far ? BODY_FAR : BODY;
  const far = view === 'side'; // 옆모습일 때 먼 쪽 팔다리를 흐리게

  const equip = motion.equip ?? [];
  const has = (k: string) => equip.some(e => e.t === k);

  return (
    <View style={[styles.canvas, { transform: [{ scale }] }]}>
      {/* 바닥 */}
      {motion.ground !== false && <View style={[styles.ground, { top: GROUND }]} />}

      {/* 고정 기구 */}
      {equip.map((e, i) => {
        if (e.t === 'rect') {
          return (
            <View
              key={i}
              style={[styles.furniture, {
                left: e.x,
                top: e.y,
                width: e.w,
                height: e.h,
                transform: e.angle ? [{ rotate: `${e.angle}deg` }] : undefined,
              }]}
            />
          );
        }
        if (e.t === 'bar') return <Seg key={i} a={[20, e.y]} b={[220, e.y]} w={4} color={METAL} />;
        if (e.t === 'rails') {
          return e.xs.map(x => <Seg key={`${i}-${x}`} a={[x, 10]} b={[x, GROUND]} w={3} color={FURNITURE} />);
        }
        if (e.t === 'cable') {
          return (
            <React.Fragment key={i}>
              <Seg a={e.from} b={s.hand} w={2} color={METAL} />
              <Dot p={e.from} r={5} color={FURNITURE} ring={METAL} />
            </React.Fragment>
          );
        }
        return null;
      })}

      {/* 먼 쪽 팔다리 */}
      <Seg a={s.hip2} b={s.knee2} w={11} color={f('thigh', far)} />
      <Seg a={s.knee2} b={s.ankle2} w={9} color={f('shin', far)} />
      <Seg a={s.ankle2} b={s.toe2} w={6} color={far ? BODY_FAR : BODY} />
      <Seg a={s.shoulder2} b={s.elbow2} w={8} color={f('upperArm', far)} />
      <Seg a={s.elbow2} b={s.hand2} w={7} color={f('foreArm', far)} />
      {view === 'front' && has('db') && <Seg a={[s.hand2[0] - 7, s.hand2[1]]} b={[s.hand2[0] + 7, s.hand2[1]]} w={6} color={METAL} />}

      {/* 몸통 + 머리 */}
      <Seg a={s.hip} b={view === 'front' ? s.neck : s.shoulder} w={view === 'front' ? 24 : 15} color={f('torso')} />
      <Seg a={s.shoulder} b={s.neck} w={7} color={BODY} />
      <Dot p={s.head} r={LEN.head} color={BODY} />

      {/* 가까운 쪽 다리 */}
      <Seg a={s.hip1} b={s.knee} w={11} color={f('thigh')} />
      <Seg a={s.knee} b={s.ankle} w={9} color={f('shin')} />
      <Seg a={s.ankle} b={s.toe} w={6} color={BODY} />

      {/* 몸에 붙는 기구 */}
      {has('bbShoulder') && <Dot p={s.shoulder} r={14} color={PLATE} ring={FURNITURE} z={2} />}
      {has('footPlate') && (
        <Seg
          a={[s.ankle[0] + (s.toe[0] - s.ankle[0]) * 0.3 - 2, s.ankle[1] - 18]}
          b={[s.ankle[0] + (s.toe[0] - s.ankle[0]) * 0.3 + 6, s.ankle[1] + 18]}
          w={6}
          color={METAL}
        />
      )}
      {has('anklePad') && <Dot p={s.ankle} r={7} color={FURNITURE} ring={METAL} />}

      {/* 가까운 쪽 팔 */}
      <Seg a={s.shoulder} b={s.elbow} w={8} color={f('upperArm')} z={3} />
      <Seg a={s.elbow} b={s.hand} w={7} color={f('foreArm')} z={3} />
      {has('db') && view === 'side' && <Dot p={s.hand} r={7} color={METAL} ring={FURNITURE} z={4} />}
      {has('db') && view === 'front' && (
        <Seg a={[s.hand[0] - 7, s.hand[1]]} b={[s.hand[0] + 7, s.hand[1]]} w={6} color={METAL} z={4} />
      )}
      {has('bb') && <Dot p={s.hand} r={13} color={PLATE} ring={FURNITURE} z={4} />}
      {has('handle') && <Dot p={s.hand} r={5} color={METAL} z={4} />}
    </View>
  );
}

const styles = StyleSheet.create({
  abs: { position: 'absolute' },
  furniture: { position: 'absolute', borderRadius: 4, backgroundColor: FURNITURE },
  canvas: { width: CANVAS_W, height: CANVAS_H, overflow: 'hidden' },
  ground: {
    position: 'absolute',
    left: 10,
    right: 10,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.border,
  },
});
