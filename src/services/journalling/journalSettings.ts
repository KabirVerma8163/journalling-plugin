import { ISettingsHandler, SettingsMngr, setCollapsibleElement } from "src/dataManagement/settings"
import JournallingPlugin from "src/main"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { JournalService } from "src/services/journalling/journal"
import { DEFAULT_JOURNAL_SETTINGS, TJournalSettings } from "src/dataManagement/dataTypes"
import { CollapsibleObject } from "src/ui_elements/collapsible"
import { Setting } from "obsidian"
import { FileSuggest, FolderSuggest } from "src/ui_elements/suggesters/fileFolderSuggests"
import { InteractiveTextSetting, ReminderSetting, ReminderSettingConfig, TimelySubDirSetting, TimelySubDirSettingConfig } from "src/utils/moreSettings"
import { formatDate } from "src/utils/independentUtils"

export class JournalSettingsHandler implements ISettingsHandler {
  serviceName: string
  plugin: JournallingPlugin
  serviceMngr: JournalService
  servicesManager: ServicesManager
  settingsMngr: SettingsMngr

  hasSettings: boolean
  allSettingsContainerEl: HTMLElement
  settingsEl: HTMLElement
  settingsElId: string
  containerEl: HTMLElement
  collapsible: CollapsibleObject
  collapsibleEl: HTMLElement
  
  journalSettings: TJournalSettings = DEFAULT_JOURNAL_SETTINGS

  constructor(serviceMngr: IServiceMngr) {
    serviceMngr.plugin.debugger.log("Constructing JournalSettingsHandler")

    this.serviceName = serviceMngr.name
    this.plugin = serviceMngr.plugin
    this.serviceMngr = serviceMngr as JournalService
    this.servicesManager = serviceMngr.servicesMngr
    this.settingsMngr = serviceMngr.servicesMngr.settingsMngr

    this.settingsElId = "journal-settings"
    this.allSettingsContainerEl = this.settingsMngr.containerEl
  }

  display(): void {
    this.plugin.debugger.log("Displaying Journal Settings")

    setCollapsibleElement(this)
    this.collapsibleEl = this.collapsible.collapsibleEl

    // Autocreate on Setting
    new Setting(this.collapsibleEl)
      .setName('Enable Journal Autocreation')
      .setDesc('Automatically create a journal without a command')
      .addToggle((toggle) => {
        toggle.setValue(this.journalSettings.autoCreateOn)
          .onChange(async (value) => {
            this.journalSettings.autoCreateOn = value
            await this.setJournalSettings()
          })
      })

    // Journal Naming Settings
    const journalNamingSetting = {
      setting: new Setting(this.collapsibleEl).setName("Journal Naming Format"),
      settingName: "journal-naming-format",
      descText: "Current Format: ",
      getText: (val: string, isDefault?: boolean) => {
        if (val === "value") {
          return formatDate(isDefault ? DEFAULT_JOURNAL_SETTINGS.namingFormat : this.journalSettings.namingFormat)
        } else {
          return isDefault ? DEFAULT_JOURNAL_SETTINGS.namingFormat : this.journalSettings.namingFormat
        }
      },
      setText: (val: string) => {
        this.journalSettings.namingFormat = val
        this.setJournalSettings()
      }
    }
    const interactiveTextSetting = new InteractiveTextSetting(this.settingsMngr, journalNamingSetting)

    // Journal Directory Settings
    new Setting(this.collapsibleEl)
    .setName('Journal Folder Path')
    .setDesc('The location of your Journal')
    .addSearch((search) => {
      new FolderSuggest(this.plugin.app, search.inputEl)
      search.setPlaceholder("Example: folder1/folder2")
        .setValue(this.journalSettings.dirPath)
        .onChange((folderName) => {
          this.journalSettings.dirPath = folderName
          this.setJournalSettings()
        })
    })

    // Journal Template Settings
    new Setting(this.collapsibleEl)
    .setName('Journal Template Path')
    .setDesc('The location of your Journal Template')
    .addSearch((search) => {
      new FileSuggest(this.plugin.app, search.inputEl)
      search.setPlaceholder("Example: folder1/filename.md")
        .setValue(this.journalSettings.journalTemplatePath)
        .onChange((fileName) => {
          this.journalSettings.journalTemplatePath = fileName
          this.setJournalSettings()
        })
    })
    
    new Setting(this.collapsibleEl)
    .setName('Home Note Id')
    .setDesc(`Chose an id to help the plugin locate where you want your Journal Link`)
    .addText((text) => {
      text.setPlaceholder("Journal-Link")
      if (this.journalSettings.homeNoteId != null) {
        text.setValue(this.journalSettings.homeNoteId)
      }
      text.onChange((value) => {
        this.journalSettings.homeNoteId = value
        this.setJournalSettings()
      })

    })
     

    // TODO: Add some use to this man...
    // new Setting(this.collapsibleEl)
    // .setName('Entry Template Path')
    // .setDesc('The location of your Journal Entry Template')
    // .addSearch((search) => {
    //   new FileSuggest(this.plugin.app, search.inputEl)
    //   search.setPlaceholder("Example: folder1/filename.md")
    //     .setValue(this.journalSettings.entryTemplatePath)
    //     .onChange((fileName) => {
    //       this.journalSettings.entryTemplatePath = fileName
    //       this.setJournalSettings()
    //     })
    // })

    // // Journal Reminder Settings
    // const reminderSettingConfig: ReminderSettingConfig = {
    //   container: this.collapsibleEl,
    //   settingName: "Journal",
    //   getSetting: () => this.journalSettings.reminderOn,
    //   setSetting: (val: boolean) => {
    //     this.journalSettings.reminderOn = val
    //     this.setJournalSettings()
    //   },
    //   getToggled: () => this.journalSettings.reminderTime,
    //   setToggled: (val: string) => {
    //     this.journalSettings.reminderTime = val
    //     this.setJournalSettings()
    //   }
    // }
    // new ReminderSetting(reminderSettingConfig, this.settingsMngr)


    // Journal Subfolder Settings
    let monthlyConfig: TimelySubDirSettingConfig = {
      container: this.collapsibleEl,
      settingName: 'Monthly',
      getSetting: () => { return this.journalSettings.monthly.subDirOn },
      setSetting: (val: boolean) => {
        this.journalSettings.monthly.subDirOn = val
        this.setJournalSettings()
      },
      getTextFunc: (val: string, isDefault?: boolean) => {
        if (val === "value") {
          return isDefault ? DEFAULT_JOURNAL_SETTINGS.monthly.subDirFormat : this.journalSettings.monthly.subDirFormat
        } else {
          return isDefault ? DEFAULT_JOURNAL_SETTINGS.monthly.subDirFormat : this.journalSettings.monthly.subDirFormat
        }
      },
      setTextFunc: (val: string) => {
        this.journalSettings.monthly.subDirFormat = val
        this.setJournalSettings()
      },
    }
    new TimelySubDirSetting(monthlyConfig, this.settingsMngr)

    let yearlyConfig: TimelySubDirSettingConfig = {
      container: this.collapsibleEl,
      settingName: 'Yearly',
      getSetting: () => { return this.journalSettings.yearly.subDirOn },
      setSetting: (val: boolean) => {
        this.journalSettings.yearly.subDirOn = val
        this.setJournalSettings()
      },
      getTextFunc: (val: string, isDefault?: boolean) => {
        if (val === "value") {
          return isDefault ? DEFAULT_JOURNAL_SETTINGS.yearly.subDirFormat : this.journalSettings.yearly.subDirFormat
        } else {
          return isDefault ? DEFAULT_JOURNAL_SETTINGS.yearly.subDirFormat : this.journalSettings.yearly.subDirFormat
        }
      },
      setTextFunc: (val: string) => {
        this.journalSettings.yearly.subDirFormat = val
        this.setJournalSettings()
      },
    }
    new TimelySubDirSetting(yearlyConfig, this.settingsMngr)


  }

  retrieveSettings(): void {
    this.journalSettings = this.settingsMngr.getJournalSettings()
  }
  async setJournalSettings() {
    await this.settingsMngr.setJournalSettings(this.journalSettings)
  }

  getAutoCreateOn(): boolean{
    return this.journalSettings.autoCreateOn
  }
  async setAutoCreateOn(value: boolean) {
    this.journalSettings.autoCreateOn = value
    await this.settingsMngr.setJournalSettings(this.journalSettings)
  }

  getSettingsShowing(): boolean {
    return this.getJournalSettingsShowing()
  }
  async setSettingsShowing(value: boolean) {
    await this.setJournalSettingsShowing(value)
  }

  getJournalSettingsShowing(): boolean {
    return this.journalSettings.showing
  }
  async setJournalSettingsShowing(value: boolean) {
    this.journalSettings.showing = value
    await this.settingsMngr.setJournalSettings(this.journalSettings)
  }


  async initialize() {
    this.plugin.debugger.log("Initializing JournalSettingsHandler")
    this.retrieveSettings()
  }
  async cleanup() {
    this.plugin.debugger.log("Not yet implemented JournalSettingsHandler.cleanup()")
  }
}



