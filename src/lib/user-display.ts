export function getInitials(name: string | null | undefined, username: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  }

  return username.substring(0, 2).toUpperCase();
}
