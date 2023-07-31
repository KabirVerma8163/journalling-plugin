import { IInfoHandler } from "src/dataManagement/info"
import JournallingPlugin from "src/main"
import { IServiceMngr, ServicesManager } from "../servicesMngr"
import { NotificationInfoHandler } from "./notificationInfo"

export class NotificationService implements IServiceMngr {
  name = "Notifications"
  description = "This is the reminders feature"
  infoMngr: NotificationInfoHandler
  servicesManager: ServicesManager
  plugin: JournallingPlugin

  constructor(servicesManager: ServicesManager){
    this.servicesManager = servicesManager
    this.plugin = servicesManager.plugin
  }

  async initialize(): Promise<void> { 
    this.infoMngr = new NotificationInfoHandler(this)
    await this.infoMngr.initialize()

    // this.settingsMngr = new ReminderSettingsHandler(this)
    // throw new Error("Method not implemented.")
  }

}