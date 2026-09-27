import type { Game } from './types';

const clean = (s: string) => s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&#39;/g, "'").replace(/&quot;/g, ' ').replace(/\s+/g, ' ').trim();
const esc = (s: string) => s.replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '').toLowerCase();

export function parseGames(html: string, season: string): Game[] {
  const out: Game[] = [];
  // The official page renders each match as a link/card. Keep the card boundary
  // deliberately broad so minor CSS changes do not break extraction.
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']*\/game\/[^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  for (const m of links) {
    const href = m[1].startsWith('http') ? m[1] : `https://www.gamba-osaka.net${m[1]}`;
    const start = Math.max(0, m.index! - 1800), end = Math.min(html.length, m.index! + m[0].length + 1800);
    const text = clean(html.slice(start, end));
    const date = text.match(/(20\d{2})[./年-](\d{1,2})[./月-](\d{1,2})|(?<!\d)(\d{1,2})[./月](\d{1,2})/);
    const time = text.match(/\b([01]?\d|2[0-3]):[0-5]\d\b/)?.[0];
    const side = text.includes('HOME') ? 'HOME' : text.includes('AWAY') ? 'AWAY' : 'UNKNOWN';
    const comp = text.match(/(明治安田[^ ]*J1[^ ]*|Jリーグ[^ ]*ルヴァン[^ ]*|天皇杯|AFC[^ ]*|ACL[^ ]*)/)?.[1] || '公式戦';
    const round = text.match(/(第\d+節|\bMD\d+\b|\d+回戦|ラウンド\d+)/)?.[1];
    const versus = text.match(/(?:vs\.?|VS\.?|対戦)\s*([\p{L}\p{N}ー・ー＆&\- ]{2,30})/u)?.[1]?.trim();
    const venue = text.match(/＠\s*([^ ]{2,30})/)?.[1];
    if (!date && !versus) continue;
    const dateIso = date ? (date[1] ? `${date[1]}-${date[2].padStart(2,'0')}-${date[3].padStart(2,'0')}` : `${season.slice(0,2) === '26' ? '2026' : '20'+season.slice(0,2)}-${date[4].padStart(2,'0')}-${date[5].padStart(2,'0')}`) : undefined;
    // Official match detail links are the best stable identity. Fall back to
    // competition/round/date only when a card has no detail link.
    const detailId = href.match(/\/game\/[^/?#]+(?:\/[^/?#]+)*/i)?.[0];
    const key = detailId ? `${season}:${detailId}` : [season, esc(comp), esc(round || ''), dateIso || 'tbd', side].join(':');
    if (!out.some(g => g.uid === key)) out.push({uid: `${key}@gamba-calendar`, season, competition: comp, round, date: dateIso, time, opponent: versus, venue, homeAway: side as Game['homeAway'], url: href});
  }
  return out;
}
