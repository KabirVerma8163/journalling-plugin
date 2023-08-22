import { IInfoHandler, InfoMngr } from "src/dataManagement/info"
import JournallingPlugin from "src/main"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { DEFAULT_PERIODIC_INFO, TPeriodicInfo } from "src/dataManagement/dataTypes"

export class PeriodicInfoHandler implements IInfoHandler{
  serviceName: string
  plugin: JournallingPlugin
  serviceMngr: IServiceMngr
  servicesManager: ServicesManager
  infoMngr: InfoMngr
  periodicInfo: TPeriodicInfo = DEFAULT_PERIODIC_INFO

  constructor(serviceMngr: IServiceMngr){
    serviceMngr.plugin.debugger.log("Constructing PeriodicInfoHandler")
    this.plugin = serviceMngr.plugin
    this.serviceName = serviceMngr.name
    this.serviceMngr = serviceMngr
    this.servicesManager = serviceMngr.servicesMngr
    this.infoMngr = serviceMngr.servicesMngr.infoMngr
  }

  retrieveInfo(){
    this.periodicInfo = this.infoMngr.getPeriodicInfo()
  }

  async setPeriodicInfo() {
    this.infoMngr.setPeriodicInfo(this.periodicInfo)
  }

  async initialize() {
    this.plugin.debugger.log("Initializing PeriodicInfoHandler")
  }

  async incrementDailyCount() {
    this.periodicInfo.daily.count++
    await this.setPeriodicInfo()
  }

  async decrementDailyCount() {
    this.periodicInfo.daily.count--
    await this.setPeriodicInfo()
  }

  async cleanup(){
    throw new Error("Method not implemented.")
  }
  
}