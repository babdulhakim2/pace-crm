// Pace — sample seed data
// Realistic London high-street businesses.

export const OUTCOMES: Record<string, { label: string; dm: boolean; sale: boolean; tone: string }> = {
  CB:   { label: "Callback",                    dm: false, sale: false, tone: "warning" },
  IM:   { label: "Instant Meeting",             dm: true,  sale: false, tone: "accent" },
  IMPQ: { label: "Instant Meeting + Quote",     dm: true,  sale: false, tone: "accent" },
  MA:   { label: "Meeting Appointment",         dm: true,  sale: false, tone: "purple" },
  MAPQ: { label: "Meeting Appt. + Quote",       dm: true,  sale: false, tone: "purple" },
  MAS:  { label: "Meeting Appt. Sold",          dm: true,  sale: true,  tone: "success" },
  IS:   { label: "Instant Sale",                dm: true,  sale: true,  tone: "success" },
  NI:   { label: "Not Interested",              dm: true,  sale: false, tone: "danger" },
  BC:   { label: "Business Closed",             dm: false, sale: false, tone: "muted" },
  BCD:  { label: "Business Closed Down",        dm: false, sale: false, tone: "muted" },
  NDM:  { label: "No Decision Maker",           dm: false, sale: false, tone: "muted" },
  R:    { label: "Referral",                    dm: true,  sale: false, tone: "orange" },
};

export type OutcomeMap = Record<string, { label: string; dm: boolean; sale: boolean; tone: string }>;

export const SERVICES: Record<string, { label: string }> = {
  GBPO: { label: "Google Business Profile" },
  BRL:  { label: "Business Reviews & Listings" },
  "360":{ label: "360\u00B0 photos" },
  WEB:  { label: "Web development" },
  SMM:  { label: "Social media management" },
  SMA:  { label: "Social media ads" },
  SEO:  { label: "Monthly SEO" },
  GADS: { label: "Google Ads" },
  ECOM: { label: "E-commerce site" },
};

export const AREAS = [
  "Shoreditch",
  "Hackney",
  "Islington",
  "Camden",
  "Hampstead",
  "Soho",
  "Marylebone",
  "Stoke Newington",
];

export interface Business {
  id: string;
  name: string;
  type: string;
  area: string;
  contact: string;
  role: string;
}

export interface VisitItem {
  svc: string;
  out: string;
}

export interface Visit {
  id: string;
  bizId: string;
  date: string;
  via: string;
  notes: string;
  items: VisitItem[];
}

export interface EnrichedBusiness extends Business {
  visits: Visit[];
  items: VisitItem[];
  svcLatest: Record<string, { out: string; date: string; via: string }>;
  lastVisit: Visit | null;
  contactCount: number;
  serviceCount: number;
  stage: string;
  stageOverride?: string;
}

const BUSINESSES: Business[] = [
  { id: "b01", name: "Monmouth Coffee", type: "Cafe",        area: "Shoreditch",      contact: "Sally Khoury",  role: "Manager" },
  { id: "b02", name: "Polpo Notting",   type: "Restaurant",  area: "Soho",            contact: "Marco Ricci",   role: "Owner" },
  { id: "b03", name: "Tony's Barbers",  type: "Barbershop",  area: "Hackney",         contact: "Tony Ashe",     role: "Owner" },
  { id: "b04", name: "Belle Hair Salon",type: "Salon",       contact: "Imane Bouzid",  area: "Islington",       role: "Owner" },
  { id: "b05", name: "The Daily Loaf",  type: "Bakery",      area: "Stoke Newington", contact: "Jen Holloway",  role: "Owner" },
  { id: "b06", name: "Bloomsbury Eye",  type: "Clinic",      area: "Marylebone",      contact: "Dr Pari Shah",  role: "Owner" },
  { id: "b07", name: "Fern & Petal",    type: "Florist",     area: "Hampstead",       contact: "Wendy Aurelio", role: "Owner" },
  { id: "b08", name: "Camden Cycles",   type: "Retail",      area: "Camden",          contact: "Rob Mendez",    role: "Manager" },
  { id: "b09", name: "Saffron Spice",   type: "Restaurant",  area: "Shoreditch",      contact: "Anika Patel",   role: "Owner" },
  { id: "b10", name: "Ozone Coffee",    type: "Cafe",        area: "Shoreditch",      contact: "Liv Tanner",    role: "Manager" },
  { id: "b11", name: "Cut & Co",        type: "Barbershop",  area: "Soho",            contact: "Idris Walker",  role: "Owner" },
  { id: "b12", name: "Rivington Dental",type: "Clinic",      area: "Shoreditch",      contact: "Dr A. Holm",    role: "Owner" },
  { id: "b13", name: "Hampstead Books", type: "Retail",      area: "Hampstead",       contact: "Eleanor Quinn", role: "Owner" },
  { id: "b14", name: "Bao Bun House",   type: "Restaurant",  area: "Soho",            contact: "Min Park",      role: "Manager" },
  { id: "b15", name: "Roots & Rye",     type: "Cafe",        area: "Hackney",         contact: "Jamie O'Brien", role: "Owner" },
  { id: "b16", name: "Aurelia Brows",   type: "Salon",       area: "Marylebone",      contact: "Aurelia C.",    role: "Owner" },
  { id: "b17", name: "Newington Wine",  type: "Retail",      area: "Stoke Newington", contact: "Henrik Walz",   role: "Owner" },
  { id: "b18", name: "Skylight Yoga",   type: "Studio",      area: "Islington",       contact: "Nadia Cole",    role: "Owner" },
  { id: "b19", name: "Print House",     type: "Services",    area: "Camden",          contact: "Reece Allen",   role: "Manager" },
  { id: "b20", name: "Pho Stop",        type: "Restaurant",  area: "Hackney",         contact: "Linh Trinh",    role: "Owner" },
  { id: "b21", name: "Wellington Vets", type: "Clinic",      area: "Hampstead",       contact: "Dr Owens",      role: "Owner" },
  { id: "b22", name: "The Mason Arms",  type: "Pub",         area: "Islington",       contact: "Greg Mason",    role: "Owner" },
  { id: "b23", name: "Lulu's Nails",    type: "Salon",       area: "Camden",          contact: "Lulu Tran",     role: "Owner" },
  { id: "b24", name: "Volta Cycles",    type: "Retail",      area: "Shoreditch",      contact: "Marek Olejnik", role: "Owner" },
  { id: "b25", name: "Tabletop Games",  type: "Retail",      area: "Stoke Newington", contact: "Sam Begum",     role: "Manager" },
  { id: "b26", name: "Almond & Oat",    type: "Cafe",        area: "Marylebone",      contact: "Bea Lindgren",  role: "Owner" },
  { id: "b27", name: "Studio 47",       type: "Salon",       area: "Soho",            contact: "Yuki Tanaka",   role: "Owner" },
  { id: "b28", name: "Granger Optical", type: "Clinic",      area: "Islington",       contact: "Sam Granger",   role: "Owner" },
];

// Deterministic minute from id hash so server/client produce the same ISO string
function hashMinute(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((h < 0 ? -h : h) % 60);
}

// Use a fixed "now" so dates are stable across SSR and client hydration
const REF_NOW = new Date("2025-06-01T12:00:00Z");

function v(id: string, biz: string, daysAgo: number, hours: number, via: string, notes: string, items: VisitItem[]): Visit {
  const d = new Date(REF_NOW);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, hashMinute(id), 0, 0);
  return { id, bizId: biz, date: d.toISOString(), via, notes, items };
}

const VISITS: Visit[] = [
  // Today / very recent
  v("v01", "b01", 0, 11, "voice", "Sally suggested coming back at 3pm when Damien (owner) is in.", [{svc:"GBPO", out:"CB"}, {svc:"WEB", out:"CB"}]),
  v("v02", "b03", 0, 12, "voice", "Tony loved the GBP idea \u2014 booked us for Wed 10am.", [{svc:"GBPO", out:"MA"}, {svc:"BRL", out:"MA"}]),
  v("v03", "b09", 0, 13, "text",  "Owner not in. Niece said try after 4.", [{svc:"GBPO", out:"NDM"}]),
  v("v04", "b14", 0, 14, "voice", "Sold web build \u00A31.8k upfront, deposit on file.", [{svc:"WEB", out:"IS"}, {svc:"SEO", out:"MAPQ"}]),
  v("v05", "b15", 0, 15, "text",  "Jamie wants social ads quote by end of week.", [{svc:"SMA", out:"MAPQ"}]),
  v("v06", "b02", 0, 16, "voice", "Marco grateful but already has agency. Open to GADS though.", [{svc:"SMM", out:"NI"}, {svc:"GADS", out:"CB"}]),

  // Yesterday
  v("v07", "b04", 1, 10, "voice", "Imane sold on full GBP package plus monthly reviews.", [{svc:"GBPO", out:"IS"}, {svc:"BRL", out:"MAS"}]),
  v("v08", "b05", 1, 11, "voice", "Bakery moving locations Aug \u2014 try in autumn.", [{svc:"GBPO", out:"CB"}]),
  v("v09", "b06", 1, 13, "text",  "Dr Shah keen on 360 walkthrough \u2014 booked Thurs 9am.", [{svc:"360", out:"MA"}, {svc:"WEB", out:"MA"}]),
  v("v10", "b07", 1, 14, "voice", "Wendy referred us to her sister's clinic (Wellington Vets).", [{svc:"SMM", out:"R"}]),
  v("v11", "b10", 1, 15, "voice", "Liv said no thanks, big group has internal team.", [{svc:"SMM", out:"NI"}, {svc:"GADS", out:"NI"}]),
  v("v12", "b11", 1, 16, "text",  "Idris booked meeting Mon, wants to discuss SMA + GBP.", [{svc:"GBPO", out:"MA"}, {svc:"SMA", out:"MA"}]),

  // 2 days ago
  v("v13", "b12", 2, 10, "voice", "Dr Holm asked for written quote on ECOM, will decide Friday.", [{svc:"ECOM", out:"IMPQ"}]),
  v("v14", "b08", 2, 12, "voice", "Rob is friendly, hates ads, sold him on SEO basics.", [{svc:"SEO", out:"IS"}]),
  v("v15", "b13", 2, 14, "text",  "Closed for stocktake \u2014 back Mon.", [{svc:"GBPO", out:"BC"}]),
  v("v16", "b16", 2, 15, "voice", "Aurelia ran us through clientele \u2014 booked SMA meeting.", [{svc:"SMA", out:"MA"}, {svc:"SMM", out:"MAPQ"}]),

  // 3 days ago
  v("v17", "b17", 3, 11, "voice", "Henrik already has photographer, polite no.", [{svc:"360", out:"NI"}]),
  v("v18", "b18", 3, 13, "text",  "Nadia loved the idea but partner runs marketing.", [{svc:"SMM", out:"NDM"}]),
  v("v19", "b19", 3, 14, "voice", "Reece is open to GBP, sales decision next week.", [{svc:"GBPO", out:"CB"}, {svc:"BRL", out:"CB"}]),
  v("v20", "b20", 3, 15, "voice", "Sold instant web build \u2014 Linh paid \u00A3900 deposit.", [{svc:"WEB", out:"IS"}, {svc:"GBPO", out:"MAS"}]),

  // 4-7 days ago
  v("v21", "b21", 5, 10, "voice", "Dr Owens unsure on cost \u2014 quote sent.", [{svc:"WEB", out:"IMPQ"}, {svc:"GBPO", out:"IM"}]),
  v("v22", "b22", 5, 13, "text",  "Greg likes us, just had website rebuilt. Try SMM in a month.", [{svc:"WEB", out:"NI"}, {svc:"SMM", out:"CB"}]),
  v("v23", "b23", 6, 14, "voice", "Lulu loves photos \u2014 360 walkthrough booked Sat.", [{svc:"360", out:"MA"}]),
  v("v24", "b24", 6, 12, "text",  "Closed permanently.", [{svc:"GBPO", out:"BCD"}]),
  v("v25", "b25", 7, 11, "voice", "Sam Begum \u2014 sold monthly SEO \u00A3180.", [{svc:"SEO", out:"IS"}]),

  // 8-14 days ago
  v("v26", "b26", 9, 10, "voice", "Bea wants ECOM but waiting on partner. Soft callback.", [{svc:"ECOM", out:"CB"}]),
  v("v27", "b27", 10, 14, "text", "Yuki referred us to two other salons.", [{svc:"SMM", out:"R"}, {svc:"SMA", out:"R"}]),
  v("v28", "b28", 11, 11, "voice", "Sam Granger said maybe in Q3.", [{svc:"GBPO", out:"CB"}]),
  v("v29", "b01", 12, 12, "text", "First visit \u2014 chatted with Sally re GBP, came back for owner.", [{svc:"GBPO", out:"NDM"}]),
  v("v30", "b02", 13, 13, "voice", "Marco busy lunch service. Try Tue morning.", [{svc:"SMM", out:"CB"}]),
  v("v31", "b03", 13, 14, "voice", "Tony asked us to do GBP audit, will decide after.", [{svc:"GBPO", out:"CB"}]),

  // Older — for stage history
  v("v32", "b04", 18, 11, "text", "First touch \u2014 Imane interested but busy.", [{svc:"GBPO", out:"CB"}]),
  v("v33", "b09", 20, 14, "voice", "Anika polite \u2014 no DM at counter today.", [{svc:"GBPO", out:"NDM"}, {svc:"SMA", out:"NDM"}]),
  v("v34", "b06", 22, 13, "voice", "Dr Shah introduced \u2014 interested in tour.", [{svc:"360", out:"IM"}]),
  v("v35", "b14", 25, 15, "voice", "Min Park said yes to redo of website. Quote on way.", [{svc:"WEB", out:"IMPQ"}]),
  v("v36", "b08", 30, 12, "text",  "Rob said come back when SEO comes up. Done!", [{svc:"SEO", out:"CB"}]),
  v("v37", "b22", 32, 14, "voice", "Greg loves us. Was busy. No DM.", [{svc:"WEB", out:"NDM"}]),
  v("v38", "b16", 34, 11, "voice", "First visit Aurelia.", [{svc:"GBPO", out:"IM"}]),
  v("v39", "b18", 38, 16, "voice", "Nadia at counter, partner runs marketing.", [{svc:"SMM", out:"NDM"}]),
  v("v40", "b12", 42, 13, "text",  "Dr Holm first touch.", [{svc:"ECOM", out:"IM"}]),
  v("v41", "b20", 50, 14, "voice", "First touch with Pho Stop \u2014 chatty, no DM.", [{svc:"GBPO", out:"NDM"}]),

  // Older for Stats weekly chart
  v("v42", "b07", 60, 11, "voice", "Wendy sold reviews package.", [{svc:"BRL", out:"IS"}]),
  v("v43", "b11", 62, 13, "text",  "First touch.", [{svc:"SMM", out:"CB"}]),
  v("v44", "b13", 65, 14, "voice", "Eleanor said no thanks.", [{svc:"GBPO", out:"NI"}]),
];

// Pure function: derive stage from enriched business
export function stageOf(biz: EnrichedBusiness, outcomes: OutcomeMap): string {
  if (biz.stageOverride) return biz.stageOverride;
  const items = biz.visits.flatMap((v) => v.items.map((i) => ({ ...i, date: v.date })));
  const dmSpoken = items.some((it) => outcomes[it.out]?.dm);
  const anySale = items.some((it) => outcomes[it.out]?.sale);
  if (anySale) return "won";
  if (!dmSpoken) return "cold";
  const allNi = items.every((it) => !outcomes[it.out]?.dm || outcomes[it.out]?.tone === "danger" || outcomes[it.out]?.tone === "muted");
  if (allNi) return "lost";
  return "active";
}

// Pure function: enrich businesses from raw data
export function enrichBusinesses(
  businesses: Business[],
  visits: Visit[],
  outcomes: Record<string, { label: string; dm: boolean; sale: boolean; tone: string }>,
  overrides?: Record<string, string>,
): Record<string, EnrichedBusiness> {
  const byBiz: Record<string, EnrichedBusiness> = {};
  businesses.forEach((b) => {
    byBiz[b.id] = { ...b, visits: [], items: [], svcLatest: {}, lastVisit: null, contactCount: 0, serviceCount: 0, stage: "cold" };
  });
  visits.forEach((vi) => {
    if (byBiz[vi.bizId]) byBiz[vi.bizId].visits.push(vi);
  });
  Object.values(byBiz).forEach((b) => {
    b.visits.sort((a, c) => new Date(c.date).getTime() - new Date(a.date).getTime());
    b.lastVisit = b.visits[0] || null;
    b.contactCount = b.visits.length;
    b.serviceCount = 0;
    b.items = b.visits.flatMap((vi) => vi.items);
    const seenSvc = new Set<string>();
    [...b.visits].reverse().forEach((vi) => {
      vi.items.forEach((it) => {
        seenSvc.add(it.svc);
        b.svcLatest[it.svc] = { out: it.out, date: vi.date, via: vi.via };
      });
    });
    b.serviceCount = seenSvc.size;
    if (overrides?.[b.id]) b.stageOverride = overrides[b.id];
    b.stage = stageOf(b, outcomes);
  });
  return byBiz;
}

// Seed data aliases used by db/seed.ts
export const SEED_BUSINESSES = BUSINESSES;
export const SEED_VISITS = VISITS;

// Stats helpers
export function isSale(out: string, outcomes: OutcomeMap) { return !!outcomes[out]?.sale; }
export function isDM(out: string, outcomes: OutcomeMap) { return !!outcomes[out]?.dm; }
export function isPitch(_out: string) { return true; }
export function isQuoted(out: string, outcomes: OutcomeMap) { return !!outcomes[out]?.label?.toLowerCase().includes("quote"); }

export function formatAgo(iso: string) {
  const then = new Date(iso);
  const now = new Date();
  const min = Math.round((now.getTime() - then.getTime()) / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.round(d / 7);
  if (w < 5) return `${w}w ago`;
  const mo = Math.round(d / 30);
  return `${mo}mo ago`;
}

export function shortDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " \u00B7 " +
         d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function todayLabel() {
  const d = new Date();
  return d.toLocaleDateString("en-GB", { weekday: "long" }) + ", " +
         d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
}
