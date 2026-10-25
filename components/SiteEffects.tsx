"use client";
import { usePathname } from "next/navigation";
import PageLoader from "./PageLoader";
import SmoothScroll from "./SmoothScroll";
export default function SiteEffects() {
  const path = usePathname();
  return path.startsWith("/admin") || path.startsWith("/auth") ? null : <><SmoothScroll /><PageLoader /></>;
}
