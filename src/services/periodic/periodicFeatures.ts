import { Command, getFrontMatterInfo, TFile } from "obsidian"
import JournallingPlugin from "src/main"
import { IFeatureHandler } from "src/services/features"
import { IServiceMngr } from "src/services/servicesMngr"
import { PeriodicService } from "src/services/periodic/periodic"
import { PeriodicInfoHandler } from "src/services/periodic/periodicInfo"
import { PeriodicSettingsHandler } from "src/services/periodic/periodicSettings"
import { firstSunday, formatDate, setReminderTime } from "src/utils/independentUtils"
import { DateTime } from "luxon"
import { JournalService } from "../journalling/journal"
import { NewFileCreationStatus } from "../functional/vaultManipulation/vaultManipulationFeatures"

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

  async createDailyNote(date: DateTime = DateTime.now(), fromCommand: boolean = false) {
    let dailySettings = this.settingsHandler.periodicSettings.daily
    let vaultManipulationService = this.serviceMngr.servicesMngr.vaultManipulationService
    let notificationService = this.serviceMngr.servicesMngr.notificationService

    const folderPath = this.getDailyNotePath(date)
    const dailyNoteContent = await this.makeDailyNoteContent(date)
    if (dailyNoteContent == null) { return }

    vaultManipulationService.featureHandler.createNewMarkdownFile(
      folderPath, 
      formatDate(dailySettings.namingFormat, date.toJSDate()),
      dailyNoteContent
    )
    .then(({file, status}) => {
      if (status == NewFileCreationStatus.SuccessfulNewCreation 
        || status == NewFileCreationStatus.SuccessfulReplacement
        || status == NewFileCreationStatus.FileAlreadyExists
      ) {
        if (status == NewFileCreationStatus.FileAlreadyExists) {
          notificationService.featureHandler.createWarningNotice( `File: ${file?.name} already exists!` )
        }
        else{
            this.infoHandler.incrementDailyCount()
          }
        if (fromCommand && file){
          vaultManipulationService.featureHandler.openFile(file.path)
        }
      } else {
        notificationService.featureHandler.createErrorNotice(
          `Something went wrong: ${status}!`
        )
      }
    })
  }

  private getDailyNotePath(date?: DateTime): string{
    if (date === undefined) {
      date = DateTime.now()  // Using Luxon for the current date
    }
    let dailySettings = this.settingsHandler.periodicSettings.daily

    // if the dailySettings.diryPath is "/" then don't add the extra "/"
    let basicPath = "/" === dailySettings.dirPath ? "" : "" + dailySettings.dirPath
    if (basicPath === "") basicPath = "/"
    if (dailySettings.yearly.subDirOn) { // Add the yearly subdirectory here
      basicPath += "/" + formatDate(dailySettings.yearly.subDirFormat, date.toJSDate())
    } 
    if (dailySettings.monthly.subDirOn) { // Add the monthly subdirectory here
      basicPath += "/" + formatDate(dailySettings.monthly.subDirFormat, date.toJSDate())
    }
    if (dailySettings.weekly.subDirOn) { // Add the weekly subdirectory here
      basicPath += "/" + formatDate(dailySettings.weekly.subDirFormat, date.toJSDate())
    }
    
    return basicPath
  }

  private async makeDailyNoteContent(date: DateTime): Promise<string | null>{
    let dailySettings = this.settingsHandler.periodicSettings.daily
    let vault = this.plugin.app.vault

    let yesterFileName = formatDate(dailySettings.namingFormat, date.minus({ days: 1 }).toJSDate())
    let tomorrowFileName = formatDate(dailySettings.namingFormat, date.plus({ days: 1 }).toJSDate())
    let links = `#### [[${yesterFileName}|<--Yesterday's Note]] ++ [[${tomorrowFileName}|Tomorrow's Note-->]]\n`

    let templateFile = vault.getAbstractFileByPath(dailySettings.templatePath)
    if (templateFile instanceof TFile) {
      let templateString = await vault.read(templateFile)
    
      let dailyNoteContent = ""
      // Extract front matter using getFrontMatterInfo
      const frontMatterInfo = getFrontMatterInfo(templateString)
      if (frontMatterInfo.exists) {
        dailyNoteContent = `---\n` + frontMatterInfo.frontmatter + `---\n`
        templateString = templateString.substring(frontMatterInfo.contentStart)
      }
      dailyNoteContent += links + templateString
    
      // Replace {{journal_link}} if it exists
      if (dailyNoteContent.includes("{{journal_link}}")) {
        const journalService = this.serviceMngr.servicesMngr.serviceMngrs.find( (service) => service.name === "Journal" )
    
        if (journalService instanceof JournalService) {
          const journalNamingFormat = this.serviceMngr.servicesMngr.settingsMngr.getJournalSettings().namingFormat
          const journalName = formatDate(journalNamingFormat, firstSunday(date).toJSDate())
          const weeklyJournalPath = `[[${journalName}|Today's Journal]]`
          dailyNoteContent = dailyNoteContent.replace(/{{journal_link}}/g, weeklyJournalPath)
        }
      }

      return dailyNoteContent + links
    } 

    return links
  }

  async cleanup() {
    this.plugin.debugger.log("Not yet implemented PeriodicFeatures.cleanup()")
  }
}

