import type { NavItem } from "@/config/navigation";

const exactRoutes = new Set(["/", "/home", "/discover"]);

export function isNavItemActive(pathname: string, item: Pick<NavItem, "href">) {
  const href = item.href;

  if (pathname === href) return true;
  if (exactRoutes.has(href)) return false;
  if (href === "/me") return pathname === "/me" || pathname.startsWith("/u/");
  if (href === "/settings") return pathname.startsWith("/settings");

  return pathname.startsWith(`${href}/`);
}
