"use client";
import React from "react";

function makeIcon(d: React.ReactNode, defaultSize = 16) {
  const Icon = ({ size = defaultSize, ...rest }: { size?: number } & React.SVGProps<SVGSVGElement>) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
         {...rest}>{d}</svg>
  );
  Icon.displayName = "Icon";
  return Icon;
}

export const IconHome      = makeIcon(<><path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" /></>);
export const IconMic       = makeIcon(<><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><path d="M12 18v3" /></>);
export const IconPipeline  = makeIcon(<><rect x="3"  y="4" width="4" height="14" rx="1" /><rect x="10" y="4" width="4" height="9"  rx="1" /><rect x="17" y="4" width="4" height="17" rx="1" /></>);
export const IconTrail     = makeIcon(<><path d="M5 5h14M5 10h14M5 15h9M5 20h6" /></>);
export const IconMap       = makeIcon(<><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" /></>);
export const IconStats     = makeIcon(<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>);
export const IconExport    = makeIcon(<><path d="M12 3v12" /><path d="m7 8 5-5 5 5" /><path d="M5 17v3a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3" /></>);
export const IconArrowRight= makeIcon(<><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>);
export const IconClose     = makeIcon(<><path d="M6 6l12 12M18 6 6 18" /></>);
export const IconCheck     = makeIcon(<><path d="m5 12 5 5 9-11" /></>);
export const IconSearch    = makeIcon(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>);
export const IconFilter    = makeIcon(<><path d="M3 5h18l-7 9v6l-4-2v-4L3 5Z" /></>);
export const IconPlus      = makeIcon(<><path d="M12 5v14M5 12h14" /></>);
export const IconMinus     = makeIcon(<><path d="M5 12h14" /></>);
export const IconChevron   = makeIcon(<><path d="m9 6 6 6-6 6" /></>);
export const IconDown      = makeIcon(<><path d="m6 9 6 6 6-6" /></>);
export const IconCalendar  = makeIcon(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>);
export const IconPhone     = makeIcon(<><path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2Z" /></>);
export const IconBuilding  = makeIcon(<><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" /></>);
export const IconPencil    = makeIcon(<><path d="M4 20h4l11-11-4-4L4 16Z" /><path d="m13 5 4 4" /></>);
export const IconTrash     = makeIcon(<><path d="M4 7h16M9 7V4h6v3M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" /></>);
export const IconClipboard = makeIcon(<><rect x="6" y="4" width="12" height="16" rx="2" /><path d="M9 4h6v3H9z" /></>);
export const IconMicOff    = makeIcon(<><path d="M3 3l18 18" /><path d="M9 9v2a3 3 0 0 0 5.66 1.4" /><path d="M15 11V6a3 3 0 0 0-5.7-1.3" /><path d="M19 11a7 7 0 0 1-1.5 4.3" /><path d="M12 18v3" /></>);
export const IconUser      = makeIcon(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>);
export const IconLocation  = makeIcon(<><path d="M12 22s7-7.6 7-13a7 7 0 1 0-14 0c0 5.4 7 13 7 13Z" /><circle cx="12" cy="9" r="2.5" /></>);
export const IconClock     = makeIcon(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
export const IconSparkle   = makeIcon(<><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></>);
export const IconChevronRight = makeIcon(<><path d="m9 6 6 6-6 6" /></>);
export const IconRefresh   = makeIcon(<><path d="M3 12a9 9 0 0 1 15.4-6.4L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15.4 6.4L3 16" /><path d="M3 21v-5h5" /></>);
export const IconSheet     = makeIcon(<><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></>);
export const IconCsv       = makeIcon(<><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 10h8M8 14h8M8 18h5" /></>);
export const IconReceipt   = makeIcon(<><path d="M5 3v18l2-1.5 2 1.5 2-1.5 2 1.5 2-1.5 2 1.5 2-1.5V3Z" /><path d="M8 8h8M8 12h8M8 16h5" /></>);
export const IconShop      = makeIcon(<><path d="M4 8 6 4h12l2 4" /><path d="M4 8v11a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V8" /><path d="M9 21v-6h6v6" /><path d="M4 8a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0" /></>);
export const IconChartBar  = makeIcon(<><path d="M4 20h16" /><rect x="6" y="10" width="3" height="8" /><rect x="12" y="6" width="3" height="12" /><rect x="18" y="13" width="3" height="5" /></>);
export const IconFunnel    = makeIcon(<><path d="M3 5h18l-7 9v5l-4 1v-6L3 5Z" /></>);
export const IconSettings  = makeIcon(<><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></>);
export const IconGrip      = makeIcon(<><circle cx="9" cy="6" r="1.5" fill="currentColor" stroke="none" /><circle cx="15" cy="6" r="1.5" fill="currentColor" stroke="none" /><circle cx="9" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="15" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="9" cy="18" r="1.5" fill="currentColor" stroke="none" /><circle cx="15" cy="18" r="1.5" fill="currentColor" stroke="none" /></>);
export const IconLogout    = makeIcon(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></>);
