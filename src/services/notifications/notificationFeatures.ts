import { Notice } from "obsidian";
import { IFeatureHandler } from "../features";
import { IServiceMngr } from "../servicesMngr";
import { NotificationLocation, NotificationType, PluginNotification } from "./notificationInfo";
import { NotificationService } from "./notifications";
import JournallingPlugin from "src/main";

export class NotificationFeatures implements IFeatureHandler {
  name: string
  description: string
  serviceMngr: NotificationService
  plugin: JournallingPlugin

  schedule: any

  constructor(serviceMngr: IServiceMngr){
    this.name = "Notifications"
    this.description = "This is the notifications feature"  
    this.plugin = serviceMngr.plugin

    if (!this.serviceMngr.plugin.isMobile){
      this.schedule = require('node-schedule')
    }
  }

  activateNotifications(): void {
    if (this.plugin.isMobile) return

    this.serviceMngr.infoMngr.getNotifications()
    this.serviceMngr.infoMngr.getNotifications().forEach(notification => {
      this.activateNotification(notification)
    })
  }

  activateNotification(notification: PluginNotification): void {
    if (this.plugin.isMobile) return

    let jobId = notification.id
    let date = notification.dataAndTime
    let jobFunction = () => {
      this.sendNotification(notification)
    }
    const job = this.schedule.scheduleJob(jobId, date, jobFunction)
  }

  sendNotification(notification: PluginNotification): void {
    if (notification.location === "Both"){
      this.sendSystemNotification(notification)
      this.sendInternalNotification(notification)
    } else if (notification.location === "System"){
      this.sendSystemNotification(notification)
    } else if (notification.location === "Internal"){
      this.sendInternalNotification(notification)
    }
  }

  sendInternalNotification(notification: PluginNotification): void {
    const errorNotice = new Notice(notification.name, 100)
    // Add the notification description to the noticeEl
    errorNotice.noticeEl.innerText = notification.description
  }

  sendSystemNotification(notification: PluginNotification): void {
    if (this.plugin.isMobile) return

    // createNotification(title: string, body: string, clickMessage: string, onClick?: VoidFunction): void {
    let notif = new window.Notification(notification.name, { body: notification.description || "" })
    notif.onclick = () => {
      // console.log(clickMessage)
      // if (onClick) onClick()
    }
  }

  createErrorNotice(errMsg: string) {
    const errorNotice = new Notice(errMsg)
    errorNotice.noticeEl.style.backgroundColor = '#ff5c5c'
  }


  async initialize(): Promise<void> {
    this.activateNotifications()
    // Testing notification command, adds a notification for the next 15 seconds
    this.plugin.addCommand({
      id: "addNotification",
      name: "Add Notification",
      callback: () => {
        let notification: PluginNotification = {
          id: "test",
          name: "Test Notification",
          description: "This is a test notification",
          location: NotificationLocation.Both,
          dataAndTime: new Date(Date.now() + 15000),
          type: NotificationType.Device,
          internalAction: function (): void {
            console.log("Test command run")
          },
          title: "",
          subtitle: ""
        }
        this.serviceMngr.infoMngr.addNotification(notification)
        this.activateNotification(notification)
      }
    })
  }
  
  async cleanup(): Promise<void> {
    throw new Error("Method not implemented.")
  }
  
}

  // createSystemNotification(notification: PluginNotification): void {
  //   if (this.plugin.isMobile) return

  //   // createNotification(title: string, body: string, clickMessage: string, onClick?: VoidFunction): void {
  //   let notif = new window.Notification(notification.title, { body: notification.body || "" })
  //   notif.onclick = () => {
  //     // console.log(clickMessage)
  //     // if (onClick) onClick()
      
  //     // TODO: Send an obsidian notice too, one that doesn't disappear.
  //   }
  // }

    // createSystemNotificationFromReminder(reminder: PluignReminder): void {
  // }
  
  // createInternalNotification(notification: PluginNotification): void {
  //   let notice = new Notice(notification.title, 100)
  // }

  // createErrorNotification(notification: PluginNotification): void {
  //   // createErrorNotice(errMsg: string) {
  //   //   const errorNotice = new Notice(errMsg)
  //   //   errorNotice.noticeEl.style.backgroundColor = '#ff5c5c'
  //   // }
  // }

