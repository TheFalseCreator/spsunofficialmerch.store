# GuptaGang.Shop — static storefront demo

This is a minimal static storefront meant for GitHub Pages. It includes:
- Product grid
- Cart with localStorage persistence
- Checkout simulation (no real payments)

## To deploy
1. Create a new repo on GitHub and push these files to `main` (root).
2. In repo → Settings → Pages: choose `main` branch, root folder. Save.
3. Optionally add `guptagang.shop` as a custom domain and set DNS A records to GitHub Pages IPs.

## To add/modify products
Edit `script.js` PRODUCTS array.

## Payments
This demo uses a simulated payment flow. When ready:
- Implement a secure backend endpoint to create real orders and payment tokens.
- Integrate your chosen gateway (Razorpay, Stripe, Cashfree, etc). Do not embed secret keys in frontend.
