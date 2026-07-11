import type { QueryClient } from "@tanstack/react-query";
import { create } from "zustand";

import {
  isWsEvent,
  type AutonomousDecisionPayload,
  type WsEvent,
  type WsServerMessage,
} from "@/types/websocket";

const MAX_AUTONOMOUS_DECISIONS = 100;

export const AUTONOMOUS_DECISIONS_QUERY_KEY = [
  "autonomous-decisions",
] as const;

export const LATEST_AUTONOMOUS_DECISION_QUERY_KEY = [
  "autonomous-decision-latest",
] as const;

export interface AutonomousDecisionRecord
  extends AutonomousDecisionPayload {
  eventId: string;
  sequence: number;
  occurredAt: string;
}

export interface AutonomousDecisionCache {
  decisions: AutonomousDecisionRecord[];
  latest: AutonomousDecisionRecord | null;
}

interface WsState {
  connected: boolean;
  connectionId: string | null;
  currentSequence: number;
  lastMessageAt: string | null;
  lastError: string | null;
  lastAutonomousDecision: AutonomousDecisionRecord | null;

  setConnected: (connected: boolean) => void;
  setCurrentSequence: (sequence: number) => void;
  clearError: () => void;
  reset: () => void;

  handleServerMessage: (
    message: WsServerMessage,
    queryClient: QueryClient,
  ) => void;
}

const initialState = {
  connected: false,
  connectionId: null,
  currentSequence: 0,
  lastMessageAt: null,
  lastError: null,
  lastAutonomousDecision: null,
};

function isAutonomousDecisionPayload(
  payload: unknown,
): payload is AutonomousDecisionPayload {
  if (
    payload === null ||
    typeof payload !== "object"
  ) {
    return false;
  }

  const value = payload as Record<string, unknown>;

  const validOutcome =
    value.outcome === "ALLOW" ||
    value.outcome === "REJECT";

  const validDirection =
    value.direction === "BUY" ||
    value.direction === "SELL" ||
    value.direction === "HOLD";

  return (
    validOutcome &&
    validDirection &&
    typeof value.allowed === "boolean" &&
    typeof value.symbol === "string" &&
    typeof value.timeframe === "string" &&
    typeof value.confidence === "number" &&
    Number.isFinite(value.confidence) &&
    typeof value.reason === "string" &&
    Array.isArray(value.checks) &&
    value.checks.every(
      (check) => typeof check === "string",
    ) &&
    value.indicators !== null &&
    typeof value.indicators === "object" &&
    typeof value.evaluated_at === "string"
  );
}

function toAutonomousDecisionRecord(
  event: WsEvent,
): AutonomousDecisionRecord | null {
  if (
    event.event !== "AUTONOMOUS_DECISION_EVENT" ||
    !isAutonomousDecisionPayload(event.payload)
  ) {
    return null;
  }

  return {
    ...event.payload,
    eventId: event.event_id,
    sequence: event.sequence,
    occurredAt: event.occurred_at,
  };
}

function patchAutonomousDecisionCache(
  queryClient: QueryClient,
  decision: AutonomousDecisionRecord,
): void {
  queryClient.setQueryData<AutonomousDecisionRecord | null>(
    LATEST_AUTONOMOUS_DECISION_QUERY_KEY,
    decision,
  );

  queryClient.setQueryData<AutonomousDecisionCache>(
    AUTONOMOUS_DECISIONS_QUERY_KEY,
    (current) => {
      const existing = current?.decisions ?? [];

      const duplicate = existing.some(
        (item) =>
          item.eventId === decision.eventId ||
          item.sequence === decision.sequence,
      );

      if (duplicate) {
        return {
          decisions: existing,
          latest: current?.latest ?? decision,
        };
      }

      return {
        decisions: [
          decision,
          ...existing,
        ].slice(0, MAX_AUTONOMOUS_DECISIONS),
        latest: decision,
      };
    },
  );

  /*
   * Patch broader dashboard caches opportunistically. These cache entries may
   * not exist yet, which is fine: setQueryData creates them without causing a
   * network request.
   */
  queryClient.setQueryData<
    Record<string, unknown> | undefined
  >(
    ["dashboard-snapshot"],
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        last_autonomous_decision: decision,
      };
    },
  );

  queryClient.setQueryData<
    Record<string, unknown> | undefined
  >(
    ["latest-signal"],
    (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        autonomous_decision: decision,
      };
    },
  );
}

function handleControlMessage(
  message: Exclude<WsServerMessage, WsEvent>,
  set: (
    partial:
      | Partial<WsState>
      | ((
          state: WsState,
        ) => Partial<WsState>),
  ) => void,
): void {
  if ("action" in message) {
    switch (message.action) {
      case "connected":
        set({
          connected: true,
          connectionId: message.conn_id,
          currentSequence:
            message.current_sequence,
          lastMessageAt:
            new Date().toISOString(),
          lastError: null,
        });
        return;

      case "ping":
      case "subscribed":
      case "unsubscribed":
      case "replay_complete":
        set({
          lastMessageAt:
            new Date().toISOString(),
        });
        return;

      default:
        return;
    }
  }

  if ("error" in message) {
    set({
      lastError: message.error,
      lastMessageAt:
        new Date().toISOString(),
    });
  }
}

export const useWsStore = create<WsState>(
  (set, get) => ({
    ...initialState,

    setConnected: (connected) => {
      set({
        connected,
        connectionId: connected
          ? get().connectionId
          : null,
        lastMessageAt:
          new Date().toISOString(),
      });
    },

    setCurrentSequence: (currentSequence) => {
      if (!Number.isFinite(currentSequence)) {
        return;
      }

      set({ currentSequence });
    },

    clearError: () => {
      set({ lastError: null });
    },

    reset: () => {
      set(initialState);
    },

    handleServerMessage: (
      message,
      queryClient,
    ) => {
      try {
        if (!isWsEvent(message)) {
          handleControlMessage(
            message,
            set,
          );
          return;
        }

        const state = get();

        /*
         * Ignore duplicate or replayed events already processed. Sequence zero
         * is allowed for backends that do not begin sequencing at one.
         */
        if (
          message.sequence > 0 &&
          message.sequence <=
            state.currentSequence
        ) {
          return;
        }

        const receivedAt =
          new Date().toISOString();

        set({
          currentSequence: Math.max(
            state.currentSequence,
            message.sequence,
          ),
          lastMessageAt: receivedAt,
          lastError: null,
        });

        if (
          message.event !==
          "AUTONOMOUS_DECISION_EVENT"
        ) {
          return;
        }

        const decision =
          toAutonomousDecisionRecord(
            message,
          );

        if (!decision) {
          set({
            lastError:
              "Received an invalid AUTONOMOUS_DECISION_EVENT payload.",
          });
          return;
        }

        /*
         * Update Zustand first so subscribed components render immediately,
         * then patch React Query caches without invalidation or refetching.
         */
        set({
          lastAutonomousDecision:
            decision,
        });

        patchAutonomousDecisionCache(
          queryClient,
          decision,
        );
      } catch (error) {
        const messageText =
          error instanceof Error
            ? error.message
            : "Unknown WebSocket processing error.";

        set({
          lastError: messageText,
          lastMessageAt:
            new Date().toISOString(),
        });

        console.error(
          "[ws-store] Failed to process WebSocket message:",
          error,
        );
      }
    },
  }),
);

export const selectWsConnected = (
  state: WsState,
): boolean => state.connected;

export const selectWsSequence = (
  state: WsState,
): number => state.currentSequence;

export const selectLastAutonomousDecision = (
  state: WsState,
): AutonomousDecisionRecord | null =>
  state.lastAutonomousDecision;

export const selectWsError = (
  state: WsState,
): string | null => state.lastError;