export interface IHTTPResponse<TData = object> {
  message: string
  data: TData & {
    success: boolean
  }
}
