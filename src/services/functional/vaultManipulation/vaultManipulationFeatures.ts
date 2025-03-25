import { Command, FileView, TFile, Workspace, WorkspaceLeaf } from "obsidian"
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

  async createNewFile(
    folderPath: string,
    filename: string,
    templateContents: string = "",
    replace: boolean = this.settingsHandler.vaultManipulationSettings.replaceFilesOn
  ) {
    let vault = this.plugin.app.vault

    // Create the folder from the folder path if it doesn't exist 
    await vault.adapter.exists(folderPath).then((exists) => {
      if (!exists) {
        vault.createFolder(folderPath)
          .then((folder) => { })
          .catch((err) => {
            this.plugin.basicErrorNotice(`Error in file creation:${filename} check consolve for details.`)
            console.log(`Error in folder existence: ${err}`)
            return
          })
      }
    })

    // #region Path sanity checks
    if (folderPath.endsWith("/") == false) {
      folderPath = folderPath + "/"
    }
    if (filename.substring(0, 1) == "/") {
      filename = filename.substring(1)
    }
    // #endregion

    // Steps for if the file already exists 
    let file = vault.getAbstractFileByPath(`${folderPath}${filename}`)
    if (file != null && file instanceof TFile) {
      if (!replace) {
        return new Promise ((resolve, reject) => { // File exists and leave it as is
          if (file != null && file instanceof TFile) {
            resolve({
              file: file, 
              status: NewFileCreationStatus.FileAlreadyExists
            })
          }
          reject({
            error: `File: ${filename} already exists in ${folderPath}`,
            status: NewFileCreationStatus.FailedToCreateFile
          })
        })
      } else { // File Replacement 
        this.plugin.basicWarningNotice(`Replacing File: ${filename} already exists in ${folderPath}`)
        return vault.modify(file, templateContents)
        .then(() => {
          return new Promise((resolve, reject) => {
            if (file != null && file instanceof TFile) {
              resolve(NewFileCreationStatus.SuccessfulReplacement)
            } else {
              reject({
                file: file,
                error: "File exists but there was a type error in modification.",
                status: NewFileCreationStatus.UnsuccessfulReplacement
              })
            }
          })
        })
        .catch(() => {
          return new Promise((resolve, reject) => {
            reject({
              file: file,
              error: "File Exists but couldn't be modified.",
              status: NewFileCreationStatus.UnsuccessfulReplacement
            })
          })
        })
      }
    }

    // Create the file if it doesn't exist
    return new Promise ((resolve, reject) => {
      vault.create(folderPath + filename, templateContents)
        .then((file) => { // Successful creation
          if (file != null && file instanceof TFile) {
            resolve({
              file: file, 
              status: NewFileCreationStatus.SuccessfulNewCreation
            })
          }
        })
        .catch((error) => { // UnSuccessful creation
          reject({
            error: error,
            status: NewFileCreationStatus.FailedToCreateFile
          })
        })
    })
  }

  // There is no point in adding more customizability to how to open the file 
  // as obsidian natively doesn't have that many options 
  async openFile(filePath: string){
    let vault = this.plugin.app.vault
    let workspace = this.plugin.app.workspace
    let file = vault.getAbstractFileByPath(filePath)

    // Check if the file is already open. 
    let openFileLeaf = null
    workspace.iterateAllLeaves((leaf) => {
      let view: FileView = leaf.view as FileView
      if (view.file && view.file.path == filePath){ openFileLeaf = leaf }
    })

    if (openFileLeaf){
      workspace.setActiveLeaf(openFileLeaf)
    } else if (file != null && file instanceof TFile){
      workspace.getLeaf(true).openFile(file)
    }
  }

  async createNewMarkdownFile(
    folderPath: string, 
    filename: string,
    templateContents: string = "",
    replace: boolean = this.settingsHandler.vaultManipulationSettings.replaceFilesOn
  ) {
    if (!filename.endsWith(".md")) { filename = filename + ".md" }
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
  UnsuccessfulReplacement = "UnsuccessfulReplacement",
  FileAlreadyExists = "FileAlreadyExists",
  FailedToCreateFile = "FailedToCreateFile",
}