import type { Metadata } from "next";

import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Checkout — Speed Core",
  description: "Complete your order.",
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
