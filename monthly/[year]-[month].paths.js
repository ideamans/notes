import Dayjs from 'dayjs'

const yearMonths = []
const start = Dayjs('2024-05-01')
const nextMonth = Dayjs().add(1, 'month')
for (let ym = start; ym.isBefore(nextMonth); ym = ym.add(1, 'month')) {
  yearMonths.push({
    year: ym.format('YYYY'),
    month: ym.format('MM')
  })
}

export default {
  paths() {
    return yearMonths.map((ym) => ({ params: ym }))
  }
}
