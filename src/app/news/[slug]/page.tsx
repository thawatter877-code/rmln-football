import NewsDetailClient from "./NewsDetailClient";
import { MOCK_NEWS } from "@/data/mockNews";

export function generateStaticParams() {
  return MOCK_NEWS.map((item) => ({
    slug: item.slug,
  }));
}

export default function Page() {
  return <NewsDetailClient />;
}
