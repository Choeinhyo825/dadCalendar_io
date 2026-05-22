import { DateUtils } from "./date-utils.js";
import { ShiftType, loadStore, saveStore, resolveShift, dayNumberColor, markClass } from "./schedule.js";

let store = loadStore();
let viewYear;
let viewMonth;

const els = {
  monthTitle: document.getElementById("month-title"),
  calendarGrid: document.getElementById("calendar-grid"),
  btnPrev: document.getElementById("btn-prev"),
  btnNext: document.getElementById("btn-next"),
  btnGoToday: document.getElementById("btn-go-today"),
  btnSettings: document.getElementById("btn-settings"),
  dlgMonth: document.getElementById("dlg-month"),
  dlgSettings: document.getElementById("dlg-settings"),
  pickYear: document.getElementById("pick-year"),
  pickMonth: document.getElementById("pick-month"),
  anchorYear: document.getElementById("anchor-year"),
  anchorMonth: document.getElementById("anchor-month"),
  anchorShift: document.querySelectorAll('input[name="anchor-shift"]'),
};

function fillAnchorDatePicker(year, month) {
  els.anchorYear.innerHTML = "";
  for (let y = year - 10; y <= year + 10; y++) {
    const opt = document.createElement("option");
    opt.value = String(y);
    opt.textContent = `${y}년`;
    if (y === year) opt.selected = true;
    els.anchorYear.appendChild(opt);
  }

  els.anchorMonth.innerHTML = "";
  for (let m = 1; m <= 12; m++) {
    const opt = document.createElement("option");
    opt.value = String(m);
    opt.textContent = `${m}월`;
    if (m === month) opt.selected = true;
    els.anchorMonth.appendChild(opt);
  }
}

function initViewFromToday() {
  const today = DateUtils.todayEpochDay();
  viewYear = DateUtils.fromEpochDay(today).year;
  viewMonth = DateUtils.fromEpochDay(today).month;
}

function openMonthPicker() {
  const y = viewYear;
  els.pickYear.innerHTML = "";
  for (let year = y - 5; year <= y + 5; year++) {
    const opt = document.createElement("option");
    opt.value = String(year);
    opt.textContent = `${year}년`;
    if (year === viewYear) opt.selected = true;
    els.pickYear.appendChild(opt);
  }
  els.pickMonth.value = String(viewMonth);
  els.dlgMonth.showModal();
}

function applyMonthPick() {
  viewYear = Number(els.pickYear.value);
  viewMonth = Number(els.pickMonth.value);
  render();
}

function openSettings() {
  const { year, month } = DateUtils.fromEpochDay(store.anchorEpochDay);
  fillAnchorDatePicker(year, month);
  for (const radio of els.anchorShift) {
    radio.checked = radio.value === store.anchorShift;
  }
  els.dlgSettings.showModal();
}

function saveSettings() {
  const y = Number(els.anchorYear.value);
  const m = Number(els.anchorMonth.value);
  const prevDay = DateUtils.fromEpochDay(store.anchorEpochDay).day;
  const d = Math.min(prevDay, DateUtils.daysInMonth(y, m));
  const shift =
    [...els.anchorShift].find((r) => r.checked)?.value === ShiftType.ON_DUTY
      ? ShiftType.ON_DUTY
      : ShiftType.REGULAR;
  store = {
    anchorEpochDay: DateUtils.toEpochDay(y, m, d),
    anchorShift: shift,
  };
  saveStore(store);
  els.dlgSettings.close();
  render();
}

function goToToday() {
  const today = DateUtils.todayEpochDay();
  viewYear = DateUtils.fromEpochDay(today).year;
  viewMonth = DateUtils.fromEpochDay(today).month;
  render();
}

function changeMonth(delta) {
  viewMonth += delta;
  if (viewMonth < 1) {
    viewMonth = 12;
    viewYear -= 1;
  } else if (viewMonth > 12) {
    viewMonth = 1;
    viewYear += 1;
  }
  render();
}

function render() {
  const today = DateUtils.todayEpochDay();
  els.monthTitle.textContent = DateUtils.formatMonthTitle(viewYear, viewMonth);

  const daysInMonth = DateUtils.daysInMonth(viewYear, viewMonth);
  const firstEpoch = DateUtils.toEpochDay(viewYear, viewMonth, 1);
  const startColumn = DateUtils.dayOfWeek(firstEpoch) - 1;

  let prevYear = viewYear;
  let prevMonth = viewMonth - 1;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear -= 1;
  }
  let nextYear = viewYear;
  let nextMonth = viewMonth + 1;
  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }
  const prevDays = DateUtils.daysInMonth(prevYear, prevMonth);

  els.calendarGrid.innerHTML = "";

  for (let cell = 0; cell < 42; cell++) {
    const dayIndex = cell - startColumn;
    let displayYear;
    let displayMonth;
    let displayDay;
    let isCurrentMonth;

    if (dayIndex < 0) {
      isCurrentMonth = false;
      displayYear = prevYear;
      displayMonth = prevMonth;
      displayDay = prevDays + dayIndex + 1;
    } else if (dayIndex >= daysInMonth) {
      isCurrentMonth = false;
      displayYear = nextYear;
      displayMonth = nextMonth;
      displayDay = dayIndex - daysInMonth + 1;
    } else {
      isCurrentMonth = true;
      displayYear = viewYear;
      displayMonth = viewMonth;
      displayDay = dayIndex + 1;
    }

    const epochDay = DateUtils.toEpochDay(displayYear, displayMonth, displayDay);
    const shift = resolveShift(store, epochDay);
    const isToday = epochDay === today;
    const color = dayNumberColor(epochDay, shift, isCurrentMonth, isToday);
    const mark = markClass(shift, isCurrentMonth);

    const cellEl = document.createElement("div");
    cellEl.className = "day-cell";

    const markEl = document.createElement("div");
    markEl.className = `day-mark ${mark}`.trim();

    const wrapEl = document.createElement("div");
    wrapEl.className = "day-number-wrap" + (isCurrentMonth && isToday ? " is-today" : "");

    const numEl = document.createElement("span");
    numEl.className = `day-number color-${color}`;
    numEl.textContent = String(displayDay);

    wrapEl.appendChild(numEl);
    markEl.appendChild(wrapEl);
    cellEl.appendChild(markEl);
    els.calendarGrid.appendChild(cellEl);
  }
}

function bind() {
  els.btnPrev.addEventListener("click", () => changeMonth(-1));
  els.btnNext.addEventListener("click", () => changeMonth(1));
  els.monthTitle.addEventListener("click", openMonthPicker);
  els.btnGoToday.addEventListener("click", goToToday);
  els.btnSettings.addEventListener("click", openSettings);

  document.getElementById("month-pick-ok").addEventListener("click", () => {
    applyMonthPick();
    els.dlgMonth.close();
  });
  document.getElementById("month-pick-cancel").addEventListener("click", () => els.dlgMonth.close());

  document.getElementById("settings-save").addEventListener("click", saveSettings);
  document.getElementById("settings-cancel").addEventListener("click", () => els.dlgSettings.close());
}

initViewFromToday();
bind();
render();
