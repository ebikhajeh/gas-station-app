import { create } from "zustand";
import { storage } from "../persist/storage";
import { STORAGE_KEYS } from "../persist/storageKeys";
import {
  addDaysToDateInput,
  getTodayLocalDateInput,
} from "../../utils/date";

export type TabKey =
  | "endOfDay"
  | "prepaid"
  | "propane"
  | "fuel"
  | "cash"
  | "lotto"
  | "cigarettes";

type UiState = {
  selectedDate: string;
  activeTab: TabKey;

  setSelectedDate: (date: string) => void;
  setActiveTab: (tab: TabKey) => void;

  goToToday: () => void;
  goToPrevDay: () => void;
  goToNextDay: () => void;
};

type PersistedUiState = Pick<UiState, "selectedDate" | "activeTab">;

const loadInitialUiState = (): PersistedUiState => {
  const today = getTodayLocalDateInput();

  const saved = storage.get<Partial<PersistedUiState>>(STORAGE_KEYS.UI_STATE);

  return {
    selectedDate: saved?.selectedDate ?? today,
    activeTab: saved?.activeTab ?? "endOfDay",
  };
};

export const useUiStore = create<UiState>((set, get) => {
  const initial = loadInitialUiState();

  const persist = (patch?: Partial<PersistedUiState>) => {
    const current = {
      selectedDate: get().selectedDate,
      activeTab: get().activeTab,
      ...patch,
    };

    storage.set(STORAGE_KEYS.UI_STATE, current);
  };

  return {
    selectedDate: initial.selectedDate,
    activeTab: initial.activeTab,

    setSelectedDate: (date) => {
      set({ selectedDate: date });
      persist({ selectedDate: date });
    },

    setActiveTab: (tab) => {
      set({ activeTab: tab });
      persist({ activeTab: tab });
    },

    goToToday: () => {
      const today = getTodayLocalDateInput();
      set({ selectedDate: today });
      persist({ selectedDate: today });
    },

    goToPrevDay: () => {
      const next = addDaysToDateInput(get().selectedDate, -1);
      set({ selectedDate: next });
      persist({ selectedDate: next });
    },

    goToNextDay: () => {
      const next = addDaysToDateInput(get().selectedDate, 1);
      set({ selectedDate: next });
      persist({ selectedDate: next });
    },
  };
});