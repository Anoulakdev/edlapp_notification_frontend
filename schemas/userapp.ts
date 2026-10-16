export interface UserApp {
  user_id: number;
  username: string | null;
  phone_no: string | null;
  email: string | null;
  user_image: string | null;
  users_status: string | null;
  last_login: string | null;
  ip_address: string | null;
  role_id: number | null;
  birthday: string | null;
  province_id: number | null;
  district_id: number | null;
  village_id: number | null;
  otp_start: string | null;
  otp_end: string | null;
  otp_cycle: number | null;
  access_noti: string | null;
  created_at?: string | null;
}

export interface UserAppPaginationResponse {
  message: string;
  statusCode: number;
  data: UserApp[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
