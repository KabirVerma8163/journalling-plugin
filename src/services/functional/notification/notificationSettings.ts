import { ISettingsHandler, SettingsMngr, setCollapsibleElement } from "src/dataManagement/settings"
import JournallingPlugin from "src/main"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { CollapsibleObject } from "src/ui_elements/collapsible"
import { Setting } from "obsidian"
import { TNotificationSettings } from "src/dataManagement/dataTypes"
import { NotificationService } from "src/services/functional/notification/notifications"

export class NotificationSettingsHandler implements ISettingsHandler {
  serviceName: string
  plugin: JournallingPlugin
  serviceMngr: NotificationService
  servicesManager: ServicesManager
  settingsMngr: SettingsMngr

  hasSettings = true
  allSettingsContainerEl: HTMLElement
  settingsEl: HTMLElement
  settingsElId: string
  collapsible: CollapsibleObject
  collapsibleEl: HTMLElement

  private notificationSettings: TNotificationSettings = {
    canNotify: true,
    showing: true
  }

  constructor(serviceMngr: IServiceMngr) {
    serviceMngr.plugin.debugger.log("Constructing NotificationSettingsHandler")

    this.serviceName = serviceMngr.name
    this.plugin = serviceMngr.plugin
    this.serviceMngr = serviceMngr as NotificationService
    this.servicesManager = serviceMngr.servicesMngr
    this.settingsMngr = serviceMngr.servicesMngr.settingsMngr

    this.settingsElId = "notification-settings"
    this.allSettingsContainerEl = this.settingsMngr.containerEl

  }

  display(): void {
    this.plugin.debugger.log("Displaying Notification Settings")

    setCollapsibleElement(this)
    this.collapsibleEl = this.collapsible.collapsibleEl

    // Add a simple setting to toggle showing notifications
    new Setting(this.collapsibleEl)
      .setName("Allow Notifications")
      .setDesc("Toggle whether or not to notifications are allowed")
      .addToggle(toggle => toggle
        .setValue(this.getNotificationsAllowed())
        .onChange(async (value) => {
          await this.setNotificationsAllowed(value)
        }))
  }


  getSettingsShowing(): boolean {
    return this.getNotificationSettingsShowing()
  }

  async setSettingsShowing(value: boolean): Promise<void> {
    await this.setNotificationSettingsShowing(value)
  }

  retrieveSettings() {
    this.notificationSettings = this.settingsMngr.getNotificationSettings()
  }

  getNotificationsAllowed(): boolean {
    return this.notificationSettings.canNotify
  }

  async setNotificationsAllowed(value: boolean) {
    this.notificationSettings.canNotify = value
    await this.settingsMngr.setNotificationSettings(this.notificationSettings)
  }

  getNotificationSettingsShowing(): boolean {
    return this.notificationSettings.showing
  }

  async setNotificationSettingsShowing(value: boolean) {
    this.notificationSettings.showing = value
    await this.settingsMngr.setNotificationSettings(this.notificationSettings)
  }

  async initialize(){
    this.plugin.debugger.log("Initializing NotificationSettingsHandler")
    this.retrieveSettings()

    return Promise.resolve(undefined)
  }

  async cleanup() {
    return Promise.resolve(undefined)
  }
}