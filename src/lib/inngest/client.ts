import { Inngest } from "inngest";

/** Shared Inngest client instance used across all functions and event sends. */
export const inngest = new Inngest({ id: "spinlist" });
