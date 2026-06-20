import { create } from 'zustand';
import { QueueRecord, MissedRecord, Clinic, TimeSlot, Patient } from '@/types';
import { mockQueueRecords, mockMissedRecords } from '@/data/mockQueue';
import { mockClinics, mockTreatmentItems, mockTimeSlots } from '@/data/mockClinic';
import { sortQueue, getWaitingQueue, markAsMissed, requeueToEnd, generateQueueNumber, mergeAdjacentSlots } from '@/utils/queue';
import dayjs from 'dayjs';

interface QueueState {
  queueRecords: QueueRecord[];
  missedRecords: MissedRecord[];
  clinics: Clinic[];
  treatmentItems: Record<string, any[]>;
  timeSlots: Record<string, TimeSlot[]>;
  currentPatient: Patient;
  selectedClinicId: string;
  selectedDate: string;

  setSelectedClinicId: (id: string) => void;
  setSelectedDate: (date: string) => void;

  getWaitingList: (clinicId?: string) => QueueRecord[];
  getCurrentCalling: (clinicId?: string) => QueueRecord | null;
  getVisitingRecord: (clinicId?: string) => QueueRecord | null;
  getMissedList: (clinicId?: string) => QueueRecord[];

  callNext: (clinicId: string) => void;
  confirmVisit: (recordId: string) => void;
  markMissed: (recordId: string) => void;
  requeue: (recordId: string) => void;

  addQueueRecord: (record: Omit<QueueRecord, 'id' | 'queueNumber' | 'createTime' | 'isMerged' | 'missedCount' | 'status'>) => void;

  getClinicById: (id: string) => Clinic | undefined;
  getTreatmentItems: (clinicId: string) => any[];
  getTimeSlots: (clinicId: string, date: string) => TimeSlot[];
  getMergedTimeSlots: (clinicId: string, date: string) => TimeSlot[];

  cancelSlot: (slotId: string, clinicId: string, date: string) => void;
}

const currentPatient: Patient = {
  id: 'p001',
  name: '张伟',
  age: 32,
  gender: 'male',
  phone: '138****8888',
  idCard: '3201**********1234'
};

export const useQueueStore = create<QueueState>((set, get) => ({
  queueRecords: mockQueueRecords,
  missedRecords: mockMissedRecords,
  clinics: mockClinics,
  treatmentItems: mockTreatmentItems,
  timeSlots: mockTimeSlots,
  currentPatient,
  selectedClinicId: 'c001',
  selectedDate: dayjs().format('YYYY-MM-DD'),

  setSelectedClinicId: (id) => set({ selectedClinicId: id }),
  setSelectedDate: (date) => set({ selectedDate: date }),

  getWaitingList: (clinicId) => {
    const { queueRecords } = get();
    let records = queueRecords.filter(r => r.status === 'waiting');
    if (clinicId) {
      records = records.filter(r => r.clinicId === clinicId);
    }
    return sortQueue(records);
  },

  getCurrentCalling: (clinicId) => {
    const { queueRecords } = get();
    let calling = queueRecords.filter(r => r.status === 'calling');
    if (clinicId) {
      calling = calling.filter(r => r.clinicId === clinicId);
    }
    return calling.length > 0 ? calling[0] : null;
  },

  getVisitingRecord: (clinicId) => {
    const { queueRecords } = get();
    let visiting = queueRecords.filter(r => r.status === 'visiting');
    if (clinicId) {
      visiting = visiting.filter(r => r.clinicId === clinicId);
    }
    return visiting.length > 0 ? visiting[0] : null;
  },

  getMissedList: (clinicId) => {
    const { queueRecords } = get();
    let missed = queueRecords.filter(r => r.status === 'missed');
    if (clinicId) {
      missed = missed.filter(r => r.clinicId === clinicId);
    }
    return missed;
  },

  callNext: (clinicId) => {
    console.log('[QueueStore] callNext', { clinicId });
    set((state) => {
      const waiting = getWaitingQueue(
        state.queueRecords.filter(r => r.clinicId === clinicId)
      );
      
      if (waiting.length === 0) return state;

      const nextRecord = waiting[0];
      const updatedRecord: QueueRecord = {
        ...nextRecord,
        status: 'calling',
        callTime: new Date().toISOString()
      };

      return {
        queueRecords: state.queueRecords.map(r =>
          r.id === nextRecord.id ? updatedRecord : r
        )
      };
    });
  },

  confirmVisit: (recordId) => {
    console.log('[QueueStore] confirmVisit', { recordId });
    set((state) => ({
      queueRecords: state.queueRecords.map(r =>
        r.id === recordId
          ? { ...r, status: 'visiting', actualStartTime: new Date().toISOString() }
          : r
      )
    }));
  },

  markMissed: (recordId) => {
    console.log('[QueueStore] markMissed', { recordId });
    set((state) => {
      const record = state.queueRecords.find(r => r.id === recordId);
      if (!record) return state;

      const result = markAsMissed(record, state.queueRecords);
      
      const missedRecord: MissedRecord = {
        id: `m${Date.now()}`,
        queueRecordId: record.id,
        patientId: record.patientId,
        patientName: record.patientName,
        clinicId: record.clinicId,
        clinicName: record.clinicName,
        missedCount: result.record.missedCount,
        callTime: record.callTime || new Date().toISOString(),
        status: result.isCancelled ? 'cancelled' : 'pending',
        remark: result.isCancelled 
          ? `连续${result.record.missedCount}次过号，已自动作废` 
          : `第${result.record.missedCount}次过号，可重新排队`
      };

      return {
        queueRecords: result.allRecords,
        missedRecords: [missedRecord, ...state.missedRecords]
      };
    });
  },

  requeue: (recordId) => {
    console.log('[QueueStore] requeue', { recordId });
    set((state) => {
      const record = state.queueRecords.find(r => r.id === recordId);
      if (!record) return state;

      const result = requeueToEnd(record, state.queueRecords);

      const updatedMissedRecords = state.missedRecords.map(m =>
        m.queueRecordId === recordId
          ? { ...m, status: 'requeued' as const, requeueTime: new Date().toISOString() }
          : m
      );

      return {
        queueRecords: result.allRecords,
        missedRecords: updatedMissedRecords
      };
    });
  },

  addQueueRecord: (recordData) => {
    console.log('[QueueStore] addQueueRecord', { recordData });
    set((state) => {
      const clinicRecords = state.queueRecords.filter(
        r => r.clinicId === recordData.clinicId
      );
      const maxNum = clinicRecords.reduce((max, r) => {
        const num = parseInt(r.queueNumber.slice(1));
        return num > max ? num : max;
      }, 0);
      
      const prefix = recordData.clinicId === 'c001' ? 'A' : 
                     recordData.clinicId === 'c002' ? 'B' :
                     recordData.clinicId === 'c003' ? 'C' :
                     recordData.clinicId === 'c004' ? 'E' : 'D';

      const newRecord: QueueRecord = {
        ...recordData,
        id: `q${Date.now()}`,
        queueNumber: generateQueueNumber(prefix, maxNum + 1),
        status: 'waiting',
        missedCount: 0,
        createTime: new Date().toISOString(),
        isMerged: recordData.treatmentItemIds.length > 1
      };

      return {
        queueRecords: [...state.queueRecords, newRecord]
      };
    });
  },

  getClinicById: (id) => {
    const { clinics } = get();
    return clinics.find(c => c.id === id);
  },

  getTreatmentItems: (clinicId) => {
    const { treatmentItems } = get();
    return treatmentItems[clinicId] || [];
  },

  getTimeSlots: (clinicId, date) => {
    const { timeSlots } = get();
    const key = `${clinicId}-${date}`;
    return timeSlots[key] || [];
  },

  getMergedTimeSlots: (clinicId, date) => {
    const slots = get().getTimeSlots(clinicId, date);
    return mergeAdjacentSlots(slots);
  },

  cancelSlot: (slotId, clinicId, date) => {
    console.log('[QueueStore] cancelSlot', { slotId, clinicId, date });
    set((state) => {
      const key = `${clinicId}-${date}`;
      const slots = state.timeSlots[key] || [];
      
      const updatedSlots = slots.map(s =>
        s.id === slotId
          ? { ...s, status: 'available' as const, patientId: undefined, patientName: undefined, queueRecordId: undefined }
          : s
      );

      return {
        timeSlots: {
          ...state.timeSlots,
          [key]: updatedSlots
        }
      };
    });
  }
}));
