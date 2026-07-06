import { calculatePremium, chargePremium } from "./premium";
import { stripe } from "./stripe";

// Undo any spy after each test so a Stripe mock can't leak into the next one.
afterEach(() => jest.restoreAllMocks());

// The money math — the part that actually matters — needs ZERO mocks.
// Real input in, real number out. Titles state the behaviour as
// WHEN <situation> / THEN <outcome>, so the test report reads like a spec.
describe("calculatePremium", () => {
  it("WHEN a house with no risk factors, THEN the premium is 0.5% of its value", () => {
    expect(calculatePremium({ value: 300_000, hasPool: false, roofAgeYears: 5 })).toBe(1500);
  });

  it("WHEN a house has a swimming pool, THEN a $200 liability surcharge is added", () => {
    expect(calculatePremium({ value: 300_000, hasPool: true, roofAgeYears: 5 })).toBe(1700);
  });

  it("WHEN a roof is older than 20 years, THEN a $150 claims surcharge is added", () => {
    expect(calculatePremium({ value: 300_000, hasPool: false, roofAgeYears: 25 })).toBe(1650);
  });

  // Edge cases — cheap to capture precisely because the core is pure (no mocks).
  it("WHEN a roof is exactly 20 years old, THEN no surcharge applies (the boundary)", () => {
    expect(calculatePremium({ value: 300_000, hasPool: false, roofAgeYears: 20 })).toBe(1500);
  });

  it("WHEN the home value is negative, THEN it throws instead of pricing garbage", () => {
    expect(() =>
      calculatePremium({ value: -1, hasPool: false, roofAgeYears: 5 }),
    ).toThrow(/invalid home value/i);
  });

  it("WHEN the roof age is negative, THEN it throws instead of silently skipping the surcharge", () => {
    expect(() =>
      calculatePremium({ value: 300_000, hasPool: false, roofAgeYears: -3 }),
    ).toThrow(/invalid roof age/i);
  });

  it("WHEN a field is not a finite number (NaN), THEN it throws instead of billing NaN", () => {
    expect(() =>
      calculatePremium({ value: NaN, hasPool: false, roofAgeYears: 5 }),
    ).toThrow(/invalid home value/i);
  });
});

// The side effect gets thin tests: it charges what we calculated, and it
// surfaces I/O failures. This is the only place a mock earns its keep.
describe("chargePremium", () => {
  it("WHEN a customer is charged, THEN Stripe bills the calculated premium", async () => {
    const charge = jest.spyOn(stripe.charges, "create");

    await chargePremium({ value: 300_000, hasPool: true, roofAgeYears: 5 }, "cus_123");

    expect(charge).toHaveBeenCalledWith({ customer: "cus_123", amount: 1700 });
  });

  it("WHEN Stripe rejects the charge, THEN the failure is surfaced with the customer id", async () => {
    jest.spyOn(stripe.charges, "create").mockRejectedValue(new Error("card_declined"));

    await expect(
      chargePremium({ value: 300_000, hasPool: false, roofAgeYears: 5 }, "cus_123"),
    ).rejects.toThrow("Could not charge cus_123");
  });
});
