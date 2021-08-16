export interface TapisResponse {
  result: any,
  status: string,
  message: string,
  version: string
}

// Type checker to see if an object is a tapis response or another type of javascript exception
export const isTapisResponse = <T>(obj: TapisResponse | Error | T): obj is TapisResponse => {
  return ('result' in (obj as TapisResponse));
}