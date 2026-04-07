# Data authority: who owns each feed (port-adjacent context)

## Cargo scope: general cargo (no containers)

This planning model targets **general / breakbulk / non-containerized cargo** (e.g. pallets, skids, bundles, project pieces, bulk bagged or loose commodities handled as **weight, cube, and floor area**). It is **not** framed around TEU or container counts.

- **Internal forecasts and reservations** should use units your ops already trust: **square feet of floor**, **cubic feet of stowage**, **pallet positions**, **metric (or short) tons**, or **piece counts** for standardized lifts—not box/container equivalents.
- **AIS / vessel ETAs** still help answer **when** a ship (or barge) creates a surge at the gate or shed, even when cargo is general; they do **not** replace stowage plans or manifest detail from your terminal and customers.

Use this split when wiring integrations: **internal systems are authoritative for what needs space**; **external APIs refine when pressure arrives and when to replan**.

## Internal (source of truth for allocation)

| Feed | Typical owner | Role in utilization |
|------|----------------|---------------------|
| TMS / berth & gate bookings | Port ops or terminal partner | Baseline volumes, customer/lane, time windows |
| Contracts & SLAs | Commercial / legal | Hard vs soft holds, bump rules, priority tiers |
| WMS / yard inventory | Warehouse operator | Actual occupancy vs planned reservations |
| Forecast spreadsheets / EDI from importers | Customer success or ops | Recurring “predictable” flow between TMS cutovers |
| Terminal / stevedore discharge schedules | Terminal IT | Tie reservations to discharge windows when available |

## External (signals, not cargo manifests)

| Feed | Typical owner | Role |
|------|----------------|------|
| AIS / vessel ETAs & port events | Commercial data provider (API key) | ETA shifts, arrival pressure; triggers replanning |
| NOAA NWS (alerts, marine forecasts) | Public API | Weather-driven delay risk; triggers replanning |
| CO-OPS tides/currents (optional) | NOAA | Berth and lightering timing where tide-sensitive |

## Not a public “all shipments” API

CBP **ACE** and manifest filing are compliance channels, not a general-purpose public read API for third-party warehouse planning. Cargo detail for planning usually arrives through **importers, forwarders, terminal systems**, or your own bookings—not one open federal shipment feed.

## UN/LOCODE

Use your local port UN/LOCODE for AIS queries.
