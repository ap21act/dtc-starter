import { Metadata } from "next"
import { retrieveCart } from "@lib/data/cart"
import CheckoutTemplate from "@modules/checkout/templates"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order",
}

export default async function CheckoutPage() {
  const cart = await retrieveCart().catch(() => null)

  if (!cart || !cart.items?.length) {
    return notFound()
  }

  return <CheckoutTemplate cart={cart} />
}
