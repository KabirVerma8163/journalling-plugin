import JournallingPlugin from "src/main"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { DataMngr } from "src/dataManagement/dataMngr"
import { PluginSettingTab} from "obsidian"
import { TJournalSettings, TNotificationSettings, TPeriodicSettings, TReminderSettings, TVaultManipulationSettings } from "src/dataManagement/dataTypes"
import { CollapsibleObject } from "src/ui_elements/collapsible"

export interface ISettingsHandler {
  serviceName: string
  plugin: JournallingPlugin
  serviceMngr: IServiceMngr
  servicesManager: ServicesManager
  settingsMngr: SettingsMngr

  hasSettings: boolean
  allSettingsContainerEl: HTMLElement
  settingsEl: HTMLElement
  settingsElId: string
  collapsible: CollapsibleObject
  collapsibleEl: HTMLElement
  display(): void

  // A private object for Settings
  retrieveSettings(): void
  getSettingsShowing(): boolean
  setSettingsShowing(value: boolean): Promise<void>

  initialize(): Promise<void>
  cleanup(): Promise<void>
}

// TODO: Have an update setting function, that runs the save automatically
export class SettingsMngr extends PluginSettingTab {
  plugin: JournallingPlugin
  servicesMngr: ServicesManager
  dataMngr: DataMngr

  constructor(servicesMngr: ServicesManager) {
    servicesMngr.plugin.debugger.log("Constructing SettingsMngr")

    super(servicesMngr.plugin.app, servicesMngr.plugin)

    this.plugin = servicesMngr.plugin
    this.servicesMngr = servicesMngr
    this.dataMngr = servicesMngr.dataMngr
  }

  async initialize() {
    this.plugin.debugger.log("Initializing SettingsMngr")
    // Initialize the settings for each service
    for (const serviceMngr of this.servicesMngr.serviceMngrs) {
      await serviceMngr.settingsHandler.initialize()
    }
  }

  display() {
    this.plugin.debugger.log("Displaying Settings")

    const { containerEl } = this
    containerEl.empty()
    containerEl.createEl('h3', { text: `${this.plugin.name} Settings` })

    // Displaying the settings for each service
    for (const serviceMngr of this.servicesMngr.serviceMngrs) {
      serviceMngr.settingsHandler.display()
    }
  }

  getNotificationSettings(): TNotificationSettings {
    return this.dataMngr.getAllSettings("notification")
  }

  async setNotificationSettings(value: TNotificationSettings) {
    await this.dataMngr.setSetting("notification", value)
  }

  getReminderSettings(): TReminderSettings {
    return this.dataMngr.getAllSettings("reminder")
  }

  async setReminderSettings(value: TReminderSettings) {
    await this.dataMngr.setSetting("reminder", value)
  }

  getVaultManipulationSettings(): TVaultManipulationSettings {
    return this.dataMngr.getAllSettings("vaultManipulation")
  }

  async setVaultManipulationSettings(value: TVaultManipulationSettings) {
    await this.dataMngr.setSetting("vaultManipulation", value)
  }

  getJournalSettings(): TJournalSettings {
    return this.dataMngr.getAllSettings("journal")
  }

  async setJournalSettings(value: TJournalSettings) {
    await this.dataMngr.setSetting("journal", value)
  }

  getPeriodicSettings() {
    return this.dataMngr.getAllSettings("periodic")
  }

  async setPeriodicSettings(value: TPeriodicSettings) {
    await this.dataMngr.setSetting("periodic", value)
  }

  checkIntlTimeFormat(value: string, onSuccess: (val: string) => void, onError: () => void) {
    const pattern = /^([01]?[0-9]|2[0-3])[0-5][0-9]$/
    if (value == "" || pattern.test(value)) {
      value = value.padStart(4, '0')
      onSuccess(value)
    } else {
      onError()
      this.plugin.basicErrorNotice('The time format is incorrect. Please use 24-hour format (HHMM).')
    }
  }
}

export function setCollapsibleElement(handler: ISettingsHandler) {
  handler.settingsEl = handler.allSettingsContainerEl.createDiv()
  handler.settingsEl.id = handler.settingsElId
  
  let collapsible = new CollapsibleObject(`${handler.settingsElId}-container`,
    `${handler.serviceName}`,
    handler.getSettingsShowing.bind(handler),
    handler.setSettingsShowing.bind(handler))

  handler.collapsible = collapsible
  handler.settingsEl.appendChild(collapsible.containerEl)
}