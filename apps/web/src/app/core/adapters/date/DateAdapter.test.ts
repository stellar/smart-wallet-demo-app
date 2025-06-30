import dayjs from 'dayjs'

import DateAdapter from './DateAdapter'

describe('DateAdapter', () => {
  const now = new Date()
  const futureDate = dayjs(now).add(10, 'days').toDate()
  const pastDate = dayjs(now).subtract(10, 'days').toDate()
  const pastMonthDate = dayjs(now).subtract(1, 'month').toDate()
  const pastYearDate = dayjs(now).subtract(1, 'year').toDate()

  it('formats date to YYYY-MM', () => {
    const formattedDate = DateAdapter.formatToDateAndMonth(now)
    expect(formattedDate).toBe(dayjs(now).format('YYYY-MM'))
  })

  it('formats date to DD/MM/YYYY', () => {
    const formattedDate = DateAdapter.formatToDayMonthYear(now)
    expect(formattedDate).toBe(dayjs(now).format('DD/MM/YYYY'))
  })

  it('checks if a date is before another', () => {
    expect(DateAdapter.isBefore(pastDate, now)).toBe(true)
    expect(DateAdapter.isBefore(futureDate, now)).toBe(false)
  })

  it('checks if a date is after another', () => {
    expect(DateAdapter.isAfter(futureDate, now)).toBe(true)
    expect(DateAdapter.isAfter(pastDate, now)).toBe(false)
  })

  it('calculates difference in days between two dates', () => {
    const diff = DateAdapter.diffInDays(futureDate, now)
    expect(diff).toBe(10)
  })

  it('calculates difference in months between two dates', () => {
    const diff = DateAdapter.diffInMonths(futureDate, now)
    expect(diff).toBe(0) // As the difference is less than a month
  })

  it('adds days to a date', () => {
    const result = DateAdapter.addDays(now, 10)
    expect(result).toEqual(futureDate)
  })

  it('adds months to a date', () => {
    const result = DateAdapter.addMonths(now, 1)
    expect(result).toEqual(dayjs(now).add(1, 'months').toDate())
  })

  it('subtracts days from a date', () => {
    const result = DateAdapter.subtractDays(now, 10)
    expect(result).toEqual(pastDate)
  })

  it('subtracts months from a date', () => {
    const result = DateAdapter.subtractMonths(now, 1)
    expect(result).toEqual(dayjs(now).subtract(1, 'months').toDate())
  })

  it('gets start and end of month', () => {
    expect(DateAdapter.startOfMonth(now)).toEqual(dayjs(now).startOf('month').toDate())
    expect(DateAdapter.endOfMonth(now)).toEqual(dayjs(now).endOf('month').toDate())
  })

  it('gets start and end of week', () => {
    expect(DateAdapter.startOfWeek(now)).toEqual(dayjs(now).startOf('week').toDate())
    expect(DateAdapter.endOfWeek(now)).toEqual(dayjs(now).endOf('week').toDate())
  })

  it('gets start and end of day', () => {
    expect(DateAdapter.startOfDay(now)).toEqual(dayjs(now).startOf('day').toDate())
    expect(DateAdapter.endOfDay(now)).toEqual(dayjs(now).endOf('day').toDate())
  })

  it('checks if two dates are the same day', () => {
    expect(DateAdapter.isSameDay(now, now)).toBe(true)
    expect(DateAdapter.isSameDay(now, pastDate)).toBe(false)
  })

  it('checks if two dates are in the same month', () => {
    expect(DateAdapter.isSameMonth(now, now)).toBe(true)
    expect(DateAdapter.isSameMonth(now, pastMonthDate)).toBe(false)
  })

  it('checks if two dates are in the same year', () => {
    expect(DateAdapter.isSameYear(now, now)).toBe(true)
    expect(DateAdapter.isSameYear(now, pastYearDate)).toBe(false)
  })

  it('checks if a date is today', () => {
    expect(DateAdapter.isToday(now)).toBe(true)
    expect(DateAdapter.isToday(pastDate)).toBe(false)
  })
})
