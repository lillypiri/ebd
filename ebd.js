const parse = require("csv-parse/lib/sync");
const fs = require('fs');
const format = require('date-fns/format');
const holidays = parse(fs.readFileSync(__dirname + '/holidays.csv'), 'utf8');

// Work out the value of a day
// If a federal holiday exists for a given state on that day then return a partial day
function getBusinessValueForDay(date) {
  // Weekend
  if (date.getDay() % 6 === 0) return 0;

  // Check for federal holidays
  let partialDay = 1;
  const states = ['NSW', 'QLD', 'VIC', 'NAT'];
  states.forEach(state => {
    // See if this date exists as a holiday in the array
    const holiday = holidays.find(h => {
      return format(date, "YYYYMMDD") === h[0] && h[4].includes(state);
    });
    // If it does then subtract a fraction from the total business effectiveness of the day
    if (holiday) {
      partialDay -= (1 / states.length);
    }
  });
  
  return partialDay;
}

function getBusinessDays() {
  // For each day of the year, check if its a weekend (or public holiday)
  // You might need to change the year on line 37.
  let months = {};
  let lastDate;
  let currentDate;
  let ebdGoneThisMonth = 0;
  for (let i = 1; i <= 366; i++) {
    currentDate = new Date(Date.UTC(2018, 0, 1));
    currentDate.setDate(i);

    let m = currentDate.getMonth();

    // Need to track:
    // - how many ebd there are total in this month
    // - how many ebd have gone per day

    months[m] = months[m] || {
      days: [],
      ebdTotal: 0
    };

    // the running total of ebd will be the same number gone for the given day
    months[m].ebdTotal += getBusinessValueForDay(currentDate);

    if (currentDate.getFullYear() === new Date().getFullYear()) {
      months[m].days.push({
        day: i,
        date: format(currentDate, 'YYYY-MM-DD'),
        ebdGone: months[m].ebdTotal
      });
    }
  }

  const rows = [];
  Object.keys(months).forEach(m => {
    months[m].days.forEach(d => {
      rows.push({
        day: d.day,
        date: d.date,
        ebdGone: d.ebdGone,
        ebdTotal: months[m].ebdTotal
      });
    });
  });

  return rows;
}

function round(number) {
  return Math.floor(number * 100) / 100;
}

// Output the csv data
const CSV = [['day_number', 'date', 'ebd_gone_for_month', 'ebd_total_for_month']].concat(getBusinessDays().map(row => {
  return [row.day, row.date, round(row.ebdGone), round(row.ebdTotal)].join(',');
})).join('\n');

fs.writeFileSync(__dirname + '/output-ebd.csv', CSV, 'utf8');