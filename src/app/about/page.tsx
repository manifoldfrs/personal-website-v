import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Faris Habib",
  description: "A bit about Faris Habib.",
};

export default function AboutPage() {
  return (
    <article className="about-page">
      <header className="article-header"></header>
      <div className="prose about-copy">
        <p>
          A place for everything I&apos;m curious about. I find the most of the
          interesting things in life tend to come from the cross-pollination of
          different ideas.
        </p>
      </div>
      <figure className="about-photo">
        <Image
          src="/images/scotland-pixel-art.webp"
          alt="Pixel-art interpretation of the Scotland landscape"
          width={1448}
          height={1086}
          preload
          unoptimized
        />
      </figure>
    </article>
  );
}
