import { TJournalInfo } from "src/dataManagement/dataTypes"
import { IInfoHandler, InfoMngr } from "src/dataManagement/info"
import JournallingPlugin from "src/main"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { JournalService } from "src/services/journalling/journal"

export class JournalInfoHandler implements IInfoHandler{
  serviceName: string
  plugin: JournallingPlugin
  serviceMngr: JournalService
  servicesManager: ServicesManager
  infoMngr: InfoMngr

  constructor(serviceMngr: IServiceMngr){
    this.plugin = serviceMngr.plugin
    this.serviceName = serviceMngr.name
    this.serviceMngr = serviceMngr as JournalService
    this.servicesManager = serviceMngr.servicesMngr
    this.infoMngr = serviceMngr.servicesMngr.infoMngr
  }

  private journalInfo: TJournalInfo = {
    count: 0,
  }

  retrieveInfo(): void {
    this.journalInfo = this.infoMngr.getJournalInfo()
  }

  async updateJournals(): Promise<void> {
    await this.infoMngr.setJournalInfo(this.journalInfo)
  }

  async incrementCount(): Promise<void> {
    this.journalInfo.count++
  }

  async decrementCount(): Promise<void> {
    this.journalInfo.count--
  }

  async initialize(): Promise<void> {
    this.plugin.debugger.log("Initializing JournalInfoHandler")
    this.retrieveInfo()
  }
  async cleanup(): Promise<void> {
    this.plugin.debugger.log("Not yet implemented JournalInfoHandler.cleanup()")
  }
}