import { TJournalInfo } from "src/dataManagement/dataTypes"
import { IInfoHandler, InfoMngr } from "src/dataManagement/info"
import JournallingPlugin from "src/main"
import { IServiceMngr, ServicesManager } from "src/services/servicesMngr"
import { JournalService } from "src/services/journalling/journal"
import { DateTime } from "luxon"
import { firstSunday } from "src/utils/independentUtils"

export class JournalInfoHandler implements IInfoHandler{
  serviceName: string
  plugin: JournallingPlugin
  serviceMngr: JournalService
  servicesManager: ServicesManager
  infoMngr: InfoMngr

  constructor(serviceMngr: IServiceMngr){
    this.plugin = serviceMngr.plugin
    this.serviceName = serviceMngr.name
    this.serviceMngr = serviceMngr as JournalService
    this.servicesManager = serviceMngr.servicesMngr
    this.infoMngr = serviceMngr.servicesMngr.infoMngr
  }

  private journalInfo: TJournalInfo = {
    count: 0,
    latestJournalDate: null
  }

  retrieveInfo(): void {
    this.journalInfo = this.infoMngr.getJournalInfo()
  }
  async updateJournals(): Promise<void> {
    await this.infoMngr.setJournalInfo(this.journalInfo)
  }

  async incrementCount(): Promise<void> {
    this.journalInfo.count++
  }
  async decrementCount(): Promise<void> {
    this.journalInfo.count--
  }

  getLatestJournalDate(): DateTime | null {
    return this.journalInfo.latestJournalDate
  }
  async setLatestJournalDate(date: DateTime | null): Promise<void> {
    this.journalInfo.latestJournalDate = date
    await this.updateJournals()
  }
  // Returns true only if sunday is a new one, so it will update the date last checked regardless but 
  // return true ONLY if the first sunday of that week is not a new one
  async updateLatestJournalDate(date: DateTime): Promise<boolean> {
    if (!this.journalInfo.latestJournalDate || date > this.journalInfo.latestJournalDate) {
      this.journalInfo.latestJournalDate = date
      await this.updateJournals()
      if (firstSunday(date) > firstSunday(this.journalInfo.latestJournalDate)){
        return true
      }
    }
    return false
  }

  async initialize(): Promise<void> {
    this.plugin.debugger.log("Initializing JournalInfoHandler")
    this.retrieveInfo()
  }
  async cleanup(): Promise<void> {
    this.plugin.debugger.log("Not yet implemented JournalInfoHandler.cleanup()")
  }
}

// Updates the latest journal date if the provided date is more recent
export function updateLatestJournalDate( 
  journalService: JournalService, 
  date: DateTime, 
  callback?: () => void
){
  journalService.infoHandler.updateLatestJournalDate(date)
  .then((boolVal) => {
    if (boolVal && callback){
      callback()
    }
  })
}