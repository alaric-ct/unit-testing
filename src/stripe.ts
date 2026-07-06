// Stand-in for the real Stripe SDK so the demo runs offline.
// In production this makes a real network call to charge a card.
export const stripe = {
  charges: {
    async create(args: { customer: string; amount: number }) {
      return { id: "ch_fake_123", ...args };
    },
  },
};
