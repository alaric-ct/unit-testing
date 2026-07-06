import { stripe } from "./stripe";

export type House = {
  value: number; // e.g. 300_000
  hasPool: boolean;
  roofAgeYears: number;
};

// Charges a customer their annual home-insurance premium.
export function calculateAndChargePremium(house: House, customerId: string): void {
  let premium = house.value * 0.005; // base rate: 0.5% of home value
  if (house.hasPool) premium += 200; // pool → liability risk
  if (house.roofAgeYears > 20) premium += 150; // old roof → claims risk

  stripe.charges.create({ customer: customerId, amount: premium });
}
