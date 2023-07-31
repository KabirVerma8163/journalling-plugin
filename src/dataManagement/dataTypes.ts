import { PluginNotification } from "src/services/notifications/notificationInfo"
import { PluignReminder } from "src/services/reminders/reminderInfo"

export type TNotificationsInfo = {
  count: number,
  canNotify: boolean,
  notifications: PluginNotification[] 
}
export const DEFAULT_NOTIFICATIONS_INFO: TNotificationsInfo = {
  count: 0,
  canNotify: true,
  notifications: []
}

export type TRemindersInfo = {
  lateShowing: boolean,
  activeShowing: boolean,
  snoozedShowing: boolean,
  doneShowing: boolean,
  count: number,
  reminders: PluignReminder[]
}
export const DEFAULT_REMINDERS_INFO: TRemindersInfo = {
  lateShowing: true,
  activeShowing: true,
  snoozedShowing: true,
  doneShowing: true,
  count: 0,
  reminders: []
}

export type TPeriodicInfo = {}
export const DEFAULT_PERIODIC_INFO: TPeriodicInfo = {}

export type TJournalInfo = {}
export const DEFAULT_JOURNAL_INFO: TJournalInfo = {}

export type TInfo = {
  notifications: TNotificationsInfo,
  reminders: TRemindersInfo,
  periodic: TPeriodicInfo,
  journal: TJournalInfo
  // Add other fields as needed
}
export const DEFAULT_INFO: TInfo = {
  notifications: DEFAULT_NOTIFICATIONS_INFO,
  reminders: DEFAULT_REMINDERS_INFO,
  periodic: DEFAULT_PERIODIC_INFO,
  journal: DEFAULT_JOURNAL_INFO
}

export type TNotificationSettings = {}
export const DEFAULT_NOTIFICATION_SETTINGS: TNotificationSettings = {}

export type TReminderSettings = {}
export const DEFAULT_REMINDER_SETTINGS: TReminderSettings = {}

export type TPeriodicSettings = {
  daily : {
    on: boolean,
    naming: string,
    dirPath: string,
    templatePath: string,
    reminderOn: boolean,
    reminderTime: string,
    subDirDiv: string,
    yearlySubDirName: string,
    monthlySubDirName: string,
    weeklySubDirName: string,
    showing: boolean,
    noteCount: number,
  }
  showing: boolean,
}
export const DEFAULT_PERIODIC_SETTINGS: TPeriodicSettings = {
  daily : {
    on: true,
    naming: "Do ddd MMM YY",
    dirPath: "/",
    templatePath: "/",
    reminderOn: true,
    reminderTime: "2100", 
    subDirDiv: "weekly",
    yearlySubDirName: "\\Y\\e\\a\\r - YY",
    monthlySubDirName: "\\M\\o\\n\\t\\h - MMM \\o\\f YY",
    weeklySubDirName: "\\W\\e\\e\\k - WW \\o\\f YY",
    showing: true,
    noteCount: 0,
  },
  showing: true,
}

export type TJournalSettings = {
  dirPath: string, 
  naming: string,
  templatePath: string
  reminderOn: boolean,
  reminderTime: string,
  // later on add an option to choose the differentater of how many day's journal in one note
  monthly : {
    subDirOn: boolean,
    subDirName: string,
  },
  yearly : {
    subDirOn: boolean,
    subDirName: string,
  },
  showing: boolean,
}
export const DEFAULT_JOURNAL_SETTINGS: TJournalSettings = {
  dirPath: "/",
  naming: "\\W\\e\\e\\k\\l\\y Journ\\a\\l – Do MMM YY",
  templatePath: "/",
  reminderOn: true,
  reminderTime: "2300",
  monthly: {
    subDirOn: true,
    subDirName: "M MMM YY"
  },
  yearly: {
    subDirOn: true,
    subDirName: "YYYY"
  },
  showing: true
}


export type TSettings = {
  notifications : TNotificationSettings,
  remnders : TReminderSettings,
  periodic : TPeriodicSettings,
  journal : TJournalSettings,
}

export const DEFAULT_SETTINGS: TSettings = {
  notifications : DEFAULT_NOTIFICATION_SETTINGS,
  remnders : DEFAULT_REMINDER_SETTINGS,
  periodic : DEFAULT_PERIODIC_SETTINGS,
  journal : DEFAULT_JOURNAL_SETTINGS,
  // reminders:
}

export type TData = {
  info: TInfo,
  settings: TSettings
}
export const DEFAULT_DATA: TData = {
  info: DEFAULT_INFO,
  settings: DEFAULT_SETTINGS
}