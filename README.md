# unit-test-session

A 30-minute, code-along session on unit testing — using a home-insurance premium
example.

```bash
npm install
npm test            # all green
```

| File | Role |
|------|------|
| `src/premium.ts` | The starting point: one `void` function doing two jobs. |
| `src/premium.test.ts` | The test — all green|
| `src/stripe.ts` | Offline stand-in for the Stripe SDK. |
