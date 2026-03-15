import GasStationLayout from "../layouts/GasStationLayout.tsx";
import PrepaidPage from "../features/prepaid/pages/PrepaidPage";
import PropanePage from "../features/propane/pages/PropanePage";
import EndOfDayPage from "../features/summary/pages/EndOfDayPage";
import FuelPage from "../features/fuel/pages/FuelPage";
import CashDropsPage from "../features/cash/pages/CashDropsPage";
import { useUiStore } from "../store/ui/ui.store";

const AppShell = () => {
  const selectedDate = useUiStore((s) => s.selectedDate);

  return (
    <GasStationLayout
      prepaid={<PrepaidPage date={selectedDate} />}
      propane={<PropanePage date={selectedDate} />}
      fuel={<FuelPage date={selectedDate} />}
      cash={<CashDropsPage date={selectedDate} />}
      endOfDay={<EndOfDayPage date={selectedDate} />}
    />
  );
};

export default AppShell;