// Server-side access to the SwapSpot market registry (contract §2.2, website client):
// anonymous GET `${APP_PLATFORM_URL}/v1/apps/${APP_PLATFORM_APP_SLUG}/swapspot/markets`, cached for
// an hour; the bundled snapshot (scripts/sync-markets-snapshot.mjs) when the endpoint is not
// configured, unreachable or returns an unusable body.
import { cache } from "react";
import snapshot from "./marketsSnapshot.json";
import {
  findMarket,
  isActiveMarket,
  loadMarkets,
  marketDisplayName,
  parseMarketsPayload,
  type Market,
} from "./marketsCore";
import { appPlatformAppBase } from "./supabaseAdmin";

export type { Market } from "./marketsCore";

const snapshotMarkets: Market[] = parseMarketsPayload(snapshot)?.markets ?? [];

export function marketsEndpoint() {
  const appBase = appPlatformAppBase();
  return appBase ? `${appBase}/markets` : null;
}

const loadRegistry = cache((live = false) =>
  loadMarkets({
    url: marketsEndpoint(),
    snapshot,
    fetchImpl: fetch as never,
    init: live ? { cache: "no-store" } : { next: { revalidate: 3600 } },
    onError: (reason) => console.warn(`SwapSpot markets registry unavailable, using the bundled snapshot: ${reason}`),
  }),
);

/** Active and preparing markets, ordered by `sort_order`. */
export async function getMarkets({ live = false } = {}): Promise<Market[]> {
  return (await loadRegistry(live)).markets;
}

/** The market of a country code, or null (no US fallback). */
export async function getMarket(code: string | null | undefined, options?: { live?: boolean }): Promise<Market | null> {
  return findMarket(await getMarkets(options), code);
}

/** Country name in the page locale from the registry `names`, falling back to English. */
export function marketName(code: string | null | undefined, locale: string, markets: readonly Market[] = snapshotMarkets) {
  return marketDisplayName(markets, code, locale);
}

export function isActive(market: Market | null | undefined): market is Market {
  return isActiveMarket(market);
}
