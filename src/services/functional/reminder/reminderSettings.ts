import { ISettingsHandler, SettingsMngr } from "src/dataManagement/settings"
import JournallingPlugin from "src/main"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { CollapsibleObject } from "src/ui_elements/collapsible"

// TODO: Guess it could just be a bunch of toggles to start with idk, right now it's just a placeholder
export class ReminderSettingsHandler implements ISettingsHandler {
  serviceName: string
  plugin: JournallingPlugin
  serviceMngr: IServiceMngr
  servicesManager: ServicesManager
  settingsMngr: SettingsMngr


  hasSettings = false 
  allSettingsContainerEl: HTMLElement
  settingsEl: HTMLElement
  settingsElId: string
  collapsible: CollapsibleObject 
  collapsibleEl: HTMLElement

  private reminderSettings: any = {
    showing: true,
  } 

  constructor(serviceMngr: IServiceMngr) {
    serviceMngr.plugin.debugger.log("Constructing ReminderSettingsHandler")
    this.settingsElId = "reminder-settings"

    this.serviceName = serviceMngr.name
    this.plugin = serviceMngr.plugin
    this.serviceMngr = serviceMngr
    this.servicesManager = serviceMngr.servicesMngr
    this.settingsMngr = serviceMngr.servicesMngr.settingsMngr
    this.allSettingsContainerEl = this.settingsMngr.containerEl
  }

  display(){
    this.plugin.debugger.log("Displaying Reminder Settings")
  }

  getSettingsShowing(): boolean {
    throw new Error("Method not implemented.")
  }
  setSettingsShowing(value: boolean): Promise<void> {
    throw new Error("Method not implemented.")
  }

  retrieveSettings(){
    this.reminderSettings = this.settingsMngr.getReminderSettings()
  }

  async initialize(){
    this.plugin.debugger.log("Initializing NotificationSettingsHandler")
    this.retrieveSettings()
  }

  async cleanup(){
    
  }

}

