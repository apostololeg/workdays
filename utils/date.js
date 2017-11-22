export const addDays = (_date, days) => {
  let date = new Date(_date.valueOf())

  date.setDate(date.getDate() + days);

  return date
}

export const getDatesList = (from, to) => {
  let dateArray = new Array();
  let currentDate = from

  while (currentDate <= to) {
    dateArray.push(currentDate);
    currentDate = addDays(currentDate, 1);
  }

  return dateArray
}
