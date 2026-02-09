# Suture Preference Cards (Offline iPad Kiosk)

Flow:
1) Specialty list (start)
2) Surgeon | Procedure list (filtered by specialty)
3) Preference card (Suture, SKU, Quantity) + Finish returns to start

## Run locally
```bash
npm install
npm run dev
```
Open http://localhost:3000

## Offline (iPad)
1) Deploy to HTTPS (Vercel recommended)
2) Open site once on iPad Safari (online)
3) Share → Add to Home Screen
4) Turn on Airplane Mode and relaunch from the icon

## Data
Update: `public/data/preference_cards.csv`

## Updating Preference Cards (CSV-only)

1. Edit `public/data/preference_cards.csv`
2. Save as CSV (do not rename the file or change headers)
3. Commit + push:
   ```bash
   git add public/data/preference_cards.csv
   git commit -m "Update suture preference cards"
   git push

Expected columns (flexible):
- Specialty
- Surgeon
- Procedure Name (or Procedure / Lab)
- Suture Name (or Product Description / Suture)
- Description (optional)
- SKU (or Manufacturer SKU)
- Quantity (or Amount)
