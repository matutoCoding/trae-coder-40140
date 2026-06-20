import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useQueueStore } from '@/store/queueStore';
import { formatTime, formatDateTime } from '@/utils/time';
import styles from './index.module.scss';

type TabType = 'pending' | 'requeued' | 'cancelled';

const MissedPage: React.FC = () => {
  const { missedRecords, requeue } = useQueueStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  const stats = useMemo(() => ({
    pending: missedRecords.filter(r => r.status === 'pending').length,
    requeued: missedRecords.filter(r => r.status === 'requeued').length,
    cancelled: missedRecords.filter(r => r.status === 'cancelled').length,
    total: missedRecords.length
  }), [missedRecords]);

  const filteredRecords = useMemo(() => {
    return missedRecords.filter(r => r.status === activeTab);
  }, [missedRecords, activeTab]);

  const statusLabels: Record<string, string> = {
    pending: '待处理',
    requeued: '已重排',
    cancelled: '已作废'
  };

  const handleRequeue = (recordId: string) => {
    Taro.showModal({
      title: '确认重新排队',
      content: '确定将该患者重新排到队尾吗？',
      success: (res) => {
        if (res.confirm) {
          requeue(recordId);
          Taro.showToast({ title: '已重新排队', icon: 'success' });
        }
      }
    });
  };

  const renderMissedCountDots = (count: number) => {
    const maxCount = 3;
    return (
      <View className={styles.missedCountBar}>
        <View className={styles.countDots}>
          {[...Array(maxCount)].map((_, i) => (
            <View
              key={i}
              className={classnames(styles.dot, {
                [styles.filled]: i < count,
                [styles.warning]: i === count - 1 && count === 2
              })}
            />
          ))}
        </View>
        <Text className={styles.countText}>{count}/3 次</Text>
      </View>
    );
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>过号管理</Text>
        <Text className={styles.headerSubtitle}>处理过号患者，维护排队秩序</Text>
        
        <View className={styles.statsRow}>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.pending}</Text>
            <Text className={styles.statLabel}>待处理</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.requeued}</Text>
            <Text className={styles.statLabel}>已重排</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statNumber}>{stats.cancelled}</Text>
            <Text className={styles.statLabel}>已作废</Text>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.tabs}>
          <View 
            className={classnames(styles.tabItem, { [styles.active]: activeTab === 'pending' })}
            onClick={() => setActiveTab('pending')}
          >
            <Text>待处理</Text>
            <Text className={styles.tabCount}>{stats.pending}</Text>
          </View>
          <View 
            className={classnames(styles.tabItem, { [styles.active]: activeTab === 'requeued' })}
            onClick={() => setActiveTab('requeued')}
          >
            <Text>已重排</Text>
            <Text className={styles.tabCount}>{stats.requeued}</Text>
          </View>
          <View 
            className={classnames(styles.tabItem, { [styles.active]: activeTab === 'cancelled' })}
            onClick={() => setActiveTab('cancelled')}
          >
            <Text>已作废</Text>
            <Text className={styles.tabCount}>{stats.cancelled}</Text>
          </View>
        </View>

        {activeTab === 'pending' && (
          <View className={styles.rulesCard}>
            <Text className={styles.rulesTitle}>
              <Text>📋</Text>
              过号处理规则
            </Text>
            <View className={styles.rulesList}>
              <View className={styles.ruleItem}>
                <View className={styles.ruleNumber}>1</View>
                <Text>叫号后患者未及时就诊，记为一次过号</Text>
              </View>
              <View className={styles.ruleItem}>
                <View className={styles.ruleNumber}>2</View>
                <Text>过号患者可申请重新排队，排到队尾</Text>
              </View>
              <View className={styles.ruleItem}>
                <View className={styles.ruleNumber}>3</View>
                <Text>连续三次过号，自动作废本次挂号</Text>
              </View>
            </View>
          </View>
        )}

        <ScrollView scrollY className={styles.list}>
          {filteredRecords.length > 0 ? (
            filteredRecords.map(record => (
              <View 
                key={record.id} 
                className={classnames(styles.recordCard, {
                  [styles.cancelled]: record.status === 'cancelled',
                  [styles.requeued]: record.status === 'requeued'
                })}
              >
                <View className={styles.cardHeader}>
                  <View className={styles.leftInfo}>
                    <Text className={styles.queueNumber}>
                      {record.queueRecordId ? '' : 'A00'}{Math.floor(Math.random() * 20) + 1}
                    </Text>
                    <Text className={styles.patientName}>{record.patientName}</Text>
                  </View>
                  <View className={classnames(styles.statusTag, styles[record.status])}>
                    <Text>{statusLabels[record.status]}</Text>
                  </View>
                </View>

                <View className={styles.cardBody}>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>就诊诊室</Text>
                    <Text className={styles.infoValue}>{record.clinicName}</Text>
                  </View>
                  <View className={styles.infoRow}>
                    <Text className={styles.infoLabel}>叫号时间</Text>
                    <Text className={styles.infoValue}>{formatDateTime(record.callTime)}</Text>
                  </View>
                  {record.requeueTime && (
                    <View className={styles.infoRow}>
                      <Text className={styles.infoLabel}>重排时间</Text>
                      <Text className={styles.infoValue}>{formatDateTime(record.requeueTime)}</Text>
                    </View>
                  )}
                  
                  {renderMissedCountDots(record.missedCount)}
                  
                  {record.remark && (
                    <View className={styles.remark}>
                      <Text>{record.remark}</Text>
                    </View>
                  )}
                </View>

                {record.status === 'pending' && (
                  <View className={styles.actions}>
                    <Button 
                      className={classnames(styles.actionBtn, styles.primary)}
                      onClick={() => handleRequeue(record.queueRecordId)}
                    >
                      重新排队
                    </Button>
                    <Button 
                      className={classnames(styles.actionBtn, styles.ghost)}
                    >
                      查看详情
                    </Button>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>
                {activeTab === 'pending' ? '✅' : activeTab === 'requeued' ? '📋' : '❌'}
              </Text>
              <Text className={styles.emptyText}>
                {activeTab === 'pending' ? '暂无待处理的过号' : 
                 activeTab === 'requeued' ? '暂无已重排记录' : '暂无已作废记录'}
              </Text>
              <Text className={styles.emptyDesc}>
                {activeTab === 'pending' ? '所有患者都已按时就诊' : 
                 '过号记录会在此处显示'}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default MissedPage;
