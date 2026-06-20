import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useQueueStore } from '@/store/queueStore';
import { getClinicTypeLabel } from '@/data/mockClinic';
import { mergeAdjacentSlots, splitMergedSlot } from '@/utils/queue';
import { TimeSlot } from '@/types';
import { formatDuration } from '@/utils/time';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const ClinicDetailPage: React.FC = () => {
  const router = useRouter();
  const { getClinicById, getTimeSlots, getWaitingList, queueRecords, getTreatmentItems } = useQueueStore();
  
  const routeClinicId = router.params.id || 'c001';
  const [clinicId] = useState<string>(routeClinicId);
  const [selectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [showMerged, setShowMerged] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'treatment'>('timeline');
  
  const [baseSlots, setBaseSlots] = useState<any[]>([]);

  const clinic = useMemo(() => getClinicById(clinicId), [getClinicById, clinicId]);

  const treatmentItems = useMemo(() => 
    getTreatmentItems(clinicId), 
    [getTreatmentItems, clinicId]
  );

  const allSlots = useMemo(() => 
    getTimeSlots(clinicId, selectedDate),
    [getTimeSlots, clinicId, selectedDate]
  );

  React.useEffect(() => {
    const mockData = [
      { id: 's1', startTime: '08:30', endTime: '09:00', patientName: '张伟', patientId: 'p1', status: 'occupied' as const, treatmentName: '初诊评估', duration: 30 },
      { id: 's2', startTime: '09:00', endTime: '09:15', patientName: '李娜', patientId: 'p2', status: 'occupied' as const, treatmentName: '复诊问诊', duration: 15 },
      { id: 's3', startTime: '09:30', endTime: '10:00', patientName: '王强', patientId: 'p3', status: 'occupied' as const, treatmentName: '初诊评估', duration: 30 },
      { id: 's4', startTime: '10:00', endTime: '10:20', patientName: '王强', patientId: 'p3', status: 'occupied' as const, treatmentName: '药物调整', duration: 20 },
      { id: 's5', startTime: '10:30', endTime: '11:00', patientName: '刘芳', patientId: 'p4', status: 'occupied' as const, treatmentName: '心理咨询', duration: 30 },
      { id: 's6', startTime: '14:00', endTime: '14:15', patientName: '陈明', patientId: 'p5', status: 'occupied' as const, treatmentName: '复诊问诊', duration: 15 },
      { id: 's7', startTime: '14:15', endTime: '14:45', patientName: '陈明', patientId: 'p5', status: 'occupied' as const, treatmentName: '心理咨询', duration: 30 },
      { id: 's8', startTime: '15:00', endTime: '15:30', patientName: '赵雪', patientId: 'p6', status: 'occupied' as const, treatmentName: '初诊评估', duration: 30 },
      { id: 's9', startTime: '15:30', endTime: '15:50', patientName: '赵雪', patientId: 'p6', status: 'occupied' as const, treatmentName: '药物调整', duration: 20 },
      { id: 's10', startTime: '16:00', endTime: '16:30', patientName: '孙磊', patientId: 'p7', status: 'occupied' as const, treatmentName: '复诊问诊', duration: 30 }
    ];
    setBaseSlots(mockData);
    setSelectedSlot(null);
  }, [clinicId]);

  const mergedSlots = useMemo(() => {
    if (baseSlots.length === 0) return [];
    
    const sorted = [...baseSlots].sort((a, b) => 
      dayjs(a.startTime, 'HH:mm').valueOf() - dayjs(b.startTime, 'HH:mm').valueOf()
    );
    
    const result: any[] = [];
    let currentMerge: any = null;

    for (const slot of sorted) {
      if (slot.status !== 'occupied') continue;

      if (currentMerge && currentMerge.patientId === slot.patientId) {
        const prevEnd = dayjs(currentMerge.endTime, 'HH:mm');
        const currStart = dayjs(slot.startTime, 'HH:mm');
        if (prevEnd.valueOf() === currStart.valueOf()) {
          currentMerge.endTime = slot.endTime;
          currentMerge.duration += slot.duration;
          currentMerge.mergedSlotIds.push(slot.id);
          currentMerge.treatments.push({ id: slot.id, name: slot.treatmentName, duration: slot.duration });
          continue;
        }
      }

      if (currentMerge) {
        result.push(currentMerge);
      }

      currentMerge = {
        id: `merge-${slot.id}`,
        startTime: slot.startTime,
        endTime: slot.endTime,
        patientName: slot.patientName,
        patientId: slot.patientId,
        status: 'occupied',
        duration: slot.duration,
        isMerged: false,
        mergedSlotIds: [slot.id],
        treatments: [{ id: slot.id, name: slot.treatmentName, duration: slot.duration }]
      };
    }

    if (currentMerge) {
      result.push(currentMerge);
    }

    return result.map(s => ({
      ...s,
      isMerged: s.mergedSlotIds.length > 1
    }));
  }, [baseSlots]);

  const displaySlots = useMemo(() => {
    if (showMerged) {
      return mergedSlots;
    }
    return baseSlots.filter(s => s.status === 'occupied').map(s => ({
      ...s,
      treatments: [{ id: s.id, name: s.treatmentName, duration: s.duration }],
      mergedSlotIds: [s.id],
      isMerged: false
    }));
  }, [showMerged, mergedSlots, baseSlots]);

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

  const handleCancelSlot = (slotId?: string) => {
    const targetId = slotId || selectedSlot?.id;
    if (!targetId) return;

    const isMergedSlot = selectedSlot?.isMerged && !slotId;
    
    Taro.showModal({
      title: '确认取消',
      content: isMergedSlot 
        ? '确定要取消整个合并时段的所有预约吗？' 
        : '确定要取消这个预约时段吗？',
      success: (res) => {
        if (res.confirm) {
          let idsToCancel: string[] = [];
          
          if (isMergedSlot && selectedSlot?.mergedSlotIds) {
            idsToCancel = selectedSlot.mergedSlotIds;
          } else if (slotId) {
            idsToCancel = [slotId];
          } else if (selectedSlot?.mergedSlotIds) {
            idsToCancel = selectedSlot.mergedSlotIds;
          }

          setBaseSlots(prev => 
            prev.map(s => 
              idsToCancel.includes(s.id) 
                ? { ...s, status: 'available' as const }
                : s
            )
          );

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
    const slots = displaySlots;
    
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

    const treatments = selectedSlot.treatments || [];

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
          <Text className={styles.detailLabel}>总时长</Text>
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
        
        {treatments.length > 0 && (
          <View className={styles.treatmentList}>
            <Text className={styles.detailLabel} style={{ marginBottom: '16rpx' }}>
              包含诊疗项目（{treatments.length}项）：
            </Text>
            {treatments.map((item: any) => (
              <View key={item.id} className={styles.treatmentItem}>
                <View>
                  <Text className={styles.treatmentName}>{item.name}</Text>
                  <Text className={styles.treatmentDuration}>
                    {item.duration}分钟
                  </Text>
                </View>
                <Button 
                  className={classnames(styles.actionBtn, styles.cancelMini)}
                  onClick={() => handleCancelSlot(item.id)}
                >
                  取消
                </Button>
              </View>
            ))}
          </View>
        )}

        <View className={styles.actionRow}>
          <Button 
            className={classnames(styles.actionBtn, styles.ghost)}
            onClick={handleToggleMerge}
          >
            {showMerged ? '拆分视图' : '合并视图'}
          </Button>
          <Button 
            className={classnames(styles.actionBtn, styles.danger)}
            onClick={() => handleCancelSlot()}
          >
            {selectedSlot.isMerged ? '取消全部' : '取消预约'}
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
              {treatmentItems.map((item: any) => (
                <View key={item.id} className={styles.treatmentItem} style={{ padding: '24rpx' }}>
                  <View>
                    <Text className={styles.treatmentName} style={{ fontSize: '28rpx' }}>{item.name}</Text>
                    <Text className={styles.treatmentDuration}>
                      {item.duration}分钟 · ¥{item.price}
                    </Text>
                  </View>
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
