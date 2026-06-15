import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full border-b border-ui-border-base relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center small:p-32 gap-6">
        <span>
          <Heading
            level="h1"
            className="text-3xl leading-10 text-ui-fg-base font-normal"
          >
            Kingsbury Builders Merchant
          </Heading>
          <Heading
            level="h2"
            className="text-3xl leading-10 text-ui-fg-subtle font-normal"
          >
            Tools, fixings &amp; building materials
          </Heading>
        </span>
        <Text className="text-ui-fg-subtle">
          Trade &amp; retail supply — delivered across the UK
        </Text>
        <div className="flex gap-3">
          <LocalizedClientLink href="/store">
            <Button variant="primary">Shop All Products</Button>
          </LocalizedClientLink>
          <LocalizedClientLink href="/categories">
            <Button variant="secondary">Browse Categories</Button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}

export default Hero
