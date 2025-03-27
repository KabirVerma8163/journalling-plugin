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

  private pickerEl: HTMLElement
  private calendarEl: HTMLElement
  private monthYearEl: HTMLElement
  private monthSelect: HTMLSelectElement
  private yearInput: HTMLInputElement
  private dayEl :HTMLDivElement
  private prevMonthBtn:HTMLButtonElement
  private nextMonthBtn:HTMLButtonElement
  private statusEl: HTMLElement

  private onSelectCallback: (startDate: DateTime | null, endDate: DateTime | null) => void
  private clickOutsideHandler: (e: MouseEvent) => void
  private onResizeDebounced: () => void

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
    if (rangeInputSettingEl.parentElement){
      this.pickerContainer = rangeInputSettingEl.parentElement.createDiv({ cls: 'date-range-picker-container' })
    }
  
    this.pickerContainer.className = "date-range-picker"

    this.addStyles() // Add styles
    this.createCalendarStructure() // Create the calendar structure
    this.renderCalendar()
    this.setupEvents() // Set up events
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
    this.pickerEl = this.pickerContainer.createDiv({ cls: "simple-date-picker" }) // Create the main container
    const headerEl = this.pickerEl.createDiv({ cls: "date-header" }) // Create header with month/year and navigation
    
    this.prevMonthBtn = headerEl.createEl("button", { 
      cls: "nav-btn", 
      text: "←",
      attr: { "aria-label": "Previous month" }
    })
    const centerEl = headerEl.createDiv({ cls: "month-year-container" }) // Create month/year display
    this.nextMonthBtn = headerEl.createEl("button", { 
      cls: "nav-btn", 
      text: "→",
      attr: { "aria-label": "Next month" }
    })
    
    this.prevMonthBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      this.activeDate = this.activeDate.minus({ months: 1 })
      this.renderCalendar()
    })
    this.nextMonthBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      this.activeDate = this.activeDate.plus({ months: 1 })
      this.renderCalendar()
    })
    
    this.monthSelect = centerEl.createEl("select", { // Month dropdown
      cls: "month-year-dropdown month-dropdown"
    })
    const monthNames = Array.from({ length: 12 }, (_, i) => 
      DateTime.local(2000, i + 1).toFormat("MMMM")
    )
    monthNames.forEach((month, idx) => {
      const option = this.monthSelect.createEl("option", { 
        text: month, 
        value: (idx + 1).toString() 
      })
      
      if (idx + 1 === this.activeDate.month) {
        option.selected = true
      }
    })

    centerEl.createEl("span", { cls: "dropdown-spacer", text: " " }) // Add small spacer
    
    const currentYear = this.activeDate.year
    this.yearInput = centerEl.createEl("input", {
      cls: "month-year-dropdown year-dropdown",
      type: "text",
      value: currentYear.toString()
    })
    
    this.yearInput.style.width = "8ch" // Set width to fit approximately 5 characters
    
    this.yearInput.addEventListener("change", (e) => {
      e.stopPropagation()
      const newYear = parseInt(this.yearInput.value, 10)
      if (!isNaN(newYear)) {
        this.activeDate = this.activeDate.set({ year: newYear })
        this.renderCalendar()
      }
    })    

    this.monthSelect.addEventListener("change", (e) => {
      e.stopPropagation()
      this.activeDate = this.activeDate.set({ month: parseInt(this.monthSelect.value) })
      this.renderCalendar()
    })
    
    this.monthYearEl = centerEl
    this.calendarEl = this.pickerEl.createDiv({ cls: "calendar" }) // Create calendar grid container

    this.statusEl = this.pickerContainer.createDiv({ cls: "selection-status" })
    if (this.singleDateMode) {
      this.statusEl.textContent = "Select date"
    } else {
      this.statusEl.textContent = "Select start date"
    }
  }

  public renderCalendar() {
    // Update the month/year dropdowns
    this.monthSelect.value = this.activeDate.month.toString()
    this.yearInput.value = this.activeDate.year.toString()
    
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
    
    // Find the Monday before or on the start of the month, In Luxon, 1 is Monday, 7 is Sunday
    const dayOfWeek = monthStart.weekday
    let viewStart = monthStart.minus({ days: (dayOfWeek - 1) % 7 })
    
    const today = DateTime.local().startOf('day')
    
    // Create 6 weeks (42 days) to ensure we always have enough days
    for (let i = 0; i < 42; i++) {
      const currentDate = viewStart.plus({ days: i })
      const isDifferentMonth = currentDate.month !== this.activeDate.month
      const isToday = currentDate.hasSame(today, 'day')
      
      this.dayEl = this.calendarEl.createDiv({ 
        cls: `day ${isDifferentMonth ? "different-month" : ""} ${isToday ? "today" : ""}`,
        text: currentDate.day.toString()
      })
      
      // Add date attribute for potential future functionality
      this.dayEl.dataset.date = currentDate.toISODate() as string
      
      this.dayEl.addEventListener("click", (e) => {
        e.stopPropagation() // Prevent event from bubbling
        this.handleDateClick(currentDate)
      })

      if (this.selectionPhase === 'second' && this.selectionStart) {
        this.dayEl.addEventListener("mouseenter", () => {
          this.showPreviewRange(currentDate)
        })
      }

    }
  }

  private setupEvents(){
    // Simplified click outside handler that handles dropdowns properly
    this.clickOutsideHandler = (e: MouseEvent) => {
      e.stopPropagation()
      const target = e.target as HTMLElement
      // Don't close if clicking within the popup
      if (this.pickerContainer.contains(target)) {
        return
      }
      this.hide()
    }

    this.rangeInputSettingEl.addEventListener("click", (e) => {
      e.stopPropagation()
      // console.log("Range Input Clicked")
      this.show()
    })

    this.onResizeDebounced = (): void => { this.positionPopup() }
    window.addEventListener("resize", this.onResizeDebounced)
  }

  private positionPopup(referenceEl: HTMLElement = this.rangeInputSettingEl) {
    const rect = referenceEl.getBoundingClientRect()
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    
    this.pickerContainer.style.top = (rect.bottom + scrollTop) + 'px'
    this.pickerContainer.style.left = (rect.left + scrollLeft) + 'px'
    
    // Check if the popup would go off the bottom of the screen
    const popupRect = this.pickerContainer.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    
    if (rect.bottom + popupRect.height > viewportHeight) {
      // Position above the input instead
      this.pickerContainer.style.top = (rect.top + scrollTop - popupRect.height) + 'px'
    }
  }

  private handleDateClick(date: DateTime) {
    if (this.singleDateMode) {
      // In single date mode, just select the date and we're done
      this.startDate = date
      this.endDate = date // Set both the same for consistency
      
      // Apply immediately
      this.onSelectCallback(this.startDate, this.endDate)
      this.hide()
      return
    }
    
    // Regular range selection mode
    if (this.selectionPhase === 'first') {
      // First click - start date
      this.selectionStart = date
      this.selectionPhase = 'second'
      
      // Update status message
      this.statusEl.textContent = "Select end date"
      
      this.renderCalendar()
    } else {
      // Second click - end date
      this.completeSelection(date)
    }
  }

  private showPreviewRange(hoverDate: DateTime) {
    if (!this.selectionStart || this.selectionPhase !== 'second' || this.singleDateMode) return
    
    // Clear existing preview classes
    const previewElements = this.calendarEl.querySelectorAll('.preview-in-range, .preview-end')
    previewElements.forEach(el => {
      el.classList.remove('preview-in-range', 'preview-end')
    })
    
    // Add preview classes
    const days = Array.from(this.calendarEl.querySelectorAll('.day'))
    const startTs = this.selectionStart.toMillis()
    const endTs = hoverDate.toMillis()
    
    // Find the first day of the current month (day with text "1" and not different-month)
    const firstDayOfCurrentMonth = days.findIndex(day => 
      day.textContent?.trim() === "1" && !day.classList.contains('different-month')
    )
    
    // Find the last day of the current month (largest day number that's not different-month)
    let lastDayOfCurrentMonth = 0
    let lastDayValue = 0
    days.forEach((day, index) => {
      const dayNum = parseInt(day.textContent?.trim() || "0")
      if (!day.classList.contains('different-month') && dayNum > lastDayValue) {
        lastDayValue = dayNum
        lastDayOfCurrentMonth = index
      }
    })
    
    days.forEach((day, index) => {
      const dayNum = parseInt(day.textContent?.trim() || '0')
      if (dayNum <= 0) return
      
      // Determine month offset based on position and value
      let monthOffset = 0
      if (day.classList.contains('different-month')) {
        // Previous month: comes before first day of current month OR 
        // comes after a high day number (>= 28) and has low value (< 13)
        if (index < firstDayOfCurrentMonth || 
            (index > 0 && 
             parseInt(days[index-1].textContent?.trim() || "0") >= 28 && 
             dayNum < 13)) {
          monthOffset = -1
        } else {
          // Next month
          monthOffset = 1
        }
      }
      
      // Create a date for this day element
      const dayDate = this.activeDate
        .set({ day: dayNum })
        .plus({ months: monthOffset })
      const dayTs = dayDate.toMillis()
      
      // Check if this day is in the preview range
      if (startTs < endTs) {
        // Normal direction
        if (dayTs > startTs && dayTs < endTs) {
          day.classList.add('preview-in-range')
        } else if (dayTs === endTs) {
          day.classList.add('preview-end')
        }
      } else {
        // Reverse direction (end is before start)
        if (dayTs < startTs && dayTs > endTs) {
          day.classList.add('preview-in-range')
        } else if (dayTs === endTs) {
          day.classList.add('preview-end')
        }
      }
    })
  }

  private completeSelection(endDate: DateTime) {
    if (!this.selectionStart) return
    
    // Determine which is start and which is end
    if (endDate < this.selectionStart) {
      this.startDate = endDate
      this.endDate = this.selectionStart
    } else {
      this.startDate = this.selectionStart
      this.endDate = endDate
    }
    
    // Reset selection state
    this.selectionStart = null
    this.selectionPhase = 'first'
    
    // Update status
    this.statusEl.textContent = "Select start date"
    
    // Apply immediately
    this.onSelectCallback(this.startDate, this.endDate)
    this.hide()
  }

  public show(referenceEl: HTMLElement = this.rangeInputSettingEl) {
    if (this.isVisible) return
  
    this.isVisible = true
    this.pickerContainer.addClass("visible")
    this.positionPopup()
    
    // Reset selection state if no dates are already selected
    // if (!this.startDate && !this.endDate) {
    //   this.selectionStart = null
    //   this.selectionPhase = 'first'
    //   this.statusEl.textContent = this.singleDateMode ? "Select date" : "Select start date"
    // } else {
    //   // If dates are already selected, use them
    //   this.selectionStart = null
    //   this.selectionPhase = 'first'
    // }
    
    this.renderCalendar()
    
    // Remove existing handler if any
    document.removeEventListener("mousedown", this.clickOutsideHandler)
    
    // Add click outside handler with a slight delay to ensure proper initialization
    setTimeout(() => {
      document.addEventListener("mousedown", this.clickOutsideHandler)
    }, 50)
  }

  public hide() {
    if (!this.isVisible) return
    
    this.isVisible = false
    this.pickerContainer.removeClass("visible")
    
    // Remove click outside handler
    document.removeEventListener("mousedown", this.clickOutsideHandler)
  }

  public destroy() {
    let datePickerStyles = document.getElementById("date-range-picker-styles")
    if (datePickerStyles instanceof HTMLElement) {
      datePickerStyles.remove()
    }

    this.dayEl?.remove()
    this.yearInput?.remove()
    this.monthSelect?.remove()
    this.rangeInputSettingEl?.remove()
    this.prevMonthBtn?.remove()
    this.nextMonthBtn?.remove()

    window.removeEventListener("resize", this.onResizeDebounced)
    document.removeEventListener("mousedown", this.clickOutsideHandler)
  }
}

