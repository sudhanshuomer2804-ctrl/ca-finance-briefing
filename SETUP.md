# CA Finance Briefing — Android/PWA

## What is included
- Installable PWA for Android/Chrome
- 5-story briefing UI
- India + global coverage
- CA/tax/accounting + markets + India business/economy categories
- Google Apps Script backend
- Google Sheet storage
- Service worker
- Push-notification foundation

## 1. Create the Google Sheet backend
1. Open Google Sheets and create a blank spreadsheet named `CA Finance Briefing`.
2. Extensions → Apps Script.
3. Replace the default script with `Code.gs`.
4. Save.
5. Run `setup()` once and authorise the script.
6. Deploy → New deployment → Web app.
7. Execute as: Me.
8. Who has access: Anyone.
9. Copy the `/exec` URL.

## 2. Connect the PWA
Open `index.html` from a hosted HTTPS site, open Settings, paste the Web App URL, and Save.

Important: a PWA must be served over HTTPS (localhost is also allowed during development). Opening the HTML directly as a `file://` page will not provide full PWA functionality.

## 3. Install on Android
Chrome → open the HTTPS app URL → menu → Install app / Add to Home screen.

## 4. Notifications
The included service worker supports push events, but a browser/PWA cannot reliably create a new daily background push by itself. For production notifications, connect a push provider such as OneSignal/Firebase Cloud Messaging to the Apps Script daily trigger.

A simple production architecture is:
Google Apps Script time trigger → refreshBriefing() → push provider API → Android PWA service worker → notification.

## 5. Daily automation
Create an Apps Script time-driven trigger for `refreshBriefing` once daily.

## 6. Important production note
The sample feed uses Google News RSS search results. For a serious daily news product, use a licensed/reliable news API and store the source URL, publication date and image URL. Do not scrape paywalled content or republish full copyrighted articles.

## 7. Data model
Each story:
category, title, summary, why, source, date, url, image

Exactly 5 stories are displayed.
