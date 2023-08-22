import JournallingPlugin from "src/main"
import { IServiceMngr } from "src/services/servicesMngr"
import { IInfoHandler } from "src/dataManagement/info"
import { Command } from "obsidian"
import { ISettingsHandler } from "src/dataManagement/settings"

export interface IFeatureHandler {
  name: string
  description: string
  serviceMngr: IServiceMngr
  infoHandler: IInfoHandler
  settingsHandler: ISettingsHandler
  plugin: JournallingPlugin

  commands : Command[]

  initialize(): Promise<void>
  cleanup(): Promise<void>
  // settingsMngr: ISettingsMngr  
}