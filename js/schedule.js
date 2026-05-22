import { DateUtils } from "./date-utils.js";

/** Android ShiftType + ScheduleResolver */
export const ShiftType = {
  REGULAR: "REGULAR",
  OFF: "OFF",
  ON_DUTY: "ON_DUTY",
};

const CYCLE = [ShiftType.REGULAR, ShiftType.OFF, ShiftType.ON_DUTY, ShiftType.OFF];

const STORAGE_KEY = "dadCalendar_web_v1";

const defaultStore = () => ({
  anchorEpochDay: DateUtils.toEpochDay(2026, 1, 5),
  anchorShift: ShiftType.ON_DUTY,
});

function anchorPhase(anchorShift) {
  if (anchorShift === ShiftType.ON_DUTY) return 2;
  if (anchorShift === ShiftType.OFF) return 1;
  return 0;
}

function mod(value, divisor) {
  const result = value % divisor;
  return result < 0 ? result + divisor : result;
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStore();
    const parsed = JSON.parse(raw);
    return {
      anchorEpochDay: Number(parsed.anchorEpochDay) || defaultStore().anchorEpochDay,
      anchorShift:
        parsed.anchorShift === ShiftType.ON_DUTY ? ShiftType.ON_DUTY : ShiftType.REGULAR,
    };
  } catch {
    return defaultStore();
  }
}

export function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function resolveShift(store, epochDay) {
  const dayDiff = epochDay - store.anchorEpochDay;
  const phase = mod(anchorPhase(store.anchorShift) + dayDiff, CYCLE.length);
  return CYCLE[phase];
}

export function dayNumberColor(epochDay, shift, isCurrentMonth, isToday) {
  if (!isCurrentMonth) return "adjacent";
  if (isToday) return "on-dark";
  if (shift === ShiftType.ON_DUTY) {
    if (DateUtils.isSunday(epochDay)) return "sunday";
    if (DateUtils.isSaturday(epochDay)) return "saturday";
    return "duty";
  }
  if (DateUtils.isSunday(epochDay)) return "sunday";
  if (DateUtils.isSaturday(epochDay)) return "saturday";
  return "default";
}

export function markClass(shift, isCurrentMonth) {
  if (!isCurrentMonth || shift === ShiftType.OFF) return "";
  if (shift === ShiftType.ON_DUTY) return "mark-duty";
  if (shift === ShiftType.REGULAR) return "mark-regular";
  return "";
}
