import { calculateAndChargePremium } from "./premium";
import { stripe } from "./stripe";

describe("calculateAndChargePremium", () => {
  it("charges the premium", () => {
    const charge = jest.spyOn(stripe.charges, "create");

    calculateAndChargePremium(
      { value: 300_000, hasPool: true, roofAgeYears: 5 },
      "cus_123",
    );
    
    expect(charge).toHaveBeenCalled();
  });
});
