export enum ColumnType {
  'string' = 'string',
  'selectRowCheckbox' = 'selectRowCheckbox',
}

export enum Check {
  checked = 'checked',
  unchecked = 'unchecked',
}

export enum OrderType {
  asc = 'asc',
  desc = 'desc',
}

export type OnOrderChange = (field: string, type: OrderType | null) => void

export type Column = {
  type?: ColumnType
  property?: string
  header?: JSX.Element | string
  renderHeader?: () => JSX.Element
  onOrderChange?: OnOrderChange
  renderRowCell?: (row: Data) => JSX.Element
}

export type Data = Record<string | number, unknown>
export type OnRowSelect = (selectedElements: Data) => void

export interface ITableProps {
  columns: Column[]
  data: Data[]
  onRowSelect?: OnRowSelect
  idPropertyName: string
}
