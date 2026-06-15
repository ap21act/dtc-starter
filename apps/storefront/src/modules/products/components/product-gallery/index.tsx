"use client"

import { useState } from "react"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"

export default function ProductGallery({
  images,
  brand,
}: {
  images: HttpTypes.StoreProductImage[]
  brand?: string
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const mainImage = images[activeIndex] ?? images[0]

  return (
    <div className="flex flex-col gap-4">
      {/* Main image with zoom on hover */}
      <div className="overflow-hidden bg-white border border-brand-border aspect-square flex items-center justify-center relative group cursor-zoom-in">
        {mainImage ? (
          <Image
            src={mainImage.url}
            alt="Product image"
            width={600}
            height={600}
            className="w-4/5 h-4/5 object-contain transition-transform duration-300 ease-out group-hover:scale-150"
            priority
          />
        ) : (
          <div className="w-4/5 h-4/5 bg-brand-surface flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-grey-30">
              image_not_supported
            </span>
          </div>
        )}
        {brand && (
          <div className="absolute top-4 left-4 bg-navy text-white px-3 py-1 text-xs font-bold uppercase tracking-wider">
            {brand}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.slice(0, 5).map((img, i) => (
            <button
              key={img.id ?? i}
              onClick={() => setActiveIndex(i)}
              className={`border-2 aspect-square bg-white p-2 transition-colors ${
                i === activeIndex
                  ? "border-safety-orange"
                  : "border-brand-border hover:border-safety-orange"
              }`}
            >
              <Image
                src={img.url}
                alt={`View ${i + 1}`}
                width={100}
                height={100}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
