export type StandContact = {
  isDemo: boolean;
  name: string;
  description: string;
  address: string | null;
  phone: { display: string; international: string } | null;
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
  email: 'contacto@autonunesmartins.example',
  directionsUrl: 'https://www.google.com/maps/search/?api=1&query=Lisboa%2C%20Portugal',
  hours: [
    { days: 'Segunda a sexta', time: '09:00 — 19:00' },
    { days: 'Sábado', time: '10:00 — 17:00' },
    { days: 'Domingo e feriados', time: 'Encerrado' },
  ],
  socialLinks: [],
};
