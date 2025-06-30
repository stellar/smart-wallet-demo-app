import dayjs from 'dayjs'

class DateAdapter {
  formatToDateAndMonth(date: Date) {
    return dayjs(date).format('YYYY-MM')
  }

  formatToDayMonthYear(date: Date) {
    return dayjs(date).format('DD/MM/YYYY')
  }

  isBefore(date: Date, dateToCompare: Date) {
    return dayjs(date).isBefore(dateToCompare)
  }

  isAfter(date: Date, dateToCompare: Date) {
    return dayjs(date).isAfter(dateToCompare)
  }

  diffInDays(date: Date, dateToCompare: Date) {
    return dayjs(date).diff(dateToCompare, 'days')
  }

  diffInMonths(date: Date, dateToCompare: Date) {
    return dayjs(date).diff(dateToCompare, 'months')
  }

  addDays(date: Date, days: number) {
    return dayjs(date).add(days, 'days').toDate()
  }

  addMonths(date: Date, months: number) {
    return dayjs(date).add(months, 'months').toDate()
  }

  subtractDays(date: Date, days: number) {
    return dayjs(date).subtract(days, 'days').toDate()
  }

  subtractMonths(date: Date, months: number) {
    return dayjs(date).subtract(months, 'months').toDate()
  }

  startOfMonth(date: Date) {
    return dayjs(date).startOf('month').toDate()
  }

  endOfMonth(date: Date) {
    return dayjs(date).endOf('month').toDate()
  }

  startOfWeek(date: Date) {
    return dayjs(date).startOf('week').toDate()
  }

  endOfWeek(date: Date) {
    return dayjs(date).endOf('week').toDate()
  }

  startOfDay(date: Date) {
    return dayjs(date).startOf('day').toDate()
  }

  endOfDay(date: Date) {
    return dayjs(date).endOf('day').toDate()
  }

  isSameDay(date: Date, dateToCompare: Date) {
    return dayjs(date).isSame(dateToCompare, 'day')
  }

  isSameMonth(date: Date, dateToCompare: Date) {
    return dayjs(date).isSame(dateToCompare, 'month')
  }

  isSameYear(date: Date, dateToCompare: Date) {
    return dayjs(date).isSame(dateToCompare, 'year')
  }

  isToday(date: Date) {
    return dayjs(date).isSame(new Date(), 'day')
  }
}

export default new DateAdapter()
