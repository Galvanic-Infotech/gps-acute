export function getSpeedRange(speed: number): string {
  const bucketStart = Math.floor(speed / 5) * 5;
  return `${bucketStart} - ${bucketStart + 4}`;
}

export function buildDistanceVsSpeedRows(
  historyPoints: any[],
  vehicleName: string,
  deviceImei: string
): any[] {
  const buckets = new Map<string, { totalRecords: number; totalDistanceMeters: number }>();

  for (const point of historyPoints) {
    const speed = Number(point.speed ?? point.Speed ?? 0);
    const range = getSpeedRange(speed);
    const distance = Number(
      point.details?.distance ?? point.Details?.distance ?? 0
    );

    const bucket = buckets.get(range) ?? {
      totalRecords: 0,
      totalDistanceMeters: 0,
    };
    bucket.totalRecords += 1;
    bucket.totalDistanceMeters += distance;
    buckets.set(range, bucket);
  }

  return Array.from(buckets.entries())
    .sort(
      (a, b) =>
        Number(a[0].split(' ')[0]) - Number(b[0].split(' ')[0])
    )
    .map(([speedRange, data], index) => ({
      slNo: index + 1,
      vehicleName,
      deviceImei,
      speedRange,
      totalRecords: data.totalRecords,
      totalDistance: `${(data.totalDistanceMeters / 1000).toFixed(2)} KM`,
    }));
}
