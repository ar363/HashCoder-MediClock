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

type OrderPrescribedDrug = {
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
  qto_order: number;
  amt_remaining: number;
};

type OrderPrescription = {
  id: number;
  image: string;
  created_at: string;
  notes: string;
  drugs: OrderPrescribedDrug[];
};

type Routine = {
  drug_id: number;
  time: string;
  taken: boolean;
};

type Order = {
  id: number;
  created_at: string;
  status: string;
  drugs: {
    id: number;
    created_at: string;
    status: string;
    drug: PrescribedDrug;
  }[];
};
