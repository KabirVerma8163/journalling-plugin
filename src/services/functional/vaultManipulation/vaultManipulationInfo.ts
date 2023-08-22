import { TVaultManipulationInfo } from "src/dataManagement/dataTypes"
import { IInfoHandler, InfoMngr } from "src/dataManagement/info"
import JournallingPlugin from "src/main"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { VaultManipulationService } from "./vaultManipulation"

export class VaultManipulationInfoHandler implements IInfoHandler{
  serviceName: string
  plugin: JournallingPlugin
  serviceMngr: IServiceMngr
  servicesManager: ServicesManager
  infoMngr: InfoMngr
  vaultManipulationInfo: TVaultManipulationInfo

  constructor(serviceMngr: IServiceMngr) {
    serviceMngr.plugin.debugger.log("Constructing VaultManipulationInfoHandler")
    this.serviceName = serviceMngr.name
    this.plugin = serviceMngr.plugin
    this.serviceMngr = serviceMngr
    this.servicesManager = serviceMngr.servicesMngr
    this.infoMngr = serviceMngr.servicesMngr.infoMngr
  }

  retrieveInfo() {
    this.vaultManipulationInfo = this.infoMngr.getVaultManipulationInfo()
  }

  async initialize(){
    this.plugin.debugger.log("Initializing VaultManipulationInfoHandler")
  }
  async cleanup(){
    this.plugin.debugger.log("Cleaning up VaultManipulationInfoHandler (not implemented)")
  }
  
}