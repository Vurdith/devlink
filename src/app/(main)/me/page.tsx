import { redirect } from "next/navigation";
import { getAuthSession } from "@/server/auth";
import { prisma } from "@/server/db";

export default async function MePage() {
  const session = await getAuthSession();
  if (!session?.user?.email) redirect("/login");
  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) redirect("/login");
  redirect(`/u/${user.username}`);
}
