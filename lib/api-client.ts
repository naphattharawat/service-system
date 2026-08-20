"use client";

import type {
  AppUser,
  Job,
  JobSearchResult,
  Role,
  ResourceUsageRow,
  SessionUser,
  SubmitServicePayload,
  SystemStatus,
  UpdateJobPayload,
} from "@/types";

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = (data && (data as { error?: string }).error) || "เกิดข้อผิดพลาด";
    throw new Error(message);
  }
  return data as T;
}

export interface LoginResponse {
  success: boolean;
  user?: string;
  role?: Role;
  name?: string;
}

export interface ChangeProfileResponse {
  success: boolean;
  msg?: string;
}

export const api = {
  getJobs: () => request<Job[]>("/api/jobs"),
  submitJob: (payload: SubmitServicePayload) =>
    request<{ id: number; fileUrl: string }>("/api/jobs", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateJob: (id: string, payload: Omit<UpdateJobPayload, "id">) =>
    request<{ success: boolean }>(`/api/jobs/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
  searchJob: (q: string) =>
    request<JobSearchResult | null>(`/api/jobs/search?q=${encodeURIComponent(q)}`),

  login: (u: string, p: string) =>
    request<LoginResponse>("/api/auth/login", { method: "POST", body: JSON.stringify({ u, p }) }),
  logout: () => request<{ success: boolean }>("/api/auth/logout", { method: "POST" }),
  session: () => request<SessionUser | null>("/api/auth/session"),
  changeProfile: (body: { oldPw: string; newPw?: string; newUser?: string }) =>
    request<ChangeProfileResponse>("/api/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  getUsers: () => request<AppUser[]>("/api/users"),
  addUser: (user: string, pass: string, role: Role, name: string) =>
    request<{ success: boolean }>("/api/users", {
      method: "POST",
      body: JSON.stringify({ user, pass, role, name }),
    }),
  toggleUserStatus: (user: string, currentStatus: boolean) =>
    request<{ success: boolean }>(`/api/users/${encodeURIComponent(user)}`, {
      method: "PATCH",
      body: JSON.stringify({ currentStatus }),
    }),
  deleteUser: (user: string) =>
    request<{ success: boolean }>(`/api/users/${encodeURIComponent(user)}`, {
      method: "DELETE",
    }),

  getResources: () => request<ResourceUsageRow[]>("/api/resources"),
  getResourceList: () => request<string[]>("/api/resources/items"),
  addResourceItem: (name: string) =>
    request<{ success: boolean }>("/api/resources/items", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  deleteResourceItem: (name: string) =>
    request<{ success: boolean }>(`/api/resources/items?name=${encodeURIComponent(name)}`, {
      method: "DELETE",
    }),

  getSystemStatus: () => request<SystemStatus>("/api/system-status"),
  setSystemStatus: (open: boolean) =>
    request<{ open: boolean }>("/api/system-status", {
      method: "PATCH",
      body: JSON.stringify({ open }),
    }),
};
