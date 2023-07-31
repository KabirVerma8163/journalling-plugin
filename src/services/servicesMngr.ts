// I want to build an object so that its the only thing that needs to be imported for each feature and it will have its own info/setting/feature manager

import { DataMngr } from "src/dataManagement/dataMngr"
import { IInfoHandler, InfoMngr } from "src/dataManagement/info"
import JournallingPlugin from "src/main"
import { NotificationService } from "./notifications/notifications"
import { info } from "console"

// This is the one that has all the different aspect managers (info, settings, features)
// Then there is also a feature Handler which manages all the functions of one particular feature 
export interface IServiceMngr {
  name : string
  description: string
  servicesManager: ServicesManager
  plugin: JournallingPlugin
  infoMngr : IInfoHandler
  // settingsMngr : ISettingsMngr
  // featureMngr : IFeatureMngr

  initialize(): Promise<void>
}

export class ServicesManager {
  serviceMngrs: IServiceMngr[]
  plugin: JournallingPlugin
  dataMngr: DataMngr
  infoMngr: InfoMngr

  constructor(plugin: JournallingPlugin){
    this.plugin = plugin
  } 

  async initialize() : Promise<void>{
    this.dataMngr = new DataMngr(this.plugin)

    this.serviceMngrs = []
    this.serviceMngrs.push(new NotificationService(this))

    this.serviceMngrs.forEach(serviceMngr => { 
      serviceMngr.initialize()
    })
    
    return Promise.resolve()
  }
}