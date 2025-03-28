// I want to build an object so that its the only thing that needs to be imported for each feature and it will have its own info/setting/feature manager

import { DataMngr } from "src/dataManagement/dataMngr"
import { IInfoHandler, InfoMngr } from "src/dataManagement/info"
import JournallingPlugin from "src/main"
import { NotificationService } from "src/services/functional/notification/notifications"
import { IFeatureHandler } from "src/services/features"
import { ISettingsHandler, SettingsMngr } from "src/dataManagement/settings"
import { JournalService } from "src/services/journalling/journal"
import { PeriodicService } from "src/services/periodic/periodic"
import { Vault } from "obsidian"
import { VaultManipulationService } from "./functional/vaultManipulation/vaultManipulation"

// This is the one that has all the different aspect managers (info, settings, features)
// Then there is also a feature Handler which manages all the functions of one particular feature 
export interface IServiceMngr {
  name : string
  description : string
  servicesMngr : ServicesManager
  plugin : JournallingPlugin
  settingsHandler: ISettingsHandler
  infoHandler : IInfoHandler
  featureHandler : IFeatureHandler

  initialize(): Promise<void>
}

export class ServicesManager {
  serviceMngrs: IServiceMngr[]
  plugin: JournallingPlugin
  dataMngr: DataMngr
  infoMngr: InfoMngr
  settingsMngr: SettingsMngr
  notificationService: NotificationService
  // reminderService: ReminderService
  vaultManipulationService: VaultManipulationService

  constructor(plugin: JournallingPlugin){
    plugin.debugger.log("Constructing ServicesManager")
    this.plugin = plugin

    this.dataMngr = new DataMngr(this.plugin)
    this.settingsMngr = new SettingsMngr(this)
    this.infoMngr = new InfoMngr(this)

    this.serviceMngrs = []
    this.serviceMngrs.push(new JournalService(this)) 
    this.serviceMngrs.push(new PeriodicService(this))

    this.notificationService = new NotificationService(this)
    this.serviceMngrs.push(this.notificationService)
    // this.reminderService = new ReminderService(this)
    // this.serviceMngrs.push(this.reminderService)
    this.vaultManipulationService = new VaultManipulationService(this)
    this.serviceMngrs.push(this.vaultManipulationService)
  } 

  async initialize(){
    this.plugin.debugger.log("Initializing ServicesManager")

    await this.dataMngr.initialize()
    await this.settingsMngr.initialize()

    for (const serviceMngr of this.serviceMngrs) {
      await serviceMngr.initialize()
    }
    
    this.plugin.addSettingTab(this.settingsMngr)

    return Promise.resolve()
  }
}