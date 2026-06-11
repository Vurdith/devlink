import { redirect } from "next/navigation";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

const allowedTabs = new Set([
  "about",
  "posts",
  "replies",
  "reposts",
  "liked",
  "saved",
  "portfolio",
  "reviews",
]);

function readTab(tab?: string | string[]) {
  const value = Array.isArray(tab) ? tab[0] : tab;
  return value && allowedTabs.has(value) ? value : null;
}

export default async function MePage(props: { searchParams?: Promise<{ tab?: string | string[] }> }) {
  const session = await getAuthSession();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  const searchParams = props.searchParams ? await props.searchParams : undefined;
  const tab = readTab(searchParams?.tab);
  redirect(`/u/${user.username}${tab ? `?tab=${encodeURIComponent(tab)}` : ""}`);
}
