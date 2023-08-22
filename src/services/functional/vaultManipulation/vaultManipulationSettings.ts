import { Setting } from "obsidian"
import { ISettingsHandler, SettingsMngr, setCollapsibleElement } from "src/dataManagement/settings"
import JournallingPlugin from "src/main"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { CollapsibleObject } from "src/ui_elements/collapsible"
import { VaultManipulationService } from "./vaultManipulation"
import { DEFAULT_VAULT_MANIPULATION_SETTINGS, TVaultManipulationSettings } from "src/dataManagement/dataTypes"

export class VaultManipulationSettingsHandler implements ISettingsHandler {
  serviceName: string
  plugin: JournallingPlugin
  serviceMngr: IServiceMngr
  servicesManager: ServicesManager
  settingsMngr: SettingsMngr
  hasSettings = true
  allSettingsContainerEl: HTMLElement
  settingsEl: HTMLElement
  settingsElId: string
  collapsible: CollapsibleObject
  collapsibleEl: HTMLElement
  vaultManipulationSettings: TVaultManipulationSettings = DEFAULT_VAULT_MANIPULATION_SETTINGS

  constructor(serviceMngr: IServiceMngr) {
    serviceMngr.plugin.debugger.log("Constructing VaultManipulationSettingsHandler")

    this.serviceName = serviceMngr.name
    this.plugin = serviceMngr.plugin
    this.serviceMngr = serviceMngr
    this.servicesManager = serviceMngr.servicesMngr
    this.settingsMngr = serviceMngr.servicesMngr.settingsMngr
    this.settingsElId = "vault-manipulation-settings"
    this.allSettingsContainerEl = this.settingsMngr.containerEl
  }
  
  display(): void {
    this.plugin.debugger.log("Displaying VaultManipulationSettingsHandler")
    // TODO: Settings for replace or don't make new file defaults later

    setCollapsibleElement(this)
    this.collapsibleEl = this.collapsible.collapsibleEl

    // Add a toggle for file replace or not
    new Setting(this.collapsibleEl)
      .setName("Always replace file")
      .setDesc("If a file with the same name already exists, replace it with the new file")
      .addToggle(toggle => {
        toggle.setValue(this.getReplaceFile())
        toggle.onChange(async (value) => {
          await this.setReplaceFile(value)
        })
      })
  }

  retrieveSettings(){
    this.vaultManipulationSettings = this.settingsMngr.getVaultManipulationSettings()
  }
  getSettingsShowing(): boolean {
    return this.vaultManipulationSettings.showing
  }
  async setSettingsShowing(value: boolean) {
    await this.setVaultManipulationSettingsShowing(value)
  }
  getVaultManipulationSettingsShowing(): TVaultManipulationSettings {
    return this.vaultManipulationSettings
  }
  async setVaultManipulationSettingsShowing(value: boolean) {
    this.vaultManipulationSettings.showing = value
    await this.setVaultManipulationSettings()
  }
  async setVaultManipulationSettings(){
    await this.settingsMngr.setVaultManipulationSettings(this.vaultManipulationSettings)
  }

  async initialize(){
    this.plugin.debugger.log("Initializing VaultManipulationSettingsHandler")
  }

  getReplaceFile(): boolean {
    return this.vaultManipulationSettings.replaceFilesOn
  }
  async setReplaceFile(value: boolean) {
    this.vaultManipulationSettings.replaceFilesOn = value
    await this.setVaultManipulationSettings()
  }

  async cleanup(){
    this.plugin.debugger.log("Cleaning up VaultManipulationSettingsHandler (not implemented)")
  }

}