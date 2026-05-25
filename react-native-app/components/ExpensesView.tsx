import React, { useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Expense } from '../types';

const STATUS_CONFIG: Record<Expense['status'], { label: string; color: string; bg: string }> = {
  paid: { label: '已支付', color: '#34C759', bg: '#E8F5E9' },
  booked: { label: '已预订', color: '#FF9500', bg: '#FFF3E0' },
  planned: { label: '计划中', color: '#007AFF', bg: '#E3F2FD' },
};

const CATEGORY_COLORS: Record<string, string> = {
  '交通': '#FF6B6B',
  '住宿': '#4ECDC4',
  '餐饮': '#FFE66D',
  '门票': '#A78BFA',
  '购物': '#F472B6',
  '其他': '#94A3B8',
};

interface ExpensesViewProps {
  expenses: Expense[];
  onPressExpense: (expense: Expense) => void;
}

export default function ExpensesView({ expenses, onPressExpense }: ExpensesViewProps) {
  const totals = expenses.reduce(
    (acc, e) => {
      acc[e.status] += e.amount;
      acc.total += e.amount;
      return acc;
    },
    { paid: 0, booked: 0, planned: 0, total: 0 }
  );

  const renderItem = useCallback(({ item }: { item: Expense }) => {
    const st = STATUS_CONFIG[item.status];
    const catColor = CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS['其他'];
    return (
      <TouchableOpacity style={styles.card} onPress={() => onPressExpense(item)} activeOpacity={0.7}>
        <View style={styles.cardHeader}>
          <Text style={styles.name}>{item.name || '未命名'}</Text>
          <Text style={styles.amount}>{item.amount > 0 ? `¥${item.amount.toLocaleString()}` : '待定'}</Text>
        </View>
        <View style={styles.cardFooter}>
          <View style={[styles.categoryTag, { backgroundColor: catColor + '20' }]}>
            <Text style={[styles.categoryText, { color: catColor }]}>{item.category}</Text>
          </View>
          <View style={[styles.statusTag, { backgroundColor: st.bg }]}>
            <Text style={[styles.statusText, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>
        {item.note ? <Text style={styles.note}>{item.note}</Text> : null}
      </TouchableOpacity>
    );
  }, [onPressExpense]);

  if (expenses.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>💰</Text>
        <Text style={styles.emptyTitle}>还没有费用记录</Text>
        <Text style={styles.emptySubtitle}>点击右下角按钮添加费用</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={expenses}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: '#34C759' }]}>已支付</Text>
            <Text style={styles.summaryValue}>¥{totals.paid.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: '#FF9500' }]}>已预订</Text>
            <Text style={styles.summaryValue}>¥{totals.booked.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryLabel, { color: '#007AFF' }]}>计划中</Text>
            <Text style={styles.summaryValue}>¥{totals.planned.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>总计</Text>
            <Text style={[styles.summaryValue, styles.totalValue]}>¥{totals.total.toLocaleString()}</Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
    marginRight: 8,
  },
  amount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  note: {
    fontSize: 13,
    color: '#888',
    marginTop: 8,
  },
  summary: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  totalValue: {
    color: '#FF6B6B',
    fontWeight: '700',
  },
});
