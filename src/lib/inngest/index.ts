import { backfillMusicBrainzData } from "@/lib/inngest/functions/backfillMusicBrainzData";

/** All Inngest functions registered with the serve handler. */
export const functions = [backfillMusicBrainzData];
