export function setObjVal(object: Object, address: string, value: any) {
  let path = address.split(".")
  let obj = object
  for (let i = 0; i < path.length - 1; i++) {
    // @ts-ignore
    obj = obj[path[i]]
  }
  // @ts-ignore
  obj[path[path.length - 1]] = value
}

export function  getObjVal(object: Object, address: string) {
  let path = address.split(".")
  let obj = object
  for (let i = 0; i < path.length - 1; i++) {
    // @ts-ignore
    obj = obj[path[i]]
  }
  // @ts-ignore
  return obj[path[path.length - 1]]
}