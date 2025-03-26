import { App, Modal } from "obsidian";
import { DateTime } from "luxon";

/**
 * A clean date picker modal using Luxon instead of Moment.js
 */
export class LuxonDatePickerModal extends Modal {
  private date: DateTime;
  private onSubmit: (date: DateTime) => void;
  private dateFormat: string;
  private monthYearEl: HTMLElement;
  private calendarEl: HTMLElement;

  constructor(
    app: App, 
    initialDate: DateTime | Date | string | null = null,
    onSubmit: (date: DateTime) => void,
    dateFormat: string = "yyyy-MM-dd"
  ) {
    super(app);
    
    // Set initial date or default to today
    if (initialDate) {
      if (initialDate instanceof Date) {
        this.date = DateTime.fromJSDate(initialDate);
      } else if (typeof initialDate === "string") {
        this.date = DateTime.fromFormat(initialDate, dateFormat);
        if (!this.date.isValid) {
          // Fallback if parsing fails
          this.date = DateTime.local();
        }
      } else {
        this.date = initialDate; // Already a DateTime object
      }
    } else {
      this.date = DateTime.local();
    }
    
    this.onSubmit = onSubmit;
    this.dateFormat = dateFormat;
  }

  onOpen(): void {
    const { contentEl } = this;
    
    // Apply styles
    contentEl.addClass("luxon-date-picker-modal");
    contentEl.createEl("style", {
      text: `
        .luxon-date-picker-modal {
          padding: 12px;
        }
        .date-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        .month-year {
          font-size: 1.2em;
          font-weight: bold;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .month-year:hover {
          color: var(--interactive-accent);
        }
        .month-year-dropdown {
          appearance: none;
          background: var(--background-primary);
          border: 1px solid var(--background-modifier-border);
          color: var(--text-normal);
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9em;
        }
        .month-year-dropdown:focus {
          outline: 1px solid var(--interactive-accent);
        }
        .nav-btn {
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.2em;
          color: var(--text-normal);
          padding: 5px 10px;
          border-radius: 4px;
        }
        .nav-btn:hover {
          color: var(--interactive-accent);
          background: var(--background-modifier-hover);
        }
        .calendar {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
          text-align: center;
        }
        .day-header {
          font-weight: bold;
          padding: 5px 0;
          color: var(--text-muted);
          font-size: 0.85em;
          text-transform: uppercase;
        }
        .day {
          padding: 8px;
          cursor: pointer;
          border-radius: 4px;
          font-size: 0.9em;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 20px;
          width: 20px;
          margin: 2px auto;
        }
        .day:hover {
          background-color: var(--background-modifier-hover);
        }
        .day.selected {
          background-color: var(--interactive-accent);
          color: var(--text-on-accent);
        }
        .day.different-month {
          color: var(--text-faint);
        }
        .day.today {
          border: 1px solid var(--interactive-accent);
        }
        .button-container {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 15px;
        }
      `
    });
    
    // Create header with month/year display and navigation buttons
    const headerEl = contentEl.createDiv({ cls: "date-header" });
    
    const prevMonthBtn = headerEl.createEl("button", { 
      cls: "nav-btn", 
      text: "←",
      attr: { "aria-label": "Previous month" }
    });
    
    const centerEl = headerEl.createDiv({ cls: "month-year" });
    
    // Create month dropdown
    const monthSelect = centerEl.createEl("select", { cls: "month-year-dropdown" });
    const monthNames = Array.from({ length: 12 }, (_, i) => 
      DateTime.local(2000, i + 1).toFormat("MMMM")
    );
    
    monthNames.forEach((month, idx) => {
      const option = monthSelect.createEl("option", { 
        text: month, 
        value: (idx + 1).toString() 
      });
      
      if (idx + 1 === this.date.month) {
        option.selected = true;
      }
    });
    
    // Create year dropdown (show 10 years before and after current year)
    const yearSelect = centerEl.createEl("select", { cls: "month-year-dropdown" });
    const currentYear = this.date.year;
    
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      const option = yearSelect.createEl("option", { 
        text: year.toString(), 
        value: year.toString() 
      });
      
      if (year === currentYear) {
        option.selected = true;
      }
    }
    
    this.monthYearEl = centerEl;
    
    const nextMonthBtn = headerEl.createEl("button", { 
      cls: "nav-btn", 
      text: "→",
      attr: { "aria-label": "Next month" }
    });
    
    // Event handlers for dropdown selectors
    monthSelect.addEventListener("change", () => {
      this.date = this.date.set({ month: parseInt(monthSelect.value) });
      this.renderCalendar();
    });
    
    yearSelect.addEventListener("change", () => {
      this.date = this.date.set({ year: parseInt(yearSelect.value) });
      this.renderCalendar();
    });
    
    // Navigation button handlers
    prevMonthBtn.addEventListener("click", () => {
      this.date = this.date.minus({ months: 1 });
      this.renderCalendar();
    });
    
    nextMonthBtn.addEventListener("click", () => {
      this.date = this.date.plus({ months: 1 });
      this.renderCalendar();
    });
    
    // Create calendar container
    this.calendarEl = contentEl.createDiv({ cls: "calendar" });
    
    // Create button container
    const buttonContainer = contentEl.createDiv({ cls: "button-container" });
    
    const cancelButton = buttonContainer.createEl("button", { text: "Cancel" });
    cancelButton.addEventListener("click", () => {
      this.close();
    });
    
    const todayButton = buttonContainer.createEl("button", { text: "Today" });
    todayButton.addEventListener("click", () => {
      this.date = DateTime.local();
      this.renderCalendar();
    });
    
    const submitButton = buttonContainer.createEl("button", { text: "Select", cls: "mod-cta" });
    submitButton.addEventListener("click", () => {
      this.onSubmit(this.date);
      this.close();
    });
    
    // Initialize calendar
    this.renderCalendar();
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }

  renderCalendar(): void {
    // Update the selects in the header
    const monthSelect = this.monthYearEl.querySelector('select:first-child') as HTMLSelectElement;
    const yearSelect = this.monthYearEl.querySelector('select:last-child') as HTMLSelectElement;
    
    if (monthSelect) {
      monthSelect.value = this.date.month.toString();
    }
    
    if (yearSelect) {
      yearSelect.value = this.date.year.toString();
    }
    
    // Clear the calendar
    this.calendarEl.empty();
    
    // Add day headers (Mon, Tue, etc.)
    const weekdays = Array.from({ length: 7 }, (_, i) => 
      DateTime.local(2000, 1, 3 + i).toFormat('ccc') // Start with Monday (3rd Jan 2000 was a Monday)
    );
    
    weekdays.forEach(day => {
      this.calendarEl.createDiv({ cls: "day-header", text: day });
    });
    
    // Get the start of the month view (could be in the previous month)
    // First day of current month
    let monthStart = this.date.startOf('month');
    
    // Find the Monday before or on the start of the month
    // In Luxon, 1 is Monday, 7 is Sunday
    const dayOfWeek = monthStart.weekday;
    let viewStart = monthStart.minus({ days: (dayOfWeek - 1) % 7 });
    
    const today = DateTime.local().startOf('day');
    const selectedDate = this.date.startOf('day');
    
    // Create 6 weeks (42 days) to ensure we always have enough days
    for (let i = 0; i < 42; i++) {
      const currentDate = viewStart.plus({ days: i });
      const isDifferentMonth = currentDate.month !== this.date.month;
      const isToday = currentDate.hasSame(today, 'day');
      const isSelected = currentDate.hasSame(selectedDate, 'day');
      
      const dayEl = this.calendarEl.createDiv({ 
        cls: `day ${isDifferentMonth ? "different-month" : ""} ${isToday ? "today" : ""} ${isSelected ? "selected" : ""}`,
        text: currentDate.day.toString()
      });
      
      dayEl.addEventListener("click", () => {
        // Update the selected date
        this.date = currentDate;
        this.renderCalendar();
      });
    }
  }
}

