import { App, Modal, Notice, TextComponent } from 'obsidian'

export class DateInputModal extends Modal {
  startDateInput: TextComponent
  endDateInput: TextComponent

  constructor(app: App, public onSubmit: (start: string, end: string) => void) {
    super(app)
  }

  onOpen() {
    let { contentEl } = this

    contentEl.createEl('h2', { text: 'Enter Start and End Dates' })

    let input1 = contentEl.createEl('label', { text: 'Start Date (DD-MM-YYYY):' })
    this.startDateInput = new TextComponent(contentEl)
      .setPlaceholder('Enter start date')
      .setValue('')

    contentEl.createEl('label', { text: 'End Date (DD-MM-YYYY):' })
    this.endDateInput = new TextComponent(contentEl)
      .setPlaceholder('Enter end date')
      .setValue('')

    contentEl.createEl('button', { text: 'Submit' }).addEventListener('click', () => {
      let startDate = this.startDateInput.getValue()
      let endDate = this.endDateInput.getValue()

      if (this.isValidDate(startDate) && this.isValidDate(endDate)) {
        this.onSubmit(startDate, endDate)
        this.close()
      } else {
        new Notice('Invalid date format. Please use DD-MM-YYYY.')
      }
    })
  }

  isValidDate(date: string): boolean {
    return /^\d{2}-\d{2}-\d{4}$/.test(date)
  }
}

export function getDateInput(app: App): Promise<{ start: string, end: string }> {
  return new Promise((resolve) => {
    const modal = new DateInputModal(app, (start, end) => {
      resolve({ start, end })
    })
    modal.open()
  })
}

// Usage:
getDateInput(app).then((dates) => {
  console.log(dates.start, dates.end)
})
