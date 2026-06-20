import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useQueueStore } from '@/store/queueStore';
import StatusBadge from '@/components/StatusBadge';
import { formatDuration, formatTime } from '@/utils/time';
import styles from './index.module.scss';

const QueuePage: React.FC = () => {
  const {
    clinics,
    selectedClinicId,
    setSelectedClinicId,
    getWaitingList,
    getCurrentCalling,
    getVisitingRecord,
    callNext,
    confirmVisit,
    markMissed,
    queueRecords
  } = useQueueStore();

  const [activeClinic, setActiveClinic] = useState(selectedClinicId);

  const openClinics = useMemo(() => 
    clinics.filter(c => c.status === 'open'),
    [clinics]
  );

  const waitingList = useMemo(() => 
    getWaitingList(activeClinic),
    [getWaitingList, activeClinic]
  );

  const currentCalling = useMemo(() => 
    getCurrentCalling(activeClinic),
    [getCurrentCalling, activeClinic]
  );

  const visitingRecord = useMemo(() => 
    getVisitingRecord(activeClinic),
    [getVisitingRecord, activeClinic]
  );

  const stats = useMemo(() => {
    const clinicRecords = queueRecords.filter(r => r.clinicId === activeClinic);
    return {
      waiting: clinicRecords.filter(r => r.status === 'waiting').length,
      calling: clinicRecords.filter(r => r.status === 'calling').length,
      visiting: clinicRecords.filter(r => r.status === 'visiting').length,
      completed: clinicRecords.filter(r => r.status === 'completed').length,
      missed: clinicRecords.filter(r => r.status === 'missed').length
    };
  }, [queueRecords, activeClinic]);

  const handleClinicChange = (clinicId: string) => {
    setActiveClinic(clinicId);
    setSelectedClinicId(clinicId);
  };

  const handleCallNext = () => {
    if (waitingList.length === 0) {
      Taro.showToast({ title: '暂无等待患者', icon: 'none' });
      return;
    }
    if (currentCalling) {
      Taro.showToast({ title: '请先处理当前叫号', icon: 'none' });
      return;
    }
    callNext(activeClinic);
    Taro.showToast({ title: '已叫号', icon: 'success' });
  };

  const handleConfirmVisit = () => {
    if (!currentCalling) return;
    confirmVisit(currentCalling.id);
    Taro.showToast({ title: '已确认就诊', icon: 'success' });
  };

  const handleMarkMissed = () => {
    if (!currentCalling) return;
    markMissed(currentCalling.id);
    Taro.showToast({ title: '已标记过号', icon: 'none' });
  };

  const handleTakeNumber = () => {
    Taro.navigateTo({ url: '/pages/take-number/index' });
  };

  const handleCrisisAssess = () => {
    Taro.navigateTo({ url: '/pages/crisis-assess/index' });
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>精神科门诊</Text>
        <Text className={styles.headerSubtitle}>智能排号系统</Text>
        
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.waiting}</Text>
            <Text className={styles.statLabel}>等待中</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.visiting + stats.calling}</Text>
            <Text className={styles.statLabel}>就诊中</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.completed}</Text>
            <Text className={styles.statLabel}>已完成</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.clinicSelector}>
          <Text className={styles.selectorLabel}>选择诊室</Text>
          <View className={styles.clinicTabs}>
            {openClinics.map(clinic => (
              <View
                key={clinic.id}
                className={classnames(styles.clinicTab, {
                  [styles.active]: activeClinic === clinic.id
                })}
                onClick={() => handleClinicChange(clinic.id)}
              >
                <Text>{clinic.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {visitingRecord && (
          <View className={styles.visitingSection}>
            <Text className={styles.sectionTitle}>当前就诊</Text>
            <View className={styles.visitingCard}>
              <View className={styles.visitingInfo}>
                <Text className={styles.visitingNumber}>{visitingRecord.queueNumber}</Text>
                <View>
                  <Text className={styles.visitingName}>{visitingRecord.patientName}</Text>
                  <Text className={styles.visitingLabel}>
                    {visitingRecord.treatmentItemNames.join(' + ')}
                  </Text>
                </View>
              </View>
              <View className={styles.visitingBadge}>就诊中</View>
            </View>
          </View>
        )}

        <View className={styles.currentCallingSection}>
          <Text className={styles.sectionTitle}>当前叫号</Text>
          {currentCalling ? (
            <>
              <View className={styles.callingCard}>
                <Text className={styles.callingNumber}>{currentCalling.queueNumber}</Text>
                <Text className={styles.callingPatient}>{currentCalling.patientName}</Text>
                <Text className={styles.callingClinic}>
                  {currentCalling.clinicName} · {currentCalling.treatmentItemNames.join(' + ')}
                </Text>
              </View>
              <View className={styles.callingActions}>
                <Button 
                  className={classnames(styles.actionBtn, styles.primary)}
                  onClick={handleConfirmVisit}
                >
                  确认就诊
                </Button>
                <Button 
                  className={classnames(styles.actionBtn, styles.warning)}
                  onClick={handleMarkMissed}
                >
                  过号
                </Button>
              </View>
            </>
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>暂无叫号</Text>
            </View>
          )}
        </View>

        <View className={styles.queueSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>排队队列</Text>
            <Text className={styles.queueCount}>共 {waitingList.length} 人</Text>
          </View>
          
          <View className={styles.queueList}>
            {waitingList.length > 0 ? (
              waitingList.slice(0, 8).map((record, index) => (
                <View key={record.id} className={styles.queueItem}>
                  <Text className={styles.queueNumber}>{record.queueNumber}</Text>
                  <View className={styles.queueInfo}>
                    <Text className={styles.queueName}>{record.patientName}</Text>
                    <Text className={styles.queueItemMeta}>
                      {record.treatmentItemNames.join(' + ')} · 预计{formatDuration(record.totalDuration)}
                    </Text>
                  </View>
                  <View className={styles.queueBadges}>
                    {record.priority !== 'normal' && (
                      <StatusBadge status={record.priority as any} size="sm" />
                    )}
                    {record.isMerged && (
                      <StatusBadge status="normal" text="合并" size="sm" />
                    )}
                    {index < 3 && (
                      <StatusBadge status="calling" text={`第${index + 1}位`} size="sm" />
                    )}
                  </View>
                </View>
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text className={styles.emptyText}>暂无排队患者</Text>
              </View>
            )}
          </View>

          {!currentCalling && waitingList.length > 0 && (
            <Button 
              className={classnames(styles.actionBtn, styles.ghost)}
              style={{ marginTop: '32rpx', width: '100%', height: '80rpx' }}
              onClick={handleCallNext}
            >
              呼叫下一位
            </Button>
          )}
        </View>
      </ScrollView>

      <View className={styles.crisisEntry} onClick={handleCrisisAssess}>
        <Text className={styles.crisisText}>🚨 危机评估</Text>
      </View>

      <View className={styles.fabButton} onClick={handleTakeNumber}>
        <Text className={styles.fabIcon}>+</Text>
      </View>
    </View>
  );
};

export default QueuePage;
