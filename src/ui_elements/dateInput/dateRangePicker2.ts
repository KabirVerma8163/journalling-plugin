import { App } from "obsidian"
import { DateTime } from "luxon"
import { date_range_picker_style } from "./style_var"
import { parseDate } from "./dates"

export class DateRangePicker {
  private app: App
  private startInputEl: HTMLInputElement
  private endInputEl: HTMLInputElement
  private popupEl: HTMLElement
  private startDate: DateTime | null
  private endDate: DateTime | null
  private activeDate: DateTime
  private calendarEl: HTMLElement
  private monthYearEl: HTMLElement
  private onSelectCallback: (startDate: DateTime | null, endDate: DateTime | null) => void
  private dateFormat: string
  private isVisible: boolean = false
  private clickOutsideHandler: (e: MouseEvent) => void
  private selectionStart: DateTime | null = null
  private selectionPhase: 'first' | 'second' = 'first'
  // IMPORTANT FLAG: Controls whether this is a single date or range picker
  private singleDateMode: boolean
  private statusEl: HTMLElement

  constructor(
    app: App,
    options: {
      startEl: HTMLInputElement,
      endEl: HTMLInputElement,
      onSelect?: (startDate: DateTime | null, endDate: DateTime | null) => void,
      initialStartDate?: DateTime | Date | string | null,
      initialEndDate?: DateTime | Date | string | null,
      dateFormat?: string,
      // IMPORTANT OPTION: Set to true for single date selection
      singleDateMode?: boolean
    }
  ) {
    this.app = app
    this.startInputEl = options.startEl
    this.endInputEl = options.endEl
    this.dateFormat = options.dateFormat || "yyyy-MM-dd"
    // Initialize single date mode flag
    this.singleDateMode = options.singleDateMode || false
    
    this.onSelectCallback = options.onSelect || ((startDate, endDate) => {
      this.startInputEl.value = startDate ? startDate.toFormat(this.dateFormat) : ''
      if (!this.singleDateMode) {
        this.endInputEl.value = endDate ? endDate.toFormat(this.dateFormat) : ''
      }
    })
    
    // Initialize dates
    this.startDate = options.initialStartDate ? parseDate(options.initialStartDate, this.dateFormat) : null
    this.endDate = options.initialEndDate ? parseDate(options.initialEndDate, this.dateFormat) : null
    
    // Ensure end date is not before start date
    if (this.startDate && this.endDate && this.endDate < this.startDate) {
      this.endDate = this.startDate
    }
    
    // Set active date for calendar rendering
    this.activeDate = this.startDate || DateTime.local()

    // Create the popup element
    this.popupEl = document.createElement("div")
    this.popupEl.className = "date-range-picker"
    document.body.appendChild(this.popupEl)

    this.addStyles() // Add styles
    this.createCalendarStructure() // Create the calendar structure
    this.setupEvents() // Set up events
  }
  
  private addStyles() {
    // Check if styles are already added
    if (document.getElementById("date-range-picker-styles")) return
    
    const styleEl = document.head.createEl("style", {
      attr: { id: "date-range-picker-styles" }
    })

    // Add base styles from the imported style
    styleEl.textContent = date_range_picker_style
  }

  private createCalendarStructure() {
    // Create header with month/year display and navigation buttons
    const headerEl = this.popupEl.createDiv({ cls: "date-header" })
    
    const prevMonthBtn = headerEl.createEl("button", { 
      cls: "nav-btn", 
      text: "←",
      attr: { "aria-label": "Previous month" }
    })
    
    // Create a clean month/year display without labels
    const centerEl = headerEl.createDiv({ cls: "month-year-container" })
    
    // Create month dropdown with improved styling
    const monthSelect = centerEl.createEl("select", { 
      cls: "month-year-dropdown month-dropdown",
      attr: { "aria-label": "Select month" }
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
    
    // Add small spacer
    centerEl.createEl("span", { cls: "dropdown-spacer", text: " " })
    
    // Create year dropdown with improved styling
    const yearSelect = centerEl.createEl("select", { 
      cls: "month-year-dropdown year-dropdown",
      attr: { "aria-label": "Select year" }
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
    
    this.monthYearEl = centerEl
    
    const nextMonthBtn = headerEl.createEl("button", { 
      cls: "nav-btn", 
      text: "→",
      attr: { "aria-label": "Next month" }
    })
    
    // Create calendar container
    this.calendarEl = this.popupEl.createDiv({ cls: "calendar" })

    // Status message area - shows different text based on mode
    this.statusEl = this.popupEl.createDiv({ cls: "selection-status" })
    if (this.singleDateMode) {
      this.statusEl.textContent = "Select date"
    } else {
      this.statusEl.textContent = "Select start date"
    }

    // Create button container
    const buttonContainer = this.popupEl.createDiv({ cls: "button-container" })
    
    const todayButton = buttonContainer.createEl("button", { text: "Today" })
    const clearButton = buttonContainer.createEl("button", { text: "Clear" })
    const applyButton = buttonContainer.createEl("button", { 
      text: "Ok", 
      cls: "mod-cta"
    })
    
    // Set up dropdown event handlers with proper event bubbling management
    // monthSelect.addEventListener("change", () => {
    //   this.activeDate = this.activeDate.set({ month: parseInt(monthSelect.value) })
    //   this.renderCalendar()
    // })
    
    // yearSelect.addEventListener("change", () => {
    //   this.activeDate = this.activeDate.set({ year: parseInt(yearSelect.value) })
    //   this.renderCalendar()
    // })
    
    // yearSelect.addEventListener("click", (e) => {
    //   e.stopPropagation()
    // })
    
    // prevMonthBtn.addEventListener("click", (e) => {
    //   e.stopPropagation()
    //   this.activeDate = this.activeDate.minus({ months: 1 })
    //   this.renderCalendar()
    // })
    
    // nextMonthBtn.addEventListener("click", (e) => {
    //   e.stopPropagation()
    //   this.activeDate = this.activeDate.plus({ months: 1 })
    //   this.renderCalendar()
    // })

    // todayButton.addEventListener("click", (e) => {
    //   e.stopPropagation()
    //   const today = DateTime.local()
    //   if (this.singleDateMode) {
    //     // In single date mode, just set the date to today
    //     this.startDate = today
    //     this.endDate = today
    //     this.onSelectCallback(this.startDate, this.endDate)
    //     this.hide()
    //   } else if (this.selectionPhase === 'first') {
    //     this.selectionStart = today
    //     this.selectionPhase = 'second'
    //     this.statusEl.textContent = "Select end date"
    //   } else {
    //     this.completeSelection(today)
    //   }
    //   this.activeDate = today
    //   this.renderCalendar()
    // })

    // clearButton.addEventListener("click", (e) => {
    //   e.stopPropagation()
    //   this.selectionStart = null
    //   this.selectionPhase = 'first'
    //   this.startDate = null
    //   this.endDate = null
    //   this.statusEl.textContent = this.singleDateMode ? "Select date" : "Select start date"
    //   this.renderCalendar()
    // })

    // applyButton.addEventListener("click", (e) => {
    //   e.stopPropagation()
    //   // If in the middle of selection, use the current selection start as both start and end
    //   if (this.selectionPhase === 'second' && this.selectionStart) {
    //     this.startDate = this.selectionStart
    //     this.endDate = this.selectionStart
    //   }
      
    //   this.onSelectCallback(this.startDate, this.endDate)
    //   this.hide()
    // })
  }

  private setupEvents() {
    // Click on input to show calendar
    // this.startInputEl.addEventListener("click", (e) => {
    //   e.stopPropagation()
    //   this.show(this.startInputEl)
    // })

    // this.startInputEl.addEventListener("focus", (e) => {
    //   e.stopPropagation()
    //   this.show(this.startInputEl)
    // })
    
    // if (!this.singleDateMode) {
    //   this.endInputEl.addEventListener("click", (e) => {
    //     e.stopPropagation()
    //     this.show(this.endInputEl)
    //   })

    //   this.endInputEl.addEventListener("focus", (e) => {
    //     e.stopPropagation()
    //     this.show(this.endInputEl)
    //   })
    // }

    // Simplified click outside handler that handles dropdowns properly
    this.clickOutsideHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Don't close when interacting with select elements
      if (target.tagName === 'SELECT' || target.tagName === 'OPTION' || 
          target.closest('select') || target.closest('option')) {
        return
      }
      
      // Don't close if clicking within the popup
      if (this.popupEl.contains(target)) {
        return
      }
      
      // Don't close if clicking the input elements
      if (target === this.startInputEl || target === this.endInputEl) {
        return
      }
      
      this.hide()
    }
  }

  private positionPopup(referenceEl: HTMLElement) {
    const rect = referenceEl.getBoundingClientRect()
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    
    this.popupEl.style.top = (rect.bottom + scrollTop) + 'px'
    this.popupEl.style.left = (rect.left + scrollLeft) + 'px'
    
    // Check if the popup would go off the bottom of the screen
    const popupRect = this.popupEl.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    
    if (rect.bottom + popupRect.height > viewportHeight) {
      // Position above the input instead
      this.popupEl.style.top = (rect.top + scrollTop - popupRect.height) + 'px'
    }
  }

  public show(referenceEl: HTMLElement) {
    if (this.isVisible) return
    
    this.isVisible = true
    this.popupEl.addClass("visible")
    this.positionPopup(referenceEl)
    
    // Reset selection state if no dates are already selected
    if (!this.startDate && !this.endDate) {
      this.selectionStart = null
      this.selectionPhase = 'first'
      this.statusEl.textContent = this.singleDateMode ? "Select date" : "Select start date"
    } else {
      // If dates are already selected, use them
      this.selectionStart = null
      this.selectionPhase = 'first'
    }
    
    this.renderCalendar()
    
    // // Remove existing handler if any
    // document.removeEventListener("mousedown", this.clickOutsideHandler)
    
    // // Add click outside handler with a slight delay to ensure proper initialization
    // setTimeout(() => {
    //   document.addEventListener("mousedown", this.clickOutsideHandler)
    // }, 50)
  }

  public hide() {
    if (!this.isVisible) return
    
    this.isVisible = false
    this.popupEl.removeClass("visible")
    
    // Remove click outside handler
    document.removeEventListener("mousedown", this.clickOutsideHandler)
  }

  public renderCalendar() {
    // Update the selects in the header
    const monthSelect = this.monthYearEl.querySelector('select:first-child') as HTMLSelectElement
    const yearSelect = this.monthYearEl.querySelector('select:last-child') as HTMLSelectElement
    
    // if (monthSelect) {
    //   monthSelect.value = this.activeDate.month.toString()
    // }
    
    // if (yearSelect) {
    //   yearSelect.value = this.activeDate.year.toString()
    // }
    
    // Clear the calendar
    this.calendarEl.empty()
    
    // Add day headers (Mon, Tue, etc.)
    const weekdays = Array.from({ length: 7 }, (_, i) => 
      DateTime.local(2000, 1, 3 + i).toFormat('ccc') // Start with Monday (3rd Jan 2000 was a Monday)
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
      
      // Determine if the date is selected or in range
      const isStartDate = this.startDate && currentDate.hasSame(this.startDate, 'day')
      const isEndDate = this.endDate && currentDate.hasSame(this.endDate, 'day')
      const isInRange = this.startDate && this.endDate && 
                        currentDate > this.startDate && 
                        currentDate < this.endDate
                        
      // Temporary selection highlight
      const isTempStart = this.selectionStart && currentDate.hasSame(this.selectionStart, 'day')
      
      const dayEl = this.calendarEl.createDiv({ 
        cls: `day 
            ${isDifferentMonth ? "different-month" : ""} 
            ${isToday ? "today" : ""} 
            ${isStartDate ? "selected-start" : ""} 
            ${isEndDate ? "selected-end" : ""} 
            ${isInRange ? "in-range" : ""}
            ${isTempStart ? "temp-selected" : ""}`,
        text: currentDate.day.toString()
      })
      
      // dayEl.addEventListener("click", (e) => {
      //   // e.stopPropagation() // Prevent event from bubbling
      //   this.handleDateClick(currentDate)
      // })
      
      // // Add hover effect for range preview
      // if (this.selectionPhase === 'second' && this.selectionStart) {
      //   dayEl.addEventListener("mouseenter", () => {
      //     this.showPreviewRange(currentDate)
      //   })
      // }
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
    const days = this.calendarEl.querySelectorAll('.day')
    const startTs = this.selectionStart.toMillis()
    const endTs = hoverDate.toMillis()
    
    days.forEach(day => {
      const dayNum = parseInt(day.textContent || '0')
      const monthOffset = day.classList.contains('different-month') ? 
        (day.previousElementSibling?.classList.contains('different-month') ? -1 : 1) : 0
      
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

  // IMPORTANT FUNCTION: This handles date clicks differently based on singleDateMode
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
    this.renderCalendar()
  }

  public destroy() {
    // Remove event listeners
    document.removeEventListener("mousedown", this.clickOutsideHandler)
    
    // Clean up input element listeners
    this.startInputEl.removeEventListener("click", this.show.bind(this, this.startInputEl))
    this.startInputEl.removeEventListener("focus", this.show.bind(this, this.startInputEl))
    
    if (!this.singleDateMode) {
      this.endInputEl.removeEventListener("click", this.show.bind(this, this.endInputEl))
      this.endInputEl.removeEventListener("focus", this.show.bind(this, this.endInputEl))
    }
    
    // Remove popup element
    this.popupEl.remove()
  }
}//