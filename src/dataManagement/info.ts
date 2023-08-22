import JournallingPlugin from "src/main"
import { DataMngr } from "src/dataManagement/dataMngr"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { TNotificationInfo, TReminderInfo, TPeriodicInfo, TJournalInfo, TVaultManipulationInfo } from "src/dataManagement/dataTypes"

export interface IInfoHandler {
  serviceName : string
  plugin: JournallingPlugin
  serviceMngr: IServiceMngr
  servicesManager: ServicesManager
  infoMngr: InfoMngr

  // An object for Info

  retrieveInfo(): void
  initialize(): Promise<void>
  cleanup(): Promise<void>
}

export class InfoMngr{
  plugin: JournallingPlugin
  dataMngr: DataMngr
  servicesMngr: ServicesManager

  constructor(servicesManager: ServicesManager){
    servicesManager.plugin.debugger.log("Constructing InfoMngr")
    this.plugin = servicesManager.plugin
    this.dataMngr = servicesManager.dataMngr
    this.servicesMngr = servicesManager
  }

  getNotificationInfo() : TNotificationInfo{
   return this.dataMngr.getInfo("notification")
  }

  async setNotificationInfo(value: TNotificationInfo){
    await this.dataMngr.setInfo("notification", value)
  }

  getReminderInfo() : TReminderInfo{
    return  this.dataMngr.getInfo("reminder")
  }

  async setReminderInfo(value: TReminderInfo){
    await this.dataMngr.setInfo("reminder", value)
  }

  getVaultManipulationInfo() : TVaultManipulationInfo{
    return this.dataMngr.getInfo("vaultManipulation")
  }

  async setVaultManipulationInfo(value: TVaultManipulationInfo){
    await this.dataMngr.setInfo("vaultManipulation", value)
  }

  getPeriodicInfo() : TPeriodicInfo{
    return this.dataMngr.getInfo("periodic")
  }
 
  async setPeriodicInfo(value: TPeriodicInfo){
    await this.dataMngr.setInfo("periodic", value)
  }

  getJournalInfo() : TJournalInfo{
    return this.dataMngr.getInfo("journal")
  }

  async setJournalInfo(value: TJournalInfo){
    await this.dataMngr.setInfo("journal", value)
  }
}