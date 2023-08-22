import { App, Plugin, PluginManifest} from 'obsidian'
import { ServicesManager } from 'src/services/servicesMngr'
import { DebuggingSupport } from 'src/utils/debuggingSupport'
import { nanoid } from 'nanoid'


export default class JournallingPlugin extends Plugin {
	isTesting: boolean

	name: string
	isMobile: boolean
	servicesManager: ServicesManager

	debugger: DebuggingSupport
	// TODO: check if the template naming format is a valid naming format.
	// TODO: make sure settings are compatible with the new settings system, for example notifications/schedulers can't be off if autocreate is on 
	// TODO: the data handling stuff is still finicky, make sure it works with the addition of advanced settings and such.
	// TODO: You forgot to enable the reminder time properly
	// TODO: The daily note name is still funky, make sure it works soon

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest)
		this.name = manifest.name
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
	}

	onunload() {}

	testing(){
		console.log('Testing')
	}

	// A basic function to send an error notice
	basicErrorNotice(errMsg: string, length?: number) {
		this.servicesManager.notificationService.featureHandler.createErrorNotice(errMsg, length)
	}

	basicWarningNotice(errMsg: string, length?: number) {
		this.servicesManager.notificationService.featureHandler.createWarningNotice(errMsg, length)
	}

} 

