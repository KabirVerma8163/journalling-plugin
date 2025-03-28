import { Command, Notice } from "obsidian"
import { IFeatureHandler } from "src/services/features"
import { IServiceMngr } from "src/services/servicesMngr"
import { NotificationInfoHandler, NotificationLocation, NotificationType, PluginNotification, PluginScheduledNotification } from "src/services/functional/notification/notificationInfo"
import { NotificationService } from "src/services/functional/notification/notifications"
import JournallingPlugin from "src/main"
import { NotificationSettingsHandler } from "src/services/functional/notification/notificationSettings"
import { isValidFutureDateOrCron } from "src/utils/independentUtils"

export class NotificationFeatureHandler implements IFeatureHandler {
  name: string
  description: string
  serviceMngr: NotificationService
  infoHandler: NotificationInfoHandler
  settingsHandler: NotificationSettingsHandler
  plugin: JournallingPlugin
  notificationsOn: boolean

  commands: Command[] = []

  schedule: any

  constructor(serviceMngr: IServiceMngr) {
    serviceMngr.plugin.debugger.log("Constructing NotificationFeatureHandler")
    this.name = "Notifications"
    this.description = "This is the notifications feature"
    this.plugin = serviceMngr.plugin

    this.serviceMngr = serviceMngr as NotificationService
    this.infoHandler = serviceMngr.infoHandler as NotificationInfoHandler
    this.settingsHandler = serviceMngr.settingsHandler as NotificationSettingsHandler
  }

  activateNotifications(): void {
    if (this.plugin.isMobile) return

    let notifs = this.infoHandler.getScheduledNotifications()
    if (notifs && notifs.length > 0) {
      notifs.forEach(notification => {
        this.activateNotification(notification)
      })
    }
  }

  activateNotification(notification: PluginScheduledNotification): void {
    if (!this.notificationsOn) return

    let jobId = notification.id
    if (isValidFutureDateOrCron(notification.dateAndTime)) {
      let date = notification.dateAndTime
      let jobFunction = () => {
        this.sendNotification(notification)
        if (notification.deleteOnShow) {
          this.infoHandler.removeNotification(notification.id)
        }
      }
      const job = this.schedule.scheduleJob(jobId, date, jobFunction)
    }
  }

  addScheduledNotification(notification: PluginScheduledNotification): void {
    if (isValidFutureDateOrCron(notification.dateAndTime)){
      this.infoHandler.addNotification(notification)
    }
    this.activateNotification(notification)
  }

  sendNotification(notification: PluginNotification): void {
    if (notification.location === NotificationLocation.Both || notification.location === NotificationLocation.App) {
      this.sendAppNotification(notification)
    }
    if (notification.location === NotificationLocation.System || notification.location === NotificationLocation.Both) {
      this.sendSystemNotification(notification)
    }
  }

  sendAppNotification(notification: PluginNotification): void {
    let notice = new Notice('', notification.length || 1000)

    const titleEl = notice.noticeEl.createEl('strong')
    titleEl.innerText = notification.title
    titleEl.style.fontSize = '1.5em'

    if (notification.subtitle) {
      const subtitleEl = notice.noticeEl.createEl('p')
      subtitleEl.innerText = notification.subtitle
      subtitleEl.style.fontSize = '1.2em'
    }

    const bodyEl = notice.noticeEl.createEl('p')
    bodyEl.innerText = notification.body
    bodyEl.style.fontSize = '1em'

    notification.runOnShow()
    if (notification.internalOnClick) {
      notice.noticeEl.onclick = notification.internalOnClick
    }

    // TODO If a color is defined, set it for the notice
    // if (notification.color) {
    //   titleEl.style.color = notification.color
    //   if (notification.subtitle) {
    //     subtitleEl.style.color = notification.color
    //   }
    //   bodyEl.style.color = notification.color
    // }
  }

  sendSystemNotification(notification: PluginNotification): void {
    if (!this.notificationsOn) return

    const options = {
      body: notification.subtitle ? `${notification.subtitle}\n${notification.body}` : notification.body,
      silent: notification.silent || false,
    }
    let notif = new window.Notification(notification.title, options)

    if (notification.externalOnClick) {
      notif.onclick = notification.externalOnClick
    }
  }

  sendSchedulerJob(name: string, date: number | string | Date, callback: () => void): void {
    if (this.plugin.isMobile) return

    if (date instanceof Date || typeof date === 'string') {
      if (isValidFutureDateOrCron(date)) {
        const job = this.schedule.scheduleJob(name, date, callback)
      } else {
        this.createErrorNotice("Invalid date or cron string")
      }
    } else {
      // Add the number of milliseconds to the current time and make a job that runs at that new time
      const job = this.schedule.scheduleJob(name, new Date(Date.now() + date), callback)
    }
  }

  createErrorNotice(errMsg: string, length?: number) {
    let errorNotice: Notice
    if (length = undefined) {
      errorNotice = new Notice(errMsg)
    } else {
      errorNotice = new Notice(errMsg, length)
    }
    errorNotice.messageEl.style.backgroundColor = '#ff5c5c'
    errorNotice.messageEl.style.padding = '5px'
  }

  createWarningNotice(errMsg: string, length?: number) {
    let warningNotice: Notice
    if (length = undefined) {
      warningNotice = new Notice(errMsg)
    } else {
      warningNotice = new Notice(errMsg, length)
    }
    warningNotice.messageEl.style.backgroundColor = '#fc7d36'
    warningNotice.messageEl.style.padding = '5px'
  }

  async initialize() {
    this.plugin.debugger.log("Initializing NotificationFeatureHandler")

    this.notificationsOn = !this.plugin.isMobile && this.settingsHandler.getNotificationsAllowed()

    if (this.notificationsOn) {
      this.schedule = require('node-schedule')


      // log all the jobs in the schduler
      this.plugin.debugger.log(this.schedule.scheduledJobs)
    }


    this.activateNotifications()
    // Testing notification command, adds a notification for the next 15 seconds
    // this.plugin.debugger.log ("Adding Testing notification command")
    // this.plugin.addCommand({
    //   id: "addNotification",
    //   name: "Testing Notification",
    //   callback: () => {
    //     let notification: PluginNotification = {
    //       id: "test-notification",
    //       name: "Test Notification",
    //       title: "Test Notification Title",
    //       subtitle: "This is a test notification subtitble",
    //       body: "This is a test notificatio body",
    //       type: NotificationType.NonSpecific,
    //       location: NotificationLocation.Both,
    //       runOnShow: () => { 
    //         this.plugin.debugger.log("Showing on run") 
    //       },
    //       internalOnClick: () => { 
    //         this.plugin.debugger.log("Internal Clicked") 
    //       },
    //       externalOnClick: () => { 
    //         this.plugin.debugger.log("External Clicked") 
    //       },
    //       deleteOnShow: true,
    //       deleteOnDone: false
    //     }
    //     this.sendNotification(notification)
    //   }
    // })

    this.commands.forEach(command => {
      this.plugin.addCommand(command)
    })

  }

  async cleanup(): Promise<void> {
    this.plugin.debugger.log("Not yet implemented NotificationFeatureHandler.cleanup()")
  }

}
