export type AhpEditorDevice = {
  uid: string;
  role: string;
  vendor: string;
  cpu_score: string;
  ram_score: string;
  energy: string;
  cost: string;
  rel_low: string;
  rel_high: string;
};

export type AhpEditorConfiguration = {
  uid: string;
  id: string;
  meta: { people: string };
  devices: AhpEditorDevice[];
};
