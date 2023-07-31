// static convertDateToString(date: Date): string {
//   return date.toLocaleDateString('en-US', this.dateOptions)
// }

// export function convertLocaleStringToCronFormat(localeString: string) {
//   const parts = localeString.split(/[/,\s:]/);  // Split on slashes, commas, spaces, and colons
//   const month = parts[0];
//   const day = parts[1];
//   const year = parts[2];
//   const hour = parts[4];
//   const minute = parts[5];

//   // In cron format, months are 1-12 instead of 0-11 and days of the week are 0-7 (where both 0 and 7 are Sunday)
//   // So no conversion is necessary for those
//   // The cron format is: "second minute hour day-of-month month day-of-week"
//   // If you want the job to run every year on the same date and time, you can use a wildcard "*" for the day-of-week field
//   const cronFormat = `0 ${minute} ${hour} ${day} ${month} *`;
//   return cronFormat;
// }

// // Test the function with an example string
// const localeString = "12/31/2022, 16:30:20";
// console.log(convertLocaleStringToCronFormat(localeString));  // Should output: "0 30 16 31 12 *"

// export function convertDateToCronFormat(date: Date): string {
//   const second = date.getSeconds(); console.log(`second: ${second}`)
//   const minute = date.getMinutes(); console.log(`minute: ${minute}`)
//   const hour = date.getHours(); console.log(`hour: ${hour}`)
//   const day = date.getDate(); console.log(`day: ${day}`)
//   const month = date.getMonth() + 1; console.log(`month: ${month}`) // JavaScript's getMonth() is zero-based

//   return `${second} ${minute} ${hour} ${day} ${month} *`;
// }