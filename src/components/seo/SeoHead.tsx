import { useEffect } from "react";

interface SeoHeadProps {
  title: string;
  description: string;
  canonical?: string;
  robots?: string;
  ogType?: string;
  ogImage?: string;
  twitterCard?: string;
}

const setMeta = (name: string, content: string, isProperty = false) => {
  const selector = isProperty ? `meta[property=\"${name}\"]` : `meta[name=\"${name}\"]`;
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    if (isProperty) tag.setAttribute("property", name);
    else tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.content = content;
};

export const SeoHead = ({ title, description, canonical, robots = "index,follow", ogType = "website", ogImage, twitterCard = "summary_large_image" }: SeoHeadProps) => {
  useEffect(() => {
    document.title = title;
    setMeta("description", description);
    setMeta("robots", robots);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("og:type", ogType, true);
    setMeta("twitter:card", twitterCard);
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    if (ogImage) {
      setMeta("og:image", ogImage, true);
      setMeta("twitter:image", ogImage);
    }

    if (canonical) {
      let link = document.head.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }
  }, [title, description, canonical, robots, ogType, ogImage, twitterCard]);

  return null;
};
