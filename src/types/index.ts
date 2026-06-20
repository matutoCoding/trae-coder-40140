// 患者信息
export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  idCard: string;
  avatar?: string;
}

// 诊室类型
export type ClinicType = 'general' | 'specialist' | 'therapy' | 'emergency';

// 诊室信息
export interface Clinic {
  id: string;
  name: string;
  type: ClinicType;
  doctorName: string;
  location: string;
  description?: string;
  status: 'open' | 'closed' | 'pause';
}

// 诊疗项目
export interface TreatmentItem {
  id: string;
  name: string;
  duration: number; // 分钟
  price: number;
  description?: string;
}

// 排队状态
export type QueueStatus = 'waiting' | 'calling' | 'visiting' | 'missed' | 'cancelled' | 'completed';

// 优先级
export type PriorityLevel = 'normal' | 'urgent' | 'crisis';

// 排队记录
export interface QueueRecord {
  id: string;
  patientId: string;
  patientName: string;
  clinicId: string;
  clinicName: string;
  treatmentItemIds: string[];
  treatmentItemNames: string[];
  queueNumber: string;
  status: QueueStatus;
  priority: PriorityLevel;
  missedCount: number;
  totalDuration: number; // 总时长（分钟）
  estimatedStartTime?: string;
  actualStartTime?: string;
  actualEndTime?: string;
  createTime: string;
  callTime?: string;
  isMerged: boolean; // 是否为合并时段
  mergedFrom?: string[]; // 合并自哪些记录
}

// 占用时段（诊室排期用）
export interface TimeSlot {
  id: string;
  clinicId: string;
  startTime: string;
  endTime: string;
  patientId?: string;
  patientName?: string;
  queueRecordId?: string;
  treatmentItemId?: string;
  treatmentItemName?: string;
  status: 'available' | 'occupied' | 'blocked';
  isMerged: boolean;
  mergedSlotIds?: string[];
}

// 过号记录
export interface MissedRecord {
  id: string;
  queueRecordId: string;
  patientId: string;
  patientName: string;
  clinicId: string;
  clinicName: string;
  missedCount: number;
  callTime: string;
  requeueTime?: string;
  status: 'pending' | 'requeued' | 'cancelled';
  remark?: string;
}

export type CrisisLevel = 'low' | 'medium' | 'high' | 'critical';

// 危机评估结果
export interface CrisisAssessment {
  id: string;
  patientId: string;
  score: number;
  level: CrisisLevel;
  assessmentTime: string;
  answers: CrisisAnswer[];
  suggestion?: string;
}

export interface CrisisAnswer {
  questionId: string;
  answer: number;
}

// 危机评估问题选项
export interface CrisisOption {
  value: number;
  label: string;
  level: CrisisLevel;
  desc?: string;
}

// 危机评估问题
export interface CrisisQuestion {
  id: string;
  question: string;
  category: string;
  options: CrisisOption[];
}
