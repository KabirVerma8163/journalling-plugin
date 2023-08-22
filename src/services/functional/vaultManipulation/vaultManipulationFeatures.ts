import { Command, TFile } from "obsidian"
import JournallingPlugin from "src/main"
import { IFeatureHandler } from "src/services/features"
import { IServiceMngr } from "src/services/servicesMngr"
import { VaultManipulationInfoHandler } from "./vaultManipulationInfo"
import { VaultManipulationSettingsHandler } from "./vaultManipulationSettings"

export class VaultManipulationFeatureHandler implements IFeatureHandler {
  name: string
  description: string
  plugin: JournallingPlugin
  serviceMngr: IServiceMngr
  infoHandler: VaultManipulationInfoHandler
  settingsHandler: VaultManipulationSettingsHandler
  commands: Command[]

  constructor(serviceMngr: IServiceMngr) {
    serviceMngr.plugin.debugger.log("Constructing VaultManipulationFeatureHandler")

    this.name = serviceMngr.name
    this.description = serviceMngr.description
    this.serviceMngr = serviceMngr
    this.infoHandler = serviceMngr.infoHandler as VaultManipulationInfoHandler
    this.settingsHandler = serviceMngr.settingsHandler as VaultManipulationSettingsHandler
    this.plugin = serviceMngr.plugin
    this.commands = []
  }

  async createNewFile(folderPath: string, filename: string, templateContents: string = "", replace: boolean = this.settingsHandler.vaultManipulationSettings.replaceFilesOn) {
    let vault = this.plugin.app.vault

    await vault.adapter.exists(folderPath).then((exists) => {
      if (!exists) {
        vault.createFolder(folderPath)
          .then((folder) => { })
          .catch((err) => {
            console.log(`Error in folder existence: ${err}`)
            return
          })
      }
    })

    if (folderPath.endsWith("/") == false) {
      folderPath = folderPath + "/"
    }
    if (filename.substring(0, 1) == "/") {
      filename = filename.substring(1)
    }

    let file = vault.getAbstractFileByPath(`${folderPath}${filename}`)
    if (file != null && file instanceof TFile) {
      if (replace == false) {
        this.plugin.basicErrorNotice(`File: ${filename} already exists in ${folderPath}`)
        return new Promise((resolve, reject) => {
          // @ts-ignore
          this.openFile(file.path)
          resolve(NewFileCreationStatus.FileAlreadyExists)
        })
      } else {
        this.plugin.basicWarningNotice(`Replacing File: ${filename} already exists in ${folderPath}`)
        return vault.modify(file , templateContents).then(() => {
          if (file != null && file instanceof TFile) {
            return new Promise((resolve, reject) => {
              // @ts-ignore
              this.openFile(file.path)
              resolve(NewFileCreationStatus.SuccessfulReplacement)
            })
          }
        })
      }
    }

    return new Promise ((resolve, reject) => {
      vault.create(folderPath + filename, templateContents)
        .then((file) => {
          if (file != null && file instanceof TFile) {
            // Open the note
            this.openFile(file.path)
            resolve(NewFileCreationStatus.SuccessfulNewCreation)
          }
        })
    })
  }

  async openFile(filePath: string){
    let file = this.plugin.app.vault.getAbstractFileByPath(filePath)
    if (file != null && file instanceof TFile){
      this.plugin.app.workspace.getLeaf(true).openFile(file)
    }
  }

  async createNewMarkdownFile(folderPath: string, filename: string, templateContents: string = "", replace: boolean = false) {
    if (filename.endsWith(".md") == false) {
      filename = filename + ".md"
    }
    return this.createNewFile(folderPath, filename, templateContents, replace)
  }

  async initialize() {
    this.plugin.debugger.log("Initializing VaultManipulationFeatureHandler")
  }
  async cleanup() {
    this.plugin.debugger.log("Cleaning up VaultManipulationFeatureHandler (not implemented)")
  }

}

// Create an object that would hold the different possibilities when a new file is created. Like SuccessfulNewCreation, FileAlreadyExists, FailedToCreateFile, etc.
export enum NewFileCreationStatus {
  SuccessfulNewCreation = "SuccessfulNewCreation",
  SuccessfulReplacement = "SuccessfulReplacement",
  FileAlreadyExists = "FileAlreadyExists",
  FailedToCreateFile = "FailedToCreateFile",
}