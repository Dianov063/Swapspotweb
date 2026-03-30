export function isAdmin(email: string | undefined): boolean {
  const adminEmails =
    process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(",").map((e) => e.trim()) ?? [];
  return !!email && adminEmails.includes(email);
}
