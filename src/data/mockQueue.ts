import { QueueRecord, MissedRecord } from '@/types';
import { sortQueue } from '@/utils/queue';

const now = new Date('2026-06-20T09:30:00');

const createTime = (minutesAgo: number): string => {
  return new Date(now.getTime() - minutesAgo * 60 * 1000).toISOString();
};

export const mockQueueRecords: QueueRecord[] = sortQueue([
  {
    id: 'q001',
    patientId: 'p001',
    patientName: '张伟',
    clinicId: 'c001',
    clinicName: '精神科一诊室',
    treatmentItemIds: ['t001'],
    treatmentItemNames: ['初诊评估'],
    queueNumber: 'A001',
    status: 'completed',
    priority: 'normal',
    missedCount: 0,
    totalDuration: 30,
    actualStartTime: createTime(120),
    actualEndTime: createTime(90),
    createTime: createTime(150),
    isMerged: false
  },
  {
    id: 'q002',
    patientId: 'p002',
    patientName: '李娜',
    clinicId: 'c001',
    clinicName: '精神科一诊室',
    treatmentItemIds: ['t002'],
    treatmentItemNames: ['复诊问诊'],
    queueNumber: 'A002',
    status: 'completed',
    priority: 'normal',
    missedCount: 0,
    totalDuration: 15,
    actualStartTime: createTime(80),
    actualEndTime: createTime(65),
    createTime: createTime(100),
    isMerged: false
  },
  {
    id: 'q003',
    patientId: 'p003',
    patientName: '王强',
    clinicId: 'c001',
    clinicName: '精神科一诊室',
    treatmentItemIds: ['t001', 't003'],
    treatmentItemNames: ['初诊评估', '药物调整'],
    queueNumber: 'A003',
    status: 'visiting',
    priority: 'normal',
    missedCount: 0,
    totalDuration: 50,
    actualStartTime: createTime(20),
    createTime: createTime(60),
    isMerged: true,
    mergedFrom: ['q003-1', 'q003-2']
  },
  {
    id: 'q004',
    patientId: 'p004',
    patientName: '刘芳',
    clinicId: 'c001',
    clinicName: '精神科一诊室',
    treatmentItemIds: ['t002'],
    treatmentItemNames: ['复诊问诊'],
    queueNumber: 'A004',
    status: 'calling',
    priority: 'normal',
    missedCount: 0,
    totalDuration: 15,
    callTime: createTime(2),
    createTime: createTime(45),
    isMerged: false
  },
  {
    id: 'q005',
    patientId: 'p005',
    patientName: '陈明',
    clinicId: 'c001',
    clinicName: '精神科一诊室',
    treatmentItemIds: ['t002'],
    treatmentItemNames: ['复诊问诊'],
    queueNumber: 'A005',
    status: 'waiting',
    priority: 'urgent',
    missedCount: 0,
    totalDuration: 15,
    createTime: createTime(35),
    isMerged: false
  },
  {
    id: 'q006',
    patientId: 'p006',
    patientName: '赵雪',
    clinicId: 'c001',
    clinicName: '精神科一诊室',
    treatmentItemIds: ['t001'],
    treatmentItemNames: ['初诊评估'],
    queueNumber: 'A006',
    status: 'waiting',
    priority: 'normal',
    missedCount: 1,
    totalDuration: 30,
    createTime: createTime(30),
    isMerged: false
  },
  {
    id: 'q007',
    patientId: 'p007',
    patientName: '孙磊',
    clinicId: 'c001',
    clinicName: '精神科一诊室',
    treatmentItemIds: ['t003'],
    treatmentItemNames: ['药物调整'],
    queueNumber: 'A007',
    status: 'waiting',
    priority: 'normal',
    missedCount: 0,
    totalDuration: 20,
    createTime: createTime(25),
    isMerged: false
  },
  {
    id: 'q008',
    patientId: 'p008',
    patientName: '周静',
    clinicId: 'c001',
    clinicName: '精神科一诊室',
    treatmentItemIds: ['t001', 't002'],
    treatmentItemNames: ['初诊评估', '复诊问诊'],
    queueNumber: 'A008',
    status: 'waiting',
    priority: 'crisis',
    missedCount: 0,
    totalDuration: 45,
    createTime: createTime(15),
    isMerged: true
  },
  {
    id: 'q009',
    patientId: 'p009',
    patientName: '吴涛',
    clinicId: 'c001',
    clinicName: '精神科一诊室',
    treatmentItemIds: ['t002'],
    treatmentItemNames: ['复诊问诊'],
    queueNumber: 'A009',
    status: 'waiting',
    priority: 'normal',
    missedCount: 0,
    totalDuration: 15,
    createTime: createTime(10),
    isMerged: false
  },
  {
    id: 'q010',
    patientId: 'p010',
    patientName: '郑敏',
    clinicId: 'c001',
    clinicName: '精神科一诊室',
    treatmentItemIds: ['t001'],
    treatmentItemNames: ['初诊评估'],
    queueNumber: 'A010',
    status: 'missed',
    priority: 'normal',
    missedCount: 2,
    callTime: createTime(5),
    createTime: createTime(40),
    isMerged: false
  },
  {
    id: 'q011',
    patientId: 'p011',
    patientName: '马超',
    clinicId: 'c001',
    clinicName: '精神科一诊室',
    treatmentItemIds: ['t002'],
    treatmentItemNames: ['复诊问诊'],
    queueNumber: 'A011',
    status: 'cancelled',
    priority: 'normal',
    missedCount: 3,
    createTime: createTime(80),
    isMerged: false
  },
  {
    id: 'q012',
    patientId: 'p012',
    patientName: '黄丽',
    clinicId: 'c002',
    clinicName: '精神科二诊室',
    treatmentItemIds: ['t004'],
    treatmentItemNames: ['专家会诊'],
    queueNumber: 'B001',
    status: 'visiting',
    priority: 'normal',
    missedCount: 0,
    totalDuration: 45,
    actualStartTime: createTime(30),
    createTime: createTime(90),
    isMerged: false
  },
  {
    id: 'q013',
    patientId: 'p013',
    patientName: '林峰',
    clinicId: 'c002',
    clinicName: '精神科二诊室',
    treatmentItemIds: ['t005'],
    treatmentItemNames: ['专家复诊'],
    queueNumber: 'B002',
    status: 'waiting',
    priority: 'normal',
    missedCount: 0,
    totalDuration: 30,
    createTime: createTime(50),
    isMerged: false
  }
]);

export const mockMissedRecords: MissedRecord[] = [
  {
    id: 'm001',
    queueRecordId: 'q010',
    patientId: 'p010',
    patientName: '郑敏',
    clinicId: 'c001',
    clinicName: '精神科一诊室',
    missedCount: 2,
    callTime: createTime(5),
    status: 'pending',
    remark: '第二次过号，可重新排队'
  },
  {
    id: 'm002',
    queueRecordId: 'q011',
    patientId: 'p011',
    patientName: '马超',
    clinicId: 'c001',
    clinicName: '精神科一诊室',
    missedCount: 3,
    callTime: createTime(40),
    status: 'cancelled',
    remark: '连续三次过号，已自动作废'
  },
  {
    id: 'm003',
    queueRecordId: 'q006',
    patientId: 'p006',
    patientName: '赵雪',
    clinicId: 'c001',
    clinicName: '精神科一诊室',
    missedCount: 1,
    callTime: createTime(55),
    requeueTime: createTime(50),
    status: 'requeued',
    remark: '已重新排到队尾'
  }
];

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    waiting: '等待中',
    calling: '叫号中',
    visiting: '就诊中',
    missed: '已过号',
    cancelled: '已作废',
    completed: '已完成'
  };
  return labels[status] || status;
};

export const getPriorityLabel = (priority: string): string => {
  const labels: Record<string, string> = {
    normal: '普通',
    urgent: '加急',
    crisis: '危急'
  };
  return labels[priority] || priority;
};
