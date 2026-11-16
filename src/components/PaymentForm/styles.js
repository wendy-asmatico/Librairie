const focus = "focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-gold";
const button = `min-h-11 rounded-lg border px-6 py-3 font-semibold transition-colors disabled:cursor-not-allowed disabled:border-[#4a5e49] disabled:bg-white disabled:text-[#4a5e49] ${focus}`;

export const paymentInput = `min-h-11 rounded-lg border border-[#647a60] bg-white px-3 py-2.5 text-ink ${focus}`;
export const paymentPrimary = `${button} border-forest bg-forest text-white enabled:hover:bg-forest-deep`;
export const paymentSecondary = `${button} border-forest bg-white text-forest enabled:hover:bg-mint-soft`;
export const paymentCard = "min-h-12 rounded-lg border border-[#647a60] bg-white px-4 py-3.5 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-gold";
