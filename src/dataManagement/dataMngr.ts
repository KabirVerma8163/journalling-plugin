import { App, Notice, Plugin, PluginSettingTab, Setting, TextComponent, ToggleComponent } from 'obsidian'
// import moment from 'moment'
import JournallingPlugin from '../main'
import { DEFAULT_DATA, DEFAULT_INFO, DEFAULT_SETTINGS, TData, TSettings } from './dataTypes'
import { getObjVal, setObjVal } from '../utils/objectManipulation'
import { InfoMngr } from './info'

export class DataMngr {
  app : App 
  plugin : JournallingPlugin
  private pluginData : TData
  // infoMngr : InfoMngr

  constructor(plugin: JournallingPlugin) {
    this.app = plugin.app
    this.plugin = plugin

    // this.infoMngr = new InfoMngr(plugin)
  }

  async initialize() {
    this.pluginData = Object.assign({}, DEFAULT_DATA, await this.plugin.loadData())

    // // The infoMngr and settingMngr requires that there already exist a dataMngr object so they must be created // nvm
  }

  private async saveData() {
    await this.plugin.saveData(this.pluginData)
  }

  private async loadData() {
    this.pluginData = Object.assign({}, DEFAULT_DATA, await this.plugin.loadData())
  }

  async refreshPluginData(){
    if (this.plugin.isTesting) {
      this.loadData()
    }
  }

  async getSetting(settingAddr : string){
    return getObjVal(this.pluginData.settings, settingAddr)
  }

  async getSettings() {
    return this.getSetting("")
  }

  async setSetting(settingAddr : string, value : any) {
    setObjVal(this.pluginData.settings, settingAddr, value)
    await this.saveData()
  }

  async getInfo(infoAddr : string){
    return getObjVal(this.pluginData.info, infoAddr)
  }

  async setInfo(infoAddr : string, value : any) {
    setObjVal(this.pluginData.info, infoAddr, value)
    await this.saveData()
  }

}

// addTextInteractiveDesc(setting: Setting, descText: string, settingName: string, binding: string, 
//   callback: (value:string, defaultBinding: string) => string) {
//   let desc = setting.setDesc(descText).descEl
//   let id: string = `${settingName}-naming-desc`
//   let interactiveText = callback(getObjVal(this.pluginSettings, binding), binding)

//   desc.createDiv({text: "Current Format: "})
//   .createEl("b", { text: interactiveText,
//      cls: "u-pop"}).id = id
//   setting.addText((text) => {
//     text.setPlaceholder(getObjVal(DEFAULT_SETTINGS, binding))
//     .setValue(getObjVal(this.pluginSettings, binding))
//     .onChange(async(value) => {
//       setObjVal(this.pluginSettings, binding, value)
//       await this.saveSettings()
//       // @ts-ignore
//       document.getElementById(id).textContent = callback(value, binding)
//     })
//   })
// }

// createToggledSetting(container:HTMLElement, settingName: string, binding: string) : {toggle: Setting, toggled: Setting} {
//   let toggle: Setting = new Setting(container)
//   let toggled: Setting = new Setting(container)
//   let parent = toggled.controlEl.parentElement
//   let settingCSS: string
//   // @ts-ignore
//   let parentId = `${settingName.replaceAll(" ", "")}-parent`
//   if (parent) {parent.id = parentId}
//   settingCSS = getObjVal(this.pluginSettings, binding) ? "" : "none"
//   // @ts-ignore
//   document.getElementById(parentId).style.display = settingCSS

//   toggle.addToggle((toggle) => {
//     toggle.setValue(getObjVal(this.pluginSettings, binding)) 
//     toggle.onChange((val) => {
//         setObjVal(this.pluginSettings, binding, val)
//         this.saveSettings()
//         settingCSS = val ? "" : "none"
//         // @ts-ignore
//         document.getElementById(parentId).style.display = settingCSS
//       })
//   })
//   return {toggle: toggle, toggled: toggled}
// }

// createTimeInputSetting(containerEl:HTMLElement, settingName: string, bindingToggle: string, bindingTime: string ){
//   let timedInputSettings = this.createToggledSetting(containerEl, settingName, bindingToggle)

//   let timeInputOpt  = timedInputSettings.toggle
//   let timeInput  = timedInputSettings.toggled
  
//   timeInputOpt.setName(`Enable ${settingName} Reminder`)

//   timeInput.setName(`${settingName} Reminder Time`)
//   timeInput.setDesc("Please enter the time in Iternational Standard Time.")
//   timeInput.addText((text) => {
//     text.setValue(getObjVal(this.pluginSettings, bindingTime))
//       .setPlaceholder("2300")
//       .onChange((value) => {
//         setObjVal(this.pluginSettings, bindingTime, value)
//         let canClick = true
//         // @ts-ignore
//         const handleClickOutside = (event) => {
//           if (!canClick) {
//             return
//           }
//           if (!text.inputEl.contains(event.target)) { this.checkIntlTimeFormat(getObjVal(this.pluginSettings, bindingTime), bindingTime) }
//           canClick = false
//           setTimeout(() => {canClick = true}, 100)}
//         containerEl.addEventListener('click', handleClickOutside)
//       })

//     text.inputEl.addEventListener('keydown', (event) => {
//       if (event.key === 'Enter') this.checkIntlTimeFormat(getObjVal(this.pluginSettings, bindingTime), bindingTime)
//     })
//   })
// }

// // International time fomrat checker
// checkIntlTimeFormat(value: string, binding: string) {
//   const pattern = /^([01]?[0-9]|2[0-3])[0-5][0-9]$/
//   // console.log(value)
//   if (value == "" || pattern.test(value)) {
//     value = value.padStart(4, '0')
//     setObjVal(this.pluginSettings, binding, value)
//     this.saveSettings() 
//   } else {
//     setObjVal(this.pluginSettings, binding, "")
//     this.utilsHandler.createErrorNotice('The time format is incorrect. Please use 24-hour format (HHMM).')
//   }
// }