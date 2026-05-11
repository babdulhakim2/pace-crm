import * as XLSX from "xlsx";
import type { Visit, EnrichedBusiness } from "@/lib/data";
import { isDM, isSale } from "@/lib/data";

type OutcomeMap = Record<string, { label: string; dm: boolean; sale: boolean; tone: string }>;
type ServiceMap = Record<string, { label: string }>;

interface ExportData {
  visits: Visit[];
  services: ServiceMap;
  areas: string[];
  businessesById: Record<string, EnrichedBusiness>;
  allVisitsSorted: Visit[];
  outcomes: OutcomeMap;
  opts?: {
    audit?: boolean;
    biz?: boolean;
    perSvc?: boolean;
    perArea?: boolean;
    weekly?: boolean;
    serviceMatrix?: boolean;
  };
}

// Outcome codes that count as "DM spoken to"
function isDMCode(out: string, outcomes: OutcomeMap): boolean {
  return !!outcomes[out]?.dm;
}
function isSaleCode(out: string, outcomes: OutcomeMap): boolean {
  return !!outcomes[out]?.sale;
}

function getWeeks(visits: Visit[]) {
  if (visits.length === 0) return [];
  const sorted = [...visits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const first = new Date(sorted[0].date);
  const firstMonday = new Date(first);
  firstMonday.setDate(firstMonday.getDate() - ((firstMonday.getDay() + 6) % 7));
  firstMonday.setHours(0, 0, 0, 0);

  const weeks: { num: number; start: Date; end: Date; visits: Visit[] }[] = [];
  const last = new Date(sorted[sorted.length - 1].date);

  let weekStart = new Date(firstMonday);
  let weekNum = 1;
  while (weekStart <= last) {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const wv = sorted.filter((v) => {
      const d = new Date(v.date);
      return d >= weekStart && d < weekEnd;
    });
    if (wv.length > 0) {
      weeks.push({ num: weekNum, start: new Date(weekStart), end: new Date(weekEnd), visits: wv });
    }
    weekStart = weekEnd;
    weekNum++;
  }
  return weeks;
}

// Build a weekly sheet using aoa_to_sheet for precise cell placement
function buildWeekSheetAoa(
  weekVisits: Visit[],
  services: ServiceMap,
  outcomes: OutcomeMap,
  businessesById: Record<string, EnrichedBusiness>,
) {
  const svcCodes = Object.keys(services);
  const outCodes = Object.keys(outcomes);

  // Left-side headers: Date, City, Area, Business, Name, Notes, Gratitude, [services...]
  const leftHeaders = ["Date", "City", "Area", "Name of Business", "Name", "Notes", "Gratitude"];
  const svcHeaders = svcCodes.map((c) => services[c]?.label || c);

  // Middle tracking columns
  const trackHeaders = [
    "No of contacts / Visits", "Pitch Completed", "Quoted Y/N",
    "Quoted By Mobile / Email / Verbal", "Follow Up Qty", "Sold",
    "Date Sign Up", "Pre Magic Call Arranged", "Pre Magic Call Done",
    "Magic Begins", "Gratitude", "Referral", "Gratitude", "Referral Notes",
  ];

  const headerRow = [...leftHeaders, ...svcHeaders, ...trackHeaders];

  const rows: (string | number | null)[][] = [headerRow];

  // Visit data rows
  for (const v of weekVisits) {
    const biz = businessesById[v.bizId];
    if (!biz) continue;
    const row: (string | number | null)[] = [
      new Date(v.date).toLocaleDateString("en-GB"),
      "", // City
      biz.area,
      biz.name,
      biz.contact,
      v.notes,
      "", // Gratitude
    ];
    // Service outcome columns
    for (const code of svcCodes) {
      const item = v.items.find((it) => it.svc === code);
      row.push(item ? item.out : "");
    }
    // Tracking columns (mostly empty, populate what we can)
    const totalItemsForBiz = v.items.length;
    const hasSale = v.items.some((it) => isSale(it.out));
    const hasQuote = v.items.some((it) => ["IMPQ", "MAPQ"].includes(it.out));
    const hasReferral = v.items.some((it) => it.out === "R");

    row.push(totalItemsForBiz);          // No of contacts
    row.push(totalItemsForBiz > 0 ? "Y" : ""); // Pitch completed
    row.push(hasQuote ? "Y" : "");        // Quoted
    row.push("");                          // Quoted By
    row.push("");                          // Follow Up Qty
    row.push(hasSale ? "Y" : "");         // Sold
    row.push(hasSale ? new Date(v.date).toLocaleDateString("en-GB") : ""); // Date Sign Up
    row.push("");                          // Pre Magic Call Arranged
    row.push("");                          // Pre Magic Call Done
    row.push("");                          // Magic Begins
    row.push("");                          // Gratitude
    row.push(hasReferral ? "Y" : "");     // Referral
    row.push("");                          // Gratitude
    row.push("");                          // Referral Notes

    rows.push(row);
  }

  // Right-side per-service summary tables (starting at column AF = index 31)
  // We build them into the same rows array, extending columns
  const summaryStartCol = leftHeaders.length + svcHeaders.length + trackHeaders.length + 1; // +1 for blank separator col

  const allItems = weekVisits.flatMap((v) => v.items);
  let summaryRow = 0;

  for (const svcCode of svcCodes) {
    const svcItems = allItems.filter((it) => it.svc === svcCode);
    const totalContacts = svcItems.length;
    const dmSpoken = svcItems.filter((it) => isDMCode(it.out, outcomes)).length;
    const salesCount = svcItems.filter((it) => isSaleCode(it.out, outcomes)).length;
    const conv = dmSpoken > 0 ? Math.round((salesCount / dmSpoken) * 100) : 0;
    const referrals = svcItems.filter((it) => it.out === "R").length;

    // Ensure rows exist
    const ensureRow = (idx: number) => {
      while (rows.length <= idx) rows.push([]);
      while (rows[idx].length < summaryStartCol) rows[idx].push(null);
    };

    // Header row for this service summary
    ensureRow(summaryRow);
    rows[summaryRow].push("SERVICE:", "Outcome", "Outcome Total", "Total No of contacts + visits", "DMs spoken to", "Pitch to conversion", "No of referrals");
    summaryRow++;

    // Service name + CB row
    ensureRow(summaryRow);
    rows[summaryRow].push(
      services[svcCode]?.label || svcCode,
      "CB",
      svcItems.filter((it) => it.out === "CB").length,
      totalContacts,
      dmSpoken,
      conv ? `${conv}%` : "0%",
      referrals,
    );
    summaryRow++;

    // Remaining outcome rows (skip CB since it's in the first row)
    for (const outCode of outCodes) {
      if (outCode === "CB") continue;
      const count = svcItems.filter((it) => it.out === outCode).length;
      ensureRow(summaryRow);
      rows[summaryRow].push("", outCode, count, null, null, null, null);
      summaryRow++;
    }

    // Blank separator
    summaryRow++;
  }

  return XLSX.utils.aoa_to_sheet(rows);
}

function buildLegendSheet(outcomes: OutcomeMap) {
  const rows: (string | number | null)[][] = [];

  rows.push(["Pace CRM — Outcome Legend"]);
  rows.push([]);
  rows.push(["Code", "Meaning", "When to use it", "", "DM spoken to", "Sale"]);

  for (const [code, info] of Object.entries(outcomes)) {
    let when = "";
    if (info.sale) when = "Closed the sale on the spot or at a meeting";
    else if (info.dm && code.includes("M")) when = "Met with decision maker, discussed services";
    else if (info.dm && code.includes("Q")) when = "Met with DM, sent a quote";
    else if (code === "CB") when = "DM not available, call/visit back later";
    else if (code === "NI") when = "DM said no thanks";
    else if (code === "R") when = "Got a referral to another business";
    else if (code === "NDM") when = "Visited but no decision maker present";
    else if (code === "BC") when = "Business was temporarily closed";
    else if (code === "BCD") when = "Business has permanently closed down";
    else when = info.label;

    rows.push([code, info.label, when, "", info.dm ? "Yes" : "No", info.sale ? "Yes" : "No"]);
  }

  rows.push([]);
  rows.push(["How this workbook is wired up"]);
  rows.push(["1. Each week gets its own sheet with visit data on the left and per-service summaries on the right"]);
  rows.push(["2. Master Weeks combines all weeks into one sheet"]);
  rows.push(["3. Service Matrix shows latest outcome per service for every business"]);
  rows.push(["4. Audit Trail is a flat log of every contact event"]);

  return XLSX.utils.aoa_to_sheet(rows);
}

function buildTemplateSheet(services: ServiceMap) {
  const svcCodes = Object.keys(services);
  const leftHeaders = ["Date", "City", "Area", "Name of Business", "Name", "Notes", "Gratitude"];
  const svcHeaders = svcCodes.map((c) => services[c]?.label || c);
  const trackHeaders = [
    "No of contacts / Visits", "Pitch Completed", "Quoted Y/N",
    "Quoted By Mobile / Email / Verbal", "Follow Up Qty", "Sold",
    "Date Sign Up", "Pre Magic Call Arranged", "Pre Magic Call Done",
    "Magic Begins", "Gratitude", "Referral", "Gratitude", "Referral Notes",
  ];

  const headerRow = [...leftHeaders, ...svcHeaders, ...trackHeaders];
  const rows: (string | null)[][] = [headerRow];
  // Add 20 empty rows as template
  for (let i = 0; i < 20; i++) {
    rows.push(new Array(headerRow.length).fill(null));
  }
  return XLSX.utils.aoa_to_sheet(rows);
}

function buildAuditTrailSheet(
  allVisitsSorted: Visit[],
  businessesById: Record<string, EnrichedBusiness>,
  services: ServiceMap,
  outcomes: OutcomeMap,
) {
  const rows: (string | number | null)[][] = [];

  // Main headers
  const headers = ["Date", "Business", "City", "Area", "Service", "Service Name", "Outcome", "Outcome Name", "Via", "Notes"];
  // Quick summary sidebar starts at column 11 (K)
  const sidebarCol = headers.length + 1;

  rows.push([...headers, null, "Quick Summary"]);

  // Build sidebar data
  const allItems = allVisitsSorted.flatMap((v) => v.items);
  const totalContacts = allItems.length;
  const totalDms = allItems.filter((it) => isDMCode(it.out, outcomes)).length;
  const totalSales = allItems.filter((it) => isSaleCode(it.out, outcomes)).length;
  const convRate = totalDms ? Math.round((totalSales / totalDms) * 100) : 0;

  const summaryData = [
    ["Total contacts", totalContacts],
    ["DMs spoken to", totalDms],
    ["Sales closed", totalSales],
    ["Conversion rate", `${convRate}%`],
    ["Businesses", Object.keys(businessesById).length],
  ];

  let rowIdx = 0;
  allVisitsSorted.forEach((v) => {
    const biz = businessesById[v.bizId];
    if (!biz) return;
    v.items.forEach((it) => {
      const row: (string | number | null)[] = [
        new Date(v.date).toLocaleDateString("en-GB"),
        biz.name,
        "", // City
        biz.area,
        it.svc,
        services[it.svc]?.label || it.svc,
        it.out,
        outcomes[it.out]?.label || it.out,
        v.via,
        v.notes,
      ];
      // Add sidebar data for first few rows
      row.push(null); // blank separator
      if (rowIdx < summaryData.length) {
        row.push(summaryData[rowIdx][0] as string, summaryData[rowIdx][1] as string | number);
      }
      rows.push(row);
      rowIdx++;
    });
  });

  return XLSX.utils.aoa_to_sheet(rows);
}

function buildServiceMatrixSheet(
  businessesById: Record<string, EnrichedBusiness>,
  services: ServiceMap,
  outcomes: OutcomeMap,
) {
  const svcCodes = Object.keys(services);
  const rows: (string | number | null)[][] = [];

  // Headers
  const headers = ["Business", "City", "Area", ...svcCodes.map((c) => services[c]?.label || c)];
  // Color key sidebar
  const sidebarCol = headers.length + 1;
  rows.push([...headers, null, "Color Key"]);

  // Build color key data
  const colorKeyData = Object.entries(outcomes).map(([code, info]) => [code, info.label, info.tone]);

  let rowIdx = 0;
  for (const biz of Object.values(businessesById)) {
    const row: (string | number | null)[] = [
      biz.name,
      "", // City
      biz.area,
    ];
    for (const code of svcCodes) {
      row.push(biz.svcLatest[code]?.out || "");
    }
    row.push(null); // blank separator
    if (rowIdx < colorKeyData.length) {
      row.push(colorKeyData[rowIdx][0], colorKeyData[rowIdx][1], colorKeyData[rowIdx][2]);
    }
    rows.push(row);
    rowIdx++;
  }

  return XLSX.utils.aoa_to_sheet(rows);
}

export function buildSalesTrackerWorkbook(data: ExportData): XLSX.WorkBook {
  const { visits, services, areas, businessesById, allVisitsSorted, outcomes, opts } = data;
  const svcCodes = Object.keys(services);
  const outCodes = Object.keys(outcomes);
  const items = visits.flatMap((v) => v.items.map((it) => ({ ...it, date: v.date, bizId: v.bizId })));
  const effectiveOpts = opts || { audit: true, biz: true, weekly: true, serviceMatrix: true, perSvc: false, perArea: false };

  const wb = XLSX.utils.book_new();

  // 1. Legend sheet (always first)
  const legendWs = buildLegendSheet(outcomes);
  XLSX.utils.book_append_sheet(wb, legendWs, "Legend");

  // 2. Template sheet
  const templateWs = buildTemplateSheet(services);
  XLSX.utils.book_append_sheet(wb, templateWs, "Template");

  // 3. Weekly sheets
  if (effectiveOpts.weekly) {
    const weeks = getWeeks(visits);
    for (const week of weeks) {
      const ws = buildWeekSheetAoa(week.visits, services, outcomes, businessesById);
      XLSX.utils.book_append_sheet(wb, ws, `Week ${week.num}`);
    }

    // Master Weeks
    if (visits.length > 0) {
      const sortedVisits = [...visits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const ws = buildWeekSheetAoa(sortedVisits, services, outcomes, businessesById);
      XLSX.utils.book_append_sheet(wb, ws, "Master Weeks");
    }
  }

  // 4. Audit Trail
  if (effectiveOpts.audit) {
    const ws = buildAuditTrailSheet(allVisitsSorted, businessesById, services, outcomes);
    XLSX.utils.book_append_sheet(wb, ws, "Audit Trail");
  }

  // 5. Service Matrix
  if (effectiveOpts.serviceMatrix) {
    const ws = buildServiceMatrixSheet(businessesById, services, outcomes);
    XLSX.utils.book_append_sheet(wb, ws, "Service Matrix");
  }

  // 6. Businesses summary
  if (effectiveOpts.biz) {
    const bizRows = Object.values(businessesById).map((b) => ({
      Business: b.name,
      Type: b.type,
      Area: b.area,
      Contact: b.contact,
      Role: b.role,
      Stage: b.stage,
      "Total Contacts": b.contactCount,
      "Services Pitched": b.serviceCount,
      "Last Contact": b.lastVisit ? new Date(b.lastVisit.date).toLocaleDateString("en-GB") : "",
    }));
    const ws = XLSX.utils.json_to_sheet(bizRows);
    XLSX.utils.book_append_sheet(wb, ws, "Businesses");
  }

  // 7. Per-service breakdown
  if (effectiveOpts.perSvc) {
    const svcRows = Object.entries(services).map(([code, info]) => {
      const svcItems = items.filter((it) => it.svc === code);
      const dm = svcItems.filter((it) => isDM(it.out)).length;
      const sales = svcItems.filter((it) => isSale(it.out)).length;
      return {
        Service: code,
        "Service Name": info.label,
        Pitches: svcItems.length,
        "DMs Spoken": dm,
        Sales: sales,
        "Conv. Rate": dm ? `${Math.round((sales / dm) * 100)}%` : "0%",
      };
    });
    const ws = XLSX.utils.json_to_sheet(svcRows);
    XLSX.utils.book_append_sheet(wb, ws, "Per Service");
  }

  // 8. Per-area breakdown
  if (effectiveOpts.perArea) {
    const areaRows = areas.map((a) => {
      const areaItems = items.filter((it) => businessesById[it.bizId]?.area === a);
      const dm = areaItems.filter((it) => isDM(it.out)).length;
      const sales = areaItems.filter((it) => isSale(it.out)).length;
      return {
        Area: a,
        Contacts: areaItems.length,
        "DMs Spoken": dm,
        Sales: sales,
        "Conv. Rate": dm ? `${Math.round((sales / dm) * 100)}%` : "0%",
      };
    });
    const ws = XLSX.utils.json_to_sheet(areaRows);
    XLSX.utils.book_append_sheet(wb, ws, "Per Area");
  }

  return wb;
}
