# 1 Crore Darood Pak ﷺ — Website Starter

A responsive single-page website for a collective 10,000,000 Darood Pak goal.

## Run it
Open `index.html` in a browser, or use VS Code Live Server.

The starter currently uses `localStorage`, so contributions are stored only in that browser.

## Make it a real multi-user website
Use Firebase Firestore so every visitor sees the same total.

1. Create a Firebase project.
2. Create a Firestore Database.
3. Register a Web App in Firebase.
4. Copy the Firebase web config into `script.js`.
5. Set `FIREBASE_ENABLED = true`.
6. Replace the local `addContribution()` function with a Firestore transaction.
7. Add Firestore security rules that allow validated contribution writes and prevent clients from directly changing a trusted aggregate total.
8. Deploy to Firebase Hosting, GitHub Pages, Cloudflare Pages, or another static host.

## Important
The Gregorian date corresponding to 12 Rabi ul Awwal can differ according to moon sighting/calendar convention. Update `TARGET_DATE` in `script.js` after confirming the date you intend to use.

## Suggested production architecture

Firestore:
- `campaigns/main`: goal, total, deadline
- `contributions/{id}`: name, count, city, createdAt

For the aggregate total, use a trusted server-side transaction/Cloud Function rather than trusting a client-provided total.

## Suggested next additions
- Admin dashboard
- Share-to-WhatsApp button
- Anonymous mode
- Daily contribution chart
- Top contributors (only if people opt in)
- Urdu version
- QR/share poster
- Social preview image
