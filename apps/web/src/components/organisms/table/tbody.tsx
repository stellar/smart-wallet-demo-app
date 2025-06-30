import * as React from 'react'

import { getOr } from 'lodash/fp'

import { Column, ColumnType, Data } from './types'

interface IRowCellProps {
  column: Column
  row: Data
  onSelectRow: (row: Record<string | number, unknown>) => void
  isSelected?: boolean
}

const RowCell = React.memo(({ column, row, onSelectRow, isSelected = false }: IRowCellProps): JSX.Element | null => {
  if (column.type === ColumnType.selectRowCheckbox) {
    return (
      <td>
        <input type="checkbox" onChange={(): void => onSelectRow(row)} checked={isSelected} />
      </td>
    )
  }

  if (column?.renderRowCell) {
    return column.renderRowCell(row)
  }

  if (!column.property) {
    return null
  }

  return <td>{getOr('', column.property, row) as React.ReactNode}</td>
})

RowCell.displayName = 'RowCell'

interface ITBodyProps {
  columns: Column[]
  data: Data[]
  onSelectRow: (row: Record<string | number, unknown>) => void
  selectedRows: Record<number | string, unknown>
  getIdOfRow: (row: Data) => number | string
}

const TBody = ({ columns, data, onSelectRow, selectedRows, getIdOfRow }: ITBodyProps): JSX.Element => {
  return (
    <tbody>
      {data?.map(row => {
        const idOfRow = getIdOfRow(row)
        return (
          <tr key={idOfRow}>
            {columns?.map((col, colIndex) => {
              return (
                <RowCell
                  key={`${idOfRow}_${colIndex}`}
                  column={col}
                  row={row}
                  onSelectRow={onSelectRow}
                  isSelected={!!selectedRows?.[getIdOfRow(row)]}
                />
              )
            })}
          </tr>
        )
      })}
    </tbody>
  )
}

export { TBody }
