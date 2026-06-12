export const MAX_REPORT_RANGE_DAYS = 7;

export function getReportRangeDayCount(fromDate: Date, toDate: Date): number {
  return Math.floor(
    (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

export function isReportDateRangeValid(fromDate: Date, toDate: Date): boolean {
  if (
    !fromDate ||
    !toDate ||
    isNaN(fromDate.getTime()) ||
    isNaN(toDate.getTime())
  ) {
    return false;
  }
  if (toDate < fromDate) {
    return false;
  }
  return getReportRangeDayCount(fromDate, toDate) <= MAX_REPORT_RANGE_DAYS;
}

export function getReportDateRangeErrorMessage(): string {
  return `Report date range cannot exceed ${MAX_REPORT_RANGE_DAYS} days. Please select a shorter period.`;
}
