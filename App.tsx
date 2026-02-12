import React, { useState } from 'react';
import { 
  FileText, Printer, Save, Stethoscope, User, Activity, HeartPulse, BrainCircuit, ArrowRight, CheckSquare, Pill, Microscope
} from 'lucide-react';
import { AnamnesisFormState, INITIAL_STATE } from './types';
import { SignaturePad } from './components/SignaturePad';
import { PrintTemplate } from './components/PrintTemplate';
import { analyzeAnamnesis } from './services/geminiService';

// --- Constants for Checkboxes ---
const CARDIO_OPTS = ['Problemas de coração', 'Trombose ou embolia', 'Ataques cardíacos', 'Insuficiência coronária', 'Lesões de válvulas', 'Cardiopatias congênitas'];
const CARDIO_SYMPTOMS = ['Sopro', 'Dor no peito (esforço)', 'Falta de ar (leve)', 'Cansaço fácil', 'Inchaço nas pernas', 'Amortecimento'];
const CARDIO_OTHERS = ['Varizes/Dores fortes', 'Usa mais de um travesseiro', 'Usa marcapasso'];
const NERVOUS_HISTORY = ['Epilepsia', 'Desmaios', 'Convulsões', 'Alterações emocionais', 'Enxaqueca', 'Traumatismo craniano', 'Tonturas'];
const RESP_CONDITIONS = ['Resfriado/Tosse persistente', 'Falta de ar frequente', 'Tuberculose', 'Histórico Familiar TB', 'Dificuldade respirar nariz', 'Rinite', 'Sinusite', 'Asma/Bronquite', 'Enfisema'];
const DIGESTIVE_CONDITIONS = ['Úlcera', 'Gastrite', 'Hepatite', 'Icterícia', 'Doença fígado', 'Vomitou sangue', 'Sangramento intestinal', 'Intestino regulado', 'Constipação', 'Diarreia', 'Hemorroida'];
const DIGESTIVE_SYMPTOMS = ['Ardência ao evacuar', 'Dores estomacais', 'Estufamento'];
const HEMA_CONDITIONS = ['Anemia', 'Histórico Familiar', 'Hemofilia', 'Sangramento Excessivo', 'Coagulação Lenta', 'Transfusão'];
const GENITO_CONDITIONS = ['Problema Renal', 'Sífilis/Gonorreia', 'Pedra Rim/Vesícula', 'AIDS', 'Disfunção Sexual'];
const ORTHO_CONDITIONS = ['Coluna', 'Artrite', 'Reumatismo', 'Osteoporose', 'Infecções Ósseas', 'Lúpus'];
const MED_TYPES = ['Antibióticos', 'Tranquilizantes', 'Anticoagulantes', 'Iodo', 'Drogas Hipertensão', 'Estatinas', 'Codeína/Narcóticos'];

// --- Helper Components ---
const SectionTitle = ({ icon: Icon, title, color }: { icon: any, title: string, color: string }) => (
  <div className={`flex items-center gap-3 mb-6 p-3 rounded-lg bg-${color}-50 border border-${color}-100`}>
    <div className={`text-${color}-600`}><Icon size={24} /></div>
    <h2 className={`text-xl font-bold text-${color}-800`}>{title}</h2>
  </div>
);

const InputGroup = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-sm font-medium text-slate-600">{label}</label>
    {children}
  </div>
);

const TextInput = ({ label, value, onChange, placeholder, type = "text", width = "w-full" }: any) => (
  <InputGroup label={label}>
    <input type={type} value={value} onChange={onChange} className={`${width} px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none`} placeholder={placeholder} />
  </InputGroup>
);

const CheckboxGroup = ({ options, selected, onChange }: { options: string[], selected: string[], onChange: (val: string[]) => void }) => {
  const toggle = (opt: string) => {
    if (selected.includes(opt)) onChange(selected.filter(i => i !== opt));
    else onChange([...selected, opt]);
  };
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {options.map(opt => (
        <label key={opt} className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-sm ${selected.includes(opt) ? 'bg-blue-50 border-blue-400 text-blue-800' : 'border-slate-200 hover:bg-slate-50'}`}>
          <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="rounded text-blue-600" />
          {opt}
        </label>
      ))}
    </div>
  );
};

const YesNoDetail = ({ label, value, detailValue, onChange, detailPlaceholder = "Detalhes..." }: any) => (
  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
    <div className="flex items-center justify-between mb-2">
      <span className="font-medium text-slate-700 text-sm">{label}</span>
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={value} onChange={() => onChange(true)} /> Sim</label>
        <label className="flex items-center gap-1 cursor-pointer"><input type="radio" checked={!value} onChange={() => onChange(false)} /> Não</label>
      </div>
    </div>
    {value && (
      <input 
        type="text" 
        value={detailValue} 
        onChange={(e) => onChange(true, e.target.value)} 
        className="w-full text-sm px-2 py-1 border-b border-slate-300 bg-transparent focus:border-blue-500 outline-none" 
        placeholder={detailPlaceholder} 
      />
    )}
  </div>
);

export default function App() {
  const [data, setData] = useState<AnamnesisFormState>(INITIAL_STATE);
  const [tab, setTab] = useState(0); 
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const update = (section: keyof AnamnesisFormState, field: string, value: any) => {
    setData(prev => ({ ...prev, [section]: { ...(prev[section] as any), [field]: value } }));
  };

  const updateNested = (section: keyof AnamnesisFormState, field: string, subfield: string, value: any) => {
    setData(prev => ({ 
      ...prev, 
      [section]: { 
        ...(prev[section] as any), 
        [field]: { ...((prev[section] as any)[field]), [subfield]: value } 
      } 
    }));
  };

  const handleAnalyze = async () => {
    if (!process.env.API_KEY) return alert("API Key não configurada.");
    setIsAnalyzing(true);
    const result = await analyzeAnamnesis(data);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  if (isPrintMode) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center py-8">
        <PrintTemplate data={data} aiAnalysis={aiAnalysis} />
        <div className="fixed bottom-6 flex gap-4 no-print z-50">
          <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 font-bold flex items-center gap-2"><Printer size={20}/> Imprimir</button>
          <button onClick={() => setIsPrintMode(false)} className="bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg hover:bg-slate-900 font-bold">Voltar</button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 0, title: "Dados Pessoais" },
    { id: 1, title: "Saúde Geral" },
    { id: 2, title: "Sistemas Vitais I" },
    { id: 3, title: "Sistemas Vitais II" },
    { id: 4, title: "Exames Recentes" },
    { id: 5, title: "Hábitos e Medicamentos" },
    { id: 6, title: "Finalização" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700">
            <Stethoscope className="h-6 w-6" />
            <span className="font-bold text-xl">Anamnesis Pro</span>
          </div>
          <div className="text-sm font-medium text-slate-500">
            Passo {tab + 1} de {steps.length}
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        {/* Progress Stepper */}
        <div className="flex justify-between mb-8 overflow-x-auto pb-2 gap-2">
           {steps.map((s, idx) => (
             <button 
                key={s.id} 
                onClick={() => setTab(idx)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${tab === idx ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'}`}
             >
                <span className={`flex items-center justify-center w-5 h-5 rounded-full text-xs ${tab === idx ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-600'}`}>{idx + 1}</span>
                {s.title}
             </button>
           ))}
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 md:p-8 animate-fade-in">
          
          {/* STEP 0: PERSONAL */}
          {tab === 0 && (
            <div className="space-y-6">
              <SectionTitle icon={User} title="Dados Pessoais e Identificação" color="blue" />
              <div className="grid md:grid-cols-2 gap-4">
                <TextInput label="Nome Completo" value={data.personal.fullName} onChange={(e: any) => update('personal', 'fullName', e.target.value)} />
                <TextInput label="Data de Nascimento" type="date" value={data.personal.birthDate} onChange={(e: any) => update('personal', 'birthDate', e.target.value)} />
                <TextInput label="RG" value={data.personal.rg} onChange={(e: any) => update('personal', 'rg', e.target.value)} />
                <TextInput label="CPF" value={data.personal.cpf} onChange={(e: any) => update('personal', 'cpf', e.target.value)} />
                <TextInput label="Endereço" value={data.personal.address} onChange={(e: any) => update('personal', 'address', e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                   <TextInput label="Telefone Fixo" value={data.personal.phone} onChange={(e: any) => update('personal', 'phone', e.target.value)} />
                   <TextInput label="Celular" value={data.personal.mobile} onChange={(e: any) => update('personal', 'mobile', e.target.value)} />
                </div>
                <div className="flex items-end pb-2">
                   <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={data.personal.hasWhatsapp} onChange={(e) => update('personal', 'hasWhatsapp', e.target.checked)} /> Possui WhatsApp?</label>
                </div>
                <TextInput label="Email" value={data.personal.email} onChange={(e: any) => update('personal', 'email', e.target.value)} />
                <div className="grid grid-cols-3 gap-2">
                   <TextInput label="Idade" value={data.personal.age} onChange={(e: any) => update('personal', 'age', e.target.value)} />
                   <TextInput label="Altura (m)" value={data.personal.height} onChange={(e: any) => update('personal', 'height', e.target.value)} />
                   <TextInput label="Peso (kg)" value={data.personal.weight} onChange={(e: any) => update('personal', 'weight', e.target.value)} />
                </div>
                <InputGroup label="Gênero">
                   <select value={data.personal.gender} onChange={(e) => update('personal', 'gender', e.target.value)} className="w-full px-3 py-2 border rounded-md">
                      <option value="">Selecione...</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                      <option value="Outro">Outro</option>
                   </select>
                </InputGroup>
                <TextInput label="Profissão" value={data.personal.occupation} onChange={(e: any) => update('personal', 'occupation', e.target.value)} />
                <TextInput label="Posição nascimento (irmãos)" value={data.personal.birthOrder} onChange={(e: any) => update('personal', 'birthOrder', e.target.value)} />
              </div>
            </div>
          )}

          {/* STEP 1: GENERAL HEALTH */}
          {tab === 1 && (
            <div className="space-y-6">
              <SectionTitle icon={Activity} title="Histórico Geral" color="green" />
              <div className="space-y-4">
                 <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between">
                    <span className="font-medium">Tem boa saúde geral?</span>
                    <div className="flex gap-4"><label><input type="radio" checked={data.general.goodHealth} onChange={() => update('general', 'goodHealth', true)} /> Sim</label><label><input type="radio" checked={!data.general.goodHealth} onChange={() => update('general', 'goodHealth', false)} /> Não</label></div>
                 </div>
                 <div className="bg-slate-50 p-4 rounded-lg flex items-center justify-between">
                    <span className="font-medium">Mudança recente na saúde?</span>
                    <div className="flex gap-4"><label><input type="radio" checked={data.general.recentChanges} onChange={() => update('general', 'recentChanges', true)} /> Sim</label><label><input type="radio" checked={!data.general.recentChanges} onChange={() => update('general', 'recentChanges', false)} /> Não</label></div>
                 </div>
                 <TextInput label="Data da Última Consulta Médica" type="date" value={data.general.lastAppt} onChange={(e: any) => update('general', 'lastAppt', e.target.value)} />
                 <YesNoDetail 
                   label="Já sofreu doença grave com cirurgia?" 
                   value={data.general.surgeries.has} 
                   detailValue={data.general.surgeries.details} 
                   onChange={(v: boolean, d: string) => { updateNested('general', 'surgeries', 'has', v); if(d !== undefined) updateNested('general', 'surgeries', 'details', d); }}
                   detailPlaceholder="Explique (cirurgia, data, anestesia)..."
                 />
                 <div className="flex gap-8 py-2">
                    <label className="flex gap-2 font-medium text-sm"><input type="checkbox" checked={data.general.liveWithParents} onChange={(e) => update('general', 'liveWithParents', e.target.checked)} /> Mora com os pais?</label>
                    <label className="flex gap-2 font-medium text-sm"><input type="checkbox" checked={data.general.hospitalizedLast5Years} onChange={(e) => update('general', 'hospitalizedLast5Years', e.target.checked)} /> Hospitalizado últimos 5 anos?</label>
                 </div>
                 <YesNoDetail 
                   label="Tem animais domésticos?" 
                   value={data.general.pets.has} 
                   detailValue={data.general.pets.details} 
                   onChange={(v: boolean, d: string) => { updateNested('general', 'pets', 'has', v); if(d !== undefined) updateNested('general', 'pets', 'details', d); }}
                   detailPlaceholder="Quais animais?"
                 />
              </div>
            </div>
          )}

          {/* STEP 2: VITAL SYSTEMS I */}
          {tab === 2 && (
            <div className="space-y-8">
               {/* Cardio */}
               <div>
                  <h3 className="text-lg font-bold text-red-700 mb-3 border-b border-red-200 pb-1">Sistema Cardiovascular</h3>
                  <div className="space-y-4">
                     <InputGroup label="Doenças Constatadas">
                        <CheckboxGroup options={CARDIO_OPTS} selected={data.cardio.conditions} onChange={(v) => update('cardio', 'conditions', v)} />
                     </InputGroup>
                     <InputGroup label="Sintomas">
                        <CheckboxGroup options={CARDIO_SYMPTOMS} selected={data.cardio.symptoms} onChange={(v) => update('cardio', 'symptoms', v)} />
                     </InputGroup>
                     <InputGroup label="Outros">
                        <CheckboxGroup options={CARDIO_OTHERS} selected={data.cardio.others} onChange={(v) => update('cardio', 'others', v)} />
                     </InputGroup>
                     <div className="bg-red-50 p-3 rounded flex flex-col md:flex-row gap-4 items-center">
                        <label className="font-medium"><input type="checkbox" checked={data.cardio.bloodPressure.has} onChange={(e) => updateNested('cardio', 'bloodPressure', 'has', e.target.checked)} /> Problema Pressão Arterial?</label>
                        {data.cardio.bloodPressure.has && (
                           <div className="flex gap-2">
                              <input placeholder="Alta (ex: 140/90)" className="p-1 text-sm border rounded" value={data.cardio.bloodPressure.high} onChange={(e) => updateNested('cardio', 'bloodPressure', 'high', e.target.value)} />
                              <input placeholder="Baixa (ex: 90/60)" className="p-1 text-sm border rounded" value={data.cardio.bloodPressure.low} onChange={(e) => updateNested('cardio', 'bloodPressure', 'low', e.target.value)} />
                           </div>
                        )}
                     </div>
                  </div>
               </div>

               {/* Nervous */}
               <div>
                  <h3 className="text-lg font-bold text-purple-700 mb-3 border-b border-purple-200 pb-1">Sistema Nervoso</h3>
                  <InputGroup label="Histórico">
                      <CheckboxGroup options={NERVOUS_HISTORY} selected={data.nervous.history} onChange={(v) => update('nervous', 'history', v)} />
                  </InputGroup>
                  <div className="flex gap-6 mt-3">
                     <label className="flex gap-2 text-sm"><input type="checkbox" checked={data.nervous.treatment} onChange={(e) => update('nervous', 'treatment', e.target.checked)} /> Faz tratamento nervos?</label>
                     <label className="flex gap-2 text-sm"><input type="checkbox" checked={data.nervous.psychotherapy} onChange={(e) => update('nervous', 'psychotherapy', e.target.checked)} /> Faz terapia/psicanálise?</label>
                  </div>
               </div>

               {/* Respiratory */}
               <div>
                  <h3 className="text-lg font-bold text-cyan-700 mb-3 border-b border-cyan-200 pb-1">Sistema Respiratório</h3>
                   <InputGroup label="Condições">
                      <CheckboxGroup options={RESP_CONDITIONS} selected={data.respiratory.conditions} onChange={(v) => update('respiratory', 'conditions', v)} />
                  </InputGroup>
                  <div className="mt-3">
                     <YesNoDetail 
                        label="Teve COVID-19?" 
                        value={data.respiratory.covid.has} 
                        detailValue={data.respiratory.covid.details} 
                        onChange={(v: boolean, d: string) => { updateNested('respiratory', 'covid', 'has', v); if(d !== undefined) updateNested('respiratory', 'covid', 'details', d); }}
                        detailPlaceholder="Sintomas, internação..."
                     />
                  </div>
               </div>
            </div>
          )}

          {/* STEP 3: VITAL SYSTEMS II */}
          {tab === 3 && (
            <div className="space-y-8">
               {/* Digestive */}
               <div>
                  <h3 className="text-lg font-bold text-orange-700 mb-3 border-b border-orange-200 pb-1">Digestório</h3>
                  <CheckboxGroup options={DIGESTIVE_CONDITIONS} selected={data.digestive.conditions} onChange={(v) => update('digestive', 'conditions', v)} />
                  <div className="mt-2"><CheckboxGroup options={DIGESTIVE_SYMPTOMS} selected={data.digestive.symptoms} onChange={(v) => update('digestive', 'symptoms', v)} /></div>
                  <div className="mt-2">
                     <input placeholder="Frequência diarreia (se houver)" className="w-full border p-2 rounded text-sm" value={data.digestive.diarrheaFreq} onChange={(e) => update('digestive', 'diarrheaFreq', e.target.value)} />
                  </div>
               </div>

               {/* Endocrine */}
               <div>
                  <h3 className="text-lg font-bold text-yellow-700 mb-3 border-b border-yellow-200 pb-1">Endócrino</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                     <label className="flex gap-2"><input type="checkbox" checked={data.endocrine.diabetes} onChange={(e) => update('endocrine', 'diabetes', e.target.checked)} /> Diabetes</label>
                     <label className="flex gap-2"><input type="checkbox" checked={data.endocrine.familyDiabetes} onChange={(e) => update('endocrine', 'familyDiabetes', e.target.checked)} /> Família tem Diabetes</label>
                     <label className="flex gap-2"><input type="checkbox" checked={data.endocrine.frequentUrination} onChange={(e) => update('endocrine', 'frequentUrination', e.target.checked)} /> Urina +6x dia</label>
                     <label className="flex gap-2"><input type="checkbox" checked={data.endocrine.thirst} onChange={(e) => update('endocrine', 'thirst', e.target.checked)} /> Muita sede/boca seca</label>
                     <label className="flex gap-2"><input type="checkbox" checked={data.endocrine.thyroid.has} onChange={(e) => updateNested('endocrine', 'thyroid', 'has', e.target.checked)} /> Hipo/Hipertireoidismo</label>
                  </div>
                  <div className="mt-2">
                     <YesNoDetail 
                        label="Reposição Hormonal?" 
                        value={data.endocrine.hormonalReplacement.has} 
                        detailValue={data.endocrine.hormonalReplacement.details} 
                        onChange={(v: boolean, d: string) => { updateNested('endocrine', 'hormonalReplacement', 'has', v); if(d !== undefined) updateNested('endocrine', 'hormonalReplacement', 'details', d); }}
                        detailPlaceholder="Frequência..."
                     />
                  </div>
               </div>

               {/* Hematological & Genito & Ortho */}
               <div className="grid md:grid-cols-2 gap-6">
                  <div>
                     <h3 className="font-bold text-red-900 mb-2">Hematológico</h3>
                     <CheckboxGroup options={HEMA_CONDITIONS} selected={data.hematological.conditions} onChange={(v) => update('hematological', 'conditions', v)} />
                  </div>
                  <div>
                     <h3 className="font-bold text-blue-900 mb-2">Geniturinário</h3>
                     <CheckboxGroup options={GENITO_CONDITIONS} selected={data.genitourinary.conditions} onChange={(v) => update('genitourinary', 'conditions', v)} />
                  </div>
                  <div>
                     <h3 className="font-bold text-slate-700 mb-2">Ortopédico</h3>
                     <CheckboxGroup options={ORTHO_CONDITIONS} selected={data.orthopedic.conditions} onChange={(v) => update('orthopedic', 'conditions', v)} />
                  </div>
                  <div>
                     <h3 className="font-bold text-slate-700 mb-2">Neoplasias</h3>
                     <YesNoDetail 
                        label="Tumores/Massas Malignas?" 
                        value={data.neoplasms.has} 
                        detailValue={data.neoplasms.details} 
                        onChange={(v: boolean, d: string) => { update('neoplasms', 'has', v); if(d !== undefined) update('neoplasms', 'details', d); }}
                        detailPlaceholder="Tipo, local, tratamento..."
                     />
                  </div>
               </div>
            </div>
          )}

          {/* STEP 4: EXAMS (NEW) */}
          {tab === 4 && (
            <div className="space-y-6">
                <SectionTitle icon={Microscope} title="Valores de Exames Recentes" color="teal" />
                
                <div className="mb-4">
                   <TextInput label="Data dos Exames" type="date" value={data.exams.examDate} onChange={(e: any) => update('exams', 'examDate', e.target.value)} width="w-48" />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Hematologia */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h4 className="font-bold text-slate-700 mb-3 border-b pb-1">Hematologia</h4>
                        <div className="space-y-3">
                            <TextInput label="Hemoglobina (g/dL)" value={data.exams.hemoglobin} onChange={(e:any) => update('exams', 'hemoglobin', e.target.value)} placeholder="Ex: 14.5" />
                            <TextInput label="Leucócitos (/mm³)" value={data.exams.leukocytes} onChange={(e:any) => update('exams', 'leukocytes', e.target.value)} placeholder="Ex: 6500" />
                            <TextInput label="Plaquetas (/mm³)" value={data.exams.platelets} onChange={(e:any) => update('exams', 'platelets', e.target.value)} placeholder="Ex: 250000" />
                        </div>
                    </div>

                    {/* Metabolismo */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h4 className="font-bold text-slate-700 mb-3 border-b pb-1">Metabolismo</h4>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <TextInput label="Glicose (mg/dL)" value={data.exams.glucose} onChange={(e:any) => update('exams', 'glucose', e.target.value)} placeholder="Ex: 95" />
                                <TextInput label="HbA1c (%)" value={data.exams.hba1c} onChange={(e:any) => update('exams', 'hba1c', e.target.value)} placeholder="Ex: 5.4" />
                            </div>
                            <TextInput label="Colesterol Total" value={data.exams.cholesterolTotal} onChange={(e:any) => update('exams', 'cholesterolTotal', e.target.value)} placeholder="Ex: 180" />
                            <div className="grid grid-cols-2 gap-2">
                                <TextInput label="HDL" value={data.exams.hdl} onChange={(e:any) => update('exams', 'hdl', e.target.value)} placeholder="Ex: 50" />
                                <TextInput label="LDL" value={data.exams.ldl} onChange={(e:any) => update('exams', 'ldl', e.target.value)} placeholder="Ex: 110" />
                            </div>
                            <TextInput label="Triglicerídeos" value={data.exams.triglycerides} onChange={(e:any) => update('exams', 'triglycerides', e.target.value)} placeholder="Ex: 130" />
                        </div>
                    </div>

                    {/* Renal e Hormonal */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <h4 className="font-bold text-slate-700 mb-3 border-b pb-1">Renal e Hormonal</h4>
                        <div className="space-y-3">
                             <div className="grid grid-cols-2 gap-2">
                                <TextInput label="Creatinina" value={data.exams.creatinine} onChange={(e:any) => update('exams', 'creatinine', e.target.value)} placeholder="Ex: 0.9" />
                                <TextInput label="Ureia" value={data.exams.urea} onChange={(e:any) => update('exams', 'urea', e.target.value)} placeholder="Ex: 30" />
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                                <TextInput label="TSH" value={data.exams.tsh} onChange={(e:any) => update('exams', 'tsh', e.target.value)} placeholder="uUI/mL" />
                                <TextInput label="T4 Livre" value={data.exams.t4free} onChange={(e:any) => update('exams', 't4free', e.target.value)} placeholder="ng/dL" />
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                                <TextInput label="Vit. D" value={data.exams.vitaminD} onChange={(e:any) => update('exams', 'vitaminD', e.target.value)} placeholder="ng/mL" />
                                <TextInput label="Vit. B12" value={data.exams.vitaminB12} onChange={(e:any) => update('exams', 'vitaminB12', e.target.value)} placeholder="pg/mL" />
                             </div>
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <label className="block text-sm font-medium mb-1 text-slate-700">Outros Resultados ou Observações</label>
                    <textarea 
                        className="w-full border rounded p-3 h-24 focus:ring-2 focus:ring-teal-500 outline-none" 
                        value={data.exams.others} 
                        onChange={(e) => update('exams', 'others', e.target.value)} 
                        placeholder="Digite aqui outros valores ou observações sobre os exames..." 
                    />
                </div>
            </div>
          )}

          {/* STEP 5: HABITS & MEDS & ADDITIONAL */}
          {tab === 5 && (
             <div className="space-y-6">
                <SectionTitle icon={Pill} title="Informações Adicionais, Hábitos e Medicamentos" color="indigo" />
                
                <div className="grid md:grid-cols-2 gap-4">
                   <YesNoDetail label="Infecção Atual?" value={data.additional.infection.has} detailValue={data.additional.infection.details} onChange={(v:any,d:any) => {updateNested('additional','infection','has',v); if(d!==undefined) updateNested('additional','infection','details',d);}} />
                   <YesNoDetail label="Reação Anestesia?" value={data.additional.anesthesia.has} detailValue={data.additional.anesthesia.details} onChange={(v:any,d:any) => {updateNested('additional','anesthesia','has',v); if(d!==undefined) updateNested('additional','anesthesia','details',d);}} />
                   <YesNoDetail label="Exposição Riscos (RX/Tóxicos)?" value={data.additional.risks.has} detailValue={data.additional.risks.details} onChange={(v:any,d:any) => {updateNested('additional','risks','has',v); if(d!==undefined) updateNested('additional','risks','details',d);}} />
                </div>
                
                <div className="bg-slate-50 p-4 rounded border">
                   <h4 className="font-bold mb-2">Saúde Ocular/Auditiva</h4>
                   <div className="grid grid-cols-2 gap-4 text-sm">
                      <label className="flex gap-2"><input type="checkbox" checked={data.additional.vision.glasses} onChange={(e) => updateNested('additional', 'vision', 'glasses', e.target.checked)} /> Usa Óculos</label>
                      <input placeholder="Grau" className="border rounded p-1" value={data.additional.vision.degree} onChange={(e) => updateNested('additional', 'vision', 'degree', e.target.value)} />
                      <label className="flex gap-2"><input type="checkbox" checked={data.additional.vision.glaucoma} onChange={(e) => updateNested('additional', 'vision', 'glaucoma', e.target.checked)} /> Glaucoma</label>
                      <label className="flex gap-2"><input type="checkbox" checked={data.additional.hearing} onChange={(e) => update('additional', 'hearing', e.target.checked)} /> Problema Audição</label>
                   </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                   <TextInput label="Álcool (Frequência)" value={data.habits.alcohol.freq} onChange={(e:any) => updateNested('habits','alcohol','freq',e.target.value)} />
                   <div className="flex gap-2">
                     <TextInput label="Exercício (Tipo)" value={data.habits.exercise.type} onChange={(e:any) => updateNested('habits','exercise','type',e.target.value)} />
                     <TextInput label="Freq." value={data.habits.exercise.freq} onChange={(e:any) => updateNested('habits','exercise','freq',e.target.value)} />
                   </div>
                   <TextInput label="Fumo (Frequência)" value={data.habits.smoking.freq} onChange={(e:any) => updateNested('habits','smoking','freq',e.target.value)} />
                   <label className="flex gap-2 items-center mt-6"><input type="checkbox" checked={data.habits.drugs} onChange={(e) => update('habits', 'drugs', e.target.checked)} /> Usa drogas?</label>
                   <div className="col-span-2">
                      <TextInput label="Doenças na Família (Pais/Avós/Irmãos)" value={data.habits.familyHistory} onChange={(e:any) => update('habits', 'familyHistory', e.target.value)} placeholder="Diabetes, câncer, coração..." />
                   </div>
                </div>

                <div className="border-t pt-4">
                   <h4 className="font-bold mb-2">Medicamentos</h4>
                   <InputGroup label="Categorias em uso">
                      <CheckboxGroup options={MED_TYPES} selected={data.medications.types} onChange={(v) => update('medications', 'types', v)} />
                   </InputGroup>
                   <div className="mt-4">
                      <label className="block text-sm font-medium mb-1">Liste TODOS os medicamentos atuais (Nome, Dosagem, Frequência)</label>
                      <textarea className="w-full border rounded p-2 h-24" value={data.medications.currentList} onChange={(e) => update('medications', 'currentList', e.target.value)} />
                   </div>
                </div>
             </div>
          )}

          {/* STEP 6: FINISH */}
          {tab === 6 && (
            <div className="space-y-6 animate-fade-in">
                <SectionTitle icon={CheckSquare} title="Finalização e Assinatura" color="blue" />
                
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                   <h3 className="text-blue-800 font-semibold mb-2 flex items-center gap-2">
                      <BrainCircuit size={18} /> IA Clinical Insights
                   </h3>
                   <p className="text-sm text-blue-600 mb-3">
                     Utilize a Inteligência Artificial para analisar a ficha completa, incluindo os valores dos exames laboratoriais.
                   </p>
                   {aiAnalysis ? (
                      <div className="bg-white p-4 rounded border border-blue-100 text-sm text-slate-700 mb-3">
                         <div className="font-medium text-green-600 mb-2">Análise Concluída ✓</div>
                         <p className="line-clamp-3 italic text-slate-500">
                           {aiAnalysis.substring(0, 150)}... (Veja completo na impressão)
                         </p>
                      </div>
                   ) : (
                     <button 
                        onClick={handleAnalyze} 
                        disabled={isAnalyzing}
                        className="text-sm bg-white text-blue-600 px-4 py-2 rounded shadow-sm border border-blue-200 hover:bg-blue-50 font-medium disabled:opacity-50 flex items-center gap-2"
                     >
                        {isAnalyzing ? 'Analisando...' : 'Gerar Análise Completa'}
                     </button>
                   )}
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-600 block mb-2">Assinatura Digital</label>
                   <SignaturePad onSave={(s) => setData(prev => ({...prev, signature: s}))} initialSignature={data.signature} />
                   <p className="text-justify text-xs text-slate-400 mt-2">
                      Declaro que todas as informações fornecidas nesta ficha de anamnese são verdadeiras e completas.
                   </p>
                </div>

                <div className="flex justify-end pt-4">
                  <button 
                    onClick={() => setIsPrintMode(true)}
                    disabled={!data.signature}
                    className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={20} /> Salvar e Visualizar PDF
                  </button>
                </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 border-t border-slate-100 pt-6">
             <button 
                onClick={() => setTab(p => Math.max(0, p - 1))} 
                disabled={tab === 0}
                className="px-4 py-2 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:hover:text-slate-500 font-medium"
             >
                Voltar
             </button>
             {tab < steps.length - 1 && (
                <button 
                  onClick={() => setTab(p => Math.min(steps.length - 1, p + 1))}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  Próximo <ArrowRight size={16} />
                </button>
             )}
          </div>

        </div>
      </div>
    </div>
  );
}