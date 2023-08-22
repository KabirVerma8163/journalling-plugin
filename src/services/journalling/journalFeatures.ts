import { Command, TFile } from "obsidian"
import JournallingPlugin from "src/main"
import { IFeatureHandler } from "src/services/features"
import { IServiceMngr } from "src/services/servicesMngr"
import { JournalService } from "src/services/journalling/journal"
import { JournalInfoHandler } from "src/services/journalling/journalInfo"
import { JournalSettingsHandler } from "src/services/journalling/journalSettings"
import { firstSunday, formatDate, setReminderTime } from "src/utils/independentUtils"
import { DEFAULT_PERIODIC_SETTINGS } from "src/dataManagement/dataTypes"
import moment from "moment"
import { PeriodicService } from "../periodic/periodic"
import { PeriodicFeaturesHandler } from "../periodic/periodicFeatures"
import { nanoid } from "nanoid"
import { PluginReminder, ReminderType } from "../functional/reminder/reminderInfo"
import { NotificationLocation } from "../functional/notification/notificationInfo"

export class JournalFeatureHandler implements IFeatureHandler {
  name: string
  description: string
  plugin: JournallingPlugin
  serviceMngr: JournalService
  infoHandler: JournalInfoHandler
  settingsHandler: JournalSettingsHandler
  commands: Command[]

  constructor(serviceMngr: IServiceMngr) {
    this.name = serviceMngr.name
    this.description = serviceMngr.description
    this.plugin = serviceMngr.plugin
    this.serviceMngr = serviceMngr as JournalService
    this.settingsHandler = serviceMngr.settingsHandler as JournalSettingsHandler
    this.commands = []
  }

  async createJournalNote(date?: Date, fromCommand: boolean = false) {
    // Get the path to the folder
    let journalSettings = this.settingsHandler.journalSettings
    let vault = this.plugin.app.vault
    let vaultManipulationService = this.serviceMngr.servicesMngr.vaultManipulationService


    if (date == undefined) {
      date = new Date()
    }
    date = firstSunday(date)

    let basicPath = this.getJournalFolderPath(date)

    let templateString = ""
    let templateFile = vault.getAbstractFileByPath(journalSettings.journalTemplatePath)
    if (templateFile != null && templateFile instanceof TFile) {
      await vault.read(templateFile).then((content) => {
        templateString = content
      })
    }
    // TODO add a feature for entry customization later.
    // templateFile = vault.getAbstractFileByPath(journalSettings.entryTemplatePath)
    // let entriesTemplateString = ""
    // if (templateFile != null && templateFile instanceof TFile) {

    // }

    let dailyNamingFormat = ""
    this.serviceMngr.servicesMngr.serviceMngrs.forEach(service => {
      if (service.name === "Periodic") {
        let serviceFeatureHandler = service.featureHandler as PeriodicFeaturesHandler
        dailyNamingFormat = this.serviceMngr.servicesMngr.settingsMngr.getPeriodicSettings().daily.namingFormat
        if (dailyNamingFormat === "") {
          dailyNamingFormat = DEFAULT_PERIODIC_SETTINGS.daily.namingFormat
        }

        let journalContent = ""
        let futureDate: Date
        let futureDates: Date[] = []

        if (!date) return
        let previousDate = new Date(date)
        previousDate.setDate(date.getDate() - 7)
        let nextDate = new Date(date)
        nextDate.setDate(date.getDate() + 7)

        let previousJournalName = formatDate(journalSettings.namingFormat, previousDate)
        let nextJournalName = formatDate(journalSettings.namingFormat, nextDate)

        let links = `#### [[${previousJournalName}|<--Last Week's Journal]] ++ [[${nextJournalName}|Next Week's Journal-->]]\n`
        journalContent += links 
        journalContent = journalContent + templateString + "\n"

        for (let i = 0; i < 7; i++) {
          let startOfWeek = moment(date).startOf('week')
          let futureMomentDate = startOfWeek.add(i, 'days')
          futureDate = futureMomentDate.toDate()
          let formattedFutureDate = formatDate(dailyNamingFormat, futureMomentDate.toDate())

          journalContent += `## [[${formattedFutureDate}]]\n  > Your entry\n\n`
          futureDates.push(futureDate)
        }
        journalContent += links

        let folderPath = basicPath
        let filePath = basicPath + `/${formatDate(journalSettings.namingFormat)}.md`
        let fileName = `/${formatDate(journalSettings.namingFormat, date)}.md`

        vaultManipulationService.featureHandler.createNewMarkdownFile(folderPath, fileName, journalContent)
          .then((file) => {
            if (file === "SuccessfulNewCreation" || file === "SuccessfulReplacement") {
              this.infoHandler.incrementCount()
              if (journalSettings.reminderOn) {
                if (fromCommand) {
                  futureDate = setReminderTime(journalSettings.reminderTime, futureDate)
                }
                let id = nanoid()
                let reminder: PluginReminder = {
                  id: `Journal-Note_${id}`,
                  name: `Journalling: ${formatDate(journalSettings.namingFormat)}`,
                  description: "A reminder to work on your daily note",
                  type: ReminderType.Daily,
                  dateActiveOn: futureDate.toISOString(),
                  taskLengthMilliSec: 3000,
                  deleteOnDone: true,
                  snoozeCount: 0,
                  deleteOnShow: true
                }

                let reminderService = this.serviceMngr.servicesMngr.reminderService
                if (reminderService != undefined) {
                  reminderService.featureHandler.addAndActivateNewReminder(reminder, {
                    location: NotificationLocation.Both,
                    // TODO make it on click
                    runOnShow() {
                      vaultManipulationService.featureHandler.openFile(filePath)
                    },
                    externalOnClick: (ev) => {
                      this.plugin.debugger.log("External on click")
                      vaultManipulationService.featureHandler.openFile(filePath)
                    }
                  })
                }
              }
              futureDates.forEach(futureDate => {
                serviceFeatureHandler.createDailyNote(futureDate)
              })
            }
          })
      }
    })
  }

  // async getCreationDates(){
  //   let journalSettings = this.settingsHandler.journalSettings
  //   let startDate = new Date()
  //   let endDate = new Date()

  //   getDateInput(this.plugin.app).then((dates) => {
  //     console.log(dates)
  //   })

  //   return {startDate, endDate}
  // }

  async createOlderJournalNotes(startDate: Date, endDate: Date) {
    // Create a journal note for each week in between

    // The loop that goes through all the dates
    let currentDate = startDate
    while (currentDate <= endDate) {
      this.createJournalNote(currentDate)
      currentDate.setDate(currentDate.getDate() + 7)
    }
    this.createJournalNote(endDate)

  }

  async initialize() {
    this.plugin.debugger.log("Initializing JournalFeatureHandler")
    this.infoHandler = this.serviceMngr.infoHandler as JournalInfoHandler

    // TODO Activate this later
    // this.handleAutoCreateJournalNote()

    this.plugin.addRibbonIcon(
      "calendar-minus",
      "Add older notes from 2021",
      () => {
        this.createOlderJournalNotes(new Date(2021, 1, 1), new Date())
      })

    this.plugin.addCommand({
      id: "create-journal-note",
      name: "Create Journal Note",
      hotkeys: [
        {
          modifiers: ["Ctrl"],
          key: "j",
        },
      ],
      callback: () => {
        this.createJournalNote(undefined, true)
      }
    })
  }

  async handleAutoCreateJournalNote() {
    if (!this.settingsHandler.journalSettings.autoCreateOn) return
    this.serviceMngr.servicesMngr.serviceMngrs.forEach(service => {
      if (service.name === "Notifications") {
        // Check if this week's journal note has been created
        let journalSettings = this.settingsHandler.journalSettings
        let vault = this.plugin.app.vault
        let folderPath = this.getJournalFolderPath()
        let fileName = `/${formatDate(journalSettings.namingFormat)}.md`
        let filePath = folderPath + fileName
        vault.adapter.exists(filePath).then((exists) => {
          if (!exists) {
            this.createJournalNote()
          }
        })
      }
    })
  }

  getJournalFolderPath(date?: Date): string {
    if (date == undefined) {
      date = new Date()
    }
    let journalSettings = this.settingsHandler.journalSettings

    let path = "/" === journalSettings.dirPath ? "" : "" + journalSettings.dirPath
    if (path === "") path = "/"
    if (journalSettings.yearly.subDirOn) {
      path += "/" + formatDate(journalSettings.yearly.subDirFormat, date)
    }
    if (journalSettings.monthly.subDirOn) {
      path += "/" + formatDate(journalSettings.monthly.subDirFormat, date)
    }

    return path
  }

  async cleanup() {
    this.plugin.debugger.log("Not yet implemented JournalFeatureHandler.cleanup()")
  }
}