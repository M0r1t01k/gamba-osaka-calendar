import type { Game } from './types';
const fold = (s: string) => s.replace(/[\\;,]/g, m => `\\${m}`).replace(/\r?\n/g, '\\n');
const dt = (g: Game) => g.date ? `${g.date.replace(/-/g,'')}${g.time ? 'T'+g.time.replace(':','')+'00' : ''}` : undefined;
export function toIcs(games: Game[], now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z/,'Z');
  const body = games.map(g => {
    const start = dt(g), lines = [`UID:${g.uid}`,`DTSTAMP:${stamp}`,'SEQUENCE:0','STATUS:CONFIRMED',`SUMMARY:${fold(`ガンバ大阪 ${g.homeAway === 'AWAY' ? '@' : 'vs'} ${g.opponent || '対戦相手未定'}`)}`,`DESCRIPTION:${fold([g.competition,g.round,g.homeAway,g.url].filter(Boolean).join(' / '))}`];
    if (start) {
      lines.push(`DTSTART;TZID=Asia/Tokyo:${start}`);
      if (g.time) lines.push(`DURATION:PT2H`); else lines.push(`DURATION:P1D`);
    } else lines.push('DTSTART;VALUE=DATE:19700101','DTEND;VALUE=DATE:19700102');
    if (g.venue) lines.push(`LOCATION:${fold(g.venue)}`);
    return 'BEGIN:VEVENT\r\n'+lines.join('\r\n')+'\r\nEND:VEVENT';
  }).join('\r\n');
  return `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Gamba Osaka Calendar//JP\r\nCALSCALE:GREGORIAN\r\nX-WR-CALNAME:ガンバ大阪 試合日程\r\n${body}\r\nEND:VCALENDAR\r\n`;
}
