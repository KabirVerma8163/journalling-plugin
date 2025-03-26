import { App, Modal, Setting } from "obsidian"
import { DateTime } from "luxon"
import { DateRangePicker } from "./dateRangePicker"


export class DateRangeModal extends Modal {
  startDate: DateTime | null = null
  endDate: DateTime | null = null
  dateFormat: string

  onSubmit: (startDate: DateTime | null, endDate: DateTime | null) => void
  options: Object
  rangeInput: HTMLInputElement
  datePicker: DateRangePicker
  
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
    this.dateFormat = options.dateFormat || "d MMMyy"
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
    
    // Create modified date picker that works with range or single date selection
    this.datePicker = new DateRangePicker(
      this.app, 
      this.rangeInput,
      {
        initialStartDate: this.startDate,
        initialEndDate: this.endDate,
        dateFormat: this.dateFormat,
        singleDateMode: this.singleDateMode, // Pass single date mode option to the picker
        onSelect: (start, end) => {
          this.startDate = start
          this.endDate = end
          this.updateInputDisplay()
    }})
    
    // When clicking on the visible input, show the date picker
    this.rangeInput.addEventListener('click', () => {
      this.datePicker.show(this.rangeInput)
    })
    
    if (this.openPickerByDefault) { // IMPORTANT: Auto-open the date picker on flag
      setTimeout(() => { // Use setTimeout to ensure the modal is fully rendered
        this.datePicker.show(this.rangeInput)
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
  }

  // Updates the visible input based on selected dates
  updateInputDisplay() {
    if (this.singleDateMode) { // Single date mode - just show start date
      if (this.startDate) {
        this.rangeInput.value = this.startDate.toFormat(this.dateFormat)
      } else {
        this.rangeInput.value = ''
      }
    } else { // Range mode
      if (this.startDate && this.endDate) {
        if (this.startDate.hasSame(this.endDate, 'day')) { // Single day selection
          this.rangeInput.value = this.startDate.toFormat(this.dateFormat)
        } else { // Date range
          this.rangeInput.value = `${this.startDate.toFormat(this.dateFormat)} to ${this.endDate.toFormat(this.dateFormat)}`
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
    this.datePicker.destroy()
  }
}
