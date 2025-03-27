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
  ): Promise<{
    file: TFile | null,
    status: NewFileCreationStatus
  }>{
    let vault = this.plugin.app.vault

    // Create the folder from the folder path if it doesn't exist 
    const folderExists = await vault.adapter.exists(folderPath)
    if (!folderExists) {
      try {
        await vault.createFolder(folderPath)
      } catch (err) {
        this.plugin.basicErrorNotice(`Error in file creation: ${filename}. Check console for details.`)
        this.plugin.debugger.log(`Error in folder creation: ${err}`)
        return {
          file: null,
          status: NewFileCreationStatus.FailedToCreateFolder
        }
      }
    }  

    // #region Path sanity checks
    if (folderPath.endsWith("/") == false) {
      folderPath = folderPath + "/"
    }
    if (filename.substring(0, 1) == "/") {
      filename = filename.substring(1)
    }
    // #endregion

    // Check if file already exists
    let file = vault.getAbstractFileByPath(`${folderPath}${filename}`)
    if (file instanceof TFile) {
      if (!replace) {
        return {
          file: file,
          status: NewFileCreationStatus.FileAlreadyExists
        }
      }

      try { // Replace file contents
        await vault.modify(file, templateContents)
        return {
          file: file,
          status: NewFileCreationStatus.SuccessfulReplacement
        }
      } catch {
        return {
          file: file,
          status: NewFileCreationStatus.FailedToReplaceFile
        }
      }
    }

    // Create new file
    try {
      file = await vault.create(`${folderPath}${filename}`, templateContents)
      if (file instanceof  TFile) {
        return {
          file: file,
          status: NewFileCreationStatus.SuccessfulNewCreation
        }
      }
      return {
        file: null,
        status: NewFileCreationStatus.FailedToCreateFile
      }
    } catch (err) {
      console.error(`Error creating file: ${err}`)
      throw new Error(`Failed to create file: ${filename}`)
    }
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
  ): Promise<{
    file: TFile | null,
    status: NewFileCreationStatus
  }>{
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
  FailedToReplaceFile = "FailedToReplaceFile",
  FileAlreadyExists = "FileAlreadyExists",
  FailedToCreateFile = "FailedToCreateFile",
  FailedToCreateFolder = "FailedToCreateFolder"
}