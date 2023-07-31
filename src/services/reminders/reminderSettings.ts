// TODO: Guess it could just be a bunch of toggles to start with idk, right now it's just a placeholder
// export class reminderSettingsHandler implements ISettingsHandler {

// }

export enum ReminderStatus {
  Active = 'Active',
  Completing = 'Completing',
  Late = 'Late',
  Done = 'Done',
  Snoozed = 'Snoozed',
}

export enum ReminderType {
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly',
  Yearly = 'Yearly',
  Journalling = 'Journalling',
}

