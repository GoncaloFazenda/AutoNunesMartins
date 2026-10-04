import type { WhatsAppContact } from '$lib/whatsappContact';

export type StandContact = {
  isDemo: boolean;
  name: string;
  description: string;
  address: string | null;
  phone: { display: string; international: string } | null;
  whatsapp: WhatsAppContact | null;
  email: string | null;
  directionsUrl: string | null;
  hours: { days: string; time: string }[];
  socialLinks: { label: string; href: string }[];
};

// DEMONSTRATION ONLY — the user explicitly authorized fictional contact details.
// Replace the entire contact set with confirmed official details before production.
// The .example email cannot deliver; the map is a city preview, not this stand's location.
export const standContact: StandContact = {
  isDemo: true,
  name: 'Auto Nunes Martins',
  description: 'Comércio de automóveis',
  address: 'Rua do Comércio, 123\n1100-000 Lisboa',
  phone: { display: '+351 210 000 000', international: '+351210000000' },
  // Explicit demo only: fictional NANP 555-0100–0199 range, not the stand's number.
  // For launch replace with the confirmed number, demo: false and confirmed: true.
  whatsapp: { international: '+12025550147', confirmed: false, demo: true },
  email: 'contacto@autonunesmartins.example',
  directionsUrl: 'https://www.google.com/maps/search/?api=1&query=Lisboa%2C%20Portugal',
  hours: [
    { days: 'Segunda a sexta', time: '09:00 — 19:00' },
    { days: 'Sábado', time: '10:00 — 17:00' },
    { days: 'Domingo e feriados', time: 'Encerrado' },
  ],
  socialLinks: [],
};
