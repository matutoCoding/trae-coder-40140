import React, { useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useQueueStore } from '@/store/queueStore';
import styles from './index.module.scss';

const MinePage: React.FC = () => {
  const { currentPatient, queueRecords, missedRecords } = useQueueStore();

  const stats = useMemo(() => {
    const patientRecords = queueRecords.filter(r => r.patientId === currentPatient.id);
    return {
      total: patientRecords.length,
      waiting: patientRecords.filter(r => r.status === 'waiting').length,
      completed: patientRecords.filter(r => r.status === 'completed').length,
      missed: missedRecords.filter(m => m.patientId === currentPatient.id).length
    };
  }, [queueRecords, missedRecords, currentPatient.id]);

  const menuGroups = [
    {
      title: '我的服务',
      items: [
        { icon: '📋', label: '我的挂号', iconClass: 'blue', badge: stats.waiting || undefined },
        { icon: '📅', label: '就诊记录', iconClass: 'green' },
        { icon: '⏰', label: '过号记录', iconClass: 'orange' },
        { icon: '💊', label: '处方记录', iconClass: 'purple' }
      ]
    },
    {
      title: '帮助中心',
      items: [
        { icon: '❓', label: '常见问题', iconClass: 'blue' },
        { icon: '📞', label: '联系我们', iconClass: 'green' },
        { icon: '⚙️', label: '设置', iconClass: 'orange' }
      ]
    }
  ];

  const handleMenuClick = (label: string) => {
    Taro.showToast({
      title: `${label}功能开发中`,
      icon: 'none'
    });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.userCard}>
          <View className={styles.avatar}>
            <Text className={styles.avatarText}>
              {currentPatient.name.charAt(0)}
            </Text>
          </View>
          <View className={styles.userInfo}>
            <Text className={styles.userName}>{currentPatient.name}</Text>
            <Text className={styles.userMeta}>
              {currentPatient.gender === 'male' ? '男' : '女'} · {currentPatient.age}岁
            </Text>
            <Text className={styles.userMeta}>{currentPatient.phone}</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY>
        <View className={styles.statsSection}>
          <Text className={styles.statsTitle}>我的数据</Text>
          <View className={styles.statsGrid}>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{stats.total}</Text>
              <Text className={styles.statLabel}>总挂号</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{stats.waiting}</Text>
              <Text className={styles.statLabel}>等待中</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{stats.completed}</Text>
              <Text className={styles.statLabel}>已完成</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statNumber}>{stats.missed}</Text>
              <Text className={styles.statLabel}>过号</Text>
            </View>
          </View>
        </View>

        {menuGroups.map((group, groupIndex) => (
          <View key={groupIndex} className={styles.menuSection}>
            <Text className={styles.menuTitle}>{group.title}</Text>
            <View className={styles.menuList}>
              {group.items.map((item, itemIndex) => (
                <View 
                  key={itemIndex} 
                  className={styles.menuItem}
                  onClick={() => handleMenuClick(item.label)}
                >
                  <View className={`${styles.menuIcon} ${styles[item.iconClass]}`}>
                    <Text>{item.icon}</Text>
                  </View>
                  <View className={styles.menuContent}>
                    <Text className={styles.menuText}>
                      {item.badge && <Text className={styles.menuBadge}>{item.badge}</Text>}
                      {item.label}
                    </Text>
                    <Text className={styles.menuArrow}>›</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View className={styles.aboutSection}>
          <Text className={styles.aboutText}>
            精神科门诊排号系统
          </Text>
          <Text className={styles.versionText}>版本 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default MinePage;
