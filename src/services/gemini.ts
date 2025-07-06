import { GEMINI_API_KEY, STATIC_MISSIONS, MOTIVATIONAL_QUOTES } from '../utils/constants';
import { User, Mission } from '../types';
import { generateMissionId } from '../utils/helpers';

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const generateAIMotivation = async (user: User): Promise<string> => {
  try {
    const prompt = `
    Buatkan pesan motivasi personal untuk ${user.displayName} yang sedang berjuang berhenti merokok.
    
    Data pengguna:
    - Nama: ${user.displayName}
    - Streak saat ini: ${user.streak} hari
    - Total hari berhenti: ${user.totalDays} hari
    - Level: ${user.level || 1}
    - XP: ${user.xp}
    - Badge terakhir: ${user.badges[user.badges.length - 1]?.name || 'Belum ada'}
    
    Berikan motivasi yang:
    1. Personal dan menyebutkan nama
    2. Mengapresiasi pencapaian saat ini
    3. Memberikan semangat untuk lanjut
    4. Maksimal 2 kalimat
    5. Dalam bahasa Indonesia yang hangat dan supportif
    
    Jangan gunakan format markdown atau bullet points.
    `;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 150,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    }
    
    throw new Error('Invalid response format from Gemini');
  } catch (error) {
    console.error('Error generating AI motivation:', error);
    // Fallback to static motivation
    return getRandomMotivation();
  }
};

export const generateAIMissions = async (user: User): Promise<Mission[]> => {
  try {
    const prompt = `
    Buatkan 3 misi harian yang personal untuk ${user.displayName} yang sedang berjuang berhenti merokok.
    
    Data pengguna:
    - Streak: ${user.streak} hari
    - Total hari: ${user.totalDays} hari
    - Level: ${user.level || 1}
    - Badge terakhir: ${user.badges[user.badges.length - 1]?.name || 'Belum ada'}
    
    Format response dalam JSON array dengan struktur:
    [
      {
        "title": "Judul Misi (maksimal 20 karakter)",
        "description": "Deskripsi detail misi (maksimal 50 karakter)",
        "xpReward": number (10-30),
        "difficulty": "easy|medium|hard"
      }
    ]
    
    Misi harus:
    1. Berkaitan dengan kesehatan fisik/mental
    2. Dapat dilakukan dalam 1 hari
    3. Membantu mengatasi keinginan merokok
    4. Sesuai dengan level progress user
    5. Variatif (tidak hanya olahraga)
    
    Contoh misi: minum air, jalan kaki, meditasi, napas dalam, cemilan sehat, dll.
    `;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const responseText = data.candidates[0].content.parts[0].text.trim();
      
      // Try to parse JSON response
      try {
        const cleanedText = responseText.replace(/```json\n?|\n?```/g, '').trim();
        const missions = JSON.parse(cleanedText);
        
        return missions.map((mission: any, index: number) => ({
          id: generateMissionId(),
          title: mission.title || `Misi ${index + 1}`,
          description: mission.description || 'Misi harian untuk kesehatan',
          xpReward: Math.min(Math.max(mission.xpReward || 15, 10), 30),
          difficulty: ['easy', 'medium', 'hard'].includes(mission.difficulty) 
            ? mission.difficulty 
            : 'medium',
          isCompleted: false,
          completedAt: null,
          isAIGenerated: true,
        }));
      } catch (parseError) {
        console.error('Error parsing AI missions JSON:', parseError);
        throw new Error('Invalid JSON format from AI');
      }
    }
    
    throw new Error('Invalid response format from Gemini');
  } catch (error) {
    console.error('Error generating AI missions:', error);
    // Fallback to static missions
    return getStaticMissions(3);
  }
};

export const generatePersonalizedTip = async (user: User): Promise<string> => {
  try {
    const prompt = `
    Berikan 1 tips personal untuk ${user.displayName} yang sedang berhenti merokok.
    
    Context:
    - Streak: ${user.streak} hari
    - Total hari: ${user.totalDays} hari
    - Level: ${user.level || 1}
    
    Tips harus:
    1. Praktis dan actionable
    2. Berkaitan dengan situasi saat ini
    3. Maksimal 1 kalimat
    4. Fokus pada kesehatan atau motivasi
    5. Dalam bahasa Indonesia
    
    Contoh: "Coba ganti kebiasaan merokok dengan minum air putih hangat."
    `;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 100,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      return data.candidates[0].content.parts[0].text.trim();
    }
    
    throw new Error('Invalid response format from Gemini');
  } catch (error) {
    console.error('Error generating AI tip:', error);
    // Fallback to static tip
    return getRandomTip();
  }
};

// Fallback functions for when AI is not available
const getRandomMotivation = (): string => {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
};

const getStaticMissions = (count: number = 3): Mission[] => {
  const shuffled = STATIC_MISSIONS.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map((mission, index) => ({
    id: generateMissionId(),
    ...mission,
    isCompleted: false,
    completedAt: null,
    isAIGenerated: false,
  }));
};

const getRandomTip = (): string => {
  const tips = [
    "Minum air putih setiap kali ingin merokok untuk membantu detoksifikasi.",
    "Lakukan napas dalam 4-7-8 untuk mengatasi stress tanpa rokok.",
    "Sikat gigi setelah makan untuk mengurangi keinginan merokok.",
    "Olahraga ringan 10 menit bisa menggantikan 'istirahat rokok'.",
    "Simpan uang rokok dalam celengan untuk hadiah diri sendiri.",
    "Konsumsi buah jeruk untuk vitamin C yang hilang akibat rokok.",
    "Gunakan tusuk gigi atau permen karet untuk menggantikan oral fixation.",
    "Hindari tempat atau situasi yang biasa memicu keinginan merokok.",
  ];
  return tips[Math.floor(Math.random() * tips.length)];
};

export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Test connection. Respond with 'OK' only."
          }]
        }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 10,
        }
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Gemini connection test failed:', error);
    return false;
  }
};