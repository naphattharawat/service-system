export type Role = "admin" | "staff";

export interface SessionUser {
  user: string;
  role: Role;
  name: string;
}

export interface Job {
  idNum: number;
  id: string;
  status: string;
  timestamp: number;
  prefix: string;
  name: string;
  lastname: string;
  fullName: string;
  group: string;
  department: string;
  jobType: string;
  orderDate: string;
  detail: string;
  fileUrl: string;
  needDate: string;
  phone: string;
  owner: string;
  note: string;
}

export interface JobSearchResult {
  id: string;
  name: string;
  group: string;
  department: string;
  type: string;
  orderDate: string;
  detail: string;
  fileUrl: string;
  needDate: string;
  phone: string;
  status: string;
  owner: string;
  note: string;
}

export interface SubmitFilePayload {
  data: string; // base64, no data: prefix
  name: string;
  type: string;
}

export interface SubmitServicePayload {
  prefix: string;
  name: string;
  lastname: string;
  group: string;
  department: string;
  type: string;
  orderDate: string;
  detail: string;
  needDate: string;
  phone: string;
  files?: SubmitFilePayload[];
}

export interface ResourceLineItem {
  name?: string;
  qty?: string;
  color?: string;
  size?: string;
}

export interface UpdateJobPayload {
  id: string;
  status?: string;
  owner?: string;
  note?: string;
  doneDate?: string;
  resources?: ResourceLineItem[];
}

export interface AppUser {
  user: string;
  role: Role;
  name: string;
  active: boolean;
}

export interface ResourceUsageRow {
  jobId: string;
  jobOwner: string;
  doneDate: string;
  name: string;
  qty: string;
  color: string;
  size: string;
}

export interface SystemStatus {
  open: boolean;
  holiday: boolean;
  holidayName: string;
}
