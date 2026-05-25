import { Tabs, useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';

export default function PlanDetailLayout() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '概览',
          headerTitle: `计划 #${id}`,
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📊</Text>,
        }}
      />
      <Tabs.Screen
        name="itinerary"
        options={{
          title: '行程',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="flights"
        options={{
          title: '航班',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>✈️</Text>,
        }}
      />
      <Tabs.Screen
        name="hotels"
        options={{
          title: '酒店',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏨</Text>,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: '费用',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>💰</Text>,
        }}
      />
      <Tabs.Screen
        name="packing"
        options={{
          title: '打包',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎒</Text>,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: '文档',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📄</Text>,
        }}
      />
    </Tabs>
  );
}
