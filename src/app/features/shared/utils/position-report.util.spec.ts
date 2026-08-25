import { buildPositionReportRows, buildPositionReportExportRows } from './position-report.util';

describe('position-report.util', () => {
  const point = {
    serverTime: '2026-08-25T00:00:31+05:30',
    vehicleNo: 'UP16FD1304',
    timestamp: '2026-08-25T00:00:22+05:30',
    latitude: 28.507235,
    longitude: 77.532623,
    valid: true,
    speed: 0,
    details: '{"ign":false,"sat":16,"vStatus":"stop"}',
  };

  it('maps history points and parses the details json string', () => {
    const [row] = buildPositionReportRows([point]);
    expect(row.vehicleNo).toBe('UP16FD1304');
    expect(row.gps).toBe('On');
    expect(row.ignition).toBe('Off');
    expect(row.loc).toEqual({ Lat: 28.507235, Lng: 77.532623 });
  });

  it('falls back to lat/lng when no address was fetched', () => {
    const rows = buildPositionReportRows([point, { ...point, details: '{"ign":true}' }]);
    const exported = buildPositionReportExportRows(rows, ['Noida, UP']);
    expect(exported[0][6]).toBe('Noida, UP');
    expect(exported[1][6]).toBe('28.507235, 77.532623');
    expect(exported[1][9]).toBe('On');
  });
});
