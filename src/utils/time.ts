import dayjs from 'dayjs';

export const formatTime = (time: string | Date, format = 'HH:mm'): string => {
  return dayjs(time).format(format);
};

export const formatDateTime = (time: string | Date, format = 'YYYY-MM-DD HH:mm'): string => {
  return dayjs(time).format(format);
};

export const formatDate = (date: string | Date, format = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const addMinutes = (time: string | Date, minutes: number): Date => {
  return dayjs(time).add(minutes, 'minute').toDate();
};

export const diffMinutes = (start: string | Date, end: string | Date): number => {
  return dayjs(end).diff(dayjs(start), 'minute');
};

export const isSameDay = (date1: string | Date, date2: string | Date): boolean => {
  return dayjs(date1).isSame(dayjs(date2), 'day');
};

export const getTodayStr = (): string => {
  return dayjs().format('YYYY-MM-DD');
};

export const generateTimeSlots = (
  startTime: string,
  endTime: string,
  interval: number
): { start: string; end: string }[] => {
  const slots: { start: string; end: string }[] = [];
  let current = dayjs(startTime);
  const end = dayjs(endTime);

  while (current.isBefore(end)) {
    const slotEnd = current.add(interval, 'minute');
    if (slotEnd.isAfter(end)) break;
    slots.push({
      start: current.format('HH:mm'),
      end: slotEnd.format('HH:mm')
    });
    current = slotEnd;
  }

  return slots;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
};
