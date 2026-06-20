import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { TimeSlot } from '@/types';
import styles from './index.module.scss';

interface TimeSlotBarProps {
  slots: TimeSlot[];
  showMerged?: boolean;
  onSlotClick?: (slot: TimeSlot) => void;
}

const TimeSlotBar: React.FC<TimeSlotBarProps> = ({
  slots,
  showMerged = true,
  onSlotClick
}) => {
  const statusColors: Record<string, string> = {
    available: 'available',
    occupied: 'occupied',
    blocked: 'blocked'
  };

  return (
    <View className={styles.container}>
      <View className={styles.timeAxis}>
        <Text className={styles.timeLabel}>08:00</Text>
        <Text className={styles.timeLabel}>10:00</Text>
        <Text className={styles.timeLabel}>12:00</Text>
        <Text className={styles.timeLabel}>14:00</Text>
        <Text className={styles.timeLabel}>16:00</Text>
      </View>
      
      <View className={styles.slotRow}>
        {slots.map((slot) => {
          const startHour = parseInt(slot.startTime.split(':')[0]);
          const startMin = parseInt(slot.startTime.split(':')[1]);
          const endHour = parseInt(slot.endTime.split(':')[0]);
          const endMin = parseInt(slot.endTime.split(':')[1]);
          
          const leftPercent = ((startHour - 8) * 60 + startMin) / (9 * 60) * 100;
          const widthPercent = ((endHour - startHour) * 60 + (endMin - startMin)) / (9 * 60) * 100;
          
          return (
            <View
              key={slot.id}
              className={classnames(
                styles.slot,
                styles[statusColors[slot.status]],
                { [styles.merged]: slot.isMerged && showMerged }
              )}
              style={{
                left: `${leftPercent}%`,
                width: `${widthPercent}%`
              }}
              onClick={() => onSlotClick?.(slot)}
            >
              <Text className={styles.slotTime}>{slot.startTime}</Text>
              {slot.patientName && (
                <Text className={styles.slotPatient}>{slot.patientName}</Text>
              )}
              {slot.isMerged && showMerged && (
                <View className={styles.mergeBadge}>
                  <Text className={styles.mergeText}>合并</Text>
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
          <View className={classnames(styles.legendDot, styles.blocked)} />
          <Text className={styles.legendText}>已封锁</Text>
        </View>
      </View>
    </View>
  );
};

export default TimeSlotBar;
