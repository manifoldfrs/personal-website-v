import Image from "next/image"

/** Pre-rendered facets animate once; the SVG provides its own reduced-motion still state. */
export function CreationArtwork() {
  return (
    <figure className="creation-artwork">
      <Image
        src="/images/creation-of-adam.svg"
        alt="The reaching hands from Michelangelo's The Creation of Adam, rendered in blue facets"
        width={1800}
        height={600}
        className="creation-artwork-image"
        preload
        unoptimized
      />
    </figure>
  )
}
