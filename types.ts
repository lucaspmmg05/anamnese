export interface PersonalData {
  fullName: string;
  birthDate: string;
  rg: string;
  cpf: string;
  address: string;
  phone: string;
  mobile: string;
  hasWhatsapp: boolean;
  email: string;
  gender: string;
  age: string;
  height: string;
  weight: string;
  occupation: string;
  birthOrder: string;
}

export interface GeneralHealth {
  goodHealth: boolean;
  recentChanges: boolean;
  lastAppt: string;
  surgeries: { has: boolean; details: string; };
  liveWithParents: boolean;
  hospitalizedLast5Years: boolean;
  pets: { has: boolean; details: string; };
}

export interface CardioSystem {
  conditions: string[];
  symptoms: string[];
  others: string[];
  bloodPressure: { has: boolean; high: string; low: string; };
}

export interface NervousSystem {
  history: string[];
  treatment: boolean;
  psychotherapy: boolean;
}

export interface RespiratorySystem {
  conditions: string[];
  covid: { has: boolean; details: string; };
}

export interface DigestiveSystem {
  conditions: string[];
  diarrheaFreq: string;
  symptoms: string[];
}

export interface EndocrineSystem {
  diabetes: boolean;
  familyDiabetes: boolean;
  frequentUrination: boolean;
  thirst: boolean;
  thyroid: { has: boolean; type: string; };
  hormonalReplacement: { has: boolean; details: string; };
}

export interface HematologicalSystem {
  conditions: string[];
  transfusion: boolean;
}

export interface GenitourinarySystem {
  conditions: string[];
}

export interface OrthopedicSystem {
  conditions: string[];
}

export interface Neoplasms {
  has: boolean;
  details: string;
}

export interface AdditionalInfo {
  infection: { has: boolean; details: string; };
  anesthesia: { has: boolean; details: string; };
  risks: { has: boolean; details: string; };
  vision: { 
    glasses: boolean; degree: string; 
    glaucoma: boolean; type: string; 
    contacts: boolean; lastAppt: string; 
  };
  hearing: boolean;
}

export interface Habits {
  alcohol: { freq: string; };
  exercise: { type: string; freq: string; };
  smoking: { freq: string; };
  drugs: boolean;
  familyHistory: string;
}

export interface Medications {
  types: string[]; // checkboxes
  currentList: string; // textarea
}

export interface ExamResults {
  examDate: string;
  glucose: string;
  hba1c: string; // Glycated Hemoglobin
  cholesterolTotal: string;
  hdl: string;
  ldl: string;
  triglycerides: string;
  hemoglobin: string;
  leukocytes: string;
  platelets: string;
  creatinine: string;
  urea: string;
  tsh: string;
  t4free: string;
  vitaminD: string;
  vitaminB12: string;
  others: string;
}

export interface AnamnesisFormState {
  personal: PersonalData;
  general: GeneralHealth;
  cardio: CardioSystem;
  nervous: NervousSystem;
  respiratory: RespiratorySystem;
  digestive: DigestiveSystem;
  endocrine: EndocrineSystem;
  hematological: HematologicalSystem;
  genitourinary: GenitourinarySystem;
  orthopedic: OrthopedicSystem;
  neoplasms: Neoplasms;
  additional: AdditionalInfo;
  habits: Habits;
  medications: Medications;
  exams: ExamResults;
  signature: string | null;
  date: string;
}

export const INITIAL_STATE: AnamnesisFormState = {
  personal: {
    fullName: '', birthDate: '', rg: '', cpf: '', address: '', phone: '', mobile: '',
    hasWhatsapp: false, email: '', gender: '', age: '', height: '', weight: '',
    occupation: '', birthOrder: ''
  },
  general: {
    goodHealth: true, recentChanges: false, lastAppt: '',
    surgeries: { has: false, details: '' },
    liveWithParents: false, hospitalizedLast5Years: false,
    pets: { has: false, details: '' }
  },
  cardio: {
    conditions: [], symptoms: [], others: [],
    bloodPressure: { has: false, high: '', low: '' }
  },
  nervous: { history: [], treatment: false, psychotherapy: false },
  respiratory: { conditions: [], covid: { has: false, details: '' } },
  digestive: { conditions: [], diarrheaFreq: '', symptoms: [] },
  endocrine: {
    diabetes: false, familyDiabetes: false, frequentUrination: false,
    thirst: false, thyroid: { has: false, type: '' },
    hormonalReplacement: { has: false, details: '' }
  },
  hematological: { conditions: [], transfusion: false },
  genitourinary: { conditions: [] },
  orthopedic: { conditions: [] },
  neoplasms: { has: false, details: '' },
  additional: {
    infection: { has: false, details: '' },
    anesthesia: { has: false, details: '' },
    risks: { has: false, details: '' },
    vision: { glasses: false, degree: '', glaucoma: false, type: '', contacts: false, lastAppt: '' },
    hearing: false
  },
  habits: {
    alcohol: { freq: '' }, exercise: { type: '', freq: '' },
    smoking: { freq: '' }, drugs: false, familyHistory: ''
  },
  medications: { types: [], currentList: '' },
  exams: {
    examDate: '',
    glucose: '',
    hba1c: '',
    cholesterolTotal: '',
    hdl: '',
    ldl: '',
    triglycerides: '',
    hemoglobin: '',
    leukocytes: '',
    platelets: '',
    creatinine: '',
    urea: '',
    tsh: '',
    t4free: '',
    vitaminD: '',
    vitaminB12: '',
    others: ''
  },
  signature: null,
  date: new Date().toISOString().split('T')[0],
};