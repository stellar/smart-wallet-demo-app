import { Meta, StoryFn } from '@storybook/react'
import { orderBy } from 'lodash/fp'
import { FC, useState } from 'react'

import { ColumnType, OnOrderChange } from './types'

import { ITableProps, Table } from './'

const TableDemo: FC<ITableProps> = args => {
  const [data, setData] = useState([
    { name: 'John', job: 'Developer' },
    { name: 'Steph', job: 'Tech Lead' },
    { name: 'Dave', job: 'Designer' },
  ])
  const onOrderChange: OnOrderChange = (field, type) => {
    const orderedData = orderBy([field], [type ?? false])(data)
    setData(orderedData as typeof data)
  }
  return (
    <Table
      {...args}
      data={data}
      idPropertyName="name"
      columns={[
        {
          type: ColumnType.selectRowCheckbox,
        },
        {
          property: 'name',
          header: 'Name',
          onOrderChange,
        },
        {
          property: 'job',
          header: 'Job',
        },
        {
          header: 'Combined',
          renderRowCell: row => (
            <td>
              <span>{`${row.name} - ${row.job}`}</span>
            </td>
          ),
        },
      ]}
    />
  )
}

export default {
  title: 'Organisms/Table',
  component: TableDemo,
  args: {},
} as Meta

const Template: StoryFn<ITableProps> = args => <TableDemo {...args} />

export const Default = Template.bind({})
Default.args = {}
