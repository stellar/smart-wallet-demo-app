import { removeObjectEmptyKeys } from './index'

describe('Remove object empty keys utils', () => {
  it('should clean object when there is null or undefined key values', () => {
    const object1 = {
      key1: null,
      key2: null,
      key3: undefined,
    }

    const object2 = {
      key1: 'testing',
      key2: null,
      key3: undefined,
    }

    const object3 = {
      key1: 'testing',
      key2: null,
      key3: undefined,
      key4: {},
    }

    expect(removeObjectEmptyKeys(object1)).toEqual({})
    expect(removeObjectEmptyKeys(object2)).toEqual({ key1: 'testing' })
    expect(removeObjectEmptyKeys(object3)).toEqual({ key1: 'testing' })
  })
})
