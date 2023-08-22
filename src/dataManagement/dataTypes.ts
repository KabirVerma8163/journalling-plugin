import { PluginScheduledNotification } from "src/services/functional/notification/notificationInfo"
import { PluginReminder } from "src/services/functional/reminder/reminderInfo"

export type TNotificationInfo = {
  count: number
  notifications: PluginScheduledNotification[] 
}
export const DEFAULT_NOTIFICATIONS_INFO: TNotificationInfo = {
  count: 0,
  notifications: []
}

export type TReminderInfo = {
  lateShowing: boolean
  activeShowing: boolean
  snoozedShowing: boolean
  doneShowing: boolean
  count: number
  reminders: PluginReminder[]
}
export const DEFAULT_REMINDERS_INFO: TReminderInfo = {
  lateShowing: true,
  activeShowing: true,
  snoozedShowing: true,
  doneShowing: true,
  count: 0,
  reminders: []
}

export type TVaultManipulationInfo = {}
export const DEFAULT_VAULT_MANIPULATION_INFO: TVaultManipulationInfo = {}

export type TPeriodicInfo = {
  daily: {
    count: number
  }
}
export const DEFAULT_PERIODIC_INFO: TPeriodicInfo = {
  daily: {
    count: 0
  }
}

export type TJournalInfo = {
  count: number
}
export const DEFAULT_JOURNAL_INFO: TJournalInfo = {
  count: 0,
}

export type TInfo = {
  notification: TNotificationInfo
  reminder: TReminderInfo
  periodic: TPeriodicInfo
  journal: TJournalInfo
  vaultManipulation: TVaultManipulationInfo
  // Add other fields as needed
}
export const DEFAULT_INFO: TInfo = {
  notification: DEFAULT_NOTIFICATIONS_INFO,
  reminder: DEFAULT_REMINDERS_INFO,
  periodic: DEFAULT_PERIODIC_INFO,
  journal: DEFAULT_JOURNAL_INFO,
  vaultManipulation: DEFAULT_VAULT_MANIPULATION_INFO,
}

export type TNotificationSettings = {
  canNotify: boolean
  showing: boolean
}
export const DEFAULT_NOTIFICATION_SETTINGS: TNotificationSettings = {
  canNotify: true,
  showing: true,
}

export type TReminderSettings = {
  showing: boolean
}
export const DEFAULT_REMINDER_SETTINGS: TReminderSettings = {
  showing: true,
}

export type TVaultManipulationSettings = {
  replaceFilesOn: boolean
  showing: boolean
}
export const DEFAULT_VAULT_MANIPULATION_SETTINGS: TVaultManipulationSettings = {
  replaceFilesOn: false,
  showing: true,
}

export type TPeriodicSettings = {
  daily : {
    autoCreateOn: boolean
    namingFormat: string
    dirPath: string
    templatePath: string
    reminderOn: boolean
    reminderTime: string
    weekly: {
      subDirOn: boolean
      subDirFormat: string
    }
    monthly: {
      subDirOn: boolean
      subDirFormat: string
    }
    yearly: {
      subDirOn: boolean
      subDirFormat: string
    } 
    showing: boolean
    noteCount: number
  }
  showing: boolean
}
export const DEFAULT_PERIODIC_SETTINGS: TPeriodicSettings = {
  daily : {
    autoCreateOn: true,
    namingFormat: "Do ddd MMM YY",
    dirPath: "/",
    templatePath: "/",
    reminderOn: true,
    reminderTime: "2100", 
    weekly: {
      subDirOn: true,
      subDirFormat: "\\W\\e\\e\\k - WW \\o\\f YY",
    },
    monthly: {
      subDirOn: true,
      subDirFormat: "\\M\\o\\n\\t\\h - M MMM \\o\\f YY",
    },
    yearly: {
      subDirOn: true,
      subDirFormat: "\\Y\\e\\a\\r - YY",
    },
    showing: true,
    noteCount: 0,
  },
  showing: true,
}

export type TJournalSettings = {
  autoCreateOn: boolean
  namingFormat: string
  dirPath: string
  journalTemplatePath: string
  entryTemplatePath: string
  reminderOn: boolean
  reminderTime: string
  // later on add an option to choose the differentater of how many day's journal in one note
  monthly : {
    subDirOn: boolean
    subDirFormat: string
  }
  yearly : {
    subDirOn: boolean
    subDirFormat: string
  }
  showing: boolean
}
export const DEFAULT_JOURNAL_SETTINGS: TJournalSettings = {
  autoCreateOn: true,
  dirPath: "/",
  namingFormat: "\\W\\e\\e\\k\\l\\y Journ\\a\\l – Do MMM YY",
  journalTemplatePath: "/",
  entryTemplatePath: "/",
  reminderOn: true,
  reminderTime: "2300",
  monthly: {
    subDirOn: true,
    subDirFormat: "M MMM YY"
  },
  yearly: {
    subDirOn: true,
    subDirFormat: "YYYY"
  },
  showing: true
}

export type TSettings = {
  notification : TNotificationSettings
  reminder : TReminderSettings
  vaultManipulation : TVaultManipulationSettings
  periodic : TPeriodicSettings
  journal : TJournalSettings
} 

export const DEFAULT_SETTINGS: TSettings = {
  notification : DEFAULT_NOTIFICATION_SETTINGS,
  reminder : DEFAULT_REMINDER_SETTINGS,
  vaultManipulation : DEFAULT_VAULT_MANIPULATION_SETTINGS,
  periodic : DEFAULT_PERIODIC_SETTINGS,
  journal : DEFAULT_JOURNAL_SETTINGS,
}

export type TData = {
  lastVersion: string
  info: TInfo
  settings: TSettings
}
export const DEFAULT_DATA: TData = {
  lastVersion: "1.0.0",
  info: DEFAULT_INFO,
  settings: DEFAULT_SETTINGS
}