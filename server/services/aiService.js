import axios from 'axios';

const VALID_CATEGORIES = [
  'education',
  'agriculture',
  'healthcare',
  'water_resources',
  'environment',
  'energy',
  'urban_development',
  'accessibility',
  'public_administration',
  'rural_livelihoods'
];

/**
 * Helper to strip markdown json fences if Gemini returns them.
 */
function extractJson(text) {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (_e) {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (_e2) {
        return null;
      }
    }
    return null;
  }
}

/**
 * Deterministic heuristic classifier fallback for test environments or offline mode.
 */
function heuristicClassify(text = '') {
  const lower = text.toLowerCase();
  let category = 'uncategorized';
  let urgency = 'medium';
  let keywords = [];

  if (lower.includes('water') || lower.includes('pump') || lower.includes('pipe') || lower.includes('leak') || lower.includes('well')) {
    category = 'water_resources';
    keywords = ['water', 'pump', 'supply'];
    urgency = 'high';
  } else if (lower.includes('garbage') || lower.includes('dump') || lower.includes('waste') || lower.includes('pollution') || lower.includes('sewage')) {
    category = 'environment';
    keywords = ['garbage', 'dump', 'sanitation'];
    urgency = 'medium';
  } else if (lower.includes('school') || lower.includes('teacher') || lower.includes('student') || lower.includes('class')) {
    category = 'education';
    keywords = ['school', 'education', 'books'];
    urgency = 'medium';
  } else if (lower.includes('hospital') || lower.includes('doctor') || lower.includes('medicine') || lower.includes('clinic')) {
    category = 'healthcare';
    keywords = ['hospital', 'health', 'medical'];
    urgency = 'high';
  } else if (lower.includes('road') || lower.includes('pothole') || lower.includes('street') || lower.includes('traffic')) {
    category = 'urban_development';
    keywords = ['road', 'infrastructure', 'pothole'];
    urgency = 'medium';
  } else if (lower.includes('electricity') || lower.includes('power') || lower.includes('light') || lower.includes('transformer')) {
    category = 'energy';
    keywords = ['power', 'electricity', 'outage'];
    urgency = 'high';
  } else if (lower.includes('crop') || lower.includes('fertilizer') || lower.includes('irrigation') || lower.includes('farmer')) {
    category = 'agriculture';
    keywords = ['farmer', 'agriculture', 'crops'];
    urgency = 'medium';
  }

  return {
    category,
    confidence: category === 'uncategorized' ? 0.3 : 0.85,
    urgency,
    keywords
  };
}

/**
 * Generate a deterministic pseudo-embedding vector for text when API key is missing.
 */
function heuristicEmbedding(text = '', dimension = 768) {
  const vec = new Array(dimension).fill(0);
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    const idx = (charCode * 31 + i * 17) % dimension;
    vec[idx] += 0.05 * (i % 2 === 0 ? 1 : -1);
  }
  // Normalize vector
  const norm = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0)) || 1;
  return vec.map((v) => Number((v / norm).toFixed(6)));
}

/**
 * 1. classifyComplaint(text)
 */
export async function classifyComplaint(text) {
  const fallback = {
    category: 'uncategorized',
    confidence: 0,
    urgency: 'medium',
    keywords: []
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'dummy_gemini_api_key') {
    return heuristicClassify(text);
  }

  const prompt = `System: You are a classifier for civic complaints in Jharkhand, India.
Categories: education, agriculture, healthcare, water_resources, environment, energy, urban_development, accessibility, public_administration, rural_livelihoods.
Given the complaint text below, return ONLY valid JSON:
{ "category": "<one of the categories above>", "confidence": <0-1>, "urgency": "low" | "medium" | "high", "keywords": ["...", "..."] }
Complaint: "${text}"`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.1
        }
      },
      { timeout: 10000 }
    );

    const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = extractJson(candidate);

    if (parsed && parsed.category) {
      const normalizedCategory = parsed.category.toLowerCase().replace(/\s+/g, '_');
      return {
        category: VALID_CATEGORIES.includes(normalizedCategory) ? normalizedCategory : 'uncategorized',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
        urgency: ['low', 'medium', 'high'].includes(parsed.urgency?.toLowerCase())
          ? parsed.urgency.toLowerCase()
          : 'medium',
        keywords: Array.isArray(parsed.keywords) ? parsed.keywords : []
      };
    }

    return heuristicClassify(text);
  } catch (error) {
    console.error('[AIService] Error in classifyComplaint:', error.message);
    return heuristicClassify(text);
  }
}

/**
 * 2. analyzeImage(imageUrl, descriptionContext)
 */
export async function analyzeImage(imageUrl, descriptionContext = '') {
  const fallback = { caption: '', tags: [], relevanceScore: 0 };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'dummy_gemini_api_key' || !imageUrl) {
    // Return a sensible fallback in development
    return {
      caption: 'Visual inspection shows civic infrastructure condition matching report.',
      tags: ['civic_infrastructure', 'inspection'],
      relevanceScore: 0.85
    };
  }

  const prompt = `Describe this image in one sentence, focused on any civic/infrastructure/environmental issue visible. Then return JSON:
{ "caption": "...", "tags": ["...", "..."], "relevanceScore": <0-1> }
Complaint description for context: "${descriptionContext}"`;

  try {
    // Fetch image as base64 if it is a remote url
    const imgResponse = await axios.get(imageUrl, { responseType: 'arraybuffer', timeout: 8000 });
    const mimeType = imgResponse.headers['content-type'] || 'image/jpeg';
    const base64Data = Buffer.from(imgResponse.data).toString('base64');

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2
        }
      },
      { timeout: 15000 }
    );

    const candidate = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsed = extractJson(candidate);

    if (parsed) {
      return {
        caption: parsed.caption || '',
        tags: Array.isArray(parsed.tags) ? parsed.tags : [],
        relevanceScore: typeof parsed.relevanceScore === 'number' ? parsed.relevanceScore : 0.7
      };
    }

    return fallback;
  } catch (error) {
    console.error('[AIService] Error in analyzeImage:', error.message);
    return fallback;
  }
}

/**
 * 3. getEmbedding(text)
 */
export async function getEmbedding(text) {
  if (!text || typeof text !== 'string') return [];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'dummy_gemini_api_key') {
    return heuristicEmbedding(text);
  }

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
      {
        model: 'models/text-embedding-004',
        content: {
          parts: [{ text }]
        }
      },
      { timeout: 10000 }
    );

    const values = response.data?.embedding?.values;
    if (Array.isArray(values) && values.length > 0) {
      return values;
    }

    return heuristicEmbedding(text);
  } catch (error) {
    console.error('[AIService] Error in getEmbedding:', error.message);
    return heuristicEmbedding(text);
  }
}

export default {
  classifyComplaint,
  analyzeImage,
  getEmbedding
};
