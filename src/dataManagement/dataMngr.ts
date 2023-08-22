import { App } from 'obsidian'
import JournallingPlugin from 'src/main'
import { DEFAULT_DATA, TData } from 'src/dataManagement/dataTypes'
import { getObjVal, setObjVal } from 'src/utils/independentUtils'

export class DataMngr {
  app : App 
  plugin : JournallingPlugin
  private pluginData : TData

  constructor(plugin: JournallingPlugin) {
    plugin.debugger.log("Constructing DataMngr")

    this.app = plugin.app
    this.plugin = plugin
  }

  async initialize() {
    this.plugin.debugger.log("Initializing DataMngr")

    this.pluginData = Object.assign({}, DEFAULT_DATA, await this.plugin.loadData())
    this.saveData()
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

  getAllSettings(settingAddr : string){
    return getObjVal(this.pluginData.settings, settingAddr)
  }

  getSettings() {
    return this.getAllSettings("")
  }

  async setSetting(settingAddr : string, value : any) {
    setObjVal(this.pluginData.settings, settingAddr, value)
    await this.saveData()
  }

  getInfo(infoAddr : string){
    return getObjVal(this.pluginData.info, infoAddr)
  }

  async setInfo(infoAddr : string, value : any) {
    setObjVal(this.pluginData.info, infoAddr, value)
    await this.saveData()
  }

}