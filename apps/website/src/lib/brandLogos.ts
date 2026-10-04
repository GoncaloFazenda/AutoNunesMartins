/** Verified local assets only. Unknown labels must never be guessed or corrected. */
const logos: Record<string, string> = {
  audi: 'audi', bmw: 'bmw', dacia: 'dacia', peugeot: 'peugeot',
  renault: 'renault', tesla: 'tesla', volkswagen: 'volkswagen',
};

export function brandLogo(name: string): string | undefined {
  const key = name.trim().toLowerCase();
  const slug = Object.hasOwn(logos, key) ? logos[key] : undefined;
  return slug ? `/images/brands/${slug}.svg` : undefined;
}
