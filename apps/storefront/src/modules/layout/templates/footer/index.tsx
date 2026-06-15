import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function Footer() {
  return (
    <footer className="w-full mt-16 bg-inverse-surface border-t-4 border-secondary">
      <div className="max-w-[1440px] mx-auto px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-white">

        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="font-headline text-xl mb-5 uppercase tracking-tighter">Kingsbury</div>
          <p className="text-sm text-surface-variant mb-5 leading-relaxed">
            The UK&apos;s builders merchant for trade professionals and retail customers. Reliable supplies delivered nationwide.
          </p>
          <div className="flex gap-4">
            <span className="material-symbols-outlined cursor-pointer hover:text-secondary transition-colors">alternate_email</span>
            <span className="material-symbols-outlined cursor-pointer hover:text-secondary transition-colors">share</span>
            <span className="material-symbols-outlined cursor-pointer hover:text-secondary transition-colors">storefront</span>
          </div>
        </div>

        {/* Trade Services */}
        <div>
          <h4 className="text-xs font-bold mb-5 uppercase tracking-wider text-secondary">Trade Services</h4>
          <ul className="space-y-3">
            {["Bulk Buy Discounts", "VAT Invoices", "Click & Collect", "Store Finder"].map((item) => (
              <li key={item}>
                <a href="#" className="text-sm text-surface-variant hover:text-secondary transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h4 className="text-xs font-bold mb-5 uppercase tracking-wider text-secondary">Customer Support</h4>
          <ul className="space-y-3">
            <li>
              <LocalizedClientLink href="/account" className="text-sm text-surface-variant hover:text-secondary transition-colors">
                Trade Account Login
              </LocalizedClientLink>
            </li>
            <li>
              <a href="#" className="text-sm text-surface-variant hover:text-secondary transition-colors">Delivery Information</a>
            </li>
            <li>
              <a href="#" className="text-sm text-surface-variant hover:text-secondary transition-colors">Returns &amp; Refunds</a>
            </li>
            <li>
              <a href="#" className="text-sm text-surface-variant hover:text-secondary transition-colors">Help Centre</a>
            </li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h4 className="text-xs font-bold mb-5 uppercase tracking-wider text-secondary">Legal</h4>
          <ul className="space-y-3">
            {["Privacy Policy", "Terms of Sale", "Modern Slavery Act", "Sustainability Policy"].map((item) => (
              <li key={item}>
                <a href="#" className="text-sm text-surface-variant hover:text-secondary transition-colors">{item}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-[1440px] mx-auto px-8 py-5 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-surface-variant text-xs">
        <span>© {new Date().getFullYear()} Kingsbury Builders Merchant Ltd. Registered in England &amp; Wales.</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
            Secure Checkout
          </span>
          <div className="flex gap-2">
            {["VISA", "MASTERCARD", "AMEX", "PAYPAL"].map((card) => (
              <span key={card} className="bg-white/10 px-2 py-0.5 rounded text-[10px] font-bold">{card}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
