import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Plan, ChecklistItem } from '../types';

interface SummaryViewProps {
  plan: Plan;
  onToggleChecklist: (item: ChecklistItem) => void;
}

interface CollapsibleProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function Collapsible({ title, icon, children, defaultExpanded = true }: CollapsibleProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  return (
    <View style={styles.section}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.chevron}>{expanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      {expanded && <View style={styles.sectionBody}>{children}</View>}
    </View>
  );
}

export default function SummaryView({ plan, onToggleChecklist }: SummaryViewProps) {
  const selectedFlights = plan.flights.filter((f) => f.selected);
  const selectedHotels = plan.hotels.filter((h) => h.selected);
  const selectedDestinations = plan.destinations.filter((d) => d.selected);

  const expenseTotals = plan.expenses.reduce(
    (acc, e) => {
      acc[e.status] += e.amount;
      acc.total += e.amount;
      return acc;
    },
    { paid: 0, booked: 0, planned: 0, total: 0 }
  );

  const handleToggle = useCallback(
    (item: ChecklistItem) => onToggleChecklist(item),
    [onToggleChecklist]
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 行程概要 */}
      <Collapsible title="行程概要" icon="🗺">
        {plan.trips.length === 0 ? (
          <Text style={styles.emptyText}>暂无行程</Text>
        ) : (
          plan.trips.map((trip) => (
            <View key={trip.id} style={styles.tripRow}>
              <View style={[styles.tripColor, { backgroundColor: trip.color }]} />
              <View style={styles.tripInfo}>
                <Text style={styles.tripName}>{trip.name}</Text>
                <Text style={styles.tripDate}>
                  {trip.start} ~ {trip.end}
                </Text>
              </View>
            </View>
          ))
        )}
      </Collapsible>

      {/* 已选航班 */}
      <Collapsible title="已选航班" icon="✈">
        {selectedFlights.length === 0 ? (
          <Text style={styles.emptyText}>未选择航班</Text>
        ) : (
          selectedFlights.map((f) => (
            <View key={f.id} style={styles.flightCard}>
              <View style={styles.flightHeader}>
                <Text style={styles.flightAirline}>{f.airline}</Text>
                <Text style={styles.flightCode}>{f.code}</Text>
              </View>
              <Text style={styles.flightRoute}>{f.route}</Text>
              <View style={styles.flightFooter}>
                <Text style={styles.flightTime}>
                  {f.dep} → {f.arr}
                </Text>
                <Text style={styles.flightPrice}>¥{f.price.toLocaleString()}</Text>
              </View>
            </View>
          ))
        )}
      </Collapsible>

      {/* 已选酒店 */}
      <Collapsible title="已选酒店" icon="🏨">
        {selectedHotels.length === 0 ? (
          <Text style={styles.emptyText}>未选择酒店</Text>
        ) : (
          selectedHotels.map((h) => (
            <View key={h.id} style={styles.hotelCard}>
              <Text style={styles.hotelName}>{h.name}</Text>
              <View style={styles.hotelFooter}>
                <Text style={styles.hotelLocation}>{h.location}</Text>
                <Text style={styles.hotelPrice}>{h.price}</Text>
              </View>
            </View>
          ))
        )}
      </Collapsible>

      {/* 已选目的地 */}
      <Collapsible title="已选目的地" icon="📍">
        {selectedDestinations.length === 0 ? (
          <Text style={styles.emptyText}>未选择目的地</Text>
        ) : (
          selectedDestinations.map((d) => (
            <View key={d.id} style={styles.destCard}>
              <Text style={styles.destName}>{d.name}</Text>
              <Text style={styles.destCountry}>{d.country}</Text>
            </View>
          ))
        )}
      </Collapsible>

      {/* 费用统计 */}
      <Collapsible title="费用统计" icon="💰">
        <View style={styles.expenseGrid}>
          <View style={styles.expenseItem}>
            <Text style={[styles.expenseLabel, { color: '#34C759' }]}>已支付</Text>
            <Text style={styles.expenseValue}>¥{expenseTotals.paid.toLocaleString()}</Text>
          </View>
          <View style={styles.expenseItem}>
            <Text style={[styles.expenseLabel, { color: '#FF9500' }]}>已预订</Text>
            <Text style={styles.expenseValue}>¥{expenseTotals.booked.toLocaleString()}</Text>
          </View>
          <View style={styles.expenseItem}>
            <Text style={[styles.expenseLabel, { color: '#007AFF' }]}>计划中</Text>
            <Text style={styles.expenseValue}>¥{expenseTotals.planned.toLocaleString()}</Text>
          </View>
          <View style={styles.expenseItem}>
            <Text style={styles.expenseLabel}>总计</Text>
            <Text style={[styles.expenseValue, styles.totalValue]}>
              ¥{expenseTotals.total.toLocaleString()}
            </Text>
          </View>
        </View>
      </Collapsible>

      {/* 待办清单 */}
      <Collapsible title="待办清单" icon="✅">
        {plan.checklist.length === 0 ? (
          <Text style={styles.emptyText}>暂无待办事项</Text>
        ) : (
          plan.checklist.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.checkItem}
              onPress={() => handleToggle(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.checkBox}>{item.done ? '☑' : '☐'}</Text>
              <Text style={[styles.checkText, item.done && styles.checkDone]}>
                {item.text}
              </Text>
            </TouchableOpacity>
          ))
        )}
      </Collapsible>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  chevron: {
    fontSize: 12,
    color: '#999',
  },
  sectionBody: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    paddingVertical: 8,
  },

  /* Trips */
  tripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tripColor: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 10,
  },
  tripInfo: { flex: 1 },
  tripName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  tripDate: { fontSize: 13, color: '#999', marginTop: 2 },

  /* Flights */
  flightCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  flightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  flightAirline: { fontSize: 14, fontWeight: '600', color: '#1a1a1a' },
  flightCode: { fontSize: 14, color: '#007AFF', fontWeight: '500' },
  flightRoute: { fontSize: 13, color: '#666', marginBottom: 6 },
  flightFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  flightTime: { fontSize: 13, color: '#666' },
  flightPrice: { fontSize: 14, fontWeight: '700', color: '#FF6B6B' },

  /* Hotels */
  hotelCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  hotelName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  hotelFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hotelLocation: { fontSize: 13, color: '#666' },
  hotelPrice: { fontSize: 14, fontWeight: '600', color: '#FF6B6B' },

  /* Destinations */
  destCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  destName: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  destCountry: { fontSize: 13, color: '#999' },

  /* Expenses */
  expenseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  expenseItem: {
    width: '47%',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  expenseLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  expenseValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  totalValue: {
    color: '#FF6B6B',
  },

  /* Checklist */
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  checkBox: {
    fontSize: 18,
    marginRight: 10,
    color: '#007AFF',
  },
  checkText: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a1a',
  },
  checkDone: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
});
