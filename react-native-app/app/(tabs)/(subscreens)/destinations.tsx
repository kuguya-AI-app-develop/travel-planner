import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadows } from '../../../src/theme';
import { useApp } from '../../../src/store/AppContext';
import { BackHeader } from '../../../src/components/BackHeader';
import { ScoreBar } from '../../../src/components/ScoreBar';
import { AddButton } from '../../../src/components/AddButton';
import { Toast } from '../../../src/components/Toast';
import { useToast } from '../../../src/hooks/useToast';

const DEST_CRITERIA = ['景色', '文化', '美食', '交通便利', '安全性', '性价比'];

export default function DestinationsScreen() {
  const { state, dispatch } = useApp();
  const { visible, message, showToast, hideToast } = useToast();

  const handleToggleDest = (id: number) => {
    dispatch({ type: 'TOGGLE_DEST', payload: id });
  };

  const handleAddDest = () => {
    const newDest = {
      id: Date.now(),
      name: '新目的地',
      country: '国家',
      notes: '',
      scores: DEST_CRITERIA.map(() => 3),
      selected: false,
    };
    dispatch({ type: 'ADD_DEST', payload: newDest });
    showToast('已添加目的地');
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <BackHeader title="目的地选择" />

        <Text style={styles.hint}>
          评估各目的地优缺点
        </Text>

        {state.destinations.map((dest) => {
          const avg = (dest.scores.reduce((a, b) => a + b, 0) / dest.scores.length).toFixed(1);

          return (
            <View key={dest.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <TouchableOpacity
                  onPress={() => handleToggleDest(dest.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    dest.selected && styles.checkboxSelected,
                  ]}>
                    {dest.selected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>

                <View style={styles.destInfo}>
                  <Text style={styles.destName}>{dest.name}</Text>
                  <Text style={styles.destCountry}>{dest.country}</Text>
                </View>
              </View>

              {dest.notes && (
                <Text style={styles.destNotes}>{dest.notes}</Text>
              )}

              <View style={styles.scores}>
                {DEST_CRITERIA.map((criteria, index) => (
                  <ScoreBar
                    key={criteria}
                    label={criteria}
                    score={dest.scores[index]}
                    color={Colors.coral}
                  />
                ))}
              </View>

              <View style={styles.overall}>
                <Text style={styles.overallLabel}>综合评分</Text>
                <Text style={styles.overallScore}>{avg}</Text>
              </View>
            </View>
          );
        })}

        <AddButton label="添加目的地" onPress={handleAddDest} />

        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      <Toast visible={visible} message={message} onHide={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
  },
  hint: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    fontSize: Typography.sm,
    color: Colors.muted,
  },
  card: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkmark: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: Typography.bold,
  },
  destInfo: {
    flex: 1,
  },
  destName: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
  },
  destCountry: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginTop: 2,
  },
  destNotes: {
    fontSize: Typography.sm,
    color: Colors.muted,
    marginBottom: Spacing.md,
  },
  scores: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  overall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  overallLabel: {
    fontSize: Typography.sm,
    color: Colors.muted,
  },
  overallScore: {
    fontFamily: Typography.mono,
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.coral,
  },
});
