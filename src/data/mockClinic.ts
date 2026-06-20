import { Clinic, TreatmentItem, TimeSlot } from '@/types';

export const mockClinics: Clinic[] = [
  {
    id: 'c001',
    name: '精神科一诊室',
    type: 'general',
    doctorName: '王明远',
    location: '门诊楼3楼301',
    description: '普通精神科门诊，主治抑郁症、焦虑症等常见精神疾病',
    status: 'open'
  },
  {
    id: 'c002',
    name: '精神科二诊室',
    type: 'specialist',
    doctorName: '李秀英',
    location: '门诊楼3楼302',
    description: '专家门诊，主治精神分裂症、双相情感障碍等重症',
    status: 'open'
  },
  {
    id: 'c003',
    name: '心理治疗室',
    type: 'therapy',
    doctorName: '张建国',
    location: '门诊楼4楼401',
    description: '心理咨询与治疗，提供认知行为疗法等心理干预',
    status: 'open'
  },
  {
    id: 'c004',
    name: '急诊观察室',
    type: 'emergency',
    doctorName: '陈海波',
    location: '急诊楼1楼',
    description: '精神科急诊，处理急性精神危机和自伤风险患者',
    status: 'open'
  },
  {
    id: 'c005',
    name: '儿童精神科',
    type: 'specialist',
    doctorName: '刘芳',
    location: '门诊楼3楼305',
    description: '儿童青少年精神心理专科',
    status: 'pause'
  }
];

export const mockTreatmentItems: Record<string, TreatmentItem[]> = {
  c001: [
    { id: 't001', name: '初诊评估', duration: 30, price: 100, description: '首次就诊，病情评估' },
    { id: 't002', name: '复诊问诊', duration: 15, price: 50, description: '常规复诊' },
    { id: 't003', name: '药物调整', duration: 20, price: 80, description: '用药方案调整' }
  ],
  c002: [
    { id: 't004', name: '专家会诊', duration: 45, price: 200, description: '专家门诊初诊' },
    { id: 't005', name: '专家复诊', duration: 30, price: 150, description: '专家复诊' },
    { id: 't006', name: '病例讨论', duration: 60, price: 300, description: '复杂病例讨论' }
  ],
  c003: [
    { id: 't007', name: '认知行为治疗', duration: 50, price: 200, description: 'CBT认知行为疗法' },
    { id: 't008', name: '心理咨询', duration: 50, price: 150, description: '一对一心理咨询' },
    { id: 't009', name: '家庭治疗', duration: 60, price: 250, description: '家庭系统治疗' }
  ],
  c004: [
    { id: 't010', name: '急诊评估', duration: 30, price: 150, description: '急性精神状况评估' },
    { id: 't011', name: '危机干预', duration: 60, price: 300, description: '危机状况紧急干预' }
  ],
  c005: [
    { id: 't012', name: '儿童评估', duration: 45, price: 180, description: '儿童心理评估' },
    { id: 't013', name: '亲子咨询', duration: 50, price: 200, description: '亲子关系咨询' }
  ]
};

const generateTimeSlots = (clinicId: string, date: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 8;
  const endHour = 17;
  const interval = 30;

  let slotId = 1;
  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += interval) {
      const startTime = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      const endMin = min + interval;
      const endHourTime = endMin >= 60 ? hour + 1 : hour;
      const endMinStr = endMin >= 60 ? endMin - 60 : endMin;
      const endTime = `${String(endHourTime).padStart(2, '0')}:${String(endMinStr).padStart(2, '0')}`;

      if (hour === 12 && min < 30) continue;

      slots.push({
        id: `${clinicId}-${date}-s${slotId++}`,
        clinicId,
        startTime,
        endTime,
        status: 'available',
        isMerged: false
      });
    }
  }

  return slots;
};

export const mockTimeSlots: Record<string, TimeSlot[]> = {
  'c001-2026-06-20': generateTimeSlots('c001', '2026-06-20'),
  'c002-2026-06-20': generateTimeSlots('c002', '2026-06-20'),
  'c003-2026-06-20': generateTimeSlots('c003', '2026-06-20'),
  'c004-2026-06-20': generateTimeSlots('c004', '2026-06-20'),
  'c005-2026-06-20': generateTimeSlots('c005', '2026-06-20')
};

export const getClinicTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    general: '普通门诊',
    specialist: '专家门诊',
    therapy: '心理治疗',
    emergency: '急诊'
  };
  return labels[type] || type;
};
