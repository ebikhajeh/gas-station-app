import type { DailyEntry } from "../../../domain/daily/daily.model";
import { dipChart1755 } from "../data/dipChart1755";

export type FuelStatus = "missing" | "check" | "ok";
export type FuelTankKey = "REG_T1" | "REG_T2" | "SUP" | "DSL";
type TankType = "regular" | "supreme" | "diesel";

const n = (value: number | null | undefined): number => value ?? 0;

const isFilled = (value: number | null | undefined): boolean =>
  value !== null && value !== undefined && Number.isFinite(value);

const round0 = (value: number): number => Math.round(value);

const sumPair = (
  morning: number | null | undefined,
  evening: number | null | undefined
): number => round0(n(morning) + n(evening));

type DipVolumes = {
  regular: number | null;
  supreme: number | null;
  diesel: number | null;
};

const toChartNumberOrNull = (value: string | undefined): number | null => {
  const v = (value ?? "").trim();
  if (!v) return null;

  const parsed = Number(v.replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
};

const buildDipChartMap = (raw: string): Map<number, DipVolumes> => {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const startIndex = lines[0]?.toLowerCase().startsWith("cm") ? 1 : 0;

  const map = new Map<number, DipVolumes>();

  for (let i = startIndex; i < lines.length; i += 1) {
    const parts = lines[i].split(/\s+/);

    const dip = Number(parts[0]);
    if (!Number.isFinite(dip)) continue;

    const regular = toChartNumberOrNull(parts[1]);
    const supreme = toChartNumberOrNull(parts[2]);
    const diesel = toChartNumberOrNull(parts[3]);

    map.set(dip, { regular, supreme, diesel });
  }

  return map;
};

const dipChartMap = buildDipChartMap(dipChart1755);

const tankToChartType = (tank: FuelTankKey): TankType => {
  if (tank === "REG_T1" || tank === "REG_T2") return "regular";
  if (tank === "SUP") return "supreme";
  return "diesel";
};

export const getLitersFromDip = (
  dip: number | null | undefined,
  tank: TankType
): number | null => {
  if (dip === null || dip === undefined || !Number.isFinite(dip)) return null;

  const exact = dipChartMap.get(dip);
  if (exact) return exact[tank];

  const lo = Math.floor(dip);
  const hi = Math.ceil(dip);

  if (lo === hi) return null;

  const a = dipChartMap.get(lo)?.[tank] ?? null;
  const b = dipChartMap.get(hi)?.[tank] ?? null;

  if (a === null || b === null) return null;

  const t = (dip - lo) / (hi - lo);
  return a + t * (b - a);
};

export type FuelSalesTotals = {
  reg87: number;
  ex89: number;
  sup91: number;
  sup93: number;
  dsl: number;
};

export const computeFuelSalesTotals = (entry: DailyEntry): FuelSalesTotals => {
  return {
    reg87: sumPair(entry.fuelSalesReg87Morning, entry.fuelSalesReg87Evening),
    ex89: sumPair(entry.fuelSalesEx89Morning, entry.fuelSalesEx89Evening),
    sup91: sumPair(entry.fuelSalesSup91Morning, entry.fuelSalesSup91Evening),
    sup93: sumPair(entry.fuelSalesSup93Morning, entry.fuelSalesSup93Evening),
    dsl: sumPair(entry.fuelSalesDslMorning, entry.fuelSalesDslEvening),
  };
};

export type FuelRequiredFieldsState = {
  allRequiredFilled: boolean;
  allRequiredEmpty: boolean;
};

export const computeFuelRequiredFieldsState = (
  entry: DailyEntry
): FuelRequiredFieldsState => {
  const requiredValues = [
    entry.fuelOpeningRegTotal,
    entry.fuelOpeningSup93,
    entry.fuelOpeningDsl,

    entry.fuelSalesReg87Morning,
    entry.fuelSalesReg87Evening,
    entry.fuelSalesEx89Morning,
    entry.fuelSalesEx89Evening,
    entry.fuelSalesSup91Morning,
    entry.fuelSalesSup91Evening,
    entry.fuelSalesSup93Morning,
    entry.fuelSalesSup93Evening,
    entry.fuelSalesDslMorning,
    entry.fuelSalesDslEvening,

    entry.fuelClosingDipRegT1,
    entry.fuelClosingDipRegT2,
    entry.fuelClosingDipSup,
    entry.fuelClosingDipDsl,
  ];

  return {
    allRequiredFilled: requiredValues.every(isFilled),
    allRequiredEmpty: requiredValues.every((value) => !isFilled(value)),
  };
};

export const computeFuelCheck = (entry: DailyEntry): boolean => {
  const { allRequiredFilled } = computeFuelRequiredFieldsState(entry);

  return (
    allRequiredFilled &&
    entry.fuelCalledScamTransport === true &&
    entry.fuelEnteredOnWebsite === true
  );
};

export const computeFuelStatus = (entry: DailyEntry | null | undefined): FuelStatus => {
  if (!entry) return "missing";

  const { allRequiredFilled, allRequiredEmpty } =
    computeFuelRequiredFieldsState(entry);

  if (
    allRequiredEmpty &&
    !entry.fuelCalledScamTransport &&
    !entry.fuelEnteredOnWebsite
  ) {
    return "missing";
  }

  if (!allRequiredFilled) {
    return "missing";
  }

  if (entry.fuelCalledScamTransport && entry.fuelEnteredOnWebsite) {
    return "ok";
  }

  return "check";
};

export type FuelDipLiters = {
  REG_T1: number | null;
  REG_T2: number | null;
  SUP: number | null;
  DSL: number | null;
};

export const computeFuelDipLiters = (entry: DailyEntry): FuelDipLiters => {
  return {
    REG_T1: getLitersFromDip(entry.fuelClosingDipRegT1, tankToChartType("REG_T1")),
    REG_T2: getLitersFromDip(entry.fuelClosingDipRegT2, tankToChartType("REG_T2")),
    SUP: getLitersFromDip(entry.fuelClosingDipSup, tankToChartType("SUP")),
    DSL: getLitersFromDip(entry.fuelClosingDipDsl, tankToChartType("DSL")),
  };
};

export type FuelEstimatedInventory = {
  reg: number;
  sup: number;
  dsl: number;
};

export const computeFuelEstimatedInventory = (
  entry: DailyEntry
): FuelEstimatedInventory => {
  const sales = computeFuelSalesTotals(entry);

  const reg = round0(
    n(entry.fuelOpeningRegTotal) -
      sales.reg87 -
      sales.ex89 * 0.668 -
      sales.sup91 * 0.331 +
      n(entry.fuelDeliveryRegTotal)
  );

  const sup = round0(
    n(entry.fuelOpeningSup93) -
      sales.sup93 -
      sales.ex89 * 0.332 -
      sales.sup91 * 0.669 +
      n(entry.fuelDeliverySup93)
  );

  const dsl = round0(
    n(entry.fuelOpeningDsl) - sales.dsl + n(entry.fuelDeliveryDsl)
  );

  return { reg, sup, dsl };
};

export type FuelDifferences = {
  closingRegTotal: number;
  closingSup: number;
  closingDsl: number;
  diffReg: number;
  diffSup: number;
  diffDsl: number;
};

export const computeFuelDifferences = (entry: DailyEntry): FuelDifferences => {
  const liters = computeFuelDipLiters(entry);
  const estimated = computeFuelEstimatedInventory(entry);

  const closingRegTotal = round0(n(liters.REG_T1) + n(liters.REG_T2));
  const closingSup = round0(n(liters.SUP));
  const closingDsl = round0(n(liters.DSL));

  return {
    closingRegTotal,
    closingSup,
    closingDsl,
    diffReg: round0(closingRegTotal - estimated.reg),
    diffSup: round0(closingSup - estimated.sup),
    diffDsl: round0(closingDsl - estimated.dsl),
  };
};

export type FuelNextOpening = {
  reg: number;
  sup: number;
  dsl: number;
};

export const computeFuelNextOpening = (entry: DailyEntry): FuelNextOpening => {
  const diffs = computeFuelDifferences(entry);

  return {
    reg: diffs.closingRegTotal,
    sup: diffs.closingSup,
    dsl: diffs.closingDsl,
  };
};