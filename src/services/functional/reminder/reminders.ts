import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import JournallingPlugin from "src/main"
import { ReminderInfoHandler } from "src/services/functional/reminder/reminderInfo"
import { ReminderSettingsHandler } from "src/services/functional/reminder/reminderSettings"
import { ReminderFeatureHandler } from "src/services/functional/reminder/reminderFeatures"

export class ReminderService implements IServiceMngr {
  name = "Reminders"
  description = "This is the reminders feature"
  plugin: JournallingPlugin
  servicesMngr: ServicesManager
  settingsHandler: ReminderSettingsHandler
  infoHandler: ReminderInfoHandler
  featureHandler: ReminderFeatureHandler

  constructor(servicesMngr: ServicesManager){
    this.plugin = servicesMngr.plugin
    this.servicesMngr = servicesMngr

    this.settingsHandler = new ReminderSettingsHandler(this)
    this.infoHandler = new ReminderInfoHandler(this)
    this.featureHandler = new ReminderFeatureHandler(this)
  }


  async initialize(){ 
    this.plugin.debugger.log("Initializing ReminderService")

    await this.infoHandler.initialize()
    await this.featureHandler.initialize()
  }

}

