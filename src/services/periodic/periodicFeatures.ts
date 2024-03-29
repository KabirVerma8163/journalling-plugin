import { Command, TFile } from "obsidian"
import JournallingPlugin from "src/main"
import { IFeatureHandler } from "src/services/features"
import { IServiceMngr } from "src/services/servicesMngr"
import { PeriodicService } from "src/services/periodic/periodic"
import { PeriodicInfoHandler } from "src/services/periodic/periodicInfo"
import { PeriodicSettingsHandler } from "src/services/periodic/periodicSettings"
import moment from "moment"
import { PluginReminder, ReminderType } from "src/services/functional/reminder/reminderInfo"
import { NotificationLocation } from "src/services/functional/notification/notificationInfo"
import { nanoid } from 'nanoid'
import { firstSunday, formatDate, setReminderTime } from "src/utils/independentUtils"
import { Server } from "http"
import { JournalService } from "../journalling/journal"
import { link } from "fs"

export class PeriodicFeaturesHandler implements IFeatureHandler {
  name: string
  description: string
  serviceMngr: PeriodicService
  infoHandler: PeriodicInfoHandler
  settingsHandler: PeriodicSettingsHandler
  plugin: JournallingPlugin
  commands: Command[]

  constructor(serviceMngr: IServiceMngr) {
    this.name = serviceMngr.name
    this.description = serviceMngr.description
    this.serviceMngr = serviceMngr
    this.infoHandler = serviceMngr.infoHandler as PeriodicInfoHandler
    this.settingsHandler = serviceMngr.settingsHandler as PeriodicSettingsHandler
    this.plugin = serviceMngr.plugin
    this.commands = []
  }

  async initialize() {
    this.plugin.debugger.log("Initializing PeriodicFeatures")
    // TODO: The autocreate thing

    // Here we add the command for creating a daily note
    this.commands.push(this.plugin.addCommand({
      id: "create-daily-note",
      name: "Create Daily Note",
      hotkeys: [
        {
          modifiers: ["Ctrl"],
          key: "t",
        },
      ],
      callback: () => {
        this.createDailyNote(undefined, true)
      }
    }))

  }

  async createDailyNote(date?: Date, fromCommand: boolean = false) {
    let dailySettings = this.settingsHandler.periodicSettings.daily
    let vault = this.plugin.app.vault
    if (date == undefined) {
      date = new Date()
    }

    moment.updateLocale('en', {
      week: {
        dow: 0, // Sunday is the first day of the week
      }
    })

    // if the dailySettings.diryPath is "/" then don't add the extra "/"
    let basicPath = "/" === dailySettings.dirPath ? "" : "" + dailySettings.dirPath
    if (basicPath === "") basicPath = "/"
    if (dailySettings.yearly.subDirOn) { // Add the yearly subdirectory here
      basicPath += "/" + formatDate(dailySettings.yearly.subDirFormat, date)
    } 
    if (dailySettings.monthly.subDirOn) { // Add the monthly subdirectory here
      basicPath += "/" + formatDate(dailySettings.monthly.subDirFormat, date)
    }
    if (dailySettings.weekly.subDirOn) { // Add the weekly subdirectory here
      basicPath += "/" + formatDate(dailySettings.weekly.subDirFormat, date)
    }


    let noteDate = date
    let folderPath = basicPath
    let filePath = basicPath + `/${formatDate(dailySettings.namingFormat, date)}.md`
    let vaultManipulationService = this.serviceMngr.servicesMngr.vaultManipulationService

    let templateFile = vault.getAbstractFileByPath(dailySettings.templatePath)
    let dailyNoteContent = ""

    let yesterDate = new Date(date)
    yesterDate.setDate(yesterDate.getDate() - 1)
    let yesterFileName = formatDate(dailySettings.namingFormat, yesterDate)
    let tomorrowDate = new Date(date)
    tomorrowDate.setDate(tomorrowDate.getDate() + 1)
    let tomorrowFileName = formatDate(dailySettings.namingFormat, tomorrowDate)

    let links = `#### [[${yesterFileName}|<--Yesterday's Note]] ++ [[${tomorrowFileName}|Tomorrow's Note-->]]\n`

    if (templateFile instanceof TFile) {
      await vault.read(templateFile).then(content => {
        const regex = /^---\n([\s\S]*?)\n---\n/;
        let frontmatter = content.match(regex)
        if (frontmatter != null) {
          dailyNoteContent = frontmatter[0]
          content = content.replace(regex, "")
        }
        dailyNoteContent += links
        dailyNoteContent += content

        // Replaces the {{journal_link}} in the template
        if (dailyNoteContent.includes('{{journal_link}}')) {
          this.serviceMngr.servicesMngr.serviceMngrs.forEach(service => {
            if (service.name === "Journal") {
              let journalNamingFormat = this.serviceMngr.servicesMngr.settingsMngr.getJournalSettings().namingFormat
              let journalName = formatDate(journalNamingFormat, firstSunday(noteDate))
              let weeklyJournalPath = `[[${journalName}|Today's Journal]]`
              // @ts-ignore
              dailyNoteContent = dailyNoteContent.replaceAll("{{journal_link}}", weeklyJournalPath)
            }
          })
        }
      })
    }

    dailyNoteContent += links

    vaultManipulationService.featureHandler.createNewMarkdownFile(folderPath, formatDate(dailySettings.namingFormat, date), dailyNoteContent)
      .then(() => {
        this.infoHandler.incrementDailyCount()
        if (dailySettings.reminderOn) {
          if (fromCommand){
            noteDate = setReminderTime(dailySettings.reminderTime, noteDate)
          }
          let id = nanoid()
          let reminder: PluginReminder = {
            id: `Daily-Note_${id}`,
            name: `Daily Note: ${formatDate(dailySettings.namingFormat)}`,
            description: "A reminder to work on your daily note",
            type: ReminderType.Daily,
            dateActiveOn: noteDate.toISOString(),
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
      })
  }

  async cleanup() {
    this.plugin.debugger.log("Not yet implemented PeriodicFeatures.cleanup()")
  }
}

