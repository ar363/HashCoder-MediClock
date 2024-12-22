type PrescribedDrug = {
  id: number;
  drug: string;
  drug_info: {
    id: number;
    pack_size: string;
    price: number;
    manufacturer: string;
    singular_term: string;
  };
  morning_qty: number;
  afternoon_qty: number;
  night_qty: number;
  mqfrac: string;
  aqfrac: string;
  nqfrac: string;
  amt_remaining: number;
};

type Prescription = {
  id: number;
  image: string;
  created_at: string;
  notes: string;
  drugs: PrescribedDrug[];
};

type Routine = {
  drug_id: number;
  time: string;
  taken: boolean;
};
