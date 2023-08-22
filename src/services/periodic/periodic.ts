import { IInfoHandler } from "src/dataManagement/info"
import { ISettingsHandler } from "src/dataManagement/settings"
import JournallingPlugin from "src/main"
import { IFeatureHandler } from "src/services/features"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { PeriodicSettingsHandler } from "src/services/periodic/periodicSettings"
import { PeriodicInfoHandler } from "src/services/periodic/periodicInfo"
import { PeriodicFeaturesHandler } from "src/services/periodic/periodicFeatures"

export class PeriodicService implements IServiceMngr{
  name = "Periodic"
  description = "This is the periodic notes feature"
  servicesMngr: ServicesManager
  plugin: JournallingPlugin
  settingsHandler: ISettingsHandler
  infoHandler: IInfoHandler
  featureHandler: IFeatureHandler

  constructor(servicesMngr: ServicesManager){
    servicesMngr.plugin.debugger.log("Initializing PeriodicService")
    this.servicesMngr = servicesMngr
    this.plugin = servicesMngr.plugin

    this.settingsHandler = new PeriodicSettingsHandler(this)
    this.infoHandler = new PeriodicInfoHandler(this)
    this.featureHandler = new PeriodicFeaturesHandler(this)
  }

  async initialize(){
    this.plugin.debugger.log("Initializing PeriodicService")

    await this.infoHandler.initialize()
    await this.featureHandler.initialize()
  }
  
}