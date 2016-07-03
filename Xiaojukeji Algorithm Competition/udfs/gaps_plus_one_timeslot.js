// Use this when testing
// %%javascript

/**
 * Pad with 0 or given string.
 *
 * @param int n Number to add padding to.
 * @param int width Width of number + padding.
 * @param string z (Optional) Other string to replace '0' as padding.
 */
function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

/**
 * Add one timeslot and adjust other relevant tables.
 *
 * @param {{district_id: integer, timeslot: string, date: string, day_in_week: integer,
            timeofday_slot: integer, sum_price: float, avg_price: float, gap: integer}} r
 * @param function({{district_id: integer, timeslot: string, date: string, day_in_week: integer,
                timeofday_slot: integer, sum_price: float, avg_price: float, gap: integer,
                timeslot_original: string}}) emitFn
 */
function gaps_plus_one_timeslot(r, emitFn) {
  
  var t = r.timeslot.split(/-/);
  var oldslot = parseInt(t[3]);
  var newslot = oldslot + 1;
  var d = new Date(parseInt(t[0]), parseInt(t[1])-1, parseInt(t[2]));
  if (oldslot == 144) {
    newslot = 1;
    d = new Date(d.setDate(d.getDate() + 1));
    r.day_in_week = d.getDay();
    r.date = d.getFullYear() + '-' + pad(d.getMonth()+1, 2) +
             '-' + pad(d.getDate(), 2);
  }
  
  r.timeslot_original = r.timeslot;

  r.timeslot = d.getFullYear() + '-' + pad(d.getMonth()+1, 2) +
               '-' + pad(d.getDate(), 2) + '-' + newslot;

  r.timeofday_slot = newslot;
  emitFn(r);
}


// For testing (without `new Date()` after date added by 1 setDate returns milliseconds)

// var test_row = {
//   district_id: 1,
//   timeslot: '2016-01-22-144',
//   date: '2016-01-22',
//   day_in_week: 5,
//   timeofday_slot: 144,
//   sum_price: 0.0,
//   avg_price: 0.0,
//   gap: 11
// };

// function emitter(r) {
//   for (var p in r) {
//     element.append(p + '=' + r[p] + '<br>');
//   }
// }

// udf(test_row, emitter);

bigquery.defineFunction(
  'gaps_plus_one_timeslot',                           // Name of the function exported to SQL
  ['district_id', 'timeslot', 'date', 'day_in_week', 'timeofday_slot', 'sum_price', 'avg_price', 'gap'],
  [
    {'name': 'district_id', 'type': 'integer'},
    {'name': 'timeslot', 'type': 'string'},
    {'name': 'date', 'type': 'string'},
    {'name': 'day_in_week', 'type': 'integer'},
    {'name': 'timeofday_slot', 'type': 'integer'},
    {'name': 'sum_price', 'type': 'float'},
    {'name': 'avg_price', 'type': 'float'},
    {'name': 'gap', 'type': 'integer'},
    {'name': 'timeslot_original', 'type': 'string'}
  ],                    // Names of input columns
  gaps_plus_one_timeslot                       // Reference to JavaScript UDF
);