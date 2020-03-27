module.exports = dateRangeCalculator = (frequency, previousDate, rollsBack) => {
let dayLength = 24 * 60 * 60 * 1000
let prev = new Date(previousDate)
let prevMonth = prev.getMonth()
let prevYear = prev.getFullYear()
let nbDaysBeforeNextDate
let counterData = {'once': 1,'twice': 2,'three times': 3,'four times': 4,'five times': 5,'six times': 6}
let periodData = {'a day': 1,'a week': 7,'every two weeks': 14,'a month': 30,'a year': prevYear % 400 === 0 || (prevYear % 100 !== 0 && prevYear % 4 === 0) ? 366 : 365}
if( frequency.period === 'a month'){
   nbDaysBeforeNextDate = new Date(prevYear, prevMonth + 1, 0).getDate() 
} else {
   let counter = counterData[frequency.counter]    
   let period =  periodData[frequency.period]
   nbDaysBeforeNextDate = Math.ceil(period / counter)
}

let resDate
if(!rollsBack){
   resDate = new Date(prev.getTime() + nbDaysBeforeNextDate * dayLength)
} else {
   resDate = new Date(prev.getTime() - nbDaysBeforeNextDate * dayLength)
}

return resDate
}