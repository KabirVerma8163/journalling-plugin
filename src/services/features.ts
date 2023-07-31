import JournallingPlugin from "src/main"
import { IServiceMngr } from "./servicesMngr"

export interface IFeatureHandler {
  name: string
  description: string
  serviceMngr: IServiceMngr
  plugin: JournallingPlugin

  initialize(): Promise<void>
  cleanup(): Promise<void>
  // settingsMngr: ISettingsMngr  
  // infoMngr: IInfoMngr
}