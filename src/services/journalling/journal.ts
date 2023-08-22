import JournallingPlugin from "src/main"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { JournalInfoHandler } from "src/services/journalling/journalInfo"
import { JournalSettingsHandler } from "src/services/journalling/journalSettings"
import { JournalFeatureHandler } from "src/services/journalling/journalFeatures"

export class JournalService implements IServiceMngr{
  name = "Journal"
  description = "This is the journal feature"
  plugin: JournallingPlugin
  servicesMngr: ServicesManager
  settingsHandler: JournalSettingsHandler
  infoHandler: JournalInfoHandler
  featureHandler: JournalFeatureHandler

  constructor(servicesMngr: ServicesManager){
    this.plugin = servicesMngr.plugin
    this.servicesMngr = servicesMngr

    this.settingsHandler = new JournalSettingsHandler(this)
    this.featureHandler = new JournalFeatureHandler(this)
    this.infoHandler = new JournalInfoHandler(this)
  }

  async initialize(): Promise<void> {
    this.plugin.debugger.log("Initializing JournalService")

    await this.infoHandler.initialize()
    await this.featureHandler.initialize()
  }
}