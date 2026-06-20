import { QueueRecord, TimeSlot } from '@/types';

const MAX_MISSED_COUNT = 3;

export const sortQueue = (records: QueueRecord[]): QueueRecord[] => {
  const priorityOrder = { crisis: 0, urgent: 1, normal: 2 };
  
  return [...records].sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.createTime).getTime() - new Date(b.createTime).getTime();
  });
};

export const getWaitingQueue = (records: QueueRecord[]): QueueRecord[] => {
  return sortQueue(records.filter(r => r.status === 'waiting'));
};

export const getCurrentCalling = (records: QueueRecord[]): QueueRecord | null => {
  const calling = records.filter(r => r.status === 'calling');
  return calling.length > 0 ? calling[0] : null;
};

export const getVisitingRecord = (records: QueueRecord[]): QueueRecord | null => {
  const visiting = records.filter(r => r.status === 'visiting');
  return visiting.length > 0 ? visiting[0] : null;
};

export const getMissedQueue = (records: QueueRecord[]): QueueRecord[] => {
  return records.filter(r => r.status === 'missed');
};

export const canRequeue = (record: QueueRecord): boolean => {
  return record.missedCount < MAX_MISSED_COUNT;
};

export const shouldCancel = (record: QueueRecord): boolean => {
  return record.missedCount >= MAX_MISSED_COUNT;
};

export const requeueToEnd = (
  record: QueueRecord,
  allRecords: QueueRecord[]
): { record: QueueRecord; allRecords: QueueRecord[] } => {
  const updatedRecord: QueueRecord = {
    ...record,
    status: 'waiting',
    createTime: new Date().toISOString()
  };

  const newRecords = allRecords
    .filter(r => r.id !== record.id)
    .concat(updatedRecord);

  return {
    record: updatedRecord,
    allRecords: sortQueue(newRecords)
  };
};

export const markAsMissed = (
  record: QueueRecord,
  allRecords: QueueRecord[]
): { record: QueueRecord; allRecords: QueueRecord[]; isCancelled: boolean; isRequeued: boolean } => {
  const newMissedCount = record.missedCount + 1;
  const isCancelled = newMissedCount >= MAX_MISSED_COUNT;
  const isRequeued = !isCancelled;

  let updatedRecord: QueueRecord;
  let newRecords: QueueRecord[];

  if (isCancelled) {
    updatedRecord = {
      ...record,
      status: 'cancelled',
      missedCount: newMissedCount,
      callTime: new Date().toISOString()
    };
    newRecords = allRecords.map(r =>
      r.id === record.id ? updatedRecord : r
    );
  } else {
    updatedRecord = {
      ...record,
      status: 'waiting',
      missedCount: newMissedCount,
      callTime: new Date().toISOString(),
      createTime: new Date().toISOString()
    };
    newRecords = allRecords
      .filter(r => r.id !== record.id)
      .concat(updatedRecord);
    newRecords = sortQueue(newRecords);
  }

  return {
    record: updatedRecord,
    allRecords: newRecords,
    isCancelled,
    isRequeued
  };
};

export const mergeAdjacentSlots = (slots: TimeSlot[]): TimeSlot[] => {
  if (slots.length === 0) return [];

  const sorted = [...slots].sort((a, b) => 
    a.startTime.localeCompare(b.startTime)
  );

  const merged: TimeSlot[] = [];
  let current = { ...sorted[0] };
  let mergedIds: string[] = [sorted[0].id];

  for (let i = 1; i < sorted.length; i++) {
    const slot = sorted[i];
    const isSamePatient = current.patientId === slot.patientId && slot.patientId !== undefined;
    const isAdjacent = current.endTime === slot.startTime;

    if (isSamePatient && isAdjacent) {
      current.endTime = slot.endTime;
      current.isMerged = true;
      mergedIds.push(slot.id);
    } else {
      if (current.isMerged) {
        current.mergedSlotIds = [...mergedIds];
      }
      merged.push(current);
      current = { ...slot };
      mergedIds = [slot.id];
    }
  }

  if (current.isMerged) {
    current.mergedSlotIds = [...mergedIds];
  }
  merged.push(current);

  return merged;
};

export const splitMergedSlot = (
  mergedSlot: TimeSlot,
  originalSlots: TimeSlot[]
): TimeSlot[] => {
  if (!mergedSlot.isMerged || !mergedSlot.mergedSlotIds) {
    return [mergedSlot];
  }

  return originalSlots.filter(s => 
    mergedSlot.mergedSlotIds?.includes(s.id)
  );
};

export const generateQueueNumber = (prefix: string, index: number): string => {
  return `${prefix}${String(index).padStart(3, '0')}`;
};
