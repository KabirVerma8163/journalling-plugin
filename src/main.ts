import { App, Plugin, PluginManifest} from 'obsidian'
import { ServicesManager } from 'src/services/servicesMngr'
import { JournalService } from './services/journalling/journal'
import { DateTime } from 'luxon'
import { DebuggingSupport } from './utils/debuggingSupport'


export default class JournallingPlugin extends Plugin {
	isTesting: boolean

	name: string
	isMobile: boolean
	servicesManager: ServicesManager

	runOnUnload: (() => void)[] = []

	debugger: DebuggingSupport
	// TODO: check if the template naming format is a valid naming format.
	// TODO: make sure settings are compatible with the new settings system, for example notifications/schedulers can't be off if autocreate is on 
	// TODO: the data handling stuff is still finicky, make sure it works with the addition of advanced settings and such.
	// TODO: You forgot to enable the reminder time properly
	// TODO: The daily note name is still funky, make sure it works soon

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest)
		this.name = manifest.name
		
		this.isTesting = true
		this.isTesting = false

		this.debugger = new DebuggingSupport(this)
		if (this.isTesting) {
			console.clear()
			console.log('Journalling Plugin Loaded for testing')
		} else {
			console.log('Journalling Plugin Loaded')
		}

		// @ts-ignore
		this.isMobile = app.isMobile

		this.servicesManager = new ServicesManager(this)
	}

	async onload() {
		// All the initialize functions go here
		await this.servicesManager.initialize()
		// this.addSettingTab(this.servicesManager.settingsMngr)

		this.setupAutomaticJournalCreation()
		
	}

	onunload() {
		this.runOnUnload.forEach(cb => cb())
	}

	setupAutomaticJournalCreation(): number {
		// Get the journal service
		const journalService = this.servicesManager.serviceMngrs.find(
			service => service.name === "Journal"
		) as JournalService
		
		if (!journalService) {
			this.debugger.log("Journal service not found, automatic creation not set up")
			return -1
		}

		// Set up the interval to run every 12 hours
		const intervalId = window.setInterval(() => {
			let autoCreateOn = journalService.settingsHandler.getAutoCreateOn()       

			if (!autoCreateOn) {
				return
			}

			const currentDate = DateTime.now()
			this.debugger.log(`Automatic journal creation triggered at ${currentDate.toFormat("yyyy-MM-dd HH:mm")}`)
			
			// Call the create journal function
			journalService.featureHandler.createJournalNote(currentDate, false)
			
			// Update the latest journal date
			journalService.infoHandler.setLatestJournalDate(currentDate)
		},
	 	// 2 * 1000 // 6 hours in milliseconds
		6 * 60 * 60 * 1000 // 6 hours in milliseconds
	); 
		
		// Store the interval ID so it can be cleared on plugin unload
		this.runOnUnload.push(() => {
			window.clearInterval(intervalId)
			this.debugger.log('Automatic journal creation interval cleared on unload.')
		})
		
		return intervalId
	}

	// A basic function to send an error notice
	basicErrorNotice(errMsg: string, length?: number) {
		this.servicesManager.notificationService.featureHandler.createErrorNotice(errMsg, length)
	}

	basicWarningNotice(errMsg: string, length?: number) {
		this.servicesManager.notificationService.featureHandler.createWarningNotice(errMsg, length)
	}

} 

