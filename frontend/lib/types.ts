type PrescribedDrug = {
  id: number;
  drug: string;
  morning_qty: number;
  afternoon_qty: number;
  night_qty: number;
  custom_qty: number;
  custom_time: string;
  amt_remaining: number;
};

type Prescription = {
  id: number;
  image: string;
  created_at: string;
  notes: string;
  drugs: PrescribedDrug[];
};
