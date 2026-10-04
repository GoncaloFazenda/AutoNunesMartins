export type WhatsAppContact = {
  international: string;
  confirmed: boolean;
  demo?: boolean;
  message?: string;
};

/** Live numbers require confirmation; demo links are confined to the fictional range. */
export function whatsappUrl(contact: WhatsAppContact | null): string | null {
  if (!contact || !/^\+[1-9]\d{7,14}$/.test(contact.international)) return null;
  if (contact.demo ? !/^\+120255501\d{2}$/.test(contact.international) : !contact.confirmed) return null;
  const url = new URL(`https://wa.me/${contact.international.slice(1)}`);
  if (contact.message?.trim()) url.searchParams.set('text', contact.message.trim());
  return url.href;
}

/** The whole stats section must have passed the viewport's top edge. */
export function passedHomeStats(bottom: number | null): boolean {
  return bottom !== null && Number.isFinite(bottom) && bottom <= 0;
}
