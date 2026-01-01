"use client";

import Link from "next/link";
import { trackNovelClick } from "@/app/utils/clickTracking";
import NovelCard from "./NovelCard";

type NovelCardWithTrackingProps = {
  novel: any;
};

export default function NovelCardWithTracking({ novel }: NovelCardWithTrackingProps) {
  const handleClick = () => {
    trackNovelClick(novel.id);
  };

  return (
    <Link
      href={`/novels/${novel.id}`}
      onClick={handleClick}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <NovelCard novel={novel} />
    </Link>
  );
}

