import { act, renderHook, waitFor } from '@testing-library/react'
import { UseBoundStore } from 'zustand'
import { StoreApi } from 'zustand/vanilla'

type ExpectedState<State, T = unknown> = {
  state: (state: State) => T
  expected?: T
  customAssert?: (value: T) => void
}

type ZustandTest<S, T extends StoreApi<S>> = {
  storeApi: UseBoundStore<T>
  action?: (store: S) => void
  expectedStates: ExpectedState<ReturnType<T['getState']>>[]
  timeout?: number
}

/**
 * Testing helper that checks for Zustand states.
 */
export const testZustand = async <S,>(zustand: ZustandTest<S, StoreApi<S>>): Promise<boolean> => {
  const store = renderHook(() => zustand.storeApi()).result.current

  let stateCount = 0

  const unsubscribe = zustand.storeApi.subscribe(state => {
    const expectedState = zustand.expectedStates[stateCount]

    if (!expectedState) {
      throw new Error(`Expected state not found ${JSON.stringify(state)}. State Index: ${stateCount}`)
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    expect(expectedState.state(state))[expectedState.customEqualityTest ?? 'toBe'](expectedState.expected)

    stateCount++
  })

  await act(async () => zustand.action?.(store))

  await waitFor(
    () => {
      expect(stateCount).toBe(zustand.expectedStates.length)
    },
    { timeout: zustand.timeout ?? 10000 }
  )

  unsubscribe()

  return true
}

/**
 * Testing helper that mocks Zustand store.
 */
export const mockStoreState =
  <T,>(hook: UseBoundStore<StoreApi<T>>) =>
  (initialState: Partial<T>) =>
    (() => {
      hook.setState({ ...hook.getState(), ...initialState })
    })()
