import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useQueueStore } from '@/store/queueStore';
import { getClinicTypeLabel } from '@/data/mockClinic';
import { mergeAdjacentSlots, splitMergedSlot } from '@/utils/queue';
import { TimeSlot } from '@/types';
import { formatDuration } from '@/utils/time';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const ClinicDetailPage: React.FC = () => {
  const { getClinicById, getTimeSlots, getWaitingList, queueRecords } = useQueueStore();
  
  const [clinicId, setClinicId] = useState<string>('c001');
  const [selectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [showMerged, setShowMerged] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'treatment'>('timeline');

  const clinic = useMemo(() => getClinicById(clinicId), [getClinicById, clinicId]);

  const allSlots = useMemo(() => 
    getTimeSlots(clinicId, selectedDate),
    [getTimeSlots, clinicId, selectedDate]
  );

  const displaySlots = useMemo(() => {
    const occupiedSlots = allSlots.filter(s => s.status === 'occupied');
    if (showMerged) {
      return mergeAdjacentSlots(occupiedSlots);
    }
    return occupiedSlots;
  }, [allSlots, showMerged]);

  const mockOccupiedData = useMemo(() => {
    const mockData = [
      { id: '1', startTime: '08:30', endTime: '09:00', patientName: '张伟', status: 'occupied' as const, isMerged: false, clinicId },
      { id: '2', startTime: '09:00', endTime: '09:15', patientName: '李娜', status: 'occupied' as const, isMerged: false, clinicId },
      { id: '3', startTime: '09:30', endTime: '10:20', patientName: '王强', status: 'occupied' as const, isMerged: true, clinicId, mergedSlotIds: ['3a', '3b'] },
      { id: '4', startTime: '10:30', endTime: '11:00', patientName: '刘芳', status: 'occupied' as const, isMerged: false, clinicId },
      { id: '5', startTime: '14:00', endTime: '14:45', patientName: '陈明', status: 'occupied' as const, isMerged: false, clinicId },
      { id: '6', startTime: '15:00', endTime: '15:50', patientName: '赵雪', status: 'occupied' as const, isMerged: true, clinicId, mergedSlotIds: ['6a', '6b'] },
      { id: '7', startTime: '16:00', endTime: '16:30', patientName: '孙磊', status: 'occupied' as const, isMerged: false, clinicId }
    ];
    
    if (showMerged) {
      return mockData.filter(s => s.isMerged || !mockData.some(d => d.mergedSlotIds?.includes(s.id)));
    }
    return mockData;
  }, [showMerged, clinicId]);

  const waitingCount = useMemo(() => 
    getWaitingList(clinicId).length,
    [getWaitingList, clinicId]
  );

  const todayCompleted = useMemo(() => {
    const todayRecords = queueRecords.filter(
      r => r.clinicId === clinicId && dayjs(r.createTime).isSame(selectedDate, 'day')
    );
    return todayRecords.filter(r => r.status === 'completed').length;
  }, [queueRecords, clinicId, selectedDate]);

  const handleSlotClick = (slot: any) => {
    setSelectedSlot(slot);
  };

  const handleToggleMerge = () => {
    setShowMerged(!showMerged);
    setSelectedSlot(null);
    Taro.showToast({
      title: showMerged ? '已拆分时段' : '已合并时段',
      icon: 'none'
    });
  };

  const handleCancelSlot = () => {
    if (!selectedSlot) return;
    
    Taro.showModal({
      title: '确认取消',
      content: '确定要取消这个预约时段吗？取消后时段将拆分为独立时段。',
      success: (res) => {
        if (res.confirm) {
          Taro.showToast({ title: '已取消预约', icon: 'success' });
          setSelectedSlot(null);
        }
      }
    });
  };

  const workStart = 8 * 60;
  const workEnd = 17 * 60;
  const totalMinutes = workEnd - workStart;

  const renderTimeline = () => {
    const slots = showMerged ? mockOccupiedData : mockOccupiedData;
    
    return (
      <View className={styles.timelineContainer}>
        <View className={styles.timeScale}>
          <Text className={styles.timeLabel}>08:00</Text>
          <Text className={styles.timeLabel}>10:00</Text>
          <Text className={styles.timeLabel}>12:00</Text>
          <Text className={styles.timeLabel}>14:00</Text>
          <Text className={styles.timeLabel}>16:00</Text>
          <Text className={styles.timeLabel}>17:00</Text>
        </View>
        <View className={styles.timeline}>
          {slots.map((slot: any) => {
            const [startH, startM] = slot.startTime.split(':').map(Number);
            const [endH, endM] = slot.endTime.split(':').map(Number);
            const startMinutes = startH * 60 + startM - workStart;
            const duration = (endH * 60 + endM) - (startH * 60 + startM);
            const leftPercent = (startMinutes / totalMinutes) * 100;
            const widthPercent = (duration / totalMinutes) * 100;

            return (
              <View
                key={slot.id}
                className={classnames(styles.timeSlot, styles.occupied, {
                  [styles.merged]: slot.isMerged
                })}
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`
                }}
                onClick={() => handleSlotClick(slot)}
              >
                <Text className={styles.slotTime}>{slot.startTime}</Text>
                <Text className={styles.slotPatient}>{slot.patientName}</Text>
                {slot.isMerged && (
                  <View className={styles.mergeBadge}>
                    <Text>合并</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        <View className={styles.legend}>
          <View className={styles.legendItem}>
            <View className={classnames(styles.legendDot, styles.available)} />
            <Text className={styles.legendText}>空闲</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={classnames(styles.legendDot, styles.occupied)} />
            <Text className={styles.legendText}>已预约</Text>
          </View>
          <View className={styles.legendItem}>
            <View className={classnames(styles.legendDot, styles.merged)} />
            <Text className={styles.legendText}>合并时段</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSlotDetail = () => {
    if (!selectedSlot) return null;

    const duration = dayjs(selectedSlot.endTime, 'HH:mm').diff(
      dayjs(selectedSlot.startTime, 'HH:mm'),
      'minute'
    );

    return (
      <View className={styles.slotDetail}>
        <Text className={styles.slotDetailTitle}>时段详情</Text>
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>时段</Text>
          <Text className={styles.detailValue}>
            {selectedSlot.startTime} - {selectedSlot.endTime}
          </Text>
        </View>
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>时长</Text>
          <Text className={styles.detailValue}>{formatDuration(duration)}</Text>
        </View>
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>患者</Text>
          <Text className={styles.detailValue}>{selectedSlot.patientName}</Text>
        </View>
        <View className={styles.detailRow}>
          <Text className={styles.detailLabel}>状态</Text>
          <Text className={styles.detailValue}>
            {selectedSlot.isMerged ? '已合并' : '普通预约'}
          </Text>
        </View>
        
        {selectedSlot.isMerged && (
          <View className={styles.treatmentList}>
            <Text className={styles.detailLabel} style={{ marginBottom: '8rpx' }}>包含诊疗项目：</Text>
            <View className={styles.treatmentItem}>
              <Text className={styles.treatmentName}>初诊评估</Text>
              <Text className={styles.treatmentDuration}>30分钟</Text>
            </View>
            <View className={styles.treatmentItem}>
              <Text className={styles.treatmentName}>药物调整</Text>
              <Text className={styles.treatmentDuration}>20分钟</Text>
            </View>
          </View>
        )}

        <View className={styles.actionRow}>
          <Button 
            className={classnames(styles.actionBtn, styles.ghost)}
            onClick={handleToggleMerge}
          >
            {showMerged ? '拆分时段' : '合并时段'}
          </Button>
          <Button 
            className={classnames(styles.actionBtn, styles.danger)}
            onClick={handleCancelSlot}
          >
            取消预约
          </Button>
        </View>
      </View>
    );
  };

  if (!clinic) {
    return (
      <View className={styles.page}>
        <Text>诊室不存在</Text>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.clinicName}>{clinic.name}</Text>
        <Text className={styles.clinicType}>{getClinicTypeLabel(clinic.type)}</Text>
        <View className={styles.infoRow}>
          <View className={styles.infoItem}>
            <Text className={styles.infoIcon}>👨‍⚕️</Text>
            <Text className={styles.infoText}>{clinic.doctorName}</Text>
          </View>
          <View className={styles.infoItem}>
            <Text className={styles.infoIcon}>📍</Text>
            <Text className={styles.infoText}>{clinic.location}</Text>
          </View>
        </View>
      </View>

      <ScrollView scrollY className={styles.content}>
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>今日数据</Text>
          <View className={styles.todayStats}>
            <View className={styles.statCard}>
              <Text className={styles.statNumber}>{waitingCount}</Text>
              <Text className={styles.statLabel}>等待中</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={styles.statNumber}>{todayCompleted}</Text>
              <Text className={styles.statLabel}>已完成</Text>
            </View>
            <View className={styles.statCard}>
              <Text className={styles.statNumber}>{mockOccupiedData.length}</Text>
              <Text className={styles.statLabel}>已预约</Text>
            </View>
          </View>
        </View>

        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>时段排期</Text>
            <View 
              className={classnames(styles.toggleBtn, { [styles.active]: showMerged })}
              onClick={handleToggleMerge}
            >
              <Text>{showMerged ? '合并视图' : '拆分视图'}</Text>
            </View>
          </View>

          <View className={styles.tabs}>
            <View 
              className={classnames(styles.tabItem, { [styles.active]: activeTab === 'timeline' })}
              onClick={() => setActiveTab('timeline')}
            >
              <Text>时间轴</Text>
            </View>
            <View 
              className={classnames(styles.tabItem, { [styles.active]: activeTab === 'treatment' })}
              onClick={() => setActiveTab('treatment')}
            >
              <Text>诊疗项目</Text>
            </View>
          </View>

          {activeTab === 'timeline' && (
            <>
              {renderTimeline()}
              {renderSlotDetail()}
            </>
          )}

          {activeTab === 'treatment' && (
            <View className={styles.treatmentList}>
              {['初诊评估', '复诊问诊', '药物调整', '心理咨询'].map((item, index) => (
                <View key={index} className={styles.treatmentItem} style={{ padding: '24rpx' }}>
                  <Text className={styles.treatmentName} style={{ fontSize: '28rpx' }}>{item}</Text>
                  <Text className={styles.treatmentDuration}>
                    {[30, 15, 20, 50][index]}分钟
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className={styles.section}>
          <Text className={styles.sectionTitle}>诊室介绍</Text>
          <Text className={styles.description}>{clinic.description}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ClinicDetailPage;
