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
 * Create additional fields on orders table for gaps table creation.
 *
 * @param {{order_id: string, driver_id: string, passenger_id: string,
            start_district_hash: string, dest_district_hash: string, price: float,
            time: string}} r
 * @param function({{order_id: string, driver_id: string, passenger_id: string,
                     start_district_hash: string, dest_district_hash: string, price: float,
                     time: string, timeslot: string, timeofday_slot: integer, day_in_week: integer,
                     date: string}}) emitFn
 */
function orders_create_additional_fields(r, emitFn) {
  var t = r.time.split(/[ :\-]/);
  var slot = Math.floor((parseInt(t[3]) * 60 + parseInt(t[4])) / 10) + 1;
  r.timeslot = t[0] + '-' + pad(t[1], 2) +
               '-' + pad(t[2], 2) + '-' + slot;
  r.timeofday_slot = slot;
  r.date = t[0] + '-' + pad(t[1], 2) + '-' + pad(t[2], 2);
  r.day_in_week = new Date(parseInt(t[0]), parseInt(t[1])-1, parseInt(t[2])).getDay();
  emitFn(r);
}

bigquery.defineFunction(
  'orders_create_additional_fields',                           // Name of the function exported to SQL
  ['order_id', 'driver_id', 'passenger_id', 'start_district_hash', 'dest_district_hash', 'price',
   'time'],
  [
    {'name': 'order_id', 'type': 'string'},
    {'name': 'driver_id', 'type': 'string'},
    {'name': 'passenger_id', 'type': 'string'},
    {'name': 'start_district_hash', 'type': 'string'},
    {'name': 'dest_district_hash', 'type': 'string'},
    {'name': 'price', 'type': 'float'},
    {'name': 'time', 'type': 'string'},
    {'name': 'timeslot', 'type': 'string'},
    {'name': 'timeofday_slot', 'type': 'integer'},
    {'name': 'day_in_week', 'type': 'integer'},
    {'name': 'date', 'type': 'string'}
  ],                    // Names of input columns
  orders_create_additional_fields                       // Reference to JavaScript UDF
);