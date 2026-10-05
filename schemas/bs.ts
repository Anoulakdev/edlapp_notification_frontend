export interface BsEnergyItem {
  account_no: string;
  address: string;
  customer_name: string;
  phone_no: string;
  tel: string;
  barnch: string;
  bill_date: string;
  outstaning: number;
  bill_amount: number;
  consumption: number;
  months: string;
  bill_no: string;
  bill_basic: number;
  account_status: string;
  meter_status: string;
  province_id: number;
}

export interface BsDebtItem {
  payment_no: string;
  payment_id?: string;
  payment_date?: string;
  master_id?: string;
  bill_date?: string;
  account_type: string;
  actual_amt?: number;
  bill_amount?: number;
  outstanding: number;
  payment_type: string;
  master_bill_id?: number | null;
}

export interface BsApiResponse {
  energy?: {
    statusCode?: number;
    message?: string;
    data?: BsEnergyItem[];
    errorr?: {
      message?: string;
    };
  };
  debt?: {
    statusCode?: number;
    message?: string;
    data?: BsDebtItem[];
    errorr?: {
      message?: string;
    };
  };
}

export interface ProvinceItem {
  id: number;
  province_name: string;
  province_code: string;
}
