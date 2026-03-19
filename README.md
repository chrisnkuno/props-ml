# Frontend

Next.js app for document upload, result viewing, and evidence-bundle verification.

## Local checks

```bash
npm run lint
npx next build --webpack
```

## Runtime API resolution

The client prefers `NEXT_PUBLIC_API_URL` when provided, but it also falls back to the current browser hostname on port `8000` when the configured host is the internal Compose alias `backend`. That keeps the local Docker Compose workflow usable from a browser at `localhost:3000`.

## Verification flow

- Upload a document.
- Open the result page.
- Export the evidence bundle as JSON.
- Import that bundle on `/verify` to perform a stateless consistency check.

This verifier does not perform genuine Intel TDX quote validation by itself.
