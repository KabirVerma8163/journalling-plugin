import { IInfoHandler } from "src/dataManagement/info";
import { IServiceMngr } from "../servicesMngr"
import JournallingPlugin from "src/main";
import { ReminderInfoHandler } from "./reminderInfo";

export class ReminderService implements IServiceMngr {
  name = "Reminders"
  description = "This is the reminders feature"
  infoMngr: IInfoHandler
  plugin: JournallingPlugin

  constructor(plugin: JournallingPlugin){
    this.plugin = plugin
    this.infoMngr = new ReminderInfoHandler(plugin, this)
  }

  initialize(): void { 
    throw new Error("Method not implemented.")
  }

}