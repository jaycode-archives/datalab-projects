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
 * Transform timestamps of weather table into timeslots in weather table.
 *
 * @param {{time: string, weather: integer, temperature: float, pm25: float}} r
 * @param function({{time: string, weather: integer, temperature: float, pm25: float,
                     timeslot: string}}) emitFn
 */
function transform_weather_time(r, emitFn) {
  var t = r.time.split(/[ :\-]/);
  var slot = Math.floor((parseInt(t[3]) * 60 + parseInt(t[4])) / 10) + 1;
  r.timeslot = t[0] + '-' + pad(t[1], 2) +
               '-' + pad(t[2], 2) + '-' + slot;
  emitFn(r);
}

bigquery.defineFunction(
  'transform_weather_time',                           // Name of the function exported to SQL
  ['time', 'weather', 'temperature', 'pm25'],
  [
    {'name': 'time', 'type': 'string'},
    {'name': 'weather', 'type': 'integer'},
    {'name': 'temperature', 'type': 'float'},
    {'name': 'pm25', 'type': 'float'},
    {'name': 'timeslot', 'type': 'string'}
  ],                    // Names of input columns
  transform_weather_time                       // Reference to JavaScript UDF
);