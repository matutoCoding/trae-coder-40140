import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import StatusBadge from '@/components/StatusBadge';
import { QueueRecord } from '@/types';
import { formatDuration } from '@/utils/time';
import styles from './index.module.scss';

interface QueueCardProps {
  record: QueueRecord;
  showActions?: boolean;
  onConfirm?: () => void;
  onMissed?: () => void;
  onRequeue?: () => void;
  onClick?: () => void;
}

const QueueCard: React.FC<QueueCardProps> = ({
  record,
  showActions = false,
  onConfirm,
  onMissed,
  onRequeue,
  onClick
}) => {
  return (
    <View 
      className={classnames(styles.card, { [styles.clickable]: !!onClick })}
      onClick={onClick}
    >
      <View className={styles.header}>
        <View className={styles.queueNumber}>
          <Text className={styles.numberText}>{record.queueNumber}</Text>
        </View>
        <View className={styles.headerRight}>
          <StatusBadge status={record.status as any} size="md" />
          {record.priority !== 'normal' && (
            <StatusBadge status={record.priority as any} size="md" />
          )}
          {record.isMerged && (
            <View className={styles.mergedTag}>
              <Text className={styles.mergedText}>合并</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.body}>
        <View className={styles.patientInfo}>
          <Text className={styles.patientName}>{record.patientName}</Text>
          {record.missedCount > 0 && (
            <Text className={styles.missedCount}>过号{record.missedCount}次</Text>
          )}
        </View>
        <Text className={styles.clinicName}>{record.clinicName}</Text>
        <Text className={styles.treatment}>
          {record.treatmentItemNames.join(' + ')}
        </Text>
        <Text className={styles.duration}>预计时长：{formatDuration(record.totalDuration)}</Text>
      </View>

      {showActions && (
        <View className={styles.actions}>
          {record.status === 'calling' && (
            <>
              <Button 
                className={classnames(styles.actionBtn, styles.primary)}
                onClick={onConfirm}
              >
                确认就诊
              </Button>
              <Button 
                className={classnames(styles.actionBtn, styles.warning)}
                onClick={onMissed}
              >
                过号
              </Button>
            </>
          )}
          {record.status === 'missed' && record.missedCount < 3 && (
            <Button 
              className={classnames(styles.actionBtn, styles.primary)}
              onClick={onRequeue}
            >
              重新排队
            </Button>
          )}
        </View>
      )}
    </View>
  );
};

export default QueueCard;
