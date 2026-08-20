"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api } from "@/lib/api-client";
import type { AppUser, Job, SessionUser } from "@/types";

function computeNotifJobs(jobs: Job[], session: SessionUser) {
  const myWaitingJobs = jobs.filter(
    (j) => j.owner && j.owner.includes(session.name.trim()) && j.status.includes("รอ")
  );
  const unassignedJobs =
    session.role === "admin"
      ? jobs.filter((j) => j.status.includes("รอ") && (!j.owner || j.owner.trim() === "" || j.owner.trim() === "-"))
      : [];
  return { myWaitingJobs, unassignedJobs };
}

interface AdminDataContextValue {
  session: SessionUser;
  jobs: Job[];
  users: AppUser[];
  loadingJobs: boolean;
  loadingUsers: boolean;
  myWaitingJobs: Job[];
  unassignedJobs: Job[];
  systemOpen: boolean | null;
  refreshJobs: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  refreshAll: () => Promise<void>;
  setSystemOpen: (open: boolean) => Promise<void>;
}

const AdminDataContext = createContext<AdminDataContextValue | null>(null);

export function useAdminData(): AdminDataContextValue {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error("useAdminData must be used within AdminDataProvider");
  return ctx;
}

export function AdminDataProvider({ session, children }: { session: SessionUser; children: ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [systemOpen, setSystemOpenState] = useState<boolean | null>(null);

  const refreshJobs = useCallback(async () => {
    try {
      const data = await api.getJobs();
      setJobs(data);
    } catch {
      // keep last-known jobs on failure, matches legacy's silent .catch(()=>{})
    } finally {
      setLoadingJobs(false);
    }
  }, []);

  const refreshUsers = useCallback(async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch {
      // ignore, matches legacy
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshJobs(), refreshUsers()]);
  }, [refreshJobs, refreshUsers]);

  useEffect(() => {
    // Deliberately not calling refreshJobs/refreshUsers/refreshAll here: this
    // effect must not directly invoke a named function that itself contains a
    // setState call (flagged by react-hooks/set-state-in-effect), so the
    // initial fetch is inlined instead. Manual refreshes (pull-to-refresh,
    // post-save reloads, etc.) still go through the shared functions below.
    let cancelled = false;

    api
      .getJobs()
      .then((data) => {
        if (!cancelled) setJobs(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingJobs(false);
      });

    api
      .getUsers()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoadingUsers(false);
      });

    if (session.role === "admin") {
      api
        .getSystemStatus()
        .then((s) => {
          if (!cancelled) setSystemOpenState(s.open);
        })
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [session.role]);

  const setSystemOpen = useCallback(async (open: boolean) => {
    const previous = systemOpen;
    setSystemOpenState(open);
    try {
      await api.setSystemStatus(open);
    } catch (err) {
      setSystemOpenState(previous);
      throw err;
    }
  }, [systemOpen]);

  const { myWaitingJobs, unassignedJobs } = useMemo(() => computeNotifJobs(jobs, session), [jobs, session]);

  const value: AdminDataContextValue = {
    session, jobs, users, loadingJobs, loadingUsers, myWaitingJobs, unassignedJobs, systemOpen,
    refreshJobs, refreshUsers, refreshAll, setSystemOpen,
  };

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
}
