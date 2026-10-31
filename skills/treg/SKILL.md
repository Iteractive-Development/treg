---
name: treg
description: >
  Search 4,000+ catalogued provider endpoints (SEO, SERP, backlinks, social, enrichment, ads, scraping, media generation) and call them through treg.to — one token, credentials stay on treg's servers, every answer reports what it cost.
metadata:
  author: Iteractive Development
  version: "1.0.0"
---

# treg: the tool catalog, via Enconvo

**Ask for the job, not the vendor.** treg holds the provider credentials server-side; the plugin
sends the real upstream request through `https://treg.to` and relays the provider's answer verbatim.
No provider account or key ever sits on this Mac.

## Enconvo surfaces

Local API routes (port 54535 while Enconvo runs):

| Route | Purpose | Token needed |
|---|---|---|
| `treg/catalog/search` `{q, limit?, added_within_days?, sort?}` | Find tools by job, with prices | no |
| `treg/catalog/endpoint` `{endpoint_id}` | Parameters, price, reliability, ready call line | no |
| `treg/call` `{rest, method?, query?, body?, max_cost_usd?, idempotency_key?, meta?}` | Make the real request | yes |
| `treg/balance` `{}` | Team billing and balance | yes |

Every route answers `{ok, status, treg_error, cost_usd, call_id, served_by, cache, async, body}`.
Commands `Search treg Catalog`, `Call treg Tool` and `treg Balance` wrap the same calls.
The token lives in the plugin's credentials-provider entry (`treg|credentials`) — Enconvo's
standard credential management, encrypted at rest, validated live against treg.to on save; each
command's `credentials` picker selects it, and team slug / per-call ceiling are plugin settings.

## The loop: search → get → call

```
curl -X POST localhost:54535/api/treg/catalog/search -d '{"q":"backlinks for a domain"}'
curl -X POST localhost:54535/api/treg/catalog/endpoint -d '{"endpoint_id":"treg.web.backlinks.list"}'
curl -X POST localhost:54535/api/treg/call -d '{"rest":"treg.web.backlinks.list","body":{"target":"example.com"}}'
```

- When several providers do the same job, `catalog/endpoint` lists them with measured success rate
  (`observed.ok_rate` on a sample size), median speed and price. Choose: inputs you actually hold,
  then reliability on a real sample, then price.
- For a common job, prefer the routed `treg.<capability>` tool (e.g. `treg.web.search`,
  `treg.people.email.find`): treg picks the provider, falls through on failure or miss, and bills
  only the answer it returns.
- `verdict: none` or empty results: file the need via treg's `catalog_request` instead of rephrasing.

## Money

- Call at the listed price without asking, then **report what it cost** — `cost_usd` is on every
  route answer. Before a generation task or a loop over many inputs, tell the human the expected
  total and stop before passing what they agreed to. `max_cost_usd` caps ONE call, not a loop.
- `per_result` prices scale with your `limit` or the number of targets in the body — the catalog's
  `~$/call` assumes a 20-row page.
- Failed calls (provider 4xx/5xx relayed) cost nothing. A provider failure inside a 2xx is flagged
  `treg_error`/`X-Treg-Upstream-Failed` and bills what the provider charged for the attempt.
- Repeat questions can be answered from treg's archive (`cache: hit`) at 10% — free on your own key.
- A 402 `insufficient_balance` body carries the team's balance and top-up link: team-level, report
  to the human, never forward blindly to an end user.

## Retrying without paying twice

A timeout or dropped connection may still have been answered and charged. Retry with the same
`idempotency_key` — treg returns the stored answer, charges nothing, and flags `replayed`. A new
question, even with identical parameters, gets a NEW key. Provider 4xx (other than 429): fix your
request, never retry it on another provider. After a 429 or 5xx: try the next provider of the job
and say which.

## Generation tasks (video, image, voice, music)

Asynchronous: the submission reserves the price and returns a task id; it charges only on success
and refunds on failure. The route answer carries the `X-Treg-Async` descriptor under `async`. Wait
~60 s before the first poll, then every 30–60 s; 3–6 checks per video is normal. Do other work in
between. Search `text to video` / `text to image` in the catalog to see every model with prices.

## Contacts

A found email or phone is the provider's best match, **not a confirmed one**. Only
`output.verified: true` means the mailbox was checked. Verify before anyone sends to anything;
`invalid` is dead, `accept_all` is risky, and an address the provider did not return is a guess.

## Attribution

Adapted from [treg.to/skill.md](https://treg.to/skill.md) (© Superdesign, superdesign.dev),
Apache License 2.0 with additional terms — see this plugin's LICENSE.
