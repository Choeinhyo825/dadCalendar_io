/** Android DateUtils와 동일한 epoch-day(로컬 정오 기준) 계산 */
export const DateUtils = {
  toEpochDay(year, month, day) {
    const target = new Date(year, month - 1, day, 12, 0, 0, 0);
    const epoch = new Date(1970, 0, 1, 12, 0, 0, 0);
    return Math.round((target - epoch) / 86400000);
  },

  fromEpochDay(epochDay) {
    const d = new Date(1970, 0, 1, 12, 0, 0, 0);
    d.setDate(d.getDate() + epochDay);
    return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
  },

  daysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  },

  dayOfWeek(epochDay) {
    const { year, month, day } = this.fromEpochDay(epochDay);
    return new Date(year, month - 1, day).getDay() + 1;
  },

  isSunday(epochDay) {
    return this.dayOfWeek(epochDay) === 1;
  },

  isSaturday(epochDay) {
    return this.dayOfWeek(epochDay) === 7;
  },

  formatMonthTitle(year, month) {
    return `${year}년 ${month}월`;
  },

  formatDisplayDate(year, month, day) {
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  },

  todayEpochDay() {
    const t = new Date();
    return this.toEpochDay(t.getFullYear(), t.getMonth() + 1, t.getDate());
  },
};
