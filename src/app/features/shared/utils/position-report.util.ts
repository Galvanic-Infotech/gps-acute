export interface PositionReportRow {
  slNo: number;
  vehicleNo: string;
  serverTime: any;
  fixTime: any;
  latitude: number;
  longitude: number;
  speed: number;
  gps: string;
  ignition: string;
  loc: { Lat: number; Lng: number };
}

// history API sends `details` as a JSON string
function parseDetails(details: any): any {
  if (!details) {
    return {};
  }
  if (typeof details === 'string') {
    try {
      return JSON.parse(details);
    } catch {
      return {};
    }
  }
  return details;
}

export function buildPositionReportRows(
  historyPoints: any[],
  vehicleNo: string = ''
): PositionReportRow[] {
  return (historyPoints || []).map((point: any, index: number) => {
    const details = parseDetails(point.details ?? point.Details);
    const latitude = Number(point.latitude ?? point.Latitude ?? 0);
    const longitude = Number(point.longitude ?? point.Longitude ?? 0);

    return {
      slNo: index + 1,
      vehicleNo: point.vehicleNo || point.VehicleNo || vehicleNo,
      serverTime: point.serverTime || point.ServerTime,
      fixTime: point.timestamp || point.Timestamp,
      latitude,
      longitude,
      speed: Number(point.speed ?? point.Speed ?? 0),
      gps: (point.valid ?? point.Valid) ? 'On' : 'Off',
      ignition: details.ign ? 'On' : 'Off',
      loc: { Lat: latitude, Lng: longitude },
    };
  });
}

export const POSITION_REPORT_COLUMNS = [
  'SL NO',
  'Vehicle No',
  'Server Time',
  'Fix Time',
  'Latitude',
  'Longitude',
  'Address',
  'Speed',
  'GPS',
  'Ignition',
];

// ponytail: export uses addresses already fetched on screen, lat/lng otherwise -
// geocoding every row would be thousands of API calls for a single day of data
export function buildPositionReportExportRows(
  rows: PositionReportRow[],
  addresses: string[] = []
): any[][] {
  return (rows || []).map((row, index) => [
    index + 1,
    row.vehicleNo,
    formatPositionTime(row.serverTime),
    formatPositionTime(row.fixTime),
    row.latitude,
    row.longitude,
    addresses[index] || `${row.latitude}, ${row.longitude}`,
    `${row.speed}km/hr`,
    row.gps,
    row.ignition,
  ]);
}

function formatPositionTime(value: any): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? String(value) : date.toLocaleString('en-US');
}
