"use client";
import React from "react";
import {
  OUTCOMES as DEFAULT_OUTCOMES,
  enrichBusinesses,
  type Business,
  type Visit,
  type EnrichedBusiness,
} from "@/lib/data";
import type { PaceServerData } from "@/app/actions/data";

// Lazy-import server actions to avoid bundling server code in client chunks
const serverActions = {
  addVisit: () => import("@/app/actions/visits").then((m) => m.addVisitAction),
  addBusiness: () => import("@/app/actions/businesses").then((m) => m.addBusinessAction),
  updateBusiness: () => import("@/app/actions/businesses").then((m) => m.updateBusinessAction),
  updateBusinessStage: () => import("@/app/actions/businesses").then((m) => m.updateBusinessStageAction),
  addService: () => import("@/app/actions/config").then((m) => m.addServiceAction),
  updateService: () => import("@/app/actions/config").then((m) => m.updateServiceAction),
  removeService: () => import("@/app/actions/config").then((m) => m.removeServiceAction),
  addArea: () => import("@/app/actions/config").then((m) => m.addAreaAction),
  removeArea: () => import("@/app/actions/config").then((m) => m.removeAreaAction),
  setUserName: () => import("@/app/actions/config").then((m) => m.setUserNameAction),
  addOutcome: () => import("@/app/actions/config").then((m) => m.addOutcomeAction),
  updateOutcome: () => import("@/app/actions/config").then((m) => m.updateOutcomeAction),
  removeOutcome: () => import("@/app/actions/config").then((m) => m.removeOutcomeAction),
  resetToDemo: () => import("@/app/actions/data").then((m) => m.resetToDemoAction),
  clearAll: () => import("@/app/actions/data").then((m) => m.clearAllAction),
};

interface PaceState {
  userName: string;
  outcomes: Record<string, { label: string; dm: boolean; sale: boolean; tone: string }>;
  services: Record<string, { label: string }>;
  areas: string[];
  businesses: Business[];
  visits: Visit[];
  stageOverrides: Record<string, string>;
}

interface PaceCtx extends PaceState {
  businessesById: Record<string, EnrichedBusiness>;
  allVisitsSorted: Visit[];
  addVisit: (v: Visit) => void;
  updateBusinessStage: (bizId: string, stage: string) => void;
  addService: (code: string, label: string) => void;
  updateService: (code: string, label: string) => void;
  removeService: (code: string) => void;
  addArea: (name: string) => void;
  removeArea: (name: string) => void;
  addOutcome: (code: string, o: { label: string; dm: boolean; sale: boolean; tone: string }) => void;
  updateOutcome: (code: string, o: { label: string; dm: boolean; sale: boolean; tone: string }) => void;
  removeOutcome: (code: string) => void;
  setUserName: (name: string) => void;
  resetToDemo: () => void;
  clearAll: () => void;
  addBusiness: (b: Business) => void;
  updateBusiness: (b: Business) => void;
}

const PaceContext = React.createContext<PaceCtx | null>(null);

export function PaceProvider({
  children,
  initialData,
}: {
  children: React.ReactNode;
  initialData: PaceServerData;
}) {
  const [state, setState] = React.useState<PaceState>(() => ({
    userName: initialData.userName,
    outcomes: initialData.outcomes,
    services: initialData.services,
    areas: initialData.areas,
    businesses: initialData.businesses,
    visits: initialData.visits,
    stageOverrides: initialData.stageOverrides,
  }));

  const businessesById = React.useMemo(
    () => enrichBusinesses(state.businesses, state.visits, state.outcomes, state.stageOverrides),
    [state.businesses, state.visits, state.outcomes, state.stageOverrides],
  );

  const allVisitsSorted = React.useMemo(
    () => [...state.visits].sort((a, c) => new Date(c.date).getTime() - new Date(a.date).getTime()),
    [state.visits],
  );

  // Helper: optimistic update with server action, rollback on failure
  // Uses a ref to capture state before the update for rollback
  const stateRef = React.useRef(state);
  stateRef.current = state;

  const optimistic = React.useCallback(
    (updater: (s: PaceState) => PaceState, action: () => Promise<unknown>) => {
      const prev = stateRef.current;
      setState(updater);
      action().catch((err) => {
        console.error("[Pace] Server action failed, rolling back:", err);
        setState(prev);
      });
    },
    [],
  );

  const addVisit = React.useCallback(
    (v: Visit) => {
      optimistic(
        (s) => ({ ...s, visits: [...s.visits, v] }),
        async () => {
          const fn = await serverActions.addVisit();
          await fn(v);
        },
      );
    },
    [optimistic],
  );

  const updateBusinessStage = React.useCallback(
    (bizId: string, stage: string) => {
      optimistic(
        (s) => ({ ...s, stageOverrides: { ...s.stageOverrides, [bizId]: stage } }),
        async () => {
          const fn = await serverActions.updateBusinessStage();
          await fn(bizId, stage);
        },
      );
    },
    [optimistic],
  );

  const addService = React.useCallback(
    (code: string, label: string) => {
      optimistic(
        (s) => ({ ...s, services: { ...s.services, [code]: { label } } }),
        async () => {
          const fn = await serverActions.addService();
          await fn(code, label);
        },
      );
    },
    [optimistic],
  );

  const updateService = React.useCallback(
    (code: string, label: string) => {
      optimistic(
        (s) => ({ ...s, services: { ...s.services, [code]: { label } } }),
        async () => {
          const fn = await serverActions.updateService();
          await fn(code, label);
        },
      );
    },
    [optimistic],
  );

  const removeService = React.useCallback(
    (code: string) => {
      optimistic(
        (s) => {
          const next = { ...s.services };
          delete next[code];
          return { ...s, services: next };
        },
        async () => {
          const fn = await serverActions.removeService();
          await fn(code);
        },
      );
    },
    [optimistic],
  );

  const addArea = React.useCallback(
    (name: string) => {
      optimistic(
        (s) => ({
          ...s,
          areas: s.areas.includes(name) ? s.areas : [...s.areas, name],
        }),
        async () => {
          const fn = await serverActions.addArea();
          await fn(name);
        },
      );
    },
    [optimistic],
  );

  const removeArea = React.useCallback(
    (name: string) => {
      optimistic(
        (s) => ({ ...s, areas: s.areas.filter((a) => a !== name) }),
        async () => {
          const fn = await serverActions.removeArea();
          await fn(name);
        },
      );
    },
    [optimistic],
  );

  const addOutcome = React.useCallback(
    (code: string, o: { label: string; dm: boolean; sale: boolean; tone: string }) => {
      optimistic(
        (s) => ({ ...s, outcomes: { ...s.outcomes, [code]: o } }),
        async () => {
          const fn = await serverActions.addOutcome();
          await fn(code, o.label, o.dm, o.sale, o.tone);
        },
      );
    },
    [optimistic],
  );

  const updateOutcome = React.useCallback(
    (code: string, o: { label: string; dm: boolean; sale: boolean; tone: string }) => {
      optimistic(
        (s) => ({ ...s, outcomes: { ...s.outcomes, [code]: o } }),
        async () => {
          const fn = await serverActions.updateOutcome();
          await fn(code, o.label, o.dm, o.sale, o.tone);
        },
      );
    },
    [optimistic],
  );

  const removeOutcome = React.useCallback(
    (code: string) => {
      optimistic(
        (s) => {
          const next = { ...s.outcomes };
          delete next[code];
          return { ...s, outcomes: next };
        },
        async () => {
          const fn = await serverActions.removeOutcome();
          await fn(code);
        },
      );
    },
    [optimistic],
  );

  const setUserName = React.useCallback(
    (name: string) => {
      optimistic(
        (s) => ({ ...s, userName: name }),
        async () => {
          const fn = await serverActions.setUserName();
          await fn(name);
        },
      );
    },
    [optimistic],
  );

  const resetToDemo = React.useCallback(() => {
    (async () => {
      const fn = await serverActions.resetToDemo();
      const data = await fn();
      setState({
        userName: data.userName,
        outcomes: data.outcomes,
        services: data.services,
        areas: data.areas,
        businesses: data.businesses,
        visits: data.visits,
        stageOverrides: data.stageOverrides,
      });
    })();
  }, []);

  const clearAll = React.useCallback(() => {
    // Optimistic: clear local state immediately
    setState({
      userName: "",
      outcomes: { ...DEFAULT_OUTCOMES },
      services: {},
      areas: [],
      businesses: [],
      visits: [],
      stageOverrides: {},
    });
    (async () => {
      const fn = await serverActions.clearAll();
      const data = await fn();
      setState({
        userName: data.userName,
        outcomes: data.outcomes,
        services: data.services,
        areas: data.areas,
        businesses: data.businesses,
        visits: data.visits,
        stageOverrides: data.stageOverrides,
      });
    })();
  }, []);

  const addBusiness = React.useCallback(
    (b: Business) => {
      optimistic(
        (s) => ({ ...s, businesses: [...s.businesses, b] }),
        async () => {
          const fn = await serverActions.addBusiness();
          await fn(b);
        },
      );
    },
    [optimistic],
  );

  const updateBusiness = React.useCallback(
    (b: Business) => {
      optimistic(
        (s) => ({
          ...s,
          businesses: s.businesses.map((existing) =>
            existing.id === b.id ? b : existing,
          ),
        }),
        async () => {
          const fn = await serverActions.updateBusiness();
          await fn(b);
        },
      );
    },
    [optimistic],
  );

  const ctx: PaceCtx = {
    ...state,
    businessesById,
    allVisitsSorted,
    addVisit,
    updateBusinessStage,
    addService,
    updateService,
    removeService,
    addArea,
    removeArea,
    addOutcome,
    updateOutcome,
    removeOutcome,
    setUserName,
    resetToDemo,
    clearAll,
    addBusiness,
    updateBusiness,
  };

  return <PaceContext.Provider value={ctx}>{children}</PaceContext.Provider>;
}

export function usePace(): PaceCtx {
  const ctx = React.useContext(PaceContext);
  if (!ctx) throw new Error("usePace must be used within PaceProvider");
  return ctx;
}
