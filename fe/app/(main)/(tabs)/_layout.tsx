import { Image } from 'expo-image'
import { Tabs, useRouter } from 'expo-router'
import React from 'react'

const TabLayout = () => {
  const router = useRouter()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "rgba(79,70,229,1)",
        tabBarInactiveTintColor: "rgba(205,201,255,1)",
        tabBarStyle: {
          backgroundColor: "rgba(238, 237, 255, 1)",
          borderTopWidth: 0,
          paddingBottom: 10,
          paddingTop: 10,
          height: 65,
        },
        headerShown: false
      }}
    >
      <Tabs.Screen name="index" options={{
        tabBarLabel: "Home",
        tabBarIcon: ({ focused }) => (
          <Image
            source={focused ? require("@/assets/images/tabs/home.svg") : require("@/assets/images/tabs/home2.svg")}
            contentFit="contain"
            style={{ width: 24, height: 24 }}
          />
        )
      }} />
      <Tabs.Screen name="events" options={{
        tabBarLabel: "My Events",
        tabBarIcon: ({ focused }) => (
          <Image
            source={focused ? require("@/assets/images/tabs/event.svg") : require("@/assets/images/tabs/event2.svg")}
            contentFit="contain"
            style={{ width: 24, height: 24 }}
          />
        )
      }} />
      <Tabs.Screen
        name="create"
        options={{
          tabBarLabel: "",
          tabBarIcon: () => (
            <Image
              source={require("@/assets/images/tabs/plus.svg")}
              contentFit="contain"
              style={{ width: 60, height: 60, marginTop: 12 }}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault()
            router.push("/create-event")
          },
        }}
      />
      <Tabs.Screen name="saved" options={{
        tabBarLabel: "Saved",
        tabBarIcon: ({ focused }) => (
          <Image
            source={require("@/assets/images/tabs/saved.svg")}
            contentFit="contain"
            style={{ width: 24, height: 24 }}
            tintColor={focused ? "rgba(79,70,229,1)" : "rgba(205,201,255,1)"}
          />
        )
      }} />
      <Tabs.Screen name="profile" options={{
        tabBarLabel: "Profile",
        tabBarIcon: ({ focused }) => (
          <Image
            source={focused ? require("@/assets/images/tabs/profile.svg") : require("@/assets/images/tabs/profile2.svg")}
            contentFit="contain"
            style={{ width: 24, height: 24 }}
          />
        )
      }} />
    </Tabs>
  )
}

export default TabLayout