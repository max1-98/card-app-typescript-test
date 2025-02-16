export interface Entry {
  id?: string;
  title: string;
  description: string;
  created_at: Date | string;
  scheduled_for: Date | string;
};

export interface BetweenDates {
  start_date: Date | string;
  end_date: Date | string;
};

export type EntryContextType = {
  entries: Entry[];
  saveEntry: (entry: Entry) => void;
  updateEntry: (id: string, entryData: Entry) => void;
  deleteEntry: (id: string) => void;
  betweenEntry: (betweendate: BetweenDates) => void;
};


