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
 * Transform timestamps of weather table into timeslots in traffic table.
 *
 * @param {{district_hash: string, tj_level1: integer, tj_level2: integer, tj_level3: integer, 
            tj_level4: integer, tj_time: string}} r
 * @param function({{district_hash: string, tj_level1: integer, tj_level2: integer, tj_level3: integer, 
                     tj_level4: integer, tj_time: string, timeslot: string}}) emitFn
 */
function transform_traffic_time(r, emitFn) {
  var t = r.tj_time.split(/[ :\-]/);
  var slot = Math.floor((parseInt(t[3]) * 60 + parseInt(t[4])) / 10) + 1;
  r.timeslot = t[0] + '-' + pad(t[1], 2) +
               '-' + pad(t[2], 2) + '-' + slot;
  emitFn(r);
}

bigquery.defineFunction(
  'transform_traffic_time',                           // Name of the function exported to SQL
  ['district_hash', 'tj_level1', 'tj_level2', 'tj_level3', 'tj_level4', 'tj_time'],
  [
    {'name': 'district_hash', 'type': 'string'},
    {'name': 'tj_level1', 'type': 'integer'},
    {'name': 'tj_level2', 'type': 'integer'},
    {'name': 'tj_level3', 'type': 'integer'},
    {'name': 'tj_level4', 'type': 'integer'},
    {'name': 'tj_time', 'type': 'string'},
    {'name': 'timeslot', 'type': 'string'}
  ],                    // Names of input columns
  transform_traffic_time                       // Reference to JavaScript UDF
);