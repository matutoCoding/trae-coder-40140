import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import { useQueueStore } from '@/store/queueStore';
import { getClinicTypeLabel } from '@/data/mockClinic';
import { formatDate } from '@/utils/time';
import { mergeAdjacentSlots } from '@/utils/queue';
import dayjs from 'dayjs';
import styles from './index.module.scss';

const ClinicPage: React.FC = () => {
  const { clinics, getTimeSlots, queueRecords, getWaitingList } = useQueueStore();
  
  const [selectedDate, setSelectedDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [tabType, setTabType] = useState<'all' | 'open' | 'closed'>('all');

  const statusLabels: Record<string, string> = {
    open: '正常接诊',
    closed: '今日停诊',
    pause: '临时暂停'
  };

  const filteredClinics = useMemo(() => {
    if (tabType === 'all') return clinics;
    if (tabType === 'open') return clinics.filter(c => c.status === 'open');
    return clinics.filter(c => c.status !== 'open');
  }, [clinics, tabType]);

  const handleDateChange = (offset: number) => {
    const newDate = dayjs(selectedDate).add(offset, 'day');
    setSelectedDate(newDate.format('YYYY-MM-DD'));
  };

  const handleViewDetail = (clinicId: string) => {
    Taro.navigateTo({ url: `/pages/clinic-detail/index?id=${clinicId}` });
  };

  const getClinicStats = (clinicId: string) => {
    const records = queueRecords.filter(r => r.clinicId === clinicId);
    const todayRecords = records.filter(r => 
      dayjs(r.createTime).isSame(selectedDate, 'day')
    );
    
    const slots = getTimeSlots(clinicId, selectedDate);
    const mergedSlots = mergeAdjacentSlots(
      slots.filter(s => s.status === 'occupied')
    );

    return {
      waiting: getWaitingList(clinicId).length,
      completed: todayRecords.filter(r => r.status === 'completed').length,
      total: slots.length,
      occupied: mergedSlots.length,
      slots: mergedSlots
    };
  };

  const renderTimeline = (clinicId: string) => {
    const slots = getTimeSlots(clinicId, selectedDate);
    const mergedSlots = mergeAdjacentSlots(
      slots.filter(s => s.status === 'occupied')
    );

    const workStart = 8 * 60;
    const workEnd = 17 * 60;
    const totalMinutes = workEnd - workStart;

    const mockOccupied = [
      { start: '08:30', end: '09:00', patient: '张伟', merged: false },
      { start: '09:00', end: '09:15', patient: '李娜', merged: false },
      { start: '09:30', end: '10:20', patient: '王强', merged: true },
      { start: '10:30', end: '11:00', patient: '刘芳', merged: false },
      { start: '14:00', end: '14:45', patient: '陈明', merged: false },
      { start: '15:00', end: '15:50', patient: '赵雪', merged: true },
      { start: '16:00', end: '16:30', patient: '孙磊', merged: false }
    ];

    return (
      <View className={styles.timelineSection}>
        <Text className={styles.timelineTitle}>今日排期概览</Text>
        <View className={styles.timeline}>
          {mockOccupied.map((item, index) => {
            const [startH, startM] = item.start.split(':').map(Number);
            const [endH, endM] = item.end.split(':').map(Number);
            const startMinutes = startH * 60 + startM - workStart;
            const duration = (endH * 60 + endM) - (startH * 60 + startM);
            const leftPercent = (startMinutes / totalMinutes) * 100;
            const widthPercent = (duration / totalMinutes) * 100;

            return (
              <View
                key={index}
                className={classnames(styles.timelineSlot, styles.occupied, {
                  [styles.merged]: item.merged
                })}
                style={{
                  left: `${leftPercent}%`,
                  width: `${widthPercent}%`
                }}
              >
                {item.merged && (
                  <View className={styles.mergeTag}>合并</View>
                )}
              </View>
            );
          })}
        </View>
        <View className={styles.timeLabels}>
          <Text className={styles.timeLabel}>08:00</Text>
          <Text className={styles.timeLabel}>12:00</Text>
          <Text className={styles.timeLabel}>17:00</Text>
        </View>
      </View>
    );
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>诊室排期</Text>
        <Text className={styles.headerSubtitle}>查看各诊室排班与占用情况</Text>
        
        <View className={styles.dateSelector}>
          <Text className={styles.dateText}>{formatDate(selectedDate, 'YYYY年MM月DD日 dddd')}</Text>
          <View className={styles.dateNav}>
            <View 
              className={styles.dateNavBtn}
              onClick={() => handleDateChange(-1)}
            >
              <Text>‹</Text>
            </View>
            <View 
              className={styles.dateNavBtn}
              onClick={() => handleDateChange(1)}
            >
              <Text>›</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.tabs}>
          <View 
            className={classnames(styles.tabItem, { [styles.active]: tabType === 'all' })}
            onClick={() => setTabType('all')}
          >
            <Text>全部</Text>
          </View>
          <View 
            className={classnames(styles.tabItem, { [styles.active]: tabType === 'open' })}
            onClick={() => setTabType('open')}
          >
            <Text>接诊中</Text>
          </View>
          <View 
            className={classnames(styles.tabItem, { [styles.active]: tabType === 'closed' })}
            onClick={() => setTabType('closed')}
          >
            <Text>已停诊</Text>
          </View>
        </View>

        <ScrollView scrollY className={styles.clinicList}>
          {filteredClinics.length > 0 ? (
            filteredClinics.map(clinic => {
              const stats = getClinicStats(clinic.id);
              
              return (
                <View 
                  key={clinic.id} 
                  className={styles.clinicCard}
                  onClick={() => handleViewDetail(clinic.id)}
                >
                  <View className={styles.clinicHeader}>
                    <View className={styles.clinicInfo}>
                      <Text className={styles.clinicName}>{clinic.name}</Text>
                      <Text className={styles.clinicType}>{getClinicTypeLabel(clinic.type)}</Text>
                    </View>
                    <View className={classnames(styles.statusBadge, styles[clinic.status])}>
                      <Text>{statusLabels[clinic.status]}</Text>
                    </View>
                  </View>

                  <View className={styles.clinicMeta}>
                    <View className={styles.metaRow}>
                      <Text className={styles.metaLabel}>医生</Text>
                      <Text className={styles.metaValue}>{clinic.doctorName}</Text>
                    </View>
                    <View className={styles.metaRow}>
                      <Text className={styles.metaLabel}>位置</Text>
                      <Text className={styles.metaValue}>{clinic.location}</Text>
                    </View>
                  </View>

                  {renderTimeline(clinic.id)}

                  <View className={styles.statsRow}>
                    <View className={styles.statItem}>
                      <Text className={styles.statNumber}>{stats.waiting}</Text>
                      <Text className={styles.statLabel}>等待中</Text>
                    </View>
                    <View className={styles.statItem}>
                      <Text className={styles.statNumber}>{stats.completed}</Text>
                      <Text className={styles.statLabel}>已完成</Text>
                    </View>
                    <View className={styles.statItem}>
                      <Text className={styles.statNumber}>{stats.occupied}</Text>
                      <Text className={styles.statLabel}>已预约时段</Text>
                    </View>
                  </View>

                  <View className={styles.viewDetailBtn}>
                    <Text>查看详情 →</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>暂无诊室数据</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default ClinicPage;
