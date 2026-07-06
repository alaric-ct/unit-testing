import { stripe } from "./stripe";

export type House = {
  value: number; // e.g. 300_000
  hasPool: boolean;
  roofAgeYears: number;
};

// Job #1 — the decision. Pure: same input → same output, no side effects.
// Guards first: the types say `number`, but real data (forms, JSON, the DB)
// still arrives as NaN, Infinity, or negative. Reject it here, in the core,
// where it costs one line to test and needs no mocks.
export function calculatePremium(house: House): number {
  if (!Number.isFinite(house.value) || house.value < 0) {
    throw new Error(`Invalid home value: ${house.value}`);
  }
  if (!Number.isFinite(house.roofAgeYears) || house.roofAgeYears < 0) {
    throw new Error(`Invalid roof age: ${house.roofAgeYears}`);
  }

  let premium = house.value * 0.005; // base rate: 0.5% of home value
  if (house.hasPool) premium += 200; // pool → liability risk
  if (house.roofAgeYears > 20) premium += 150; // old roof → claims risk
  return premium;
}

// Job #2 — the side effect. A thin wire: compute, then hand off to Stripe.
// I/O is the thing that fails (network, declined card), so error handling
// lives HERE, in the imperative shell — never in the pure core above.
export async function chargePremium(house: House, customerId: string): Promise<void> {
  const amount = calculatePremium(house);
  try {
    await stripe.charges.create({ customer: customerId, amount });
  } catch (cause) {
    if(cause instanceof Error) {
      cause.message = `Could not charge ${customerId}: ${cause.message}`;
      throw cause;
    }
    throw new Error(`Could not charge ${customerId}`);
  }
}
