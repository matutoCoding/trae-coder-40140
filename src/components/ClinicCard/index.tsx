import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import classnames from 'classnames';
import StatusBadge from '@/components/StatusBadge';
import { Clinic } from '@/types';
import { getClinicTypeLabel } from '@/data/mockClinic';
import styles from './index.module.scss';

interface ClinicCardProps {
  clinic: Clinic;
  waitingCount?: number;
  showAction?: boolean;
  actionText?: string;
  onAction?: () => void;
  onClick?: () => void;
}

const ClinicCard: React.FC<ClinicCardProps> = ({
  clinic,
  waitingCount,
  showAction = false,
  actionText = '查看详情',
  onAction,
  onClick
}) => {
  const statusMap: Record<string, string> = {
    open: '正常',
    closed: '停诊',
    pause: '暂停'
  };

  return (
    <View 
      className={classnames(styles.card, { [styles.clickable]: !!onClick })}
      onClick={onClick}
    >
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <Text className={styles.name}>{clinic.name}</Text>
          <StatusBadge 
            status={clinic.status === 'open' ? 'waiting' : 'cancelled'} 
            text={statusMap[clinic.status]}
          />
        </View>
        <Text className={styles.type}>{getClinicTypeLabel(clinic.type)}</Text>
      </View>

      <View className={styles.body}>
        <View className={styles.infoRow}>
          <Text className={styles.label}>医生</Text>
          <Text className={styles.value}>{clinic.doctorName}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>位置</Text>
          <Text className={styles.value}>{clinic.location}</Text>
        </View>
        {waitingCount !== undefined && (
          <View className={styles.infoRow}>
            <Text className={styles.label}>等待人数</Text>
            <Text className={classnames(styles.value, styles.highlight)}>
              {waitingCount} 人
            </Text>
          </View>
        )}
      </View>

      {showAction && (
        <View className={styles.footer}>
          <Button 
            className={styles.actionBtn}
            onClick={(e) => {
              e.stopPropagation();
              onAction?.();
            }}
          >
            {actionText}
          </Button>
        </View>
      )}
    </View>
  );
};

export default ClinicCard;
