import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import classnames from 'classnames';
import { useQueueStore } from '@/store/queueStore';
import { getClinicTypeLabel } from '@/data/mockClinic';
import { formatDuration } from '@/utils/time';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const MOCK_DATA_BY_CLINIC: Record<string, any[]> = {
  c001: [
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
  ],
  c002: [
    { id: 's1', startTime: '08:00', endTime: '08:30', patientName: '周杰', patientId: 'p8', status: 'occupied' as const, treatmentName: '专家咨询', duration: 30 },
    { id: 's2', startTime: '08:30', endTime: '09:15', patientName: '吴敏', patientId: 'p9', status: 'occupied' as const, treatmentName: '深度评估', duration: 45 },
    { id: 's3', startTime: '09:30', endTime: '10:00', patientName: '郑浩', patientId: 'p10', status: 'occupied' as const, treatmentName: '专家咨询', duration: 30 },
    { id: 's4', startTime: '10:00', endTime: '10:45', patientName: '郑浩', patientId: 'p10', status: 'occupied' as const, treatmentName: '治疗方案制定', duration: 45 },
    { id: 's5', startTime: '14:00', endTime: '14:45', patientName: '冯丽', patientId: 'p11', status: 'occupied' as const, treatmentName: '深度评估', duration: 45 },
    { id: 's6', startTime: '15:00', endTime: '15:30', patientName: '韩涛', patientId: 'p12', status: 'occupied' as const, treatmentName: '专家咨询', duration: 30 },
    { id: 's7', startTime: '15:30', endTime: '16:15', patientName: '韩涛', patientId: 'p12', status: 'occupied' as const, treatmentName: '治疗方案制定', duration: 45 },
    { id: 's8', startTime: '16:30', endTime: '17:00', patientName: '董艳', patientId: 'p13', status: 'occupied' as const, treatmentName: '专家咨询', duration: 30 }
  ],
  c003: [
    { id: 's1', startTime: '08:00', endTime: '08:50', patientName: '黄磊', patientId: 'p14', status: 'occupied' as const, treatmentName: '认知行为治疗', duration: 50 },
    { id: 's2', startTime: '09:00', endTime: '09:50', patientName: '林静', patientId: 'p15', status: 'occupied' as const, treatmentName: '精神分析治疗', duration: 50 },
    { id: 's3', startTime: '10:00', endTime: '10:50', patientName: '林涛', patientId: 'p16', status: 'occupied' as const, treatmentName: '认知行为治疗', duration: 50 },
    { id: 's4', startTime: '11:00', endTime: '11:50', patientName: '徐静', patientId: 'p17', status: 'occupied' as const, treatmentName: '家庭治疗', duration: 50 },
    { id: 's5', startTime: '14:00', endTime: '14:50', patientName: '杨勇', patientId: 'p18', status: 'occupied' as const, treatmentName: '认知行为治疗', duration: 50 },
    { id: 's6', startTime: '15:00', endTime: '15:50', patientName: '梁颖', patientId: 'p19', status: 'occupied' as const, treatmentName: '精神分析治疗', duration: 50 },
    { id: 's7', startTime: '16:00', endTime: '16:50', patientName: '宋凯', patientId: 'p20', status: 'occupied' as const, treatmentName: '团体治疗', duration: 50 }
  ],
  c004: [
    { id: 's1', startTime: '08:00', endTime: '08:30', patientName: '马超', patientId: 'p21', status: 'occupied' as const, treatmentName: '急诊评估', duration: 30 },
    { id: 's2', startTime: '08:30', endTime: '09:00', patientName: '马超', patientId: 'p21', status: 'occupied' as const, treatmentName: '危机干预', duration: 30 },
    { id: 's3', startTime: '09:15', endTime: '09:45', patientName: '安雯', patientId: 'p22', status: 'occupied' as const, treatmentName: '急诊评估', duration: 30 },
    { id: 's4', startTime: '10:00', endTime: '10:30', patientName: '常健', patientId: 'p23', status: 'occupied' as const, treatmentName: '药物中毒处理', duration: 30 },
    { id: 's5', startTime: '10:30', endTime: '11:00', patientName: '常健', patientId: 'p23', status: 'occupied' as const, treatmentName: '留观评估', duration: 30 },
    { id: 's6', startTime: '14:00', endTime: '14:30', patientName: '崔明', patientId: 'p24', status: 'occupied' as const, treatmentName: '急诊评估', duration: 30 },
    { id: 's7', startTime: '14:30', endTime: '15:00', patientName: '崔明', patientId: 'p24', status: 'occupied' as const, treatmentName: '快速镇静', duration: 30 },
    { id: 's8', startTime: '15:15', endTime: '15:45', patientName: '戴莹', patientId: 'p25', status: 'occupied' as const, treatmentName: '自伤处理', duration: 30 },
    { id: 's9', startTime: '16:00', endTime: '16:30', patientName: '邓辉', patientId: 'p26', status: 'occupied' as const, treatmentName: '急诊评估', duration: 30 }
  ],
  c005: [
    { id: 's1', startTime: '08:00', endTime: '08:30', patientName: '豆豆(6岁)', patientId: 'p27', status: 'occupied' as const, treatmentName: '儿童评估', duration: 30 },
    { id: 's2', startTime: '08:45', endTime: '09:30', patientName: '豆豆(6岁)', patientId: 'p27', status: 'occupied' as const, treatmentName: '亲子游戏治疗', duration: 45 },
    { id: 's3', startTime: '09:45', endTime: '10:15', patientName: '乐乐(8岁)', patientId: 'p28', status: 'occupied' as const, treatmentName: '儿童评估', duration: 30 },
    { id: 's4', startTime: '10:30', endTime: '11:00', patientName: '萌萌(10岁)', patientId: 'p29', status: 'occupied' as const, treatmentName: '儿童评估', duration: 30 },
    { id: 's5', startTime: '11:00', endTime: '11:45', patientName: '萌萌(10岁)', patientId: 'p29', status: 'occupied' as const, treatmentName: '认知训练', duration: 45 },
    { id: 's6', startTime: '14:00', endTime: '14:30', patientName: '浩浩(7岁)', patientId: 'p30', status: 'occupied' as const, treatmentName: '儿童评估', duration: 30 },
    { id: 's7', startTime: '14:45', endTime: '15:30', patientName: '浩浩(7岁)', patientId: 'p30', status: 'occupied' as const, treatmentName: '行为矫正', duration: 45 },
    { id: 's8', startTime: '15:45', endTime: '16:15', patientName: '欣欣(9岁)', patientId: 'p31', status: 'occupied' as const, treatmentName: '儿童评估', duration: 30 }
  ]
};

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

  React.useEffect(() => {
    const mockData = MOCK_DATA_BY_CLINIC[clinicId] || MOCK_DATA_BY_CLINIC['c001'];
    const dataWithClinicId = mockData.map(s => ({ ...s, clinicId }));
    setBaseSlots(dataWithClinicId);
    setSelectedSlot(null);
  }, [clinicId]);

  const clinic = useMemo(() => getClinicById(clinicId), [getClinicById, clinicId]);

  const treatmentItems = useMemo(() => 
    getTreatmentItems(clinicId), 
    [getTreatmentItems, clinicId]
  );

  const allSlots = useMemo(() => 
    getTimeSlots(clinicId, selectedDate),
    [getTimeSlots, clinicId, selectedDate]
  );

  const occupiedCount = useMemo(() => 
    baseSlots.filter(s => s.status === 'occupied').length,
    [baseSlots]
  );

  const mergedSlots = useMemo(() => {
    if (baseSlots.length === 0) return [];
    
    const sorted = [...baseSlots]
      .filter(s => s.status === 'occupied')
      .sort((a, b) => 
        dayjs(a.startTime, 'HH:mm').valueOf() - dayjs(b.startTime, 'HH:mm').valueOf()
      );
    
    const result: any[] = [];
    let currentMerge: any = null;

    for (const slot of sorted) {
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
    return baseSlots
      .filter(s => s.status === 'occupied')
      .sort((a, b) => 
        dayjs(a.startTime, 'HH:mm').valueOf() - dayjs(b.startTime, 'HH:mm').valueOf()
      )
      .map(s => ({
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
      title: showMerged ? '已切换到拆分视图' : '已切换到合并视图',
      icon: 'none'
    });
  };

  const handleCancelSlot = (treatmentId?: string) => {
    if (!selectedSlot) return;

    let idsToCancel: string[] = [];
    
    if (treatmentId) {
      idsToCancel = [treatmentId];
    } else if (selectedSlot.mergedSlotIds) {
      idsToCancel = selectedSlot.mergedSlotIds;
    }

    const patientId = selectedSlot.patientId;
    const isMergedSlot = selectedSlot.isMerged && !treatmentId;
    
    Taro.showModal({
      title: '确认取消',
      content: isMergedSlot 
        ? '确定要取消整个合并时段的所有预约吗？' 
        : treatmentId
          ? '确定要取消这个诊疗项目吗？'
          : '确定要取消这个预约时段吗？',
      success: (res) => {
        if (res.confirm) {
          setBaseSlots(prev => {
            const updated = prev.map(s => 
              idsToCancel.includes(s.id) 
                ? { ...s, status: 'available' as const }
                : s
            );

            const remaining = updated.filter(
              s => s.status === 'occupied' 
                && s.patientId === patientId 
                && !idsToCancel.includes(s.id)
            );
            
            if (remaining.length >= 2) {
              const remainingSorted = [...remaining].sort((a, b) => 
                dayjs(a.startTime, 'HH:mm').valueOf() - dayjs(b.startTime, 'HH:mm').valueOf()
              );
              let consecutiveStart = 0;
              let consecutiveEnd = 0;
              let maxConsecutive = 1;
              let currentConsecutive = 1;
              
              for (let i = 1; i < remainingSorted.length; i++) {
                const prevEnd = dayjs(remainingSorted[i - 1].endTime, 'HH:mm');
                const currStart = dayjs(remainingSorted[i].startTime, 'HH:mm');
                if (prevEnd.valueOf() === currStart.valueOf()) {
                  currentConsecutive++;
                  if (currentConsecutive > maxConsecutive) {
                    maxConsecutive = currentConsecutive;
                    consecutiveEnd = i;
                    consecutiveStart = i - maxConsecutive + 1;
                  }
                } else {
                  currentConsecutive = 1;
                }
              }
              
              const consecutiveSlots = remainingSorted.slice(consecutiveStart, consecutiveEnd + 1);
              setSelectedSlot({
                id: `merge-${consecutiveSlots[0].id}`,
                startTime: consecutiveSlots[0].startTime,
                endTime: consecutiveSlots[consecutiveSlots.length - 1].endTime,
                patientName: consecutiveSlots[0].patientName,
                patientId: consecutiveSlots[0].patientId,
                status: 'occupied',
                duration: consecutiveSlots.reduce((sum, s) => sum + s.duration, 0),
                isMerged: consecutiveSlots.length > 1,
                mergedSlotIds: consecutiveSlots.map(s => s.id),
                treatments: consecutiveSlots.map(s => ({ 
                  id: s.id, 
                  name: s.treatmentName, 
                  duration: s.duration 
                }))
              });
            } else if (remaining.length === 1) {
              setSelectedSlot({
                ...remaining[0],
                treatments: [{ 
                  id: remaining[0].id, 
                  name: remaining[0].treatmentName, 
                  duration: remaining[0].duration 
                }],
                mergedSlotIds: [remaining[0].id],
                isMerged: false
              });
            } else {
              setSelectedSlot(null);
            }

            return updated;
          });

          Taro.showToast({ title: '已取消预约', icon: 'success' });
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
                {treatments.length > 1 && (
                  <Button 
                    className={classnames(styles.actionBtn, styles.cancelMini)}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelSlot(item.id);
                    }}
                  >
                    取消
                  </Button>
                )}
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
        <View style={{ padding: '100rpx', textAlign: 'center' }}>
          <Text style={{ fontSize: '32rpx', color: '#999' }}>诊室不存在或已删除</Text>
        </View>
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
              <Text className={styles.statNumber}>{displaySlots.length}</Text>
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
              {baseSlots.length > 0 ? (
                <>
                  {renderTimeline()}
                  {renderSlotDetail()}
                </>
              ) : (
                <View style={{ padding: '100rpx 0', textAlign: 'center' }}>
                  <Text style={{ fontSize: '28rpx', color: '#999' }}>暂无排期数据</Text>
                </View>
              )}
            </>
          )}

          {activeTab === 'treatment' && (
            <View className={styles.treatmentList}>
              {treatmentItems.length > 0 ? (
                treatmentItems.map((item: any) => (
                  <View key={item.id} className={styles.treatmentItem} style={{ padding: '24rpx' }}>
                    <View>
                      <Text className={styles.treatmentName} style={{ fontSize: '28rpx' }}>{item.name}</Text>
                      <Text className={styles.treatmentDuration}>
                        {item.duration}分钟 · ¥{item.price}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={{ padding: '60rpx 0', textAlign: 'center' }}>
                  <Text style={{ fontSize: '28rpx', color: '#999' }}>暂无诊疗项目</Text>
                </View>
              )}
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
