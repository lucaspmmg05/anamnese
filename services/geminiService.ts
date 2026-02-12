import { GoogleGenAI } from "@google/genai";
import { AnamnesisFormState } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeAnamnesis = async (data: AnamnesisFormState): Promise<string> => {
  try {
    // Construct a detailed text representation of the data
    const patientData = JSON.stringify(data, null, 2);

    const prompt = `
      Você é um assistente clínico sênior. Analise os seguintes dados COMPLETOS de anamnese de um paciente e forneça um resumo clínico estruturado.
      
      DADOS DO PACIENTE (JSON):
      ${patientData}

      TAREFA:
      1. **Resumo Clínico (Highlights):** Resuma o perfil do paciente focando nos alertas vermelhos (doenças crônicas, cirurgias, medicamentos contínuos, alergias e histórico familiar).
      2. **Análise de Exames:** Verifique os valores de exames laboratoriais fornecidos (se houver) e alerte sobre valores fora da normalidade (glicose, colesterol, pressão, etc).
      3. **Fatores de Risco:** Liste 3-5 fatores de risco identificados baseados nos sistemas (Cardio, Resp, Digestório, etc) e estilo de vida.
      4. **Interações e Alertas:** Se houver medicamentos listados, verifique potenciais interações ou contraindicações com base no histórico.
      5. **Perguntas Sugeridas:** Sugira 3 perguntas de aprofundamento para o médico fazer na consulta presencial.

      Formate a resposta em Markdown limpo. Use tom profissional e médico. Seja conciso.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Não foi possível gerar a análise.";
  } catch (error) {
    console.error("Erro ao analisar anamnese:", error);
    return "Erro ao conectar com o serviço de IA. Por favor, verifique sua chave de API ou tente novamente mais tarde.";
  }
};