import JournallingPlugin from "src/main"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { NotificationInfoHandler } from "src/services/functional/notification/notificationInfo"
import { NotificationFeatureHandler } from "src/services/functional/notification/notificationFeatures"
import { NotificationSettingsHandler } from "src/services/functional/notification/notificationSettings"

export class NotificationService implements IServiceMngr {
  name = "Notifications"
  description = "This is the notifications feature"
  servicesMngr: ServicesManager
  plugin: JournallingPlugin
  settingsHandler: NotificationSettingsHandler
  infoHandler: NotificationInfoHandler
  featureHandler: NotificationFeatureHandler

  constructor(servicesManager: ServicesManager){
    servicesManager.plugin.debugger.log("Constructing NotificationService")
    this.servicesMngr = servicesManager
    this.plugin = servicesManager.plugin

    this.settingsHandler = new NotificationSettingsHandler(this) 
    this.infoHandler = new NotificationInfoHandler(this)
    this.featureHandler = new NotificationFeatureHandler(this)
  }


  async initialize(){ 
    this.plugin.debugger.log("Initializing NotificationService")

    await this.infoHandler.initialize()
    await this.featureHandler.initialize()
  }

}