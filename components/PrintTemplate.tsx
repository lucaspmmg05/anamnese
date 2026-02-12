import React from 'react';
import { AnamnesisFormState } from '../types';
import Markdown from 'react-markdown';

interface PrintTemplateProps {
  data: AnamnesisFormState;
  aiAnalysis?: string;
}

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-4 mt-6 break-inside-avoid">
    <h2 className="text-xl font-bold text-[#3e2b25] border-b-2 border-[#d8c3bc] pb-2 uppercase">{title}</h2>
    {subtitle && <p className="text-sm text-slate-600 mt-1 italic">{subtitle}</p>}
  </div>
);

const Box: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-[#fdfbfb] border border-[#eee] p-3 rounded-lg break-inside-avoid">
    <h3 className="font-bold text-[#3e2b25] text-sm mb-2 uppercase">{title}</h3>
    <div className="text-sm text-slate-700">{children}</div>
  </div>
);

const BoolText: React.FC<{ val: boolean }> = ({ val }) => (
  <span className={val ? "font-bold text-red-600" : "text-slate-500"}>{val ? '(X) Sim' : '( ) Não'}</span>
);

export const PrintTemplate: React.FC<PrintTemplateProps> = ({ data, aiAnalysis }) => {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-slate-900 print:p-0 font-serif">
      
      {/* Header */}
      <div className="text-center mb-10 border-b-4 border-[#d8c3bc] pb-6">
        <h1 className="text-4xl font-bold text-[#3e2b25] uppercase tracking-wider">Ficha de Anamnese</h1>
        <p className="text-slate-500 mt-2">Confidencial • Uso Profissional</p>
      </div>

      {/* 1. Personal Data */}
      <SectionHeader title="Dados Pessoais e Identificação" subtitle="Informações essenciais para cadastro e contato." />
      <div className="bg-[#e6d0cd]/20 p-6 rounded-xl mb-6 grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
         <div className="col-span-2"><span className="font-bold text-[#3e2b25]">Nome Completo:</span> {data.personal.fullName}</div>
         <div><span className="font-bold text-[#3e2b25]">Data de Nasc.:</span> {data.personal.birthDate}</div>
         <div><span className="font-bold text-[#3e2b25]">Idade:</span> {data.personal.age} anos</div>
         <div><span className="font-bold text-[#3e2b25]">RG:</span> {data.personal.rg}</div>
         <div><span className="font-bold text-[#3e2b25]">CPF:</span> {data.personal.cpf}</div>
         <div><span className="font-bold text-[#3e2b25]">Gênero:</span> {data.personal.gender}</div>
         <div><span className="font-bold text-[#3e2b25]">Profissão:</span> {data.personal.occupation}</div>
         <div><span className="font-bold text-[#3e2b25]">Peso:</span> {data.personal.weight} kg</div>
         <div><span className="font-bold text-[#3e2b25]">Altura:</span> {data.personal.height} m</div>
         <div className="col-span-2"><span className="font-bold text-[#3e2b25]">Endereço:</span> {data.personal.address}</div>
         <div><span className="font-bold text-[#3e2b25]">Telefone:</span> {data.personal.phone}</div>
         <div><span className="font-bold text-[#3e2b25]">Celular:</span> {data.personal.mobile} {data.personal.hasWhatsapp && <span className="text-green-600 text-xs">(WhatsApp)</span>}</div>
         <div className="col-span-2"><span className="font-bold text-[#3e2b25]">Email:</span> {data.personal.email}</div>
         <div className="col-span-2 text-xs text-slate-500 mt-2">Na ordem de nascimento dos filhos da sua mãe, posição: {data.personal.birthOrder}</div>
      </div>

      {/* 2. General Health */}
      <SectionHeader title="Histórico Geral de Saúde" />
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Box title="Saúde Geral">
           <div className="flex justify-between mb-1"><span>Boa saúde geral?</span> <BoolText val={data.general.goodHealth} /></div>
           <div className="flex justify-between"><span>Mudanças recentes?</span> <BoolText val={data.general.recentChanges} /></div>
        </Box>
        <Box title="Última Consulta">
           Data: {data.general.lastAppt || 'Não informada'}
        </Box>
        <div className="col-span-2 bg-[#fdfbfb] border border-[#eee] p-3 rounded-lg">
           <div className="font-bold text-[#3e2b25] text-sm uppercase mb-1">Cirurgias e Internações</div>
           <p className="text-sm mb-2">Já sofreu doença grave com cirurgia? <BoolText val={data.general.surgeries.has} /></p>
           {data.general.surgeries.has && <p className="text-sm italic bg-white p-2 border border-slate-100">{data.general.surgeries.details}</p>}
           
           <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
             <div>Mora com os pais? <BoolText val={data.general.liveWithParents} /></div>
             <div>Hospitalizado nos últimos 5 anos? <BoolText val={data.general.hospitalizedLast5Years} /></div>
           </div>
        </div>
      </div>

      {/* 3. Cardiovascular */}
      <div className="break-inside-avoid">
        <SectionHeader title="Sistema Cardiovascular" />
        <div className="grid grid-cols-3 gap-4 text-xs mb-4">
           <div className="space-y-1">
             <div className="font-bold text-[#3e2b25] mb-1">Doenças Constatadas</div>
             {['Problemas de coração', 'Trombose ou embolia', 'Ataques cardíacos', 'Insuficiência coronária', 'Lesões de válvulas', 'Cardiopatias congênitas'].map(c => (
               <div key={c}>{data.cardio.conditions.includes(c) ? '◼' : '◻'} {c}</div>
             ))}
           </div>
           <div className="space-y-1">
             <div className="font-bold text-[#3e2b25] mb-1">Sintomas</div>
             {['Sopro', 'Dor no peito (esforço)', 'Falta de ar (leve)', 'Cansaço fácil', 'Inchaço nas pernas', 'Amortecimento'].map(c => (
               <div key={c}>{data.cardio.symptoms.includes(c) ? '◼' : '◻'} {c}</div>
             ))}
           </div>
           <div className="space-y-1">
             <div className="font-bold text-[#3e2b25] mb-1">Outros</div>
             {['Varizes/Dores fortes', 'Usa marcapasso'].map(c => (
               <div key={c}>{data.cardio.others.includes(c) ? '◼' : '◻'} {c}</div>
             ))}
              <div className="mt-2 pt-2 border-t">
               <span className="font-bold">Pressão Arterial:</span> <BoolText val={data.cardio.bloodPressure.has} />
               {data.cardio.bloodPressure.has && <div className="ml-2">Alta: {data.cardio.bloodPressure.high} | Baixa: {data.cardio.bloodPressure.low}</div>}
             </div>
           </div>
        </div>
      </div>

      {/* 4. Nervous & Respiratory */}
      <div className="break-before-page"></div>
      <SectionHeader title="Sistemas Nervoso e Respiratório" />
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
           <h3 className="font-bold text-[#3e2b25] text-sm uppercase mb-2 bg-slate-100 p-1">Sistema Nervoso</h3>
           <div className="space-y-1 text-xs">
              {['Epilepsia', 'Desmaios', 'Convulsões', 'Alterações emocionais', 'Enxaqueca', 'Traumatismo craniano', 'Tonturas'].map(i => (
                  <div key={i} className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                    <span>{i}</span>
                    <span>{data.nervous.history.includes(i) ? '(X)' : '( )'}</span>
                  </div>
              ))}
              <div className="mt-2 pt-2">
                 <div>Tratamento p/ nervos? <BoolText val={data.nervous.treatment} /></div>
                 <div>Psicanálise/Terapia? <BoolText val={data.nervous.psychotherapy} /></div>
              </div>
           </div>
        </div>
        <div>
           <h3 className="font-bold text-[#3e2b25] text-sm uppercase mb-2 bg-slate-100 p-1">Sistema Respiratório</h3>
           <div className="space-y-1 text-xs">
              {['Resfriado/Tosse persistente', 'Falta de ar frequente', 'Tuberculose', 'Histórico Familiar TB', 'Dificuldade respirar nariz', 'Rinite', 'Sinusite', 'Asma/Bronquite'].map(i => (
                  <div key={i} className="flex justify-between border-b border-dotted border-slate-200 pb-1">
                    <span>{i}</span>
                    <span>{data.respiratory.conditions.includes(i) ? '(X)' : '( )'}</span>
                  </div>
              ))}
              <div className="mt-2 pt-2 bg-red-50 p-2 rounded">
                 <div className="font-bold">Teve COVID-19? <BoolText val={data.respiratory.covid.has} /></div>
                 {data.respiratory.covid.has && <div className="italic text-[10px] mt-1">{data.respiratory.covid.details}</div>}
              </div>
           </div>
        </div>
      </div>

      {/* 5. Digestive & Endocrine */}
      <SectionHeader title="Sistemas Digestório e Endócrino" />
      <div className="grid grid-cols-2 gap-6 mb-6">
         <div>
            <h3 className="font-bold text-[#3e2b25] text-sm uppercase mb-2 bg-slate-100 p-1">Digestório</h3>
            <div className="text-xs flex flex-wrap gap-2 mb-2">
               {['Úlcera', 'Gastrite', 'Hepatite', 'Icterícia', 'Doença fígado', 'Vomitou sangue', 'Sangramento intestinal', 'Constipação', 'Diarreia', 'Hemorroida'].map(c => (
                  <span key={c} className={data.digestive.conditions.includes(c) ? "bg-slate-800 text-white px-1 rounded" : "text-slate-400"}>{c}</span>
               ))}
            </div>
            {data.digestive.diarrheaFreq && <div className="text-xs mt-1"><strong>Freq. Diarreia:</strong> {data.digestive.diarrheaFreq}</div>}
            <div className="text-xs mt-2 space-y-1">
               {['Ardência ao evacuar', 'Dores estomacais', 'Estufamento'].map(c => (
                  <div key={c}>{data.digestive.symptoms.includes(c) ? '(X)' : '( )'} {c}</div>
               ))}
            </div>
         </div>
         <div>
            <h3 className="font-bold text-[#3e2b25] text-sm uppercase mb-2 bg-slate-100 p-1">Endócrino</h3>
            <div className="space-y-2 text-xs">
               <div>Diabetes? <BoolText val={data.endocrine.diabetes} /></div>
               <div>Histórico Familiar Diabetes? <BoolText val={data.endocrine.familyDiabetes} /></div>
               <div>Urina +6x/dia? <BoolText val={data.endocrine.frequentUrination} /></div>
               <div>Muita sede/Boca seca? <BoolText val={data.endocrine.thirst} /></div>
               <div>Tireoide (Hipo/Hiper)? <BoolText val={data.endocrine.thyroid.has} /></div>
               <div>Reposição Hormonal? <BoolText val={data.endocrine.hormonalReplacement.has} /></div>
               {data.endocrine.hormonalReplacement.has && <div className="pl-2 border-l-2 border-slate-300">{data.endocrine.hormonalReplacement.details}</div>}
            </div>
         </div>
      </div>

      {/* 6. Hematological, Genitourinary, Ortho, Neo */}
      <SectionHeader title="Outros Sistemas e Condições" />
      <div className="grid grid-cols-2 gap-4 text-xs mb-6">
         <Box title="Hematológico">
            {['Anemia', 'Histórico Familiar', 'Hemofilia', 'Sangramento Excessivo', 'Coagulação Lenta', 'Transfusão'].map(c => (
               <div key={c}>{data.hematological.conditions.includes(c) ? '◼' : '◻'} {c}</div>
            ))}
         </Box>
         <Box title="Geniturinário">
             {['Problema Renal', 'Sífilis/Gonorreia', 'Pedra Rim/Vesícula', 'AIDS', 'Disfunção Sexual'].map(c => (
               <div key={c}>{data.genitourinary.conditions.includes(c) ? '◼' : '◻'} {c}</div>
            ))}
         </Box>
         <Box title="Ortopédico">
             {['Coluna', 'Artrite', 'Reumatismo', 'Osteoporose', 'Infecções Ósseas', 'Lúpus'].map(c => (
               <div key={c}>{data.orthopedic.conditions.includes(c) ? '◼' : '◻'} {c}</div>
            ))}
         </Box>
         <Box title="Neoplasias (Câncer)">
             <div className="mb-2">Tumores ou massas malignas? <BoolText val={data.neoplasms.has} /></div>
             {data.neoplasms.has && <div className="italic border-t pt-1">{data.neoplasms.details}</div>}
         </Box>
      </div>

       {/* 7. Recent Exams */}
      <div className="break-before-page"></div>
      <SectionHeader title="Exames Laboratoriais Recentes" />
      <div className="bg-slate-50 p-4 rounded-lg mb-6 border border-slate-200">
          <div className="text-sm font-bold text-slate-700 mb-4 pb-2 border-b">Data dos Exames: {data.exams.examDate ? new Date(data.exams.examDate).toLocaleDateString() : 'Não informada'}</div>
          
          <div className="grid grid-cols-3 gap-6 text-sm">
             <div>
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">Hematologia</h4>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                   <span>Hemoglobina:</span> <span className="font-mono font-bold">{data.exams.hemoglobin || '-'}</span>
                   <span>Leucócitos:</span> <span className="font-mono font-bold">{data.exams.leukocytes || '-'}</span>
                   <span>Plaquetas:</span> <span className="font-mono font-bold">{data.exams.platelets || '-'}</span>
                </div>
             </div>
             <div>
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">Metabolismo</h4>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                   <span>Glicose:</span> <span className="font-mono font-bold">{data.exams.glucose || '-'}</span>
                   <span>HbA1c:</span> <span className="font-mono font-bold">{data.exams.hba1c || '-'}</span>
                   <span>Colesterol:</span> <span className="font-mono font-bold">{data.exams.cholesterolTotal || '-'}</span>
                   <span>HDL/LDL:</span> <span className="font-mono font-bold">{data.exams.hdl || '-'}/{data.exams.ldl || '-'}</span>
                   <span>Trigliceríd.:</span> <span className="font-mono font-bold">{data.exams.triglycerides || '-'}</span>
                </div>
             </div>
             <div>
                <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">Renal/Outros</h4>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                   <span>Creatinina:</span> <span className="font-mono font-bold">{data.exams.creatinine || '-'}</span>
                   <span>Ureia:</span> <span className="font-mono font-bold">{data.exams.urea || '-'}</span>
                   <span>TSH:</span> <span className="font-mono font-bold">{data.exams.tsh || '-'}</span>
                   <span>Vit D:</span> <span className="font-mono font-bold">{data.exams.vitaminD || '-'}</span>
                </div>
             </div>
          </div>

          {data.exams.others && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <span className="font-bold text-xs block mb-1">Outros Resultados / Observações:</span>
                <p className="text-xs whitespace-pre-wrap italic text-slate-600">{data.exams.others}</p>
              </div>
          )}
      </div>

      {/* 8. Additional Info & Meds */}
      <SectionHeader title="Informações Adicionais e Medicamentos" />
      
      <div className="grid grid-cols-2 gap-6 mb-6 text-sm">
         <div className="space-y-4">
            <div className="border-l-4 border-red-200 pl-3">
               <div className="font-bold text-[#3e2b25]">Infecções Atuais</div>
               <div>{data.additional.infection.has ? data.additional.infection.details : 'Nenhuma relatada'}</div>
            </div>
            <div className="border-l-4 border-yellow-200 pl-3">
               <div className="font-bold text-[#3e2b25]">Reação a Anestesia</div>
               <div>{data.additional.anesthesia.has ? data.additional.anesthesia.details : 'Nenhuma relatada'}</div>
            </div>
             <div className="border-l-4 border-orange-200 pl-3">
               <div className="font-bold text-[#3e2b25]">Exposição a Riscos (RX/Tóxicos)</div>
               <div>{data.additional.risks.has ? data.additional.risks.details : 'Nenhuma relatada'}</div>
            </div>
         </div>
         <div className="space-y-2">
            <h3 className="font-bold text-[#3e2b25] border-b">Saúde Ocular e Auditiva</h3>
            <div>Usa óculos? <BoolText val={data.additional.vision.glasses} /> (Grau: {data.additional.vision.degree})</div>
            <div>Glaucoma? <BoolText val={data.additional.vision.glaucoma} /></div>
            <div>Lentes de contato? <BoolText val={data.additional.vision.contacts} /></div>
            <div>Último oftalmologista: {data.additional.vision.lastAppt}</div>
            <div>Problema de audição? <BoolText val={data.additional.hearing} /></div>
         </div>
      </div>

      <div className="bg-[#fdfbfb] p-4 rounded-lg mb-6 border border-[#eee]">
         <h3 className="font-bold text-[#3e2b25] uppercase mb-3">Hábitos e Histórico</h3>
         <div className="grid grid-cols-2 gap-4 text-sm">
             <div><strong>Álcool:</strong> {data.habits.alcohol.freq || 'Não'}</div>
             <div><strong>Exercícios:</strong> {data.habits.exercise.type || 'Não'} ({data.habits.exercise.freq})</div>
             <div><strong>Fumo:</strong> {data.habits.smoking.freq || 'Não'}</div>
             <div><strong>Drogas:</strong> <BoolText val={data.habits.drugs} /></div>
             <div className="col-span-2"><strong>Doenças na Família:</strong> {data.habits.familyHistory}</div>
         </div>
      </div>

      <div className="mb-8">
         <h3 className="font-bold text-[#3e2b25] uppercase mb-2 border-b-2 border-[#d8c3bc]">Medicamentos</h3>
         <div className="mb-3 text-xs text-slate-500">
            Categorias em uso: {data.medications.types.length > 0 ? data.medications.types.join(', ') : 'Nenhuma selecionada'}
         </div>
         <div className="bg-slate-50 p-4 rounded min-h-[100px] border border-slate-200 text-sm whitespace-pre-wrap">
            {data.medications.currentList || 'Nenhum medicamento listado.'}
         </div>
      </div>

      {aiAnalysis && (
        <section className="mb-8 border border-blue-200 bg-blue-50 p-4 rounded-lg break-inside-avoid">
             <h2 className="text-sm font-bold uppercase text-blue-800 border-b border-blue-200 mb-3 pb-1 flex items-center gap-2">
                🤖 Resumo Clínico (IA)
             </h2>
             <div className="prose prose-sm prose-blue max-w-none text-slate-800">
                <Markdown>{aiAnalysis}</Markdown>
             </div>
        </section>
      )}

      {/* Signature */}
      <div className="mt-12 break-inside-avoid border-t-2 border-slate-100 pt-8">
        <p className="text-justify text-xs text-slate-500 mb-8 italic">
           Declaração: Declaro que todas as informações fornecidas nesta ficha de anamnese são verdadeiras e completas. 
           Estou ciente de que a omissão de informações pode comprometer minha segurança e a eficácia do tratamento.
        </p>
        <div className="grid grid-cols-2 gap-12">
            <div className="text-center">
                {data.signature ? (
                    <img src={data.signature} alt="Assinatura" className="h-16 mx-auto mb-2" />
                ) : (
                    <div className="h-16 mb-2"></div>
                )}
                <div className="border-t border-slate-400 w-3/4 mx-auto"></div>
                <p className="text-xs text-slate-500 mt-1">Assinatura do Paciente</p>
                <p className="text-xs text-slate-400">Data: {new Date(data.date).toLocaleDateString()}</p>
            </div>
            <div className="text-center">
                 <div className="h-16 mb-2"></div>
                <div className="border-t border-slate-400 w-3/4 mx-auto"></div>
                <p className="text-xs text-slate-500 mt-1">Assinatura do Profissional Responsável</p>
            </div>
        </div>
      </div>

    </div>
  );
};