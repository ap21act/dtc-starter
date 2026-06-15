import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="max-w-[1440px] mx-auto px-8 py-8" data-testid="cart-container">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-on-surface-variant mb-6">
        <LocalizedClientLink href="/" className="hover:text-navy transition-colors">Home</LocalizedClientLink>
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>chevron_right</span>
        <span className="text-navy font-bold">Your Cart</span>
      </nav>

      {/* Page header */}
      <h1 className="font-headline text-[48px] leading-tight font-bold text-navy mb-12 uppercase tracking-tighter">
        Your Cart{" "}
        <span className="text-on-surface-variant text-2xl font-normal lowercase">
          ({cart?.items?.length || 0} item{(cart?.items?.length || 0) !== 1 ? "s" : ""})
        </span>
      </h1>

      {cart?.items?.length ? (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Items — 2/3 */}
          <div className="lg:w-2/3">
            {!customer && (
              <div className="mb-8">
                <SignInPrompt />
              </div>
            )}
            <ItemsTemplate cart={cart} />
          </div>

          {/* Summary — 1/3 */}
          <div className="lg:w-1/3">
            {cart && cart.region && <Summary cart={cart} />}
          </div>
        </div>
      ) : (
        <EmptyCartMessage />
      )}
    </div>
  )
}

export default CartTemplate
