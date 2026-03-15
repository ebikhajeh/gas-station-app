export type DateKey = string; // "YYYY-MM-DD"

export type CigarettesCountMap = Record<string, number | null>;

export type DailyEntry = {
  // Prepaid
  prepaidInput: number | null;

  // End of Day (existing)
  endOfDayInput1: number | null;
  endOfDayInput2: number | null;

  // End of Day - new totals
  endOfDayFuelSales: number | null;
  endOfDayPumpTests: number | null;
  endOfDayItemSales: number | null;
  endOfDayWrongShelfPrice: number | null;
  endOfDayDamagedProduct: number | null;
  endOfDayEmployeeDiscount: number | null;
  endOfDayGst: number | null;
  endOfDayPst: number | null;
  endOfDayPstv: number | null;
  endOfDayGstv: number | null;
  endOfDayPennyRounding: number | null;
  endOfDayTotalPos: number | null;
  endOfDayPumpOverRun: number | null;
  endOfDayDeliveryApp: number | null;
  endOfDayRedemptions: number | null;
  endOfDayCigarettes02: number | null;
  endOfDayOtherTobacco03: number | null;
  endOfDayEssoGift925: number | null;

  // End of Day - Propane POS
  propaneExchange: number | null;
  propaneNew: number | null;

  // End of Day - Lotto refs
  onlineLotto41: number | null;
  scratchLotto27: number | null;
  payouts: number | null;

  // Propane Counts
  fillOpening: number | null;
  fillDelivery: number | null;
  fillClosing: number | null;

  totalOpening: number | null;
  totalDelivery: number | null;
  totalClosing: number | null;

  // Fuel - Opening
  fuelOpeningRegTotal: number | null;
  fuelOpeningSup93: number | null;
  fuelOpeningDsl: number | null;

  // Fuel - Delivery
  fuelDeliveryRegTotal: number | null;
  fuelDeliverySup93: number | null;
  fuelDeliveryDsl: number | null;

  // Fuel - Sales
  fuelSalesReg87Morning: number | null;
  fuelSalesReg87Evening: number | null;

  fuelSalesEx89Morning: number | null;
  fuelSalesEx89Evening: number | null;

  fuelSalesSup91Morning: number | null;
  fuelSalesSup91Evening: number | null;

  fuelSalesSup93Morning: number | null;
  fuelSalesSup93Evening: number | null;

  fuelSalesDslMorning: number | null;
  fuelSalesDslEvening: number | null;

  // Fuel - Closing Dip
  fuelClosingDipRegT1: number | null;
  fuelClosingDipRegT2: number | null;
  fuelClosingDipSup: number | null;
  fuelClosingDipDsl: number | null;

  // Fuel - Checklist
  fuelCalledScamTransport: boolean;
  fuelEnteredOnWebsite: boolean;

  // Cash & Drops - Morning
  cashMorningCashierName: string | null;
  cashMorningBeginTray: number | null;
  cashMorningOther: number | null;
  cashMorningEndingTray: number | null;
  cashMorningCanadianCash: number | null;

  // Cash & Drops - Morning Drop 1
  cashMorningDrop1_5: number | null;
  cashMorningDrop1_10: number | null;
  cashMorningDrop1_20: number | null;
  cashMorningDrop1_50: number | null;
  cashMorningDrop1_100: number | null;

  // Cash & Drops - Morning Drop 2
  cashMorningDrop2_5: number | null;
  cashMorningDrop2_10: number | null;
  cashMorningDrop2_20: number | null;
  cashMorningDrop2_50: number | null;
  cashMorningDrop2_100: number | null;

  // Cash & Drops - Morning Coins / USD
  cashMorningCoinsDrop1: number | null;
  cashMorningCoinsDrop2: number | null;
  cashMorningCoinsDrop3: number | null;
  cashMorningUsDrop: number | null;

  // Cash & Drops - Evening
  cashEveningCashierName: string | null;
  cashEveningBeginTray: number | null;
  cashEveningOther: number | null;
  cashEveningEndingTray: number | null;
  cashEveningCanadianCash: number | null;

  // Cash & Drops - Evening Drop 1
  cashEveningDrop1_5: number | null;
  cashEveningDrop1_10: number | null;
  cashEveningDrop1_20: number | null;
  cashEveningDrop1_50: number | null;
  cashEveningDrop1_100: number | null;

  // Cash & Drops - Evening Drop 2
  cashEveningDrop2_5: number | null;
  cashEveningDrop2_10: number | null;
  cashEveningDrop2_20: number | null;
  cashEveningDrop2_50: number | null;
  cashEveningDrop2_100: number | null;

  // Cash & Drops - Evening Coins / USD
  cashEveningCoinsDrop1: number | null;
  cashEveningCoinsDrop2: number | null;
  cashEveningCoinsDrop3: number | null;
  cashEveningUsDrop: number | null;

  // Cash & Drops - Comments
  cashComment1: string | null;
  cashComment2: string | null;
  cashComment3: string | null;

  // Lotto - Printed
  lottoPrintedMorningOnDemand: number | null;
  lottoPrintedMorningFtOnDemand: number | null;
  lottoPrintedMorningCancellation: number | null;
  lottoPrintedMorningDiscounts: number | null;

  lottoPrintedTotalOnDemand: number | null;
  lottoPrintedTotalFtOnDemand: number | null;
  lottoPrintedTotalCancellation: number | null;
  lottoPrintedTotalDiscounts: number | null;

  // Lotto - Scratch
  lottoScratchMorningSwActivation: number | null;
  lottoScratchMorningFtSw: number | null;
  lottoScratchMorningCancellation: number | null;

  lottoScratchTotalSwActivation: number | null;
  lottoScratchTotalFtSw: number | null;
  lottoScratchTotalCancellation: number | null;

  // Lotto - Validation
  lottoValidationMorningCashOnDemand: number | null;
  lottoValidationMorningCashSw: number | null;
  lottoValidationMorningFtOnDemand: number | null;
  lottoValidationMorningFtSw: number | null;
  lottoValidationMorningVouchers: number | null;

  lottoValidationTotalCashOnDemand: number | null;
  lottoValidationTotalCashSw: number | null;
  lottoValidationTotalFtOnDemand: number | null;
  lottoValidationTotalFtSw: number | null;
  lottoValidationTotalVouchers: number | null;

  // Cigarettes
  cigarettesMorningSingles: CigarettesCountMap;
  cigarettesMorningCartons: CigarettesCountMap;
  cigarettesDeliveryCartons: CigarettesCountMap;
  cigarettesEveningSingles: CigarettesCountMap;
  cigarettesEveningCartons: CigarettesCountMap;
  cigarettesBulkSale: CigarettesCountMap;
};

export const makeEmptyDailyEntry = (): DailyEntry => ({
  // Prepaid
  prepaidInput: null,

  // End of Day (existing)
  endOfDayInput1: null,
  endOfDayInput2: null,

  // End of Day - new totals
  endOfDayFuelSales: null,
  endOfDayPumpTests: null,
  endOfDayItemSales: null,
  endOfDayWrongShelfPrice: null,
  endOfDayDamagedProduct: null,
  endOfDayEmployeeDiscount: null,
  endOfDayGst: null,
  endOfDayPst: null,
  endOfDayPstv: null,
  endOfDayGstv: null,
  endOfDayPennyRounding: null,
  endOfDayTotalPos: null,
  endOfDayPumpOverRun: null,
  endOfDayDeliveryApp: null,
  endOfDayRedemptions: null,
  endOfDayCigarettes02: null,
  endOfDayOtherTobacco03: null,
  endOfDayEssoGift925: null,

  // End of Day - Propane POS
  propaneExchange: null,
  propaneNew: null,

  // End of Day - Lotto refs
  onlineLotto41: null,
  scratchLotto27: null,
  payouts: null,

  // Propane Counts
  fillOpening: null,
  fillDelivery: null,
  fillClosing: null,

  totalOpening: null,
  totalDelivery: null,
  totalClosing: null,

  // Fuel - Opening
  fuelOpeningRegTotal: null,
  fuelOpeningSup93: null,
  fuelOpeningDsl: null,

  // Fuel - Delivery
  fuelDeliveryRegTotal: null,
  fuelDeliverySup93: null,
  fuelDeliveryDsl: null,

  // Fuel - Sales
  fuelSalesReg87Morning: null,
  fuelSalesReg87Evening: null,
  fuelSalesEx89Morning: null,
  fuelSalesEx89Evening: null,
  fuelSalesSup91Morning: null,
  fuelSalesSup91Evening: null,
  fuelSalesSup93Morning: null,
  fuelSalesSup93Evening: null,
  fuelSalesDslMorning: null,
  fuelSalesDslEvening: null,

  // Fuel - Closing Dip
  fuelClosingDipRegT1: null,
  fuelClosingDipRegT2: null,
  fuelClosingDipSup: null,
  fuelClosingDipDsl: null,

  // Fuel - Checklist
  fuelCalledScamTransport: false,
  fuelEnteredOnWebsite: false,

  // Cash & Drops - Morning
  cashMorningCashierName: null,
  cashMorningBeginTray: null,
  cashMorningOther: null,
  cashMorningEndingTray: null,
  cashMorningCanadianCash: null,

  // Cash & Drops - Morning Drop 1
  cashMorningDrop1_5: null,
  cashMorningDrop1_10: null,
  cashMorningDrop1_20: null,
  cashMorningDrop1_50: null,
  cashMorningDrop1_100: null,

  // Cash & Drops - Morning Drop 2
  cashMorningDrop2_5: null,
  cashMorningDrop2_10: null,
  cashMorningDrop2_20: null,
  cashMorningDrop2_50: null,
  cashMorningDrop2_100: null,

  // Cash & Drops - Morning Coins / USD
  cashMorningCoinsDrop1: null,
  cashMorningCoinsDrop2: null,
  cashMorningCoinsDrop3: null,
  cashMorningUsDrop: null,

  // Cash & Drops - Evening
  cashEveningCashierName: null,
  cashEveningBeginTray: null,
  cashEveningOther: null,
  cashEveningEndingTray: null,
  cashEveningCanadianCash: null,

  // Cash & Drops - Evening Drop 1
  cashEveningDrop1_5: null,
  cashEveningDrop1_10: null,
  cashEveningDrop1_20: null,
  cashEveningDrop1_50: null,
  cashEveningDrop1_100: null,

  // Cash & Drops - Evening Drop 2
  cashEveningDrop2_5: null,
  cashEveningDrop2_10: null,
  cashEveningDrop2_20: null,
  cashEveningDrop2_50: null,
  cashEveningDrop2_100: null,

  // Cash & Drops - Evening Coins / USD
  cashEveningCoinsDrop1: null,
  cashEveningCoinsDrop2: null,
  cashEveningCoinsDrop3: null,
  cashEveningUsDrop: null,

  // Cash & Drops - Comments
  cashComment1: null,
  cashComment2: null,
  cashComment3: null,

  // Lotto - Printed
  lottoPrintedMorningOnDemand: null,
  lottoPrintedMorningFtOnDemand: null,
  lottoPrintedMorningCancellation: null,
  lottoPrintedMorningDiscounts: null,

  lottoPrintedTotalOnDemand: null,
  lottoPrintedTotalFtOnDemand: null,
  lottoPrintedTotalCancellation: null,
  lottoPrintedTotalDiscounts: null,

  // Lotto - Scratch
  lottoScratchMorningSwActivation: null,
  lottoScratchMorningFtSw: null,
  lottoScratchMorningCancellation: null,

  lottoScratchTotalSwActivation: null,
  lottoScratchTotalFtSw: null,
  lottoScratchTotalCancellation: null,

  // Lotto - Validation
  lottoValidationMorningCashOnDemand: null,
  lottoValidationMorningCashSw: null,
  lottoValidationMorningFtOnDemand: null,
  lottoValidationMorningFtSw: null,
  lottoValidationMorningVouchers: null,

  lottoValidationTotalCashOnDemand: null,
  lottoValidationTotalCashSw: null,
  lottoValidationTotalFtOnDemand: null,
  lottoValidationTotalFtSw: null,
  lottoValidationTotalVouchers: null,

  // Cigarettes
  cigarettesMorningSingles: {},
  cigarettesMorningCartons: {},
  cigarettesDeliveryCartons: {},
  cigarettesEveningSingles: {},
  cigarettesEveningCartons: {},
  cigarettesBulkSale: {},
});