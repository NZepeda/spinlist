import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { functions } from "@/lib/inngest";

/** API route handlers for the Inngest job queue */
export const { GET, POST, PUT } = serve({ client: inngest, functions });
