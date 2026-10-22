/**
 * 헬스 플래닛 - 주간 헬스 계획표
 *
 * @format
 */

import React, { useState } from 'react';
import { Modal, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import WeeklyPlanScreen from './src/screens/WeeklyPlanScreen';
import { colors, radius } from './src/theme';

// 메뉴는 1.0에서 '이번 주 헬스계획표' 하나. 이후 항목을 여기에 추가.
const MENU = [{ key: 'weekly', label: '이번 주 헬스계획표', icon: '📅' }] as const;
type MenuKey = (typeof MENU)[number]['key'];

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const insets = useSafeAreaInsets();
  const [menuOpen, setMenuOpen] = useState(false);
  const [screen, setScreen] = useState<MenuKey>('weekly');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.brand}>
          <Text style={styles.logo}>🪐</Text>
          <Text style={styles.brandText}>헬스 플래닛</Text>
        </View>
        <Pressable style={styles.menuBtn} onPress={() => setMenuOpen(true)} hitSlop={10}>
          <View style={styles.bar} />
          <View style={[styles.bar, styles.barShort]} />
          <View style={styles.bar} />
        </Pressable>
      </View>

      <View style={[styles.body, { paddingBottom: insets.bottom }]}>
        {screen === 'weekly' && <WeeklyPlanScreen />}
      </View>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
          <View style={[styles.menu, { marginTop: insets.top + 60 }]}>
            <Text style={styles.menuTitle}>메뉴</Text>
            {MENU.map(m => (
              <Pressable
                key={m.key}
                style={[styles.menuItem, screen === m.key && styles.menuItemOn]}
                onPress={() => {
                  setScreen(m.key);
                  setMenuOpen(false);
                }}>
                <Text style={styles.menuIcon}>{m.icon}</Text>
                <Text style={styles.menuLabel}>{m.label}</Text>
              </Pressable>
            ))}
            <Text style={styles.version}>v1.0</Text>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { fontSize: 22 },
  brandText: { color: colors.text, fontSize: 19, fontWeight: '900', letterSpacing: -0.3 },
  menuBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  bar: { width: 18, height: 2, borderRadius: 1, backgroundColor: colors.text },
  barShort: { width: 12, alignSelf: 'center' },
  body: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'flex-end', paddingRight: 16 },
  menu: {
    width: 260,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  menuTitle: { color: colors.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 1, margin: 8 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: radius.md },
  menuItemOn: { backgroundColor: colors.surfaceHigh },
  menuIcon: { fontSize: 18 },
  menuLabel: { color: colors.text, fontSize: 16, fontWeight: '700' },
  version: { color: colors.textFaint, fontSize: 11, textAlign: 'right', margin: 8 },
});

export default App;
