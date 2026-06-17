export const ROSTER_EXCHANGE = 'nurses.roster';
export const ROSTER_GENERATE_ROUTING_KEY = 'roster.generate';
export const ROSTER_GENERATE_QUEUE = 'roster.generate.q';

export interface RosterGenerateMessage {
  jobId: string;
  periodId: string;
}
