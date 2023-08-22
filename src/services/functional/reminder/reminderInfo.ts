import { IInfoHandler, InfoMngr } from "src/dataManagement/info"
import JournallingPlugin from "src/main"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { TReminderInfo } from "src/dataManagement/dataTypes"
import { ReminderService } from "src/services/functional/reminder/reminders"

export class ReminderInfoHandler implements IInfoHandler{
  serviceName: string
  plugin: JournallingPlugin
  serviceMngr: ReminderService
  servicesManager: ServicesManager
  infoMngr: InfoMngr

  constructor(serviceMngr: IServiceMngr){
    this.plugin = serviceMngr.plugin
    this.serviceName = serviceMngr.name
    this.serviceMngr = serviceMngr as ReminderService
    this.servicesManager = serviceMngr.servicesMngr
    this.infoMngr = serviceMngr.servicesMngr.infoMngr
  }

  private reminderInfo: TReminderInfo = {
    count: 0,
    reminders: [],
    lateShowing: true,
    activeShowing: true,
    snoozedShowing: true,
    doneShowing: true
  }

  retrieveInfo(): void {
    this.reminderInfo = this.infoMngr.getReminderInfo()
  }

  async updateReminderInfo(){
    await this.infoMngr.setReminderInfo(this.reminderInfo)
  }

  getReminder(id: string): PluginReminder | undefined {
    return this.reminderInfo.reminders.find(reminder => reminder.id === id)
  }

  getReminders(): PluginReminder[] {
    return this.reminderInfo.reminders
  }

  async addReminder(reminder: PluginReminder): Promise<void> {
    this.reminderInfo.reminders.push(reminder)
    await this.incrementCount()
    await this.updateReminderInfo()
  }

  async updateReminder(reminder: PluginReminder): Promise<void> {
    this.reminderInfo.reminders = this.reminderInfo.reminders.map(oldReminder => {
      if(oldReminder.id === reminder.id){
        return reminder
      } else {
        return oldReminder
      }
    })
    await this.updateReminderInfo()
  }

  async deleteReminder(id: string){
    this.reminderInfo.reminders = this.reminderInfo.reminders.filter(reminder => reminder.id !== id)
    await this.decrementCount()
    await this.updateReminderInfo()
  }

  async snoozeReminder(reminder: PluginReminder, timeAdded: number) {
    // It snoozes the reminder for time amount after the current time.
    reminder.dateLastSnoozed = new Date().toISOString()
    reminder.status = ReminderStatus.Snoozed
    let newDueDate = new Date(reminder.dateLastSnoozed).getTime() + timeAdded
    reminder.taskLengthMilliSec = newDueDate

    this.updateReminder(reminder)
  }

  async completeReminder(reminder: PluginReminder){
    if (reminder.deleteOnDone){
      this.deleteReminder(reminder.id)
    } else {
      reminder.status = ReminderStatus.Done
      this.updateReminderInfo()
    }
  }

  // Reminder count control functions
  async incrementCount(){
    this.reminderInfo.count++
    await this.updateReminderInfo()
  }

  async decrementCount(){
    this.reminderInfo.count--
    await this.updateReminderInfo()
  }

  // functions
  async initialize(){
    // Sets the values for reminderInfo
    this.retrieveInfo()
    this.plugin.debugger.log("reminderInfo: ", this.reminderInfo)
  }
  async cleanup(){
    this.plugin.debugger.log("Not yet implemented ReminderInfoHandler.cleanup()")
  }
}

export enum ReminderStatus {
  Active = 'Active',
  InProgress = 'InProgress',
  Snoozed = 'Snoozed',
  Late = 'Late',
  Done = 'Done',
}

export enum ReminderType {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Yearly = 'Yearly',
  Journalling = 'Journalling',
}

export type PluginReminder = {
  id: string
  name: string
  description: string
  type: ReminderType
  dateActiveOn: string
  taskLengthMilliSec: number // in seconds

  deleteOnShow: boolean
  deleteOnDone: boolean
  dateCreated?: string
  status?: ReminderStatus
  dateCompleted?: string
  dateLastSnoozed?: string
  snoozeCount: number
  cronTime?: string  // Add a new field to store the cron time string 
}