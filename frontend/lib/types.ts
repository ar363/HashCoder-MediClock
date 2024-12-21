type PrescribedDrug = {
  id: number;
  drug: string;
  drug_info: {
    id: number;
    pack_size: string;
    price: number;
    manufacturer: string;
  };
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
