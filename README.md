# promo-tracker

A simple Node.js background worker that monitors promo statuses on the Trojan trading terminal.

## How it works
It uses **Playwright** with a stealth plugin to intercept network traffic. Instead of parsing HTML, it listens for the specific API response from the rewards endpoint. This promo gave free $50 for 3 simple tasks.

## Setup
1. `npm install playwright-extra puppeteer-extra-plugin-stealth playwright`
2. Update `TG_TOKEN`, `CHAT_ID`, and paths in `index.js`.
3. Run with `node index.js`.

The script refreshes the page every 90 seconds and pings you on Telegram if the status changes from `unavailable`.
