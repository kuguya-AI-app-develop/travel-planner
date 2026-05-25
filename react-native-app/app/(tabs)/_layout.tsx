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
          title: '首页',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏠</Text>,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '日历',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📅</Text>,
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
      <Tabs.Screen
        name="itinerary"
        options={{
          title: '行程',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
        }}
      />
      <Tabs.Screen
        name="summary"
        options={{
          title: '总结',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📝</Text>,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: '更多',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>⋯</Text>,
        }}
      />
    </Tabs>
  )
}
