export type Game = {
  uid: string; season: string; competition: string; round?: string; date?: string;
  time?: string; opponent?: string; venue?: string; homeAway: 'HOME'|'AWAY'|'UNKNOWN';
  url?: string; status?: string;
};
