export interface TapisResponse {
  result?: any | any[] | undefined,
  message?: string, 
  metadata?: object | undefined,
  status?: string | undefined,
  version?: string | undefined
} 

export interface TapisPaginatedRequest {
  offset?: number | undefined,
  limit?: number | undefined
}