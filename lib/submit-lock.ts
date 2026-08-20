import { Mutex } from "async-mutex";

// Guards the "read last job id -> compute next id -> append row" sequence in
// lib/jobs.ts#submitJob, replicating GAS's LockService.getScriptLock() from the
// legacy backend. Only correct because the app is deployed as a single
// always-on Node process (see the plan's deployment-target decision) — an
// in-process mutex does nothing across multiple server instances.
export const submitLock = new Mutex();
