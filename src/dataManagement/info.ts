import JournallingPlugin from "src/main";
import { DataMngr } from "./dataMngr";
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr";
import { TNotificationsInfo, TRemindersInfo, TPeriodicInfo, TJournalInfo } from "./dataTypes";

// // This requires the plugin to already have a dataMngr object so it must be created in the initialize class // nvm
export class InfoMngr{
  plugin: JournallingPlugin
  dataMngr: DataMngr

  constructor(servicesManager: ServicesManager){
    this.plugin = servicesManager.plugin
    this.dataMngr = servicesManager.dataMngr
  }

  async getNotificationsInfo() : Promise<TNotificationsInfo>{
    // @ts-ignore
   return await this.dataMngr.getInfo("notifications")
  }

  async setNotificationsInfo(value: TNotificationsInfo){
    // @ts-ignore
    await this.dataMngr.setInfo("notifications", value)
  }

  async getRemindersInfo() : Promise<TRemindersInfo>{
    // @ts-ignore
   return await this.dataMngr.getInfo("reminders")
  }

  async setRemindersInfo(value: TRemindersInfo){
    // @ts-ignore
    await this.dataMngr.setInfo("reminders", value)
  }

  async getPeriodicInfo() : Promise<TPeriodicInfo>{
    // @ts-ignore
    return await this.dataMngr.getInfo("periodic")
  }

  async setPeriodicInfo(value: TPeriodicInfo){
    // @ts-ignore
    await this.dataMngr.setInfo("periodic", value)
  }

  async getJournalInfo() : Promise<TJournalInfo>{
    // @ts-ignore
    return await this.dataMngr.getInfo("journal")
  }
}

export interface IInfoHandler {
  serviceName : string
  plugin: JournallingPlugin
  serviceMngr: IServiceMngr
  
  initialize(): Promise<void>
  cleanup(): Promise<void>

}