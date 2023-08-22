import { IInfoHandler, InfoMngr } from "src/dataManagement/info"
import JournallingPlugin from "src/main"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { TNotificationInfo } from "src/dataManagement/dataTypes"

export class NotificationInfoHandler implements IInfoHandler{
  serviceName: string
  plugin: JournallingPlugin
  serviceMngr: IServiceMngr
  servicesManager: ServicesManager
  infoMngr: InfoMngr

  constructor(serviceMngr: IServiceMngr){
    serviceMngr.plugin.debugger.log("Constructing NotificationInfoHandler")
    this.serviceName = serviceMngr.name
    this.plugin = serviceMngr.plugin
    this.serviceMngr = serviceMngr
    this.servicesManager = serviceMngr.servicesMngr
    this.infoMngr = serviceMngr.servicesMngr.infoMngr
  }

  // NotificationInfoHandler specific functions and variables
  private notificationInfo: TNotificationInfo = {
    count: 0,
    notifications: []
  }

  retrieveInfo(){
    this.notificationInfo = this.infoMngr.getNotificationInfo() 
  }

  async updateNotifications(){
    await this.infoMngr.setNotificationInfo(this.notificationInfo)
  }

  getScheduledNotification(id: string): PluginScheduledNotification | undefined {
    return this.notificationInfo.notifications.find(notification => notification.id === id)
  }
  getScheduledNotifications(): PluginScheduledNotification[] {
    return this.notificationInfo.notifications
  }

  async addNotification(notification: PluginScheduledNotification){
    this.notificationInfo.notifications.push(notification)
    await this.incrementCount()
    await this.updateNotifications()
  }

  async removeNotification(id: string){
    this.notificationInfo.notifications = this.notificationInfo.notifications.filter(notification => notification.id !== id)
    await this.decrementCount()
    await this.updateNotifications()
  }

  async updateNotification(notification: PluginScheduledNotification){
    this.notificationInfo.notifications = this.notificationInfo.notifications.map(oldNotification => {
      if(oldNotification.id === notification.id){
        return notification
      } else {
        return oldNotification
      }
    })
    await this.updateNotifications()
  }

  async getCount(): Promise<number> {
    return this.notificationInfo.count
  }

  async setCount(count: number) {
    this.notificationInfo.count = count
    await this.infoMngr.setNotificationInfo(this.notificationInfo)
  }

  async incrementCount() {
    this.notificationInfo.count += 1
    await this.infoMngr.setNotificationInfo(this.notificationInfo)
  }

  async decrementCount(){
    this.notificationInfo.count -= 1
    await this.infoMngr.setNotificationInfo(this.notificationInfo)
  }

  async initialize(){
    this.plugin.debugger.log("Initializing NotificationInfoHandler")
    this.retrieveInfo()
  }

  async cleanup(){}
}


export enum NotificationType {
  NonSpecific = "non-specific",
  Scheduled = "scheduled",
  Reminder = "reminder",
  Error = "error"
}

export enum NotificationLocation{
  App = "App",
  System = "System", 
  Both = "Both"
}

export type PluginNotification = {
  id: string
  name: string
  title: string
  subtitle?: string
  body: string
  type: NotificationType

  deleteOnShow: boolean
  deleteOnDone: boolean
  length?: number // Is imp for internal notifs
  location: NotificationLocation
  silent?: boolean
  runOnShow: () => void
  internalOnClick?: () => void
  externalOnClick?: (this: Notification, ev: Event) => any
}

export type PluginScheduledNotification = PluginNotification & {
  type: NotificationType.Scheduled
  dateAndTime: string
}
