import { IInfoHandler } from "src/dataManagement/info";
import JournallingPlugin from "src/main";
import { IServiceMngr } from "../servicesMngr";
import { ReminderType, ReminderStatus } from "./reminderSettings";

export class ReminderInfoHandler implements IInfoHandler{
  serviceName: string
  plugin: JournallingPlugin
  serviceMngr: IServiceMngr

  constructor(plugin: JournallingPlugin, serviceMngr: IServiceMngr){
    this.serviceName = serviceMngr.name
  }

  // functions
  initialize(): void {
    throw new Error("Method not implemented.")
  }
  cleanup(): void {
    throw new Error("Method not implemented.")
  }
}

export type PluignReminder = {
  name: string
  description: string
  type: ReminderType
  dateActiveOn: string
  taskLengthMilliSec: number // in seconds

  id: string
  dateCreated?: string
  status?: ReminderStatus
  dateCompleted?: string
  dateSnoozed?: string
  snoozeCount: number
  cronTime?: string  // Add a new field to store the cron time string 
}