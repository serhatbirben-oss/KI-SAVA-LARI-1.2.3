import { GoogleGenAI } from "@google/genai";
import { CharacterProfile, GameEvent, Lord, KINGDOMS, KingdomName, VillageProblem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// STRICT MINIMALIST PROMPT
const GM_PROMPT = `
Sen "Kış Savaşları" oyununun Game Master'ısın.
KURAL 1: ASLA uzun yazma. Maksimum 2-3 cümle.
KURAL 2: Ton "Grimdark" ve "Vurucu" olsun. Betimleme yapma, durumu söyle.
KURAL 3: Oyuncuyu hemen karara zorla.
Dünya: Ebedi kış, büyülü buz, vahşi hayatta kalma.
Dil: Türkçe.
`;

export const generateStartScenario = async (profile: CharacterProfile): Promise<string> => {
  try {
    const prompt = `${GM_PROMPT}
    Karakter: ${profile.name} (${profile.culture}, ${profile.background}).
    Giriş: Oyuna başladığı o karanlık anı 2 cümleyle anlat.
    Örnek: "Babanın kellesi karların üzerine düştüğünde, elindeki paslı hançeri sıktın. İntikam, soğuktan daha çok yakıyor."
    `;
    const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
    return response.text || "Fırtına dindi. Elinde sadece bir kılıç ve sönmeyen bir öfke var.";
  } catch (e) {
    return "Gözlerini açtın. Soğuk ciğerlerini yakıyor. Hayatta kalmalısın.";
  }
};

export const generateEventResolution = async (eventTitle: string, choiceText: string, outcome: 'SUCCESS' | 'FAILURE'): Promise<string> => {
    try {
        const prompt = `${GM_PROMPT}
        Olay: ${eventTitle}
        Seçim: ${choiceText}
        Sonuç: ${outcome === 'SUCCESS' ? 'BAŞARILI' : 'BAŞARISIZ'}
        Çıktı: Sonucu anlatan tek, vurucu bir cümle yaz.
        `;
        const response = await ai.models.generateContent({model: 'gemini-2.5-flash', contents: prompt});
        return response.text || "Kararın bedelini ödedin.";
    } catch(e) {
        return outcome === 'SUCCESS' ? "Planın işledi. Hayattasın." : "Her şey ters gitti. Kan döküldü.";
    }
};

export const generateLordDialogue = async (lord: Lord, relation: number): Promise<{text: string, options: {text: string, type: string}[]}> => {
  try {
    const prompt = `${GM_PROMPT}
    Durum: Lord ${lord.name} ile konuşma.
    İlişki: ${relation}.
    Lordun tek cümlelik repliği ve oyuncunun 3 kısa cevabı (Saygı, Tehdit, Görev).
    JSON Format: { "text": "...", "options": [{ "text": "...", "type": "RESPECT/INSULT/QUEST" }] }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text!);
  } catch (e) {
    return {
      text: "Vaktimi harcama yabancı. Ne istiyorsun?",
      options: [
        { text: "Hizmetinize talibim.", type: "QUEST" },
        { text: "Sadece geçiyordum.", type: "RESPECT" },
        { text: "Kellenizi almaya geldim.", type: "INSULT" }
      ]
    };
  }
};

export const generateVillageProblem = async (villageName: string): Promise<VillageProblem> => {
    try {
        const prompt = `${GM_PROMPT}
        Yer: ${villageName}.
        Sorun: Köyün başındaki bela. Tek cümle.
        JSON: { "title": "Kısa Başlık", "description": "Tek cümlelik sorun.", "rewardGold": 100, "rewardRelation": 10, "type": "COMBAT" }
        `;
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text!);
    } catch (e) {
        return {
            title: "Buz Kurtları",
            description: "Kurtlar her gece bir çocuğu kaçırıyor.",
            rewardGold: 100,
            rewardRelation: 10,
            type: 'COMBAT'
        };
    }
};

export const generateTravelEvent = async (profile: CharacterProfile, location: string): Promise<GameEvent> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `${GM_PROMPT}
    Durum: Yolda rastgele olay.
    Çıktı: Kısa, atmosferik, tehlikeli.
    JSON: { "title": "Kısa Başlık", "description": "Maks 2 cümle.", "type": "STORY", "choices": [{ "id": "A", "text": "Kısa Eylem", "type": "RISKY" }] }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });
    
    return JSON.parse(response.text!) as GameEvent;
  } catch (e) {
    return {
      title: "Donmuş Kervan",
      description: "Yol kenarında yağmalanmış bir kervan. Cesetler hala sıcak.",
      choices: [
        { id: 'A', text: "Yağmala", type: 'LOOT' },
        { id: 'B', text: "Geç Git", type: 'DIPLOMATIC' }
      ]
    };
  }
};

export const generateCompanion = async (): Promise<{name: string, role: string, story: string, cost: number}> => {
   // Kept slightly longer for flavor but still concise
    return { name: "Varg", role: "WARRIOR", story: "Dilini kestiler, sadece kılıcıyla konuşur.", cost: 300 };
};