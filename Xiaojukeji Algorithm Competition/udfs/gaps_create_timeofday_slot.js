/**
 * Create timeofday_slot field from timeslot in gaps table.
 *
 * @param {{district_id: integer, timeslot: string, sum_price: float, avg_price: float,
            gap: integer}} r
 * @param function({{district_id: integer, timeslot: string, sum_price: float, avg_price: float,
                     gap: integer, timeofday_slot: integer}}) emitFn
 */
function gaps_create_timeofday_slot(r, emitFn) {
  var t = r.timeslot.split('-');
  r.timeofday_slot = parseInt(t[3]);
  emitFn(r);
}

bigquery.defineFunction(
  'gaps_create_timeofday_slot',                           // Name of the function exported to SQL
  ['district_id', 'timeslot', 'sum_price', 'avg_price', 'gap'],
  [
    {'name': 'district_id', 'type': 'integer'},
    {'name': 'timeslot', 'type': 'string'},
    {'name': 'sum_price', 'type': 'float'},
    {'name': 'avg_price', 'type': 'float'},
    {'name': 'gap', 'type': 'integer'},
    {'name': 'timeofday_slot', 'type': 'integer'}
  ],                    // Names of input columns
  gaps_create_timeofday_slot                       // Reference to JavaScript UDF
);