import { App, Modal, Setting } from "obsidian"
import { DateTime } from "luxon"
import { DateRangePicker } from "./dateRangePicker"
import { Obj } from "@popperjs/core"

/**
 * A popup date range modal that allows selecting a date range with a single input
 */
export class DateRangeModal extends Modal {
  startDate: DateTime | null = null
  endDate: DateTime | null = null
  dateFormat: string
  onSubmit: (startDate: DateTime | null, endDate: DateTime | null) => void
  options: Object
  rangeInput: HTMLInputElement
  
  modalHeaderText?: string
  dateOptionText?: string
  descText?: string

  // Flags
  openPickerByDefault: boolean // true to open the picker when modal opens
  singleDateMode: boolean // true for single date selection mode instead of range

  
  constructor(
    app: App,
    onSubmit: (startDate: DateTime | null, endDate: DateTime | null) => void,
    options: {
      initialStartDate?: DateTime | null,
      initialEndDate?: DateTime | null,
      dateFormat?: string,

      openPickerByDefault?: boolean, // true to auto-open the picker with modal opens
      singleDateMode?: boolean, // true to allow just single date selection

      modalHeaderText?: string,
      dateOptionText?: string,
      descText?: string,
    } = {}
  ) {
    super(app)
    this.onSubmit = onSubmit
    this.startDate = options.initialStartDate || null
    this.endDate = options.initialEndDate || null
    this.dateFormat = options.dateFormat || "d MMM yy"
    this.openPickerByDefault = options.openPickerByDefault || false
    this.singleDateMode = options.singleDateMode || false

    this.modalHeaderText = options.modalHeaderText
    this.dateOptionText = options.dateOptionText
    this.descText = options.descText
  }
  
  onOpen() {
    const { contentEl } = this
    contentEl.empty()
    contentEl.createEl('h2', { 
      text: this.modalHeaderText || 'Select Date Range' 
    })
    
    // Create single input for date range display
    const rangeInputSetting = new Setting(contentEl)
      .setName('Select Date Range')
      .setDesc(this.descText || 'Select Date Range')
      .addText(text => {
        this.rangeInput = text.inputEl
        text.setPlaceholder('Select date range')
        
        // Set initial value if dates are provided
        if (this.startDate && this.endDate) {
          this.updateInputDisplay()
        }
      })
    
    // Create hidden container for the date picker
    const pickerContainer = contentEl.createDiv({ cls: 'date-range-picker-container' })
    
    // Create hidden input elements for the date picker to attach to
    const startInputEl = pickerContainer.createEl('input', { 
      type: 'text',
      cls: 'hidden-date-input'
    })
    
    const endInputEl = pickerContainer.createEl('input', { 
      type: 'text',
      cls: 'hidden-date-input'
    })
    
    // Apply styles to hide the inputs but keep them functional
    pickerContainer.style.position = 'absolute'
    pickerContainer.style.top = '0'
    pickerContainer.style.left = '0'
    pickerContainer.style.height = '0'
    pickerContainer.style.overflow = 'hidden'
    
    // Initialize values if provided
    if (this.startDate) {
      startInputEl.value = this.startDate.toFormat(this.dateFormat)
    }
    
    if (this.endDate) {
      endInputEl.value = this.endDate.toFormat(this.dateFormat)
    }
    
    // Create modified date picker that works with range or single date selection
    const datePicker = new DateRangePicker(this.app, {
      startEl: startInputEl,
      endEl: endInputEl,
      initialStartDate: this.startDate,
      initialEndDate: this.endDate,
      dateFormat: this.dateFormat,
      // IMPORTANT: Pass through single date mode option to the picker
      singleDateMode: this.singleDateMode,
      onSelect: (start, end) => {
        this.startDate = start
        this.endDate = end
        this.updateInputDisplay()
      }
    })
    
    // When clicking on the visible input, show the date picker
    this.rangeInput.addEventListener('click', () => {
      datePicker.show(this.rangeInput)
    })
    
    // IMPORTANT: Auto-open the date picker if the flag is set
    if (this.openPickerByDefault) {
      // Use setTimeout to ensure the modal is fully rendered before showing the picker
      setTimeout(() => {
        datePicker.show(this.rangeInput)
      }, 100)
    }
    
    // Add buttons
    new Setting(contentEl)
      .addButton(btn =>
        btn.setButtonText('Apply')
          .setCta()
          .onClick(() => {
            this.onSubmit(this.startDate, this.endDate)
            this.close()
          })
      )
      .addButton(btn =>
        btn.setButtonText('Cancel')
          .onClick(() => {
            this.close()
          })
      )
    
    // Clean up when modal closes
    this.onClose = () => {
      datePicker.destroy()
    }
  }
  
  // Updates the visible input based on selected dates
  updateInputDisplay() {
    if (this.singleDateMode) {
      // Single date mode - just show start date
      if (this.startDate) {
        this.rangeInput.value = this.startDate.toFormat(this.dateFormat)
      } else {
        this.rangeInput.value = ''
      }
    } else {
      // Range mode
      if (this.startDate && this.endDate) {
        if (this.startDate.hasSame(this.endDate, 'day')) {
          // Single day selection
          this.rangeInput.value = this.startDate.toFormat(this.dateFormat)
        } else {
          // Date range
          this.rangeInput.value = `${this.startDate.toFormat(this.dateFormat)} - ${this.endDate.toFormat(this.dateFormat)}`
        }
      } else if (this.startDate) {
        this.rangeInput.value = this.startDate.toFormat(this.dateFormat)
      } else {
        this.rangeInput.value = ''
      }
    }
  }
  
  onClose() {
    const { contentEl } = this
    contentEl.empty()
  }
}
