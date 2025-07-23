import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { User, Bell, Shield, Palette, Volume2, Camera, Mic, CircleHelp as HelpCircle, LogOut, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const settingsGroups = [
    {
      title: 'Profile',
      items: [
        {
          icon: User,
          title: 'Personal Information',
          subtitle: 'Update your profile details',
          onPress: () => {},
        },
        {
          icon: Shield,
          title: 'Privacy Settings',
          subtitle: 'Manage your data and privacy',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'App Preferences',
      items: [
        {
          icon: Bell,
          title: 'Notifications',
          subtitle: 'Practice reminders and updates',
          component: (
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#8B5CF6' }}
              thumbColor="#FFF"
            />
          ),
        },
        {
          icon: Palette,
          title: 'Dark Mode',
          subtitle: 'Toggle app appearance',
          component: (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#8B5CF6' }}
              thumbColor="#FFF"
            />
          ),
        },
      ],
    },
    {
      title: 'Permissions',
      items: [
        {
          icon: Camera,
          title: 'Camera Access',
          subtitle: 'Enable for facial expression analysis',
          component: (
            <Switch
              value={cameraEnabled}
              onValueChange={setCameraEnabled}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#8B5CF6' }}
              thumbColor="#FFF"
            />
          ),
        },
        {
          icon: Mic,
          title: 'Microphone Access',
          subtitle: 'Enable for voice tone analysis',
          component: (
            <Switch
              value={micEnabled}
              onValueChange={setMicEnabled}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#8B5CF6' }}
              thumbColor="#FFF"
            />
          ),
        },
        {
          icon: Volume2,
          title: 'Audio Settings',
          subtitle: 'Adjust voice feedback preferences',
          onPress: () => {},
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          onPress: () => {},
        },
        {
          icon: LogOut,
          title: 'Sign Out',
          subtitle: 'Log out of your account',
          onPress: () => {},
          destructive: true,
        },
      ],
    },
  ];

  return (
    <LinearGradient
      colors={['#0F0F19', '#1A1A2E', '#16213E']}
      style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.titleText}>Settings</Text>
          <Text style={styles.subtitleText}>
            Customize your experience and manage preferences
          </Text>
        </View>

        {/* User Profile Card */}
        <View style={styles.profileCard}>
          <BlurView intensity={20} style={styles.profileBlur}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.3)', 'rgba(59, 130, 246, 0.3)']}
              style={styles.profileGradient}>
              <View style={styles.profileContent}>
                <View style={styles.avatar}>
                  <LinearGradient
                    colors={['#8B5CF6', '#3B82F6']}
                    style={styles.avatarGradient}>
                    <User size={32} color="#FFF" />
                  </LinearGradient>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>Alex Johnson</Text>
                  <Text style={styles.profileEmail}>alex.johnson@email.com</Text>
                  <Text style={styles.profileLevel}>Confidence Level: Advanced</Text>
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={groupIndex} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupCard}>
              <BlurView intensity={15} style={styles.groupBlur}>
                <View style={styles.groupContent}>
                  {group.items.map((item, itemIndex) => (
                    <TouchableOpacity
                      key={itemIndex}
                      style={[
                        styles.settingItem,
                        itemIndex < group.items.length - 1 && styles.settingItemBorder,
                      ]}
                      onPress={item.onPress}
                      disabled={!item.onPress}>
                      <View style={styles.settingLeft}>
                        <View style={[
                          styles.settingIcon,
                          item.destructive && styles.settingIconDestructive
                        ]}>
                          <item.icon 
                            size={20} 
                            color={item.destructive ? '#EF4444' : '#8B5CF6'} 
                          />
                        </View>
                        <View style={styles.settingText}>
                          <Text style={[
                            styles.settingTitle,
                            item.destructive && styles.settingTitleDestructive
                          ]}>
                            {item.title}
                          </Text>
                          <Text style={styles.settingSubtitle}>
                            {item.subtitle}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.settingRight}>
                        {item.component || (
                          <ChevronRight 
                            size={20} 
                            color="rgba(255, 255, 255, 0.4)" 
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </BlurView>
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.versionSubtext}>
            Build 2024.1.1 • Made with confidence
          </Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  titleText: {
    fontSize: 32,
    color: '#FFF',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
  profileCard: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileBlur: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileGradient: {
    borderRadius: 20,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  avatar: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  profileLevel: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  settingsGroup: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  groupTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  groupBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  groupContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingIconDestructive: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  settingTitleDestructive: {
    color: '#EF4444',
  },
  settingSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  settingRight: {
    marginLeft: 16,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '600',
  },
  versionSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    marginTop: 4,
  },
});