import { find, get, unset } from 'lodash/fp'

import { Data } from './types'

export const getIdValue = (idPropertyName: string, row: Data): string | number =>
  get(idPropertyName, row) as string | number

export const getRowById = (data: Data, idPropertyName: string, idValue: string | number): unknown =>
  find([idPropertyName, idValue], data)

export const removeById = (data: Data, id: string | number): Data => unset(id, data)
