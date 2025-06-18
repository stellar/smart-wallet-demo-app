import * as React from 'react'
import { useState } from 'react'

import { cn } from 'src/helpers/style'

import { CustomIcon, CustomIconNames } from 'src/components/atoms'

import { Check, Column, ColumnType, OnOrderChange, OrderType } from './types'
import styles from './styles.module.css'

interface IOrderByIconProps {
  property: string
  onOrderChange: OnOrderChange
}

const ORDER_CHANGE_MAPPING = {
  [OrderType.asc]: OrderType.desc,
  [OrderType.desc]: null,
}

const OrderByIcon = ({ property, onOrderChange }: IOrderByIconProps): JSX.Element => {
  const [orderByType, setOrderBy] = useState<OrderType | null>(null)

  const toggleOrderBy = (): void => {
    const newOrderByType = !orderByType ? OrderType.asc : ORDER_CHANGE_MAPPING[orderByType]
    setOrderBy(newOrderByType)
    onOrderChange(property, newOrderByType)
  }

  const iconName = !orderByType ? CustomIconNames.expand : CustomIconNames['chevron-down']

  return (
    <span className={styles.iconOrderContainer} onClick={toggleOrderBy}>
      <CustomIcon
        name={iconName}
        alt="Reorder"
        className={cn({
          [styles.rotate]: OrderType.asc === orderByType,
          [styles.active]: !!orderByType,
        })}
      />
    </span>
  )
}

interface IHeaderCellProps {
  renderHeader?: () => JSX.Element
  header?: JSX.Element | React.ReactNode
  onOrderChange?: OnOrderChange
  property?: string
}

const HeaderCell = React.memo(({ renderHeader, header, onOrderChange, property }: IHeaderCellProps) => {
  const orderByIcon =
    onOrderChange && property ? <OrderByIcon property={property} onOrderChange={onOrderChange} /> : null

  return (
    <th>
      <div className={styles.headerCell}>
        <span>{renderHeader ? renderHeader() : header}</span>
        <span>{orderByIcon}</span>
      </div>
    </th>
  )
})

HeaderCell.displayName = 'HeaderCell'

interface ISelectAllProps {
  onSelectAll: (type: Check) => void
}

const SelectAll = ({ onSelectAll }: ISelectAllProps): JSX.Element => {
  const [checked, setChecked] = useState(false)

  const toggleCheck = (): void => {
    setChecked(current => {
      onSelectAll(!current ? Check.checked : Check.unchecked)
      return !current
    })
  }

  return <input type="checkbox" checked={checked} onClick={toggleCheck} />
}

interface ITHeadProps {
  columns: Column[]
  onSelectAll: (type: Check) => void
}

const THead = React.memo(({ columns, onSelectAll }: ITHeadProps): JSX.Element => {
  return (
    <thead>
      <tr>
        {columns?.map(({ header, ...col }) => {
          let newHeader = header
          if (!newHeader && col.type === ColumnType.selectRowCheckbox) {
            newHeader = <SelectAll onSelectAll={onSelectAll} />
          }

          return <HeaderCell key={col.property} {...col} header={newHeader} />
        })}
      </tr>
    </thead>
  )
})

THead.displayName = 'THead'

export { THead }
