import { ISettingsHandler, SettingsMngr, setCollapsibleElement } from "src/dataManagement/settings"
import JournallingPlugin from "src/main"
import { CollapsibleObject } from "src/ui_elements/collapsible"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { TPeriodicSettings, DEFAULT_PERIODIC_SETTINGS } from "src/dataManagement/dataTypes"
import { Setting } from "obsidian"
import { InteractiveTextSetting, InteractiveTextSettingConfig, ReminderSetting, ReminderSettingConfig, TimelySubDirSetting, TimelySubDirSettingConfig } from "src/utils/moreSettings"
import { FileSuggest, FolderSuggest } from "src/ui_elements/suggesters/fileFolderSuggests"
import { formatDate } from "src/utils/independentUtils"

export class PeriodicSettingsHandler implements ISettingsHandler {
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
  periodicSettings: TPeriodicSettings = DEFAULT_PERIODIC_SETTINGS

  constructor(serviceMngr: IServiceMngr) {
    serviceMngr.plugin.debugger.log("Constructing PeriodicSettingsHandler")

    this.serviceName = serviceMngr.name
    this.plugin = serviceMngr.plugin
    this.serviceMngr = serviceMngr
    this.servicesManager = serviceMngr.servicesMngr
    this.settingsMngr = serviceMngr.servicesMngr.settingsMngr
    this.settingsElId = "periodic-settings"
    this.allSettingsContainerEl = this.settingsMngr.containerEl

  }

  display(): void {
    this.plugin.debugger.log("Displaying Periodic Settings")

    setCollapsibleElement(this)
    this.collapsibleEl = this.collapsible.collapsibleEl

    // Daily Note Settings
    let dailyCollapsibleObj = createTimelyNoteSetting("Daily", this)
    this.collapsibleEl.appendChild(dailyCollapsibleObj.containerEl)

    // Daily Note SubFolder Settings
    let weeklyConfig: TimelySubDirSettingConfig = {
      container: dailyCollapsibleObj.collapsibleEl,
      settingName: 'Weekly',
      getSetting: () => { return this.periodicSettings.daily.weekly.subDirOn },
      setSetting: (val: boolean) => {
        this.periodicSettings.daily.weekly.subDirOn = val
        this.setPeriodicSettings()
      },
      getTextFunc: (val: string, isDefault?: boolean) => {
        if (val === "value") {
          return formatDate(isDefault ? DEFAULT_PERIODIC_SETTINGS.daily.weekly.subDirFormat : this.periodicSettings.daily.weekly.subDirFormat)
        } else {
          return isDefault ? DEFAULT_PERIODIC_SETTINGS.daily.weekly.subDirFormat : this.periodicSettings.daily.weekly.subDirFormat
        }
      },
      setTextFunc: (val: string) => {
        this.periodicSettings.daily.weekly.subDirFormat = val
        this.setPeriodicSettings()
      },
    }
    new TimelySubDirSetting(weeklyConfig, this.settingsMngr)

    let monthlyConfig: TimelySubDirSettingConfig = {
      container: dailyCollapsibleObj.collapsibleEl,
      settingName: 'Monthly',
      getSetting: () => { return this.periodicSettings.daily.monthly.subDirOn },
      setSetting: (val: boolean) => {
        this.periodicSettings.daily.monthly.subDirOn = val
        this.setPeriodicSettings()
      },
      getTextFunc: (val: string, isDefault?: boolean) => {
        if (val === "value") {
          return formatDate(isDefault ? DEFAULT_PERIODIC_SETTINGS.daily.monthly.subDirFormat : this.periodicSettings.daily.monthly.subDirFormat)
        } else {
          return isDefault ? DEFAULT_PERIODIC_SETTINGS.daily.monthly.subDirFormat : this.periodicSettings.daily.monthly.subDirFormat
        }
      },
      setTextFunc: (val: string) => {
        this.periodicSettings.daily.monthly.subDirFormat = val
        this.setPeriodicSettings()
      },
    }
    new TimelySubDirSetting(monthlyConfig, this.settingsMngr)

    let yearlyConfig: TimelySubDirSettingConfig = {
      container: dailyCollapsibleObj.collapsibleEl,
      settingName: 'Yearly',
      getSetting: () => { return this.periodicSettings.daily.yearly.subDirOn },
      setSetting: (val: boolean) => {
        this.periodicSettings.daily.yearly.subDirOn = val
        this.setPeriodicSettings()
      },
      getTextFunc: (val: string, isDefault?: boolean) => {
        if (val === "value") {
          return formatDate(isDefault ? DEFAULT_PERIODIC_SETTINGS.daily.yearly.subDirFormat : this.periodicSettings.daily.yearly.subDirFormat)
        } else {
          return isDefault ? DEFAULT_PERIODIC_SETTINGS.daily.yearly.subDirFormat : this.periodicSettings.daily.yearly.subDirFormat
        }
      },
      setTextFunc: (val: string) => {
        this.periodicSettings.daily.yearly.subDirFormat = val
        this.setPeriodicSettings()
      },
    }
    new TimelySubDirSetting(yearlyConfig, this.settingsMngr)


  }

  retrieveSettings(): void {
    this.periodicSettings = this.settingsMngr.getPeriodicSettings()
  }
  getSettingsShowing(): boolean {
    return this.getPeriodicSettingsShowing()
  }
  async setSettingsShowing(value: boolean) {
    await this.setPeriodicSettingsShowing(value)
  }
  getPeriodicSettingsShowing(): boolean {
    return this.periodicSettings.showing
  }
  async setPeriodicSettingsShowing(value: boolean) {
    this.periodicSettings.showing = value
    return this.settingsMngr.setPeriodicSettings(this.periodicSettings)
  }
  async setPeriodicSettings() {
    await this.settingsMngr.setPeriodicSettings(this.periodicSettings)
  }

  getTimelySettingsShowing(settingName: string): boolean {
    if (settingName.toLowerCase() === "daily") {
      return this.periodicSettings.daily.showing
    }
    return false
  }
  async setTimelySettingsShowing(settingName: string, value: boolean) {
    if (settingName.toLowerCase() === "daily") {
      this.periodicSettings.daily.showing = value
    }
    await this.setPeriodicSettings()
  }


  async initialize() {
    this.plugin.debugger.log("Initializing PeriodicSettingsHandler")
    this.retrieveSettings()
  }
  async cleanup() {
    this.plugin.debugger.log("Not yet implemented PeriodicSettingsHandler.cleanup()")
  }

}

// Todo Subfolder Division, can make this dependent on the daily notes for the rest
function createTimelyNoteSetting(name: string, settingHandler: PeriodicSettingsHandler) {
  let collasibleObj = new CollapsibleObject(`periodic-${name}-setting`, `${name} Note Settings`,
  () => {
    return settingHandler.getTimelySettingsShowing(name)
  }, (val: boolean) => {
    settingHandler.setTimelySettingsShowing(name, val)
  })
  
  // Autocreate on Setting
  new Setting(collasibleObj.collapsibleEl)
    .setName(`Enable ${name} Note Autocreation`)
    .setDesc(`Automatically create a ${name} note without a command`)
    .addToggle((toggle) => {
      // @ts-ignore
      toggle.setValue(settingHandler.periodicSettings[name.toLowerCase()].autoCreateOn)
        .onChange(async (value) => {
          // @ts-ignore
          settingHandler.periodicSettings[name.toLowerCase()].autoCreateOn = value
          await settingHandler.setPeriodicSettings()
    })})


  // Note naming format
  let timelyNamingSettingConfig: InteractiveTextSettingConfig = {
    setting: new Setting(collasibleObj.collapsibleEl).setName(`${name} Note Naming Format`),
    settingName: `periodic-${name}-naming-format`,
    descText: "Current Format: ",
    getText: () => {
      // @ts-ignore
      return settingHandler.periodicSettings[name.toLowerCase()].namingFormat
    },
    setText: (val: string) => {
      // @ts-ignore
      settingHandler.periodicSettings[name.toLowerCase()].namingFormat = val
      settingHandler.setPeriodicSettings()
    }
  }
  new InteractiveTextSetting(settingHandler.settingsMngr, timelyNamingSettingConfig)

  // Note location folder
  new Setting(collasibleObj.collapsibleEl).setName(`${name} Note Folder Path`)
    .setDesc(`The locaiton of your ${name} names`)
    .addSearch((search) => {
      new FolderSuggest(settingHandler.plugin.app, search.inputEl)
      search.setPlaceholder("Example: folder1/folder2")
        // @ts-ignore
        .setValue(settingHandler.periodicSettings[name.toLowerCase()].dirPath)
        .onChange((folderName) => {
          // @ts-ignore
          settingHandler.periodicSettings[name.toLowerCase()].dirPath = folderName
          settingHandler.setPeriodicSettings()
        })
    })

  // Note template path
  new Setting(collasibleObj.collapsibleEl)
    .setName(`${name} Template Path`)
    .setDesc(`The location of your ${name} Note Template`)
    .addSearch((search) => {
      new FileSuggest(settingHandler.plugin.app, search.inputEl)
      search.setPlaceholder("Example: folder1/filename.md")
        // @ts-ignore
        .setValue(settingHandler.periodicSettings[name.toLowerCase()].templatePath)
        .onChange((fileName) => {
          // @ts-ignore
          settingHandler.periodicSettings[name.toLowerCase()].templatePath = fileName
          settingHandler.setPeriodicSettings()
        })
    })

  // Note reminder
  const reminderSettingConfig: ReminderSettingConfig = {
    container: collasibleObj.collapsibleEl,
    settingName: `${name} Note`,
    // @ts-ignore
    getSetting: () => settingHandler.periodicSettings[name.toLowerCase()].reminderOn,
    setSetting: (val: boolean) => {
      // @ts-ignore
      settingHandler.periodicSettings[name.toLowerCase()].reminderOn = val
      // @ts-ignore
      settingHandler.setPeriodicSettings()
    },
    // @ts-ignore
    getToggled: () => settingHandler.periodicSettings[name.toLowerCase()].reminderTime,
    setToggled: (val: string) => {
      // @ts-ignore
      settingHandler.periodicSettings[name.toLowerCase()].reminderTime = val
      settingHandler.setPeriodicSettings()
    }
  }
  new ReminderSetting(reminderSettingConfig, settingHandler.settingsMngr)


  collasibleObj.containerEl.style.width = "92.5%"
  collasibleObj.containerEl.style.marginLeft = "2.5%"
  collasibleObj.containerEl.style.marginRight = "5%"


  return collasibleObj
}