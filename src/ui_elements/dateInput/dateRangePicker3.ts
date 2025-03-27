import { App } from "obsidian"
import { DateTime } from "luxon"
import { date_range_picker_style } from "./style_var"
import { parseDate } from "./dates"

export class DateRangePicker {
  private app: App

  private dateFormat: string
  private startDate: DateTime | null
  private endDate: DateTime | null
  private activeDate: DateTime

  private rangeInputSettingEl: HTMLInputElement
  private pickerContainer: HTMLElement
  private popupEl: HTMLElement

  private startInputEl: HTMLInputElement
  private endInputEl: HTMLInputElement
  private calendarEl: HTMLElement
  private monthYearEl: HTMLElement
  private statusEl: HTMLElement

  private onSelectCallback: (startDate: DateTime | null, endDate: DateTime | null) => void
  private clickOutsideHandler: (e: MouseEvent) => void

  private isVisible: boolean = false
  private selectionStart: DateTime | null = null
  private selectionPhase: 'first' | 'second' = 'first'

  // IMPORTANT FLAG: Controls whether this is a single date or range picker
  private singleDateMode: boolean

  constructor(
    app: App,
    rangeInputSettingEl: HTMLInputElement,
    options: {
      initialStartDate?: DateTime | Date | string | null,
      initialEndDate?: DateTime | Date | string | null,
      dateFormat?: string,
      singleDateMode?: boolean, // Set to true for single date selection
      onSelect?: (startDate: DateTime | null, endDate: DateTime | null) => void,
    }
  ) {
    this.app = app
    this.dateFormat = options.dateFormat || "yyyy-MM-dd"
    this.singleDateMode = options.singleDateMode || false // Initialize single date mode flag
    this.onSelectCallback = options.onSelect || ((startDate, endDate) => {})
    
    // Initialize dates
    this.startDate = options.initialStartDate ? parseDate(options.initialStartDate, this.dateFormat) : null
    this.endDate = options.initialEndDate ? parseDate(options.initialEndDate, this.dateFormat) : null
    // Ensure end date is not before start date
    if (this.startDate && this.endDate && this.endDate < this.startDate) {
      this.endDate = this.startDate
    }
    this.activeDate = this.startDate || DateTime.local() // Set active date for calendar rendering

    this.rangeInputSettingEl = rangeInputSettingEl
    // Create hidden date picker container & Apply styles to hide the inputs
    this.pickerContainer = rangeInputSettingEl.parentElement.createDiv({ cls: 'date-range-picker-container' })
    
    Object.assign(this.pickerContainer.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      height: '0',
      overflow: 'hidden'
    })
  
    // Create the popup element
    this.popupEl = document.createElement("div")
    this.popupEl.className = "date-range-picker"
    this.pickerContainer.appendChild(this.popupEl)

    Object.assign(this.popupEl.style, {
      width: '200px',
      height: '100px',
      backgroundColor: 'red',
      border: '3px solid yellow',
      position: 'absolute', // Use absolute within the modal
      zIndex: '100',  // Lower z-index but still high enough
      color: 'white',
      padding: '10px',
      fontWeight: 'bold',
      boxShadow: '0 0 20px rgba(0,0,0,0.8)',
      pointerEvents: 'auto',
      // Start with positioning that places it in view
      top: '20px',
      left: '20px'
    });

    // this.addStyles() // Add styles
    this.createCalendarStructure() // Create the calendar structure
    this.renderCalendar()
    // this.setupEvents() // Set up events
    // this.show()
  }
  
  private addStyles() {
    // Check if styles are already added
    if (document.getElementById("date-range-picker-styles")) return
    
    const styleEl = document.head.createEl("style", {
      attr: { id: "date-range-picker-styles" }
    })

    styleEl.textContent = date_range_picker_style
  }

  private createCalendarStructure() {
    // Create the main container
    const pickerEl = this.pickerContainer.createDiv({ cls: "simple-date-picker" })
    
    // Create header with month/year and navigation
    const headerEl = pickerEl.createDiv({ cls: "date-header" })
    
    // Previous month button
    const prevMonthBtn = headerEl.createEl("button", { 
      cls: "nav-btn", 
      text: "←",
      attr: { "aria-label": "Previous month" }
    })
    
    prevMonthBtn.addEventListener("click", () => {
      this.activeDate = this.activeDate.minus({ months: 1 })
      this.renderCalendar()
    })
    
    // Create month/year display
    const centerEl = headerEl.createDiv({ cls: "month-year-container" })
    
    // Month dropdown
    const monthSelect = centerEl.createEl("select", { 
      cls: "month-year-dropdown month-dropdown"
    })
    
    const monthNames = Array.from({ length: 12 }, (_, i) => 
      DateTime.local(2000, i + 1).toFormat("MMMM")
    )
    
    monthNames.forEach((month, idx) => {
      const option = monthSelect.createEl("option", { 
        text: month, 
        value: (idx + 1).toString() 
      })
      
      if (idx + 1 === this.activeDate.month) {
        option.selected = true
      }
    })
    
    monthSelect.addEventListener("change", () => {
      this.activeDate = this.activeDate.set({ month: parseInt(monthSelect.value) })
      this.renderCalendar()
    })
    
    // Add small spacer
    centerEl.createEl("span", { cls: "dropdown-spacer", text: " " })
    
    // Year dropdown
    const yearSelect = centerEl.createEl("select", { 
      cls: "month-year-dropdown year-dropdown"
    })
    
    const currentYear = this.activeDate.year
    
    for (let year = currentYear - 10; year <= currentYear + 10; year++) {
      const option = yearSelect.createEl("option", { 
        text: year.toString(), 
        value: year.toString() 
      })
      
      if (year === currentYear) {
        option.selected = true
      }
    }
    
    yearSelect.addEventListener("change", () => {
      this.activeDate = this.activeDate.set({ year: parseInt(yearSelect.value) })
      this.renderCalendar()
    })
    
    this.monthYearEl = centerEl
    
    // Next month button
    const nextMonthBtn = headerEl.createEl("button", { 
      cls: "nav-btn", 
      text: "→",
      attr: { "aria-label": "Next month" }
    })
    
    nextMonthBtn.addEventListener("click", () => {
      this.activeDate = this.activeDate.plus({ months: 1 })
      this.renderCalendar()
    })
    
    // Create calendar grid container
    this.calendarEl = pickerEl.createDiv({ cls: "calendar" })
  }

  public renderCalendar() {
    // Update the month/year dropdowns
    const monthSelect = this.monthYearEl.querySelector('.month-dropdown') as HTMLSelectElement
    if (monthSelect) {
      monthSelect.value = this.activeDate.month.toString()
    }
    
    const yearSelect = this.monthYearEl.querySelector('.year-dropdown') as HTMLSelectElement
    if (yearSelect) {
      yearSelect.value = this.activeDate.year.toString()
    }
    
    // Clear the calendar
    this.calendarEl.empty()
    
    // Add day headers (Mon, Tue, etc.)
    const weekdays = Array.from({ length: 7 }, (_, i) => 
      DateTime.local(2000, 1, 3 + i).toFormat('ccc') // Start with Monday
    )
    
    weekdays.forEach(day => {
      this.calendarEl.createDiv({ cls: "day-header", text: day })
    })
    
    // First day of current month
    let monthStart = this.activeDate.startOf('month')
    
    // Find the Monday before or on the start of the month
    // In Luxon, 1 is Monday, 7 is Sunday
    const dayOfWeek = monthStart.weekday
    let viewStart = monthStart.minus({ days: (dayOfWeek - 1) % 7 })
    
    const today = DateTime.local().startOf('day')
    
    // Create 6 weeks (42 days) to ensure we always have enough days
    for (let i = 0; i < 42; i++) {
      const currentDate = viewStart.plus({ days: i })
      const isDifferentMonth = currentDate.month !== this.activeDate.month
      const isToday = currentDate.hasSame(today, 'day')
      
      const dayEl = this.calendarEl.createDiv({ 
        cls: `day 
            ${isDifferentMonth ? "different-month" : ""} 
            ${isToday ? "today" : ""}`,
        text: currentDate.day.toString()
      })
      
      // Add date attribute for potential future functionality
      dayEl.dataset.date = currentDate.toISODate() as string
      
      // Add click handler for potential future functionality
      dayEl.addEventListener("click", () => {
        console.log("Date selected:", currentDate.toISODate())
      })
    }
  }

  public destroy() {
    let datePickerStyles = document.getElementById("date-range-picker-styles")
    if (datePickerStyles instanceof HTMLElement) {
      datePickerStyles.remove()
    }

    this.popupEl.remove()
  }
}

