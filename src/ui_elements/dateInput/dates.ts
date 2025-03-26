import { DateTime } from "luxon"

export function parseDate(
  dateInput: DateTime | Date | string | null,
  dateFormat: string
): DateTime {
  if (!dateInput) return DateTime.local()
  
  if (dateInput instanceof DateTime) return dateInput
  
  if (dateInput instanceof Date) return DateTime.fromJSDate(dateInput)
  
  const parsed = DateTime.fromFormat(dateInput.toString(), dateFormat)
  return parsed.isValid ? parsed : DateTime.local()
}