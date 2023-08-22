import JournallingPlugin from "src/main"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { VaultManipulationFeatureHandler } from "./vaultManipulationFeatures"
import { VaultManipulationInfoHandler } from "./vaultManipulationInfo"
import { VaultManipulationSettingsHandler } from "./vaultManipulationSettings"

export class VaultManipulationService implements IServiceMngr {
  name: string
  description: string
  servicesMngr: ServicesManager
  plugin: JournallingPlugin
  settingsHandler: VaultManipulationSettingsHandler
  infoHandler: VaultManipulationInfoHandler
  featureHandler: VaultManipulationFeatureHandler

  constructor(servicesMngr: ServicesManager) {
    this.name = "Vault Manipulation"
    this.description = "This is the vault manipulation service"
    this.servicesMngr = servicesMngr
    this.plugin = servicesMngr.plugin

    this.settingsHandler = new VaultManipulationSettingsHandler(this)
    this.infoHandler = new VaultManipulationInfoHandler(this)
    this.featureHandler = new VaultManipulationFeatureHandler(this)
  }

  async initialize() {
    this.plugin.debugger.log("Initializing VaultManipulationService")

    await this.infoHandler.initialize()
    await this.featureHandler.initialize()

  }
}
