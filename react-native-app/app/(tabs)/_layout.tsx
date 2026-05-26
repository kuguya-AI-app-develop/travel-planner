import { Tabs } from 'expo-router'
import { Text } from 'react-native'

export default function TabsLayout() {
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
          title: '行程日历',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📅</Text>,
        }}
      />
      <Tabs.Screen
        name="flights"
        options={{
          title: '机票对比',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>✈️</Text>,
        }}
      />
      <Tabs.Screen
        name="destinations"
        options={{
          title: '目的地',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📍</Text>,
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
        name="more"
        options={{
          title: '更多',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⋯</Text>,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '行程日历',
          href: null,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: '其他消费',
          href: null,
        }}
      />
      <Tabs.Screen
        name="packing"
        options={{
          title: '行李清单',
          href: null,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: '证件管理',
          href: null,
        }}
      />
      <Tabs.Screen
        name="itinerary"
        options={{
          title: '每日行程',
          href: null,
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: '预算总结',
          href: null,
        }}
      />
    </Tabs>
  )
}
