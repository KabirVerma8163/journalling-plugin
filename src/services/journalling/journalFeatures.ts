import { Command, getFrontMatterInfo, Setting, TFile } from "obsidian"
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
import { DateRangeModal } from "src/ui_elements/dateInput/dateInputModal"
import { end } from "@popperjs/core"
import { DateTime } from "luxon"
import { create } from "domain"
import { start } from "repl"

export class JournalFeatureHandler implements IFeatureHandler {
  // #region Variable Declartion
  name: string
  description: string
  plugin: JournallingPlugin
  serviceMngr: JournalService
  infoHandler: JournalInfoHandler
  settingsHandler: JournalSettingsHandler
  commands: Command[]
  // #endregion

  constructor(serviceMngr: IServiceMngr) {
    this.name = serviceMngr.name
    this.description = serviceMngr.description
    this.plugin = serviceMngr.plugin
    this.serviceMngr = serviceMngr as JournalService
    this.settingsHandler = serviceMngr.settingsHandler as JournalSettingsHandler
    this.commands = []
  }

  async createJournalNote(
    date: DateTime = firstSunday(DateTime.now()), 
    fromCommand: boolean = false,
    createDailes: boolean = true
  ) { // Get the path to the folder
    let journalSettings = this.settingsHandler.journalSettings
    let vaultManipulationService = this.serviceMngr.servicesMngr.vaultManipulationService
    
    let futureDates: DateTime[] = []
    let journalContent = await this.makeJournalContent(date, futureDates)
    if (journalContent == null) return

    let folderPath = this.getJournalFolderPath(date)
    let fileName = `/${formatDate(journalSettings.namingFormat, date.toJSDate())}.md`

    let serviceFeatureHandler: PeriodicFeaturesHandler
    this.serviceMngr.servicesMngr.serviceMngrs.forEach(service => {
      if (service.name === "Periodic") { serviceFeatureHandler = service.featureHandler as PeriodicFeaturesHandler }
    })

    vaultManipulationService.featureHandler.createNewMarkdownFile(folderPath, fileName, journalContent)
    .then((file) => {
      if (file === "SuccessfulNewCreation" || file === "SuccessfulReplacement") {
        this.infoHandler.incrementCount()
        if (createDailes) {
          futureDates.forEach(futureDate => {
            serviceFeatureHandler.createDailyNote(futureDate.toJSDate())
          })
        }
      }
    })
  }

  // TODO give an option to choose between creating corresponding daily notes for your mass journal making or not. 
  async createOlderJournalNotes(startDate: DateTime, endDate: DateTime, createDailes: boolean) {
    // Create a journal note for each week in between
    // The loop that goes through all the dates
    let currentDate = startDate
    while (currentDate <= endDate) {
      this.createJournalNote(currentDate, false, createDailes = createDailes)
      currentDate = currentDate.plus({ days: 7 })
    }
    this.createJournalNote(endDate, false, createDailes = createDailes)

  }

  async initialize() {
    this.plugin.debugger.log("Initializing JournalFeatureHandler")
    this.infoHandler = this.serviceMngr.infoHandler as JournalInfoHandler

    // TODO Activate this later
    // this.handleAutoCreateJournalNote()

    this.plugin.addRibbonIcon(
      "calendar-minus",
      "Add older journalling and linked notes",
      () => {
        let createDailies: boolean = true
        new DateRangeModal(
          this.plugin.app , 
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
              toggle.setValue(createDailies);
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

  private getJournalFolderPath(date?: DateTime): string {
    if (date === undefined) {
      date = DateTime.now();  // Using Luxon for the current date
    }
    let journalSettings = this.settingsHandler.journalSettings;
  
    let path = "/" === journalSettings.dirPath ? "" : "" + journalSettings.dirPath;
    if (path === "") path = "/";
    
    if (journalSettings.yearly.subDirOn) {
      path += "/" + formatDate(journalSettings.yearly.subDirFormat, date.toJSDate());
    }
    if (journalSettings.monthly.subDirOn) {
      path += "/" + formatDate(journalSettings.monthly.subDirFormat, date.toJSDate());
    }
  
    return path;
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
  
    if (!date) return null;
    let previousDate = date.minus({ days: 7 }).toJSDate();
    let nextDate = date.plus({ days: 7 }).toJSDate();
  
    let previousJournalName = formatDate(journalSettings.namingFormat, previousDate);
    let nextJournalName = formatDate(journalSettings.namingFormat, nextDate);
    
    // TODO add a feature for entry customization later.
    let templateString = ""
    let templateFile = vault.getAbstractFileByPath(journalSettings.journalTemplatePath)
    if (templateFile != null && templateFile instanceof TFile) {
      templateString = await vault.read(templateFile)
    }

    const frontMatterInfo = getFrontMatterInfo(templateString);
    if (frontMatterInfo.exists) {
      journalContent = frontMatterInfo.frontmatter
      templateString = templateString.substring(frontMatterInfo.contentStart)
    }
  
    // Beginning links
    let links = `#### [[${previousJournalName}|<--Last Week's Journal]] ++ [[${nextJournalName}|Next Week's Journal-->]]\n`;
    journalContent += links;
    journalContent = journalContent + templateString + "\n";
  
    // Daily note links
    let dailyNoteLinks = "";
    for (let i = 0; i < 7; i++) {
      let startOfWeek = date.startOf('week');
      let futureDate = startOfWeek.plus({ days: i });
      let formattedFutureDate = formatDate(dailyNamingFormat, futureDate.toJSDate());
  
      dailyNoteLinks += `## [[${formattedFutureDate}]]\n  > Your entry\n\n`;
      futureDates.push(futureDate);
    }
    journalContent = journalContent.replace("{links}", dailyNoteLinks);
  
    // Adding the ending links
    journalContent = journalContent.replace("\n$", "links");
    journalContent += links;
  
    return journalContent;
  }
  

  async cleanup() {
    this.plugin.debugger.log("Not yet implemented JournalFeatureHandler.cleanup()")
  }
}