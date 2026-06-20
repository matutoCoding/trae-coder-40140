import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

export type StatusType = 'waiting' | 'calling' | 'visiting' | 'missed' | 'cancelled' | 'completed' | 'crisis' | 'urgent' | 'normal';

interface StatusBadgeProps {
  status: StatusType;
  text?: string;
  size?: 'sm' | 'md';
}

const statusMap: Record<StatusType, { label: string; className: string }> = {
  waiting: { label: '等待中', className: 'waiting' },
  calling: { label: '叫号中', className: 'calling' },
  visiting: { label: '就诊中', className: 'visiting' },
  missed: { label: '已过号', className: 'missed' },
  cancelled: { label: '已作废', className: 'cancelled' },
  completed: { label: '已完成', className: 'completed' },
  crisis: { label: '危急', className: 'crisis' },
  urgent: { label: '加急', className: 'urgent' },
  normal: { label: '普通', className: 'normal' }
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, text, size = 'sm' }) => {
  const info = statusMap[status] || statusMap.normal;
  
  return (
    <View className={classnames(styles.badge, styles[info.className], styles[size])}>
      <Text className={styles.text}>{text || info.label}</Text>
    </View>
  );
};

export default StatusBadge;
