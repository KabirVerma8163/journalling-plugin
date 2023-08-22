import { Command, Modal } from "obsidian"
import JournallingPlugin from "src/main"
import { IFeatureHandler } from "src/services/features"
import { IServiceMngr } from "src/services/servicesMngr"
import { PluginReminder, ReminderInfoHandler, ReminderStatus } from "src/services/functional/reminder/reminderInfo"
import { ReminderService } from "src/services/functional/reminder/reminders"
import { ReminderSettingsHandler } from "src/services/functional/reminder/reminderSettings"
import { NotificationFeatureHandler } from "src/services/functional/notification/notificationFeatures"
import { NotificationLocation, NotificationType, PluginScheduledNotification } from "src/services/functional/notification/notificationInfo"
import { nanoid } from 'nanoid'
import { isValidFutureDateOrCron } from "src/utils/independentUtils"

export class ReminderFeatureHandler implements IFeatureHandler {
  name: string
  description: string
  serviceMngr: ReminderService
  infoHandler: ReminderInfoHandler
  settingsHandler: ReminderSettingsHandler
  plugin: JournallingPlugin

  commands: Command[] = []
  notificationHandler: NotificationFeatureHandler


  constructor(serviceMngr: IServiceMngr) {
    serviceMngr.plugin.debugger.log("Constructing ReminderFeatureHandler")
    this.name = "Reminders"
    this.description = "This is the reminders feature"
    this.plugin = serviceMngr.plugin

    this.serviceMngr = serviceMngr as ReminderService
    this.infoHandler = serviceMngr.infoHandler as ReminderInfoHandler
    this.settingsHandler = serviceMngr.settingsHandler as ReminderSettingsHandler

    this.notificationHandler = serviceMngr.servicesMngr.notificationService.featureHandler
  }

  // This function activates a reminder, it takes them from the infoHandler and then out of the reminders makes a scheduled notification for each reminder and then when the on run function is called it also deletes the reminder from the infoHandler
  async activateReminderFromId(id: string, opts?: DefaultOptions): Promise<void> {
    let reminder = this.infoHandler.getReminder(id)
    if (reminder != undefined) {
      const activeOnDate = reminder.dateLastSnoozed
        ? new Date(reminder.dateLastSnoozed)
        : new Date(reminder.dateActiveOn)

      activeOnDate.setMilliseconds(activeOnDate.getMilliseconds() + reminder.taskLengthMilliSec)

      let toDelete = reminder.deleteOnShow
      let notification: PluginScheduledNotification = {
        id: reminder.id,
        name: reminder.name,
        title: reminder.name,
        body: reminder.description,
        type: NotificationType.Scheduled,
        dateAndTime: activeOnDate.toISOString(),
        deleteOnDone: reminder.deleteOnDone,
        deleteOnShow: reminder.deleteOnShow,
        location: opts?.location || NotificationLocation.App,
        runOnShow: () => {
          if (toDelete) {
            this.infoHandler.deleteReminder(id)
          }
          if (opts?.runOnShow){
            this.plugin.debugger.log("Running on show")
            opts.runOnShow()
          }
        },
        externalOnClick: opts?.externalOnClick,
      }

      this.notificationHandler.addScheduledNotification(notification)
      // await this.infoHandler.removeReminder(id)
    }
  }

  // Function to create a reminder, if it doesn't have an id, it will generate one 
  createReminder(reminder: PluginReminder, idPrefix: string): PluginReminder {
    if (!reminder.id || reminder.id == "") reminder.id = idPrefix + nanoid()
    return reminder
  }

  async addReminder(reminder: PluginReminder) {
    // TODO: This will have to be changed when we finally add snoozing to this
    if (isValidFutureDateOrCron(reminder.dateActiveOn)) {
      console.log(`Adding reminder for the date ${reminder.dateActiveOn}`)
      this.infoHandler.addReminder(this.createReminder(reminder, ""))
    }
  }

  async addAndActivateNewReminder(reminder: PluginReminder, opts?: DefaultOptions) {
    await this.addReminder(reminder)
    await this.activateReminderFromId(reminder.id, opts)
  }

  async removeReminder(id: string) {
    this.infoHandler.deleteReminder(id)
  }

  async updateReminder(reminder: PluginReminder) {
    this.infoHandler.updateReminder(reminder)
  }


  async initialize() {
    this.plugin.debugger.log("Initializing ReminderFeatureHandler")
    this.plugin.addCommand

    this.commands.forEach(command => {
      this.plugin.addCommand(command)
    })
  }

  async cleanup() {

  }
}

export class ReminderModal extends Modal {
  reminderService: ReminderService
  reminderInfoHandler: ReminderInfoHandler
  lateReminders: PluginReminder[]
  activeReminders: PluginReminder[]
  snoozedReminders: PluginReminder[]
  doneReminders: PluginReminder[]
  plugin: JournallingPlugin

  constructor(reminderService: ReminderService) {
    super(reminderService.plugin.app)
    this.plugin = reminderService.plugin

    this.reminderService = reminderService
    this.reminderInfoHandler = reminderService.infoHandler

    const allReminders = this.reminderInfoHandler.getReminders()
    this.lateReminders = allReminders.filter(reminder => reminder.status === ReminderStatus.Late)
    this.activeReminders = allReminders.filter(reminder => reminder.status === ReminderStatus.Active)
    this.snoozedReminders = allReminders.filter(reminder => reminder.status === ReminderStatus.Snoozed)
    this.doneReminders = allReminders.filter(reminder => reminder.status === ReminderStatus.Done)
  }

  onOpen() {
    const { contentEl } = this

    this.createReminderSection('Late Reminders', this.lateReminders, ['Completing', 'Snooze', 'Done'])
    this.createReminderSection('Active Reminders', this.activeReminders, ['Completing', 'Snooze', 'Done'])
    this.createReminderSection('Snoozed Reminders', this.snoozedReminders, ['Completing', 'Snooze'])
    this.createReminderSection('Done Reminders', this.doneReminders, ['Delete'])
  }

  createReminderSection(title: string, reminders: PluginReminder[], actions: string[]) {
    // let reminderContainer = createCollapsibleElement(`${title.toLowerCase().replace(" ", "")}`, title, 
    // () => {
    //   return getObjVal(this.plugin.dataMngr.data, reminderBinding)
    // }, (show) => {
    //   setObjVal(this.plugin.dataMngr.data, reminderBinding, show)
    // })

    // let { contentEl } = this
    // contentEl.appendChild(reminderContainer.container)
    // // contentEl = reminderContainer.container.createDiv().id = "Trial"
    // let contentElement = createDiv()
    // reminderContainer.collapsibleChild.appendChild(contentElement)
    // let settingCSS = `${title.toLowerCase().replace(' ', '-')}`
    // settingCSS = settingCSS.substring(0, settingCSS.length - 1)

    // reminderContainer.header.addClass(settingCSS)

    // if (reminders.length > 0) {
    //   // contentElement.createEl('h2', { text: title })

    //   reminders.forEach(reminder => {
    //     let setting = new Setting(contentElement).setName(reminder.name).setDesc(reminder.description)

    //     if (actions.includes('Done')) {
    //       setting.addButton(button => button
    //         .setButtonText('Done')
    //         .onClick(() => {
    //           this.reminderMngr.markAsDone(reminder.id)
    //           this.close()
    //         })
    //       )
    //     }

    //     if (actions.includes('Snooze')) {
    //       setting.addButton(button => button
    //         .setButtonText('Snooze')
    //         .onClick(() => {
    //           // Add your logic here to snooze
    //           this.reminderMngr.doLater(reminder.id)
    //           this.close()
    //         })
    //       )
    //     }

    //     if (actions.includes('Delete')) {
    //       setting.addButton(button => button
    //         .setButtonText('Delete')
    //         .onClick(() => {
    //           // Add your logic here to delete
    //           this.reminderMngr.deleteReminder(reminder.id)
    //           this.close()
    //         })
    //       )
    //     }
    //   })
    // } else {
    //   contentElement.createEl('h2', { text: `No ${title.toLowerCase()}.` })
    // }
  }

  onClose() {
    let { contentEl } = this
    contentEl.empty()
  }
}


interface DefaultOptions {
  location?: NotificationLocation
  runOnShow?: () => void
  length?: number
  internalOnClick?: () => void
  externalOnClick?: (this: Notification, ev: Event) => any
}

