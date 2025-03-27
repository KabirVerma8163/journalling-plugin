import * as cronParser from 'cron-parser'
import { DateTime } from 'luxon'
import moment from 'moment'
import { start } from 'repl'

// Object Manipulation Utilities
export function setObjVal(object: Object, address: string, value: any) {
  if (address === "") {
    object = value
    return
  }
  
  let path = address.split(".")
  let obj = object
  for (let i = 0; i < path.length - 1; i++) {
    // @ts-ignore
    obj = obj[path[i]]
  }
  // @ts-ignore
  obj[path[path.length - 1]] = value
}

export function getObjVal(object: Object, address: string) {
  if (address === "") {
    return object
  }

  let path = address.split(".")
  let obj = object
  for (let i = 0; i < path.length - 1; i++) {
    // @ts-ignore
    obj = obj[path[i]]
  }
  // @ts-ignore
  return obj[path[path.length - 1]]
}

// UI Utilities
export const wrapAround = (value: number, size: number): number => {
  return ((value % size) + size) % size
}

// Date Utilities
// Don't use cron strings to represent specific dates
export function isValidFutureDateOrCron(input: Date | string): boolean {
  if (typeof input === 'string') {
    try {
      cronParser.parseExpression(input)
      return true
    } catch (err) {
      let date = new Date(input)
      if (date instanceof Date) {
        return date.getTime() > Date.now()
      } else {
        return false
      }
    }
  } else if (input instanceof Date) {
    return input.getTime() > Date.now()
  }

  return false
}

export function formatDate(val: string, date?: Date) {
  if (date == undefined) {
    date = new Date()
  } 
  return moment(date).format(val)
}

// export function firstSunday(date: Date): Date {
//   let startOfWeek = moment(date).startOf('week')
//   return startOfWeek.toDate()
// }

// export function formatDate(val: string, date?: DateTime): string {
//   if (date === undefined) {
//     date = DateTime.now(); // Using Luxon to get the current date if undefined
//   }
//   return date.toFormat(val); // Luxon's toFormat() method is used for formatting
// }

export function firstSunday(date: DateTime): DateTime {
  let startOfWeek = date.startOf('week'); // Luxon’s DateTime already works with the 'week' unit
  return startOfWeek; // Returning as a DateTime object
}

export function setReminderTime(reminderTime: string, date?:Date){
  if (date == undefined) {
    date = new Date()
  }

  let hours = parseInt(reminderTime.substring(0, 2))
  let minutes = parseInt(reminderTime.substring(2, 4))

  date.setHours(hours)
  date.setMinutes(minutes)
  date.setSeconds(0)
  date.setMilliseconds(0)

  return date
}
