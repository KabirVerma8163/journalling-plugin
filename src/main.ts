import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginManifest, PluginSettingTab, Setting } from 'obsidian';
import { DataMngr } from './dataManagement/dataMngr';
import { ServicesManager } from './services/servicesMngr';

// Remember to rename these classes and interfaces!


export default class JournallingPlugin extends Plugin {
	isTesting: boolean

	isMobile: boolean
	servicesManager: ServicesManager

	constructor(app: App, manifest: PluginManifest) {
		super(app, manifest)
		this.isTesting = true

		// @ts-ignore
		this.isMobile = app.isMobile

		this.servicesManager = new ServicesManager(this)
	}

	async onload() {
		// All the initialize functions go here
		this.servicesManager.initialize()
	}

	onunload() {}
} 

