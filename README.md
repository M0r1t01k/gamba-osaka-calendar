# ガンバ大阪 試合日程 iCalendar

ガンバ大阪公式サイトのトップチーム試合日程を毎日取得し、購読可能な `text/calendar` として配信する Cloudflare Workers アプリです。J1、ルヴァンカップ、天皇杯、AFC等を公式ページから対象にします。

## 初回セットアップ

1. CloudflareでWorkers KV namespaceを作成（`npx wrangler kv namespace create CALENDAR`）し、返されたIDで `wrangler.toml` の `REPLACE_WITH_KV_NAMESPACE_ID` を置き換えます。
2. `npm install` 後、`npx wrangler login`、`npm run deploy` を実行します。
3. 初回アクセス時にも取得を試みます。以後はCronを待てば自動更新されます。

CronはUTC 18:00（日本時間03:00）に実行します。失敗・HTTPエラー・抽出結果ゼロの場合はKVを更新しないため、直前の正常データを維持します。

## 購読

デプロイ後の `https://<worker>.<account>.workers.dev/calendar.ics` を、iPhone/Macのカレンダーで「照会するカレンダー」に追加してください。Google Calendarは「他のカレンダー」→「URLで追加」です。定期購読側が再取得するたびに、同一試合のUIDを使って時刻・会場変更を反映します。

## 開発

`npm test` でパーサ、UID安定性、ICS envelopeを検証できます。取得元は `https://www.gamba-osaka.net/game/index/season/2627/` です。公式HTML変更時は `src/parser.ts` とfixtureテストを更新してください。
