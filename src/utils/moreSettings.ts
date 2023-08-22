import { Setting } from "obsidian"
import { config } from "process"
import { SettingsMngr } from "src/dataManagement/settings"

interface IExtendedSetting {
  settingsMngr: SettingsMngr
  settingName: string
  // Add any other common properties here
}

export type InteractiveTextSettingConfig = {
  setting: Setting
  settingName: string
  descText?: string // Optional since it has a default value
  getText: (val: string, isDefault?: boolean) => string
  setText: (val: string) => void
}

export class InteractiveTextSetting implements IExtendedSetting {
  settingsMngr: SettingsMngr
  setting: Setting
  settingName: string
  descText: string
  getText: (val: string, isDefault?: boolean) => string
  setText: (val: string) => void

  constructor(settingsMngr: SettingsMngr, config: InteractiveTextSettingConfig) {
    this.settingsMngr = settingsMngr
    this.setting = config.setting
    this.settingName = config.settingName
    this.descText = config.descText || ""
    this.getText = config.getText
    this.setText = config.setText
    this.addTextInteractiveDesc()
  }

  private addTextInteractiveDesc() {
    let id = `${this.settingName}-naming-desc`
    let interactiveText = this.getText("value")
    let desc = this.setting.setDesc(this.descText).descEl

    this.createInteractiveSpan(desc, interactiveText, id)

    this.setting.addText(text => {
      text.setPlaceholder(this.getText("setting", true))
        .setValue(this.getText("setting"))
        .onChange(value => {
          this.handleTextChange(value, this.getText, this.setText, id)
        })
    })
  }

  private createInteractiveSpan(desc: HTMLElement, interactiveText: string, id: string) {
    desc.createSpan({ text: interactiveText, cls: "u-pop" }).id = `${id}-interactiveText`
  }

  private handleTextChange(value: string, getText: (val: string, isDefault?: boolean) => string, setText: (val: string) => void, id: string) {
    // console.log("value:", value)
    setText(value)
    // @ts-ignore
    document.getElementById(`${id}-interactiveText`).textContent = getText("value")
  }
}

export interface ToggledSettingConfig {
  container: HTMLElement
  settingName: string
  getSetting: () => boolean
  setSetting: (val: boolean) => void
}

export class ToggledSetting implements IExtendedSetting {
  toggle: Setting
  toggled: Setting
  settingsMngr: SettingsMngr
  settingName: string

  constructor(config: ToggledSettingConfig, settingsMngr: SettingsMngr) {
    this.toggle = new Setting(config.container)
    this.toggled = new Setting(config.container)
    this.initializeToggledSetting(config)
    this.settingName = config.settingName
    this.settingsMngr = settingsMngr
  }

  private initializeToggledSetting(config: ToggledSettingConfig) {
    let parent = this.toggled.controlEl.parentElement
    let settingCSS: string
    // @ts-ignore
    let parentId = `${config.settingName.toLowerCase().replaceAll(" ", "-")}-parent`
    if (parent) {
      parent.id = parentId
    }
    settingCSS = config.getSetting() ? "" : "none"
    // @ts-ignore
    parent.style.display = settingCSS

    this.toggle.addToggle(toggle => {
      toggle.setValue(config.getSetting())
      toggle.onChange(val => {
        config.setSetting(val)
        settingCSS = val ? "" : "none"
        // @ts-ignore
        parent.style.display = settingCSS
      })
    })
  }
}

export interface ReminderSettingConfig extends ToggledSettingConfig {
  getToggled: () => string
  setToggled: (val: string) => void
}

export class ReminderSetting extends ToggledSetting {
  constructor(config: ReminderSettingConfig, settingsMngr: SettingsMngr) {
    super(config, settingsMngr)
    this.initializeReminderSetting(config)
  }

  private initializeReminderSetting(config: ReminderSettingConfig) {
    let timeInputOpt = this.toggle
    let timeInput = this.toggled

    timeInputOpt.setName(`Enable ${config.settingName} Reminder`)

    timeInput.setName(`${config.settingName} Reminder Time`)
    timeInput.setDesc("Please enter the time in International Standard Time.")
    timeInput.addText(text => {
      text.setValue(config.getToggled())
        .setPlaceholder("2300")
        .onChange(value => {
          this.handleInputChange(config, text, value)
        })

      text.inputEl.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          this.settingsMngr.checkIntlTimeFormat(config.getToggled(), (value: string) => {
            config.setToggled(value)
          }, () => { })
        }
      })
    })
  }

  private handleInputChange(config: ReminderSettingConfig, text: any, value: string) {
    config.setToggled(value)
    let canClick = true
    // @ts-ignore
    const handleClickOutside = event => {
      if (!canClick) return
      if (!text.inputEl.contains(event.target)) {
        this.settingsMngr.checkIntlTimeFormat(config.getToggled(), (value: string) => {
          config.setToggled(value)
        }, () => { })
      }
      canClick = false
      setTimeout(() => { canClick = true }, 100)
    }
    config.container.addEventListener('click', handleClickOutside)
  }
}

export interface TimelySubDirSettingConfig {
  container: HTMLElement
  settingName: string
  getSetting: () => boolean
  setSetting: (val: boolean) => void
  getTextFunc: (val: string, isDefault?: boolean) => string
  setTextFunc: (val: string) => void
}

export class TimelySubDirSetting implements IExtendedSetting {
  subDir: ToggledSetting
  subDirOn: Setting
  subDirNaming: Setting
  interactiveTextSetting: InteractiveTextSetting
  settingsMngr: SettingsMngr
  settingName: string

  constructor(config: TimelySubDirSettingConfig, settingsMngr: SettingsMngr) {
    const subDirSettingConfig = {
      container: config.container,
      settingName: `Add ${config.settingName} Subfolder`,
      getSetting: config.getSetting,
      setSetting: config.setSetting,
    }

    let toggledSettings = new ToggledSetting(subDirSettingConfig, settingsMngr)
    this.subDirOn = toggledSettings.toggle
    this.subDirOn.setName(`Add ${config.settingName} Subfolder`)

    this.subDirNaming = toggledSettings.toggled
    this.subDirNaming.setName(`${config.settingName} Subfolder Naming`)

    const interactiveTextConfig: InteractiveTextSettingConfig = {
      setting: this.subDirNaming,
      settingName: `${config.settingName.toLowerCase()}SubDirName`,
      descText: `Format: `,
      getText: config.getTextFunc,
      setText: config.setTextFunc
    }

    this.interactiveTextSetting = new InteractiveTextSetting(settingsMngr, interactiveTextConfig)
  }
}

