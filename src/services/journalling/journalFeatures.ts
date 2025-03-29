import { Command, getFrontMatterInfo, Setting, TFile } from "obsidian"
import { DateTime } from "luxon"
import JournallingPlugin from "src/main"
import { IFeatureHandler } from "src/services/features"
import { IServiceMngr } from "src/services/servicesMngr"
import { JournalService } from "src/services/journalling/journal"
import { JournalInfoHandler } from "src/services/journalling/journalInfo"
import { JournalSettingsHandler } from "src/services/journalling/journalSettings"
import { firstSunday, formatDate} from "src/utils/independentUtils"
import { DEFAULT_PERIODIC_SETTINGS } from "src/dataManagement/dataTypes"
import { PeriodicFeaturesHandler } from "../periodic/periodicFeatures"
import { DateRangeModal } from "src/ui_elements/dateInput/dateInputModal"
import { NewFileCreationStatus } from "../functional/vaultManipulation/vaultManipulationFeatures"

export class JournalFeatureHandler implements IFeatureHandler {
  // #region Variable Declartion
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
  // #endregion

  async initialize() {
    this.plugin.debugger.log("Initializing JournalFeatureHandler")
    this.infoHandler = this.serviceMngr.infoHandler as JournalInfoHandler

    // TODO Activate this later
    // this.handleAutoCreateJournalNote()

    this.plugin.addRibbonIcon(
      "calendar-minus",
      "Add older journalling and linked notes",
      () => {
        this.runCreateOlderJournals()
      })

    this.plugin.addCommand({
      id: "create-journal-note",
      name: "Create Journal Note",
      hotkeys: [
        {
          modifiers: ["Mod"],
          key: "j",
        },
      ],
      callback: () => {
        this.createJournalNote(undefined, true)
      }
    })

    this.plugin.addCommand({
      id: "create-older-journal-note",
      name: "Create Older Journal Notes",
      hotkeys: [
        {
          modifiers: ["Ctrl"],
          key: "j",
        },
      ],
      callback: () => {
        this.runCreateOlderJournals()
      }
    })
  }

  async createJournalNote(
    date: DateTime = firstSunday(DateTime.now()), 
    fromCommand: boolean = false,
    createDailes: boolean = true
  ) { // Get the path to the folder
    let journalSettings = this.settingsHandler.journalSettings
    let vaultManipulationService = this.serviceMngr.servicesMngr.vaultManipulationService
    let notificationService = this.serviceMngr.servicesMngr.notificationService
    
    let futureDates: DateTime[] = []
    let journalContent = await this.makeJournalContent(date, futureDates)
    if (journalContent == null) return

    let folderPath = this.getJournalFolderPath(date)
    const sundayOfWeek = date.startOf('week').minus({ days: 1 })
    let fileName = `/${formatDate(journalSettings.namingFormat, sundayOfWeek.toJSDate())}.md`

    let serviceFeatureHandler: PeriodicFeaturesHandler
    this.serviceMngr.servicesMngr.serviceMngrs.forEach(service => {
      if (service.name === "Periodic") { serviceFeatureHandler = service.featureHandler as PeriodicFeaturesHandler }
    })

    vaultManipulationService.featureHandler.createNewMarkdownFile(folderPath, fileName, journalContent)
    .then(({file, status}) => {
      if (status == NewFileCreationStatus.SuccessfulNewCreation || status == NewFileCreationStatus.SuccessfulReplacement) {
        this.infoHandler.incrementCount()
        if (createDailes) {
          futureDates.forEach(futureDate => {
            serviceFeatureHandler.createDailyNote(futureDate)
          })
        }

        if (fromCommand && file){
          vaultManipulationService.featureHandler.openFile(file.path)
        }
        
        if (vaultManipulationService.settingsHandler.getEditHomeNote() === true){
          let dailyNamingFormat = this.serviceMngr.servicesMngr.settingsMngr.getPeriodicSettings().daily.namingFormat
          if (dailyNamingFormat === "") {
            dailyNamingFormat = DEFAULT_PERIODIC_SETTINGS.daily.namingFormat
          }

          this.updateHomeNoteWithJournalLink(
            date,
            formatDate(dailyNamingFormat, date.toJSDate())
          )
        }
      } else if (status == NewFileCreationStatus.FileAlreadyExists) {
        notificationService.featureHandler.createWarningNotice( `File: ${fileName} already exists!` )
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

  // TODO give an option to choose between creating corresponding daily notes for your mass journal making or not. 
  async createOlderJournalNotes(startDate: DateTime, endDate: DateTime, createDailes: boolean) {
    // Create a journal note for each week in between
    let currentDate = startDate
    while (currentDate <= endDate) { // The loop that goes through all the dates
      this.createJournalNote(currentDate, false, createDailes = createDailes)
      currentDate = currentDate.plus({ days: 7 })
    }
    this.createJournalNote(endDate, false, createDailes = createDailes)

  }

  private runCreateOlderJournals(){
    let createDailies: boolean = true
    new DateRangeModal(
      this.plugin.app,
      (startDate, endDate) => {
        if (startDate instanceof DateTime && endDate instanceof DateTime) {
          this.plugin.debugger.log(
            `'Date range selected:' ${startDate.toFormat('yyyy-MM-dd')} to ${endDate.toFormat('yyyy-MM-dd')} \nboolean: ${createDailies}`
          )
          this.createOlderJournalNotes(startDate, endDate, createDailies)
        }
      },
      (contentEl) => {
        // Create single input for date range display
        const rangeInputSetting = new Setting(contentEl)
          .setName('Create Dailies')
          .setDesc('Do you want to make dailies for each journal note created')
          .addToggle((toggle) => {
            toggle.setValue(createDailies)
            toggle.onChange(() => {
              createDailies = toggle.getValue()
            })
          })
        },
        {
          openPickerByDefault: true,
          modalHeaderText: "Choose Journal Creation Dates",
          descText: "Select dates for which journal notes should be created for"
        }
      ).open()
  }

  private getJournalFolderPath(date?: DateTime): string {
    if (date === undefined) {
      date = DateTime.now()  // Using Luxon for the current date
    }
    let journalSettings = this.settingsHandler.journalSettings
  
    let path = "/" === journalSettings.dirPath ? "" : "" + journalSettings.dirPath
    if (path === "") path = "/"
    
    if (journalSettings.yearly.subDirOn) {
      path += "/" + formatDate(journalSettings.yearly.subDirFormat, date.toJSDate())
    }
    if (journalSettings.monthly.subDirOn) {
      path += "/" + formatDate(journalSettings.monthly.subDirFormat, date.toJSDate())
    }
  
    return path
  }

  private async makeJournalContent(
    date: DateTime,
    futureDates: DateTime[]
  ): Promise<string | null> {
    let journalSettings = this.settingsHandler.journalSettings
    let journalContent = ""
    let vault = this.plugin.app.vault

    let dailyNamingFormat = this.serviceMngr.servicesMngr.settingsMngr.getPeriodicSettings().daily.namingFormat
    if (dailyNamingFormat === "") {
      dailyNamingFormat = DEFAULT_PERIODIC_SETTINGS.daily.namingFormat
    }
  
    if (!date) return null
    // Adjust the date to the Sunday of its week (start of the week)
    const sundayOfWeek = date.startOf('week').minus({ days: 1 })
    let previousDate = sundayOfWeek.minus({ days: 7 }).toJSDate()
    let nextDate = sundayOfWeek.plus({ days: 7 }).toJSDate()
  
    let previousJournalName = formatDate(journalSettings.namingFormat, previousDate)
    let nextJournalName = formatDate(journalSettings.namingFormat, nextDate)
    
    // TODO add a feature for entry customization later.
    let templateString = ""
    let templateFile = vault.getAbstractFileByPath(journalSettings.journalTemplatePath)
    if (templateFile != null && templateFile instanceof TFile) {
      templateString = await vault.read(templateFile)
    }

    const frontMatterInfo = getFrontMatterInfo(templateString)
    if (frontMatterInfo.exists) {
      journalContent = `---\n` + frontMatterInfo.frontmatter + `---\n`
      templateString = templateString.substring(frontMatterInfo.contentStart)
    }
  
    // Beginning links
    let links = `#### [[${previousJournalName}|<--Last Week's Journal]] ++ [[${nextJournalName}|Next Week's Journal-->]]\n`
    journalContent += links
    journalContent = journalContent + templateString + "\n"
  
    // Daily note links
    let dailyNoteLinks = ""
    for (let i = 0; i < 7; i++) {
      let startOfWeek = date.startOf('week').minus({ days: 1 })
      let futureDate = startOfWeek.plus({ days: i })
      let formattedFutureDate = formatDate(dailyNamingFormat, futureDate.toJSDate())
  
      dailyNoteLinks += `## [[${formattedFutureDate}]]\n  > Your entry\n`
      futureDates.push(futureDate)
    }
    journalContent = journalContent.replace("{links}", dailyNoteLinks)
  
    // Adding the ending links
    journalContent = journalContent.replace("\n$", "links")
    journalContent += links
  
    return journalContent
  }

  async updateHomeNoteWithJournalLink(date: DateTime, dailyNoteName: string): Promise<void> {
    // Get the settings we need
    const vaultManipulationService = this.serviceMngr.servicesMngr.vaultManipulationService
    const homeNotePath = vaultManipulationService.settingsHandler.getHomeNotePath()
    const journalHomeId = this.settingsHandler.journalSettings.homeNoteId
    const journalSettings = this.settingsHandler.journalSettings
    const sundayOfWeek = date.startOf('week').minus({ days: 1 })

    if (!homeNotePath || !journalHomeId) {
      this.plugin.basicErrorNotice("Missing home note path or journal home ID in settings")
      return
    }
    
    // Get the home note file
    const vault = this.plugin.app.vault
    const homeNote = vault.getAbstractFileByPath(homeNotePath)
    
    if (!homeNote || !(homeNote instanceof TFile)) {
      this.plugin.basicErrorNotice(`Home note not found at path: ${homeNotePath}`)
      return
    }
    
    // Generate the journal name based on the date (similar to createJournalNote)
    const journalName = formatDate(journalSettings.namingFormat, sundayOfWeek.toJSDate())
    
    // Read the home note content
    const homeNoteContent = await vault.read(homeNote)
    
    // Find the line with the journal home ID
    const lines = homeNoteContent.split('\n')
    const homeIdLineIndex = lines.findIndex(line => line.includes(journalHomeId))
    
    if (homeIdLineIndex === -1) {
      this.plugin.basicErrorNotice(`Journal home ID "${journalHomeId}" not found in home note`)
      return
    }
    
    // Create the updated line with the format specified
    const journalLinkLine = `${journalHomeId}: ![[${journalName}#${dailyNoteName} | Today's Journal]]`
    
    // Update the same line with the journal link
    lines[homeIdLineIndex] = journalLinkLine
    
    // Save the updated home note content
    const updatedContent = lines.join('\n')
    await vault.modify(homeNote, updatedContent)
  }

  async cleanup() {
    this.plugin.debugger.log("Not yet implemented JournalFeatureHandler.cleanup()")
  }
}