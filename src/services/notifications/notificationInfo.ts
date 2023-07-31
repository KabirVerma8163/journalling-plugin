import { IInfoHandler } from "src/dataManagement/info"
import JournallingPlugin from "src/main"
import { IServiceMngr, ServicesManager } from "../servicesMngr"
import { PluignReminder } from "../reminders/reminderInfo"
import { Notice } from "obsidian"

export class NotificationInfoHandler implements IInfoHandler{
  serviceName: string
  plugin: JournallingPlugin
  serviceMngr: IServiceMngr
  servicesManager: ServicesManager

  constructor(serviceMngr: IServiceMngr){
    this.serviceName = serviceMngr.name
    this.plugin = serviceMngr.plugin
    this.serviceMngr = serviceMngr
    this.servicesManager = serviceMngr.servicesManager
  }

  // NotificationInfoHandler specific functions and variables
  private notifications: PluginNotification[] = []

  async retrieveNotifications(){
    this.notifications = await this.servicesManager.dataMngr.getInfo("notifications")
  }

  async updateNotifications(){
    await this.servicesManager.dataMngr.setInfo("notifications", this.notifications)
  }

  getNotification(id: string): PluginNotification | undefined {
    return this.notifications.find(notification => notification.id === id)
  }
  getNotifications(): PluginNotification[] {
    return this.notifications
  }

  async addNotification(notification: PluginNotification){
    this.notifications.push(notification)
    await this.updateNotifications()
  }

  async removeNotification(id: string){
    this.notifications = this.notifications.filter(notification => notification.id !== id)
    await this.updateNotifications()
  }

  async updateNotification(notification: PluginNotification){
    this.notifications = this.notifications.map(oldNotification => {
      if(oldNotification.id === notification.id){
        return notification
      } else {
        return oldNotification
      }
    })
    await this.updateNotifications()
  }

  // functions 
  async initialize(): Promise<void> {
    await this.retrieveNotifications()
    // throw new Error("Method not implemented.")
  }
  async cleanup(): Promise<void> {
    // throw new Error("Method not implemented.")
  }
}


export enum NotificationType {
  Device = "Device",
  Internal = "Internal",
  Reminder = "Reminder",
  Error = "Error"
}

export enum NotificationLocation{
  Internal = "Internal",
  Device = "System", 
  Both = "Both"
}

export type PluginNotification = {
  id: string
  name: string
  description: string
  dataAndTime: string | Date
  location: NotificationLocation
  type: NotificationType
  internalAction: () => void

  // General Notification options
  title: string
  subtitle: string
  body?: string
  silent?: boolean
  // icon?: string | NativeImage; // You might need to define the type for NativeImage separately

  // macOS specific options
  hasReply?: boolean
  replyPlaceholder?: string
  sound?: string
  closeButtonText?: string;
  // actions?: NotificationAction[]; // You might need to define the type for NotificationAction separately

  // Windows specific options
  // timeoutType?: 'default' | 'never' // Not macos, lin and win
  // toastXml?: string;
  // urgency?: 'normal' | 'critical' | 'low' // Linux only
}
