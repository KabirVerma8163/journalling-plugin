// This is an object that is initialized by a service manager and is passed onto each service. It is then used to log to console only if the plugin is in debug mode.

import JournallingPlugin from "src/main"

export class DebuggingSupport {
  plugin: JournallingPlugin
  debugMode: boolean

  constructor(plugin: JournallingPlugin){
    this.plugin = plugin
    this.debugMode = this.plugin.isTesting
  }

  log(message: any, ...optionalParams: any[]): void{
    const ignoredTerms = ['notification', 'reminder', 'vault', 'periodic', 'journal']

    if (this.debugMode) {
      if (typeof message === 'string' && ignoredTerms.some(term => message.toLowerCase().includes(term))) {
        return
      }
      console.log(message, ...optionalParams)
    }
  }
}