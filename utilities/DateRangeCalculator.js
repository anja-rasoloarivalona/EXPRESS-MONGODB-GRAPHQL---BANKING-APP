module.exports = dateRangeCalculator = (frequency, previousDate) => {
let counterData = {
        'once': 1,
        'twice': 2,
        'three times': 3,
        'four times': 4,
        'five times': 5,
        'six times': 6
}
    
let periodData = {
        'a day': 1,
        'a week': 7,
        'every two weeks': 14,
        'a month': 30,
        'a year': 365
}

let counter = counterData[frequency.counter]    
let period =  periodData[frequency.period]
let nbDaysBeforeNextDate = Math.ceil(period / counter)

let prevDate = new Date(previousDate)
let nextDate = new Date(prevDate.getTime() + nbDaysBeforeNextDate * 24 * 60 * 60 * 1000)
return nextDate

}