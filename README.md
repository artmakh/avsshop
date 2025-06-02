# VIBECODED FROM SCRATCH
# MADE FOR FUN

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment

This project includes GitHub Actions CI/CD for automated building and deployment:

- **CI**: Automatically builds Docker images and pushes to GitHub Container Registry (GHCR)
- **CD**: Deploys to remote hosts via SSH with environment secrets

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed setup instructions.

## TODO:
[x] Auction item card doesn't show starting price inside card itself
[x] Auction item card should have "Bid" button instead of "Buy"
[x] "Bid" button should ask for how much bid is
[x] Buyer can bid on auction
[x] If auction is ended, highest bidder wins
[x] If auction is ended, highest bidder gets item
[x] Auction item should show history of all bids on this item to all users
[x] Seller can select minimal bid step in auction items
[x] github actions CI for building docker image to GHCR of same repo
[x] github actions CD for deploying docker compose to remote host via ssh, provisioning ADMIN_USERNAME, ADMIN_PASSWORD and JWT_SECRET from github action secrets
