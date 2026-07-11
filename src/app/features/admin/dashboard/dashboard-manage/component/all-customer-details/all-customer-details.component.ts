import { Component, ElementRef, ViewChild } from '@angular/core';
import { AdminDashboardService } from '../../services/admin-dashboard.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import * as XLSX from 'xlsx';
import { DatePipe } from '@angular/common';
import { DeviceManageService } from 'src/app/features/admin/device/device-manage/service/device-manage.service';

@Component({
  selector: 'app-all-customer-details',
  templateUrl: './all-customer-details.component.html',
  styleUrls: ['./all-customer-details.component.scss'],
})
export class AllCustomerDetailsComponent {
  @ViewChild('TABLE', { static: false }) table: ElementRef | any;
  selectDealer: any;
  resellerData: any = {
    All: 0,
    Stop: 0,
    Idle: 0,
    Running: 0,
    Offline: 0,
    NoData: 0,
  };
  page = 1;
  count = 0;
  tableSize = 100;
  tableSizes = [50, 100, 250, 500, 1000];
  type = 'All';
  columns: any;
  resellerValue: any[] = [];
  allVehicles: any[] = [];
  dealerName: any;
  selectedType: any;
  excelData: any;
  noDataCount: any[] = [];
  searchKeyword: string = '';
  spinnerLoading = false;
  deviceTypeMap: Map<number, string> = new Map();

  constructor(
    private adminDashboardService: AdminDashboardService,
    private bsModalService: BsModalService,
    private datePipe: DatePipe,
    private deviceManageService: DeviceManageService
  ) {}

  ngOnInit() {
    this.setInitialValue();
    this.loadDeviceTypes();
    this.loadVehicleList();
  }

  setInitialValue() {
    this.columns = [
      { key: '', title: 'Status' },
      { key: '', title: 'Installation' },
      { key: '', title: 'Point Recharge' },
      { key: '', title: 'Customer Recharge' },
      { key: '', title: 'Vehicle No' },
      { key: '', title: 'Type' },
      { key: '', title: 'DeviceId' },
      { key: '', title: 'IMEI' },
      { key: '', title: 'SIM Phone' },
      { key: '', title: 'Last Update' },
    ];
  }

  loadDeviceTypes() {
    this.deviceManageService.getDeviceTypes().subscribe((res: any) => {
      if (res?.body?.result === true) {
        const deviceTypes = res?.body?.data || [];
        this.deviceTypeMap.clear();
        deviceTypes.forEach((type: any) => {
          if (type?.id != null) {
            this.deviceTypeMap.set(Number(type.id), type.name || '');
          }
        });
      }
    });
  }

  getDeviceTypeName(deviceTypeId: any): string {
    if (deviceTypeId == null || deviceTypeId === '') {
      return '';
    }
    const id = typeof deviceTypeId === 'number' ? deviceTypeId : parseInt(deviceTypeId, 10);
    if (Number.isNaN(id)) {
      return String(deviceTypeId);
    }
    return this.deviceTypeMap.get(id) || '';
  }

  loadVehicleList() {
    this.spinnerLoading = true;
    this.adminDashboardService.vehicleList().subscribe({
      next: (res: any) => {
        this.spinnerLoading = false;
        const rawData = this.extractVehicleList(res);
        this.allVehicles = rawData.map((item: any) => this.mapVehicleRow(item));
        this.updateStatusCounts();
        this.applyStatusFilter('All');
      },
      error: () => {
        this.spinnerLoading = false;
        this.allVehicles = [];
        this.resellerValue = [];
        this.updateStatusCounts();
      },
    });
  }

  private extractVehicleList(res: any): any[] {
    if (res?.body?.result === true && res?.body?.data) {
      return Array.isArray(res.body.data) ? res.body.data : [res.body.data];
    }
    if (Array.isArray(res?.body)) {
      return res.body;
    }
    if (Array.isArray(res?.body?.data)) {
      return res.body.data;
    }
    if (Array.isArray(res?.body?.Result?.Data)) {
      return res.body.Result.Data;
    }
    return [];
  }

  private mapVehicleRow(item: any) {
    // Already in old VehicleList/Reseller format
    if (item?.Device || item?.Customer) {
      const status = this.resolveLegacyStatus(item);
      return {
        ...item,
        Status: status.Status,
        SubStatus: status.SubStatus,
        neverConnected: status.neverConnected,
        statusKey: status.statusKey,
      };
    }

    const statusStr = (item?.position?.status?.status || 'offline').toLowerCase();
    const statusMap: any = {
      running: { Status: 1, SubStatus: 1, statusKey: 'Running' },
      stop: { Status: 1, SubStatus: 2, statusKey: 'Stop' },
      dormant: { Status: 1, SubStatus: 3, statusKey: 'Idle' },
      idle: { Status: 1, SubStatus: 3, statusKey: 'Idle' },
      offline: { Status: 0, SubStatus: 0, statusKey: 'Offline' },
      'never connected': { Status: 0, SubStatus: 0, statusKey: 'NoData', neverConnected: true },
      'point expired': { Status: 0, SubStatus: 0, statusKey: 'Offline' },
    };
    const statusInfo = statusMap[statusStr] || { Status: 0, SubStatus: 0, statusKey: 'Offline' };
    const neverConnected = statusStr === 'never connected' || statusInfo.neverConnected === true;
    const lastUpdate =
      item?.position?.deviceTime ||
      item?.position?.servertime ||
      item?.position?.serverTime ||
      null;

    const customer = item?.customer || item?.Customer || {};
    const device = item?.device || {};
    const validity = item?.validity || {};
    const fkDeviceType =
      device?.fkDeviceType ||
      device?.deviceTypeId ||
      device?.DeviceTypeId ||
      device?.deviceType ||
      null;

    return {
      Customer: {
        CustomerName:
          customer?.customerName ||
          customer?.CustomerName ||
          customer?.name ||
          customer?.Name ||
          '',
        ContactNumber:
          customer?.contactNumber ||
          customer?.ContactNumber ||
          customer?.mobile ||
          customer?.Mobile ||
          '',
      },
      Device: {
        VehicleNo: device?.vehicleNo || device?.VehicleNo || '',
        DeviceId: device?.deviceId || device?.DeviceId || device?.deviceUid || '',
        DeviceImei: device?.deviceImei || device?.DeviceImei || device?.deviceId || '',
        SimPhoneNumber:
          device?.primaryNo ||
          device?.PrimaryNo ||
          item?.primaryNo ||
          item?.PrimaryNo ||
          device?.simPhoneNumber ||
          device?.SimPhoneNumber ||
          '',
        InstallationDate:
          device?.installationOn ||
          device?.InstallationDate ||
          validity?.installationOn ||
          null,
        VehicleType: device?.vehicleType || device?.VehicleType || device?.fkVehicleType || 0,
        fkDeviceType,
        Id: device?.id || device?.Id || 0,
      },
      PointValidity: {
        NextRechargeDue: validity?.nextRechargeDate || validity?.NextRechargeDue || null,
        CustomerRechargeDue:
          validity?.customerRechargeDate || validity?.CustomerRechargeDue || null,
      },
      Eventdata: {
        Timestamp: lastUpdate,
        Latitude: item?.position?.latitude || 0,
        Longitude: item?.position?.longitude || 0,
        Speed: item?.position?.speed || 0,
      },
      Status: statusInfo.Status,
      SubStatus: statusInfo.SubStatus,
      neverConnected,
      statusKey: neverConnected ? 'NoData' : statusInfo.statusKey,
      StatusDuration: item?.position?.status?.duration || '',
      _original: item,
    };
  }

  private resolveLegacyStatus(item: any) {
    if (item?.Status === 1 && item?.SubStatus === 1) {
      return { Status: 1, SubStatus: 1, statusKey: 'Running', neverConnected: false };
    }
    if (item?.Status === 1 && item?.SubStatus === 2) {
      return { Status: 1, SubStatus: 2, statusKey: 'Stop', neverConnected: false };
    }
    if (item?.Status === 1 && item?.SubStatus === 3) {
      return { Status: 1, SubStatus: 3, statusKey: 'Idle', neverConnected: false };
    }
    const duration = item?.StatusDuration || '';
    if (item?.Status === 0 && (!duration || String(duration).startsWith('Never'))) {
      return { Status: 0, SubStatus: 0, statusKey: 'NoData', neverConnected: true };
    }
    return { Status: 0, SubStatus: 0, statusKey: 'Offline', neverConnected: false };
  }

  private updateStatusCounts() {
    const running = this.allVehicles.filter((v) => v.statusKey === 'Running');
    const stop = this.allVehicles.filter((v) => v.statusKey === 'Stop');
    const idle = this.allVehicles.filter((v) => v.statusKey === 'Idle');
    const offline = this.allVehicles.filter((v) => v.statusKey === 'Offline');
    this.noDataCount = this.allVehicles.filter(
      (v) => v.statusKey === 'NoData' || v.neverConnected
    );

    this.resellerData = {
      All: this.allVehicles.length,
      Running: running.length,
      Stop: stop.length,
      Idle: idle.length,
      Offline: offline.length,
      NoData: this.noDataCount.length,
    };
  }

  onStatusClick(_value: any, type: any) {
    this.applyStatusFilter(type);
  }

  private applyStatusFilter(type: any) {
    this.type = type;
    this.page = 1;
    this.searchKeyword = '';

    if (type === 'NoData') {
      this.resellerValue = this.allVehicles.filter(
        (v) => v.statusKey === 'NoData' || v.neverConnected
      );
    } else if (type === 'All') {
      this.resellerValue = [...this.allVehicles];
    } else {
      this.resellerValue = this.allVehicles.filter((v) => v.statusKey === type);
    }
  }

  getFilteredRows(): any[] {
    if (!this.resellerValue) {
      return [];
    }
    if (!this.searchKeyword?.trim()) {
      return this.resellerValue;
    }
    const keyword = this.searchKeyword.toLowerCase().trim();
    return this.resellerValue.filter((item: any) =>
      JSON.stringify(item).toLowerCase().includes(keyword)
    );
  }

  onTableDataChange(event: any) {
    this.page = event;
  }

  onTableSizeChange(event: any): void {
    this.tableSize = event.target.value;
    this.page = 1;
  }

  cancel() {
    this.bsModalService.hide();
  }

  onCheckVehicleDevice(device: any) {
    if (device?.Device?.VehicleType == 1) {
      if (device?.Status === 1 && device?.SubStatus === 1) {
        return 'assets/drawable/rp_marker_car_green.png';
      } else if (device?.Status === 1 && device?.SubStatus === 2) {
        return 'assets/drawable/rp_marker_car_blue.png';
      } else if (device?.Status === 1 && device?.SubStatus === 3) {
        return 'assets/drawable/rp_marker_car_yellow.png';
      } else if (device?.Status === 0) {
        return 'assets/drawable/rp_marker_car_gray.png';
      }
    } else if (device?.Device?.VehicleType == 2) {
      if (device?.Status === 1 && device?.SubStatus === 1) {
        return 'assets/drawable/rp_marker_bus_green.png';
      } else if (device?.Status === 1 && device?.SubStatus === 2) {
        return 'assets/drawable/rp_marker_bus_blue.png';
      } else if (device?.Status === 1 && device?.SubStatus === 3) {
        return 'assets/drawable/rp_marker_bus_yellow.png';
      } else if (device?.Status === 0) {
        return 'assets/drawable/rp_marker_bus_gray.png';
      }
    } else if (device?.Device?.VehicleType == 3) {
      if (device?.Status === 1 && device?.SubStatus === 1) {
        return 'assets/drawable/rp_marker_truck_green.png';
      } else if (device?.Status === 1 && device?.SubStatus === 2) {
        return 'assets/drawable/rp_marker_truck_blue.png';
      } else if (device?.Status === 1 && device?.SubStatus === 3) {
        return 'assets/drawable/rp_marker_truck_yellow.png';
      } else if (device?.Status === 0) {
        return 'assets/drawable/rp_marker_truck_gray.png';
      }
    } else if (device?.Device?.VehicleType == 4) {
      if (device?.Status === 1 && device?.SubStatus === 1) {
        return 'assets/drawable/rp_marker_bike_green.png';
      } else if (device?.Status === 1 && device?.SubStatus === 2) {
        return 'assets/drawable/rp_marker_bike_blue.png';
      } else if (device?.Status === 1 && device?.SubStatus === 3) {
        return 'assets/drawable/rp_marker_bike_yellow.png';
      } else if (device?.Status === 0) {
        return 'assets/drawable/rp_marker_bike_gray.png';
      }
    } else if (device?.Device?.VehicleType == 5) {
      if (device?.Status === 1 && device?.SubStatus === 1) {
        return 'assets/drawable/rp_marker_jcb_green.png';
      } else if (device?.Status === 1 && device?.SubStatus === 2) {
        return 'assets/drawable/rp_marker_jcb_blue.png';
      } else if (device?.Status === 1 && device?.SubStatus === 3) {
        return 'assets/drawable/rp_marker_jcb_yellow.png';
      } else if (device?.Status === 0) {
        return 'assets/drawable/rp_marker_jcb_gray.png';
      }
    } else if (device?.Device?.VehicleType == 6) {
      if (device?.Status === 1 && device?.SubStatus === 1) {
        return 'assets/drawable/rp_marker_lifter_green.png';
      } else if (device?.Status === 1 && device?.SubStatus === 2) {
        return 'assets/drawable/rp_marker_lifter_blue.png';
      } else if (device?.Status === 1 && device?.SubStatus === 3) {
        return 'assets/drawable/rp_marker_lifter_yellow.png';
      } else if (device?.Status === 0) {
        return 'assets/drawable/rp_marker_lifter_gray.png';
      }
    } else if (device?.Device?.VehicleType == 7) {
      if (device?.Status === 1 && device?.SubStatus === 1) {
        return 'assets/drawable/rp_marker_loader_green.png';
      } else if (device?.Status === 1 && device?.SubStatus === 2) {
        return 'assets/drawable/rp_marker_loader_blue.png';
      } else if (device?.Status === 1 && device?.SubStatus === 3) {
        return 'assets/drawable/rp_marker_loader_yellow.png';
      } else if (device?.Status === 0) {
        return 'assets/drawable/rp_marker_loader_gray.png';
      }
    } else if (device?.Device?.VehicleType == 8) {
      if (device?.Status === 1 && device?.SubStatus === 1) {
        return 'assets/drawable/rp_marker_marker_green.png';
      } else if (device?.Status === 1 && device?.SubStatus === 2) {
        return 'assets/drawable/rp_marker_marker_blue.png';
      } else if (device?.Status === 1 && device?.SubStatus === 3) {
        return 'assets/drawable/rp_marker_marker_yellow.png';
      } else if (device?.Status === 0) {
        return 'assets/drawable/rp_marker_marker_gray.png';
      }
    } else if (device?.Device?.VehicleType == 9) {
      if (device?.Status === 1 && device?.SubStatus === 1) {
        return 'assets/drawable/rp_marker_person_green.png';
      } else if (device?.Status === 1 && device?.SubStatus === 2) {
        return 'assets/drawable/rp_marker_person_blue.png';
      } else if (device?.Status === 1 && device?.SubStatus === 3) {
        return 'assets/drawable/rp_marker_person_yellow.png';
      } else if (device?.Status === 0) {
        return 'assets/drawable/rp_marker_person_gray.png';
      }
    } else if (device?.Device?.VehicleType == 10) {
      if (device?.Status === 1 && device?.SubStatus === 1) {
        return 'assets/drawable/rp_marker_pet_green.png';
      } else if (device?.Status === 1 && device?.SubStatus === 2) {
        return 'assets/drawable/rp_marker_pet_blue.png';
      } else if (device?.Status === 1 && device?.SubStatus === 3) {
        return 'assets/drawable/rp_marker_pet_yellow.png';
      } else if (device?.Status === 0) {
        return 'assets/drawable/rp_marker_pet_gray.png';
      }
    } else if (device?.Device?.VehicleType == 11) {
      if (device?.Status === 1 && device?.SubStatus === 1) {
        return 'assets/drawable/rp_marker_ship_green.png';
      } else if (device?.Status === 1 && device?.SubStatus === 2) {
        return 'assets/drawable/rp_marker_ship_blue.png';
      } else if (device?.Status === 1 && device?.SubStatus === 3) {
        return 'assets/drawable/rp_marker_ship_yellow.png';
      } else if (device?.Status === 0) {
        return 'assets/drawable/rp_marker_ship_gray.png';
      }
    } else if (device?.Device?.VehicleType == 12) {
      if (device?.Status === 1 && device?.SubStatus === 1) {
        return 'assets/drawable/rp_marker_tanker_green.png';
      } else if (device?.Status === 1 && device?.SubStatus === 2) {
        return 'assets/drawable/rp_marker_tanker_blue.png';
      } else if (device?.Status === 1 && device?.SubStatus === 3) {
        return 'assets/drawable/rp_marker_tanker_yellow.png';
      } else if (device?.Status === 0) {
        return 'assets/drawable/rp_marker_tanker_gray.png';
      }
    } else if (device?.Device?.VehicleType == 13) {
      if (device?.Status === 1 && device?.SubStatus === 1) {
        return 'assets/drawable/geen_taxi_f.png';
      } else if (device?.Status === 1 && device?.SubStatus === 2) {
        return 'assets/drawable/blue_taxi_f.png';
      } else if (device?.Status === 1 && device?.SubStatus === 3) {
        return 'assets/drawable/yellow_taxi_f.png';
      } else if (device?.Status === 0) {
        return 'assets/drawable/gray_taxi_f.png';
      }
    } else if (device?.Device?.VehicleType == 14) {
      if (device?.Status === 1 && device?.SubStatus === 1) {
        return 'assets/drawable/rp_marker_tractor_green.png';
      } else if (device?.Status === 1 && device?.SubStatus === 2) {
        return 'assets/drawable/rp_marker_tractor_blue.png';
      } else if (device?.Status === 1 && device?.SubStatus === 3) {
        return 'assets/drawable/rp_marker_tractor_yellow.png';
      } else if (device?.Status === 0) {
        return 'assets/drawable/rp_marker_tractor_gray.png';
      }
    }
    return 'assets/drawable/rp_marker_car_gray.png';
  }

  formatDate(date: string | null, format: string = 'yyyy-MM-dd'): string {
    return date ? this.datePipe.transform(date, format) || '' : '';
  }

  exportToExcels() {
    const rows = this.getFilteredRows() || [];
    this.excelData = rows.map((item: any) => {
      return {
        Installation: this.formatDate(item?.Device?.InstallationDate),
        'Point Recharge': this.formatDate(item?.PointValidity?.NextRechargeDue),
        'Customer Recharge': this.formatDate(item?.PointValidity?.CustomerRechargeDue),
        'Vehicle No': item?.Device?.VehicleNo,
        Type: this.getDeviceTypeName(item?.Device?.fkDeviceType) || item?.Device?.DeviceTypeMeta?.Name || '',
        DeviceId: item?.Device?.DeviceId,
        IMEI: item?.Device?.DeviceImei,
        'SIM Phone': item?.Device?.SimPhoneNumber,
        'Last Update': this.formatDate(item?.Eventdata?.Timestamp, 'yyyy-MM-dd HH:mm:ss'),
      };
    });
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.excelData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Device Report');
    XLSX.writeFile(wb, `Device Report.xlsx`);
  }
}
