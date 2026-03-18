import GasStationLayout from "../layouts/GasStationLayout.tsx";
import PrepaidPage from "../features/prepaid/pages/PrepaidPage";
import PropanePage from "../features/propane/pages/PropanePage";
import EndOfDayPage from "../features/summary/pages/EndOfDayPage";
import FuelPage from "../features/fuel/pages/FuelPage";
import CashDropsPage from "../features/cash/pages/CashDropsPage";
import LottoPage from "../features/lotto/pages/LottoPage";
import CigarettesPage from "../features/cigarettes/pages/CigarettesPage";
import ReportsPage from "../features/reports/pages/ReportsPage";
import { useUiStore } from "../store/ui/ui.store";

const AppShell = () => {
  const selectedDate = useUiStore((s) => s.selectedDate);

  return (
    <GasStationLayout
      prepaid={<PrepaidPage date={selectedDate} />}
      propane={<PropanePage date={selectedDate} />}
      fuel={<FuelPage date={selectedDate} />}
      cash={<CashDropsPage date={selectedDate} />}
      lotto={<LottoPage date={selectedDate} />}
      cigarettes={<CigarettesPage date={selectedDate} />}
      reports={<ReportsPage />}
      endOfDay={<EndOfDayPage date={selectedDate} />}
    />
  );
};

export default AppShell;