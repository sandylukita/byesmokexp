import { STATIC_MISSIONS, MOTIVATIONAL_QUOTES } from '../utils/constants';
import { ENV_CONFIG, log } from '../config/environment';
import { User, Mission } from '../types';
import { generateMissionId, getRandomMotivation, getContextualMotivation } from '../utils/helpers';

interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

// Global lock to prevent multiple simultaneous API calls
let isGeminiCallInProgress = false;
const geminiCallQueue: (() => void)[] = [];

// Enhanced AI consultation for milestones and recovery
export const generateAIMilestoneInsight = async (user: User, triggerType: 'milestone' | 'streak_recovery' | 'daily_motivation', triggerData: any, language: 'en' | 'id' = 'id'): Promise<string> => {
  const callId = Math.random().toString(36).substr(2, 9);
  console.log('🚀 GEMINI API CALL REQUESTED - ID:', callId, 'User:', user.displayName, 'Language:', language, 'Type:', triggerType);
  
  // Check if another call is in progress
  if (isGeminiCallInProgress) {
    console.log('🚫 GEMINI API CALL BLOCKED - ID:', callId, 'Another call is in progress');
    throw new Error('Another Gemini API call is in progress');
  }
  
  isGeminiCallInProgress = true;
  console.log('🔒 GEMINI API CALL LOCK ACQUIRED - ID:', callId);
  
  try {
    // Create language-appropriate prompt
    const isEnglish = language === 'en';
    
    let prompt = isEnglish ? `
    You are a supportive wellness coach with extensive knowledge from research on helping people quit smoking. This is a deep personal motivation session for ${user.displayName}.
    
    Complete user data:
    - Name: ${user.displayName}
    - Current streak: ${user.streak} days
    - Total journey: ${user.totalDays} days
    - Longest streak: ${user.longestStreak || 0} days
    - Achievement level: ${user.level || 1}
    - Latest badge: ${user.badges[user.badges.length - 1]?.name || 'No achievements yet'}
    - XP collected: ${user.xp} points
    
    ` : `
    Kamu adalah seorang wellness coach yang bijaksana dengan pengetahuan mendalam dari riset tentang membantu orang berhenti merokok. Ini adalah sesi motivasi personal yang mendalam untuk ${user.displayName}.
    
    Data lengkap pengguna:
    - Nama: ${user.displayName}
    - Streak saat ini: ${user.streak} hari
    - Total perjalanan: ${user.totalDays} hari
    - Streak terpanjang: ${user.longestStreak || 0} hari
    - Level pencapaian: ${user.level || 1}
    - Badge terakhir: ${user.badges[user.badges.length - 1]?.name || 'Belum ada pencapaian'}
    - XP yang dikumpulkan: ${user.xp} poin
    
    `;

    if (triggerType === 'milestone') {
      prompt += `
      SITUASI: ${user.displayName} baru saja mencapai milestone besar ${triggerData.daysAchieved} hari tanpa merokok!
      
      Sebagai wellness coach berpengalaman, berikan motivasi personal yang PANJANG dan MENDALAM:
      1. Mulai dengan "Anak muda ${user.displayName}" atau variasi hangat lainnya
      2. Akui pencapaian ini sebagai momen bersejarah dalam hidupnya dengan detail
      3. Berbagi wisdom dari 40 tahun praktik tentang milestone ini secara detail
      4. Jelaskan perubahan kesehatan yang terjadi di tubuhnya dengan spesifik
      5. Berikan perspektif tentang perjalanan yang sudah dilalui dengan refleksi mendalam
      6. Motivasi untuk milestone berikutnya dengan bijaksana dan inspiratif
      7. Ceritakan dampak positif untuk keluarga dan orang-orang terdekat
      8. MINIMAL 6-8 kalimat yang panjang dan bermakna mendalam
      9. Setiap kalimat harus berisi makna emosional yang kuat
      10. Nada: penuh kehangatan, bangga, dan wisdom coach senior yang sangat supportif
      
      PENTING: Buat pesan yang PANJANG dan DETAIL, bukan singkat. Setiap kalimat harus memiliki makna mendalam dan emosional.
      
      Contoh wisdom: "Berdasarkan riset 4 dekade, terlihat bahwa mereka yang mencapai ${triggerData.daysAchieved} hari memiliki kekuatan mental yang luar biasa. Tubuhmu sekarang telah mengalami transformasi yang menakjubkan - paru-parumu bernapas lebih lega, sirkulasi darahmu mengalir dengan sempurna, dan setiap sel dalam tubuhmu bersyukur atas keputusan bijak yang telah kamu ambil..."
      `;
    } else if (triggerType === 'streak_recovery') {
      prompt += `
      SITUASI: ${user.displayName} pernah memiliki streak ${triggerData.brokenStreakLength} hari yang putus, sekarang sedang membangun kembali (${user.streak} hari). Ini momen yang sangat sensitif dan butuh dukungan mendalam.
      
      Sebagai coach yang telah mempelajari ribuan kasus serupa, berikan motivasi yang PANJANG dan MENYENTUH HATI:
      1. Mulai dengan empati mendalam: "Anak muda, saya mengerti perasaanmu..." dengan detail emosional
      2. Validasi bahwa ini adalah bagian normal dari proses pemulihan dengan penjelasan berdasarkan riset
      3. Berbagi cerita wisdom dari orang lain yang berhasil bangkit dengan detail inspiratif
      4. Jelaskan bahwa streak ${triggerData.brokenStreakLength} hari sebelumnya TIDAK hilang, itu adalah pembelajaran berharga
      5. Berikan perspektif berdasarkan riset tentang proses recovery dan bagaimana tubuh terus membaik
      6. Motivasi dengan penuh kasih sayang untuk tidak menyerah, jelaskan kekuatan mental yang dimiliki
      7. Ceritakan bagaimana orang-orang terdekat bangga dengan usahanya
      8. Berikan harapan konkret untuk masa depan yang lebih sehat
      9. MINIMAL 7-9 kalimat yang panjang, menyentuh hati dan memberi kekuatan mendalam
      10. Setiap kalimat harus penuh empati dan makna emosional yang kuat
      11. Nada: sangat empati, supportif, seperti ayah yang menyemangati anak dengan kasih sayang tanpa batas
      
      PENTING: Buat pesan yang SANGAT PANJANG dan EMOSIONAL, bukan singkat. Fokus pada empati mendalam dan harapan yang kuat.
      
      Hindari: menyalahkan, menggurui, atau membuat merasa bersalah. Fokus pada harapan dan kekuatan untuk bangkit.
      `;
    } else if (triggerType === 'daily_motivation') {
      prompt += `
      SITUASI: Ini adalah motivasi harian personal untuk ${user.displayName} yang sedang menjalani perjalanan berhenti merokok.
      
      Sebagai wellness coach senior yang penuh kasih sayang, berikan motivasi harian yang PANJANG dan BERMAKNA:
      1. Mulai dengan sapaan hangat yang personal: "Selamat pagi/siang/sore ${user.displayName}"
      2. Akui usaha dan komitmen yang telah dilakukan sejauh ini
      3. Berikan perspektif berdasarkan riset tentang manfaat kesehatan yang sedang dialami
      4. Jelaskan perubahan positif yang terjadi pada tubuh dan mental
      5. Berikan motivasi untuk melanjutkan perjalanan dengan detail inspiratif
      6. Hubungkan dengan pencapaian XP dan level yang sudah diraih
      7. Sampaikan pesan tentang kebanggaan keluarga dan orang terdekat
      8. Berikan dorongan untuk hari ini dengan konkret dan praktis
      9. Akhiri dengan kata-kata penguatan yang menyentuh hati
      10. MINIMAL 7-10 kalimat PANJANG yang penuh makna dan inspirasi
      11. Setiap kalimat harus berisi detail emosional dan motivasi yang kuat
      12. Nada: hangat, penuh kasih sayang, seperti coach yang sangat peduli dengan usernya
      
      PENTING: Buat pesan yang SANGAT PANJANG dan PERSONAL, bukan umum. Fokus pada perjalanan individual dan pencapaian spesifik mereka.
      
      Sesuaikan dengan data pengguna:
      - Streak: ${user.streak} hari
      - Total perjalanan: ${user.totalDays} hari
      - Level: ${user.level || 1}
      - XP: ${user.xp} poin
      - Badge terakhir: ${user.badges[user.badges.length - 1]?.name || 'Belum ada pencapaian'}
      `;
    }

    prompt += isEnglish ? `
    
    FINAL INSTRUCTIONS:
    - Language: Warm and natural English
    - Length: MINIMUM 6-9 LONG sentences with deep emotional meaning
    - Each sentence should contain at least 15-20 words for detail and strong meaning
    - Style: Personal motivation session from a caring and wise senior wellness coach
    - Focus on emotional details, health, and positive impact
    - Avoid short or brief sentences
    - Create a message that truly touches the heart and provides deep motivation
    ` : `
    
    INSTRUKSI AKHIR:
    - Bahasa: Indonesia yang hangat dan natural
    - Panjang: MINIMAL 6-9 kalimat PANJANG yang berisi makna mendalam dan emosional
    - Setiap kalimat harus berisi minimal 15-20 kata untuk memberikan detail dan makna yang kuat
    - Gaya: Sesi motivasi personal dari wellness coach senior yang penuh kasih sayang dan wisdom
    - Fokus pada detail emosional, kesehatan, dan dampak positif
    - Hindari kalimat pendek atau singkat
    - Buat pesan yang benar-benar menyentuh hati dan memberikan motivasi mendalam
    `;

    console.log('📡 GEMINI API CALL - Making HTTP request with ID:', callId);
    
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': ENV_CONFIG.GEMINI.apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 200, // Reduced to prevent extremely long responses
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
    console.error('❌ GEMINI API CALL ERROR - ID:', callId, 'Error:', error);
    
    // Enhanced fallback to contextual motivation system
    console.log('🔄 Using contextual fallback motivation for premium user');
    
    // Use our expanded contextual motivation system based on user's journey stage
    // This provides much better fallback than generic messages
    const contextualMotivation = getContextualMotivation(user, language);
    
    // Add personalization with proper language support
    if (triggerType === 'milestone' && triggerData?.daysAchieved) {
      return language === 'en' 
        ? `🎉 Congratulations ${user.displayName}! Your ${triggerData.daysAchieved} day achievement is an outstanding milestone. ${contextualMotivation}`
        : `🎉 Selamat ${user.displayName}! Pencapaian ${triggerData.daysAchieved} hari adalah milestone yang luar biasa. ${contextualMotivation}`;
    } else if (triggerType === 'streak_recovery' && triggerData?.brokenStreakLength) {
      return language === 'en'
        ? `💪 ${user.displayName}, your previous ${triggerData.brokenStreakLength} day streak was valuable learning. ${contextualMotivation}`
        : `💪 ${user.displayName}, streak ${triggerData.brokenStreakLength} hari sebelumnya adalah pembelajaran berharga. ${contextualMotivation}`;
    } else {
      // For daily motivation, add personal touch in correct language
      return language === 'en'
        ? `🌟 ${user.displayName}, ${contextualMotivation}`
        : `🌟 ${user.displayName}, ${contextualMotivation}`;
    }
  } finally {
    isGeminiCallInProgress = false;
    console.log('🔓 GEMINI API CALL LOCK RELEASED - ID:', callId);
  }
};

// Keep original function for backward compatibility but enhance with contextual fallback
export const generateAIMotivation = async (user: User): Promise<string> => {
  // Enhanced fallback uses contextual motivation instead of random general quotes
  console.log('🔄 Using contextual fallback for generateAIMotivation');
  return getContextualMotivation(user);
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

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': ENV_CONFIG.GEMINI.apiKey,
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

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': ENV_CONFIG.GEMINI.apiKey,
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

// Translate English quotes to proper Indonesian using Gemini AI
export const translateQuotesToIndonesian = async (englishQuotes: string[]): Promise<string[]> => {
  try {
    const prompt = `
    Translate these English motivational quotes about quitting smoking to proper Indonesian. 
    Keep the motivational tone and meaning intact. Return ONLY the Indonesian translations, one per line, in the same order.
    
    English quotes:
    ${englishQuotes.join('\n')}
    
    Requirements:
    - Use proper Indonesian language (no mixed English words)
    - Keep the motivational and encouraging tone
    - Each translation should be meaningful and natural in Indonesian
    - Return only the translations, nothing else
    `;

    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': ENV_CONFIG.GEMINI.apiKey,
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const translatedText = data.candidates[0].content.parts[0].text.trim();
      return translatedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    }
    
    throw new Error('Invalid response format from Gemini');
  } catch (error) {
    console.error('Error translating quotes:', error);
    return englishQuotes; // Return original if translation fails
  }
};

export const testGeminiConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': ENV_CONFIG.GEMINI.apiKey,
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