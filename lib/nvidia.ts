import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { KeyPool } from "./key-pool";

const MAX_INPUT_LENGTH = 2000;
const MAX_TRANSCRIPT_LENGTH = 100000;

function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/[\x00-\x1F\x7F]/g, "")
    .replace(/===/g, "=--")
    .replace(/\[\[|\]\]/g, "")
    .replace(/\\\\/g, "\\")
    .slice(0, MAX_INPUT_LENGTH)
    .trim();
}

function validateTranscriptLength(transcript: string): void {
  if (transcript.length > MAX_TRANSCRIPT_LENGTH) {
    throw new Error(`Transcript too long (${transcript.length} chars). Max: ${MAX_TRANSCRIPT_LENGTH}`);
  }
  if (transcript.length < 10) {
    throw new Error("Transcript too short to process");
  }
}

// Set NVIDIA_API_KEYS="key1,key2,key3" in .env (falls back to single key)
function getNvidiaPool() {
  return KeyPool.fromEnv(
    process.env.NVIDIA_API_KEYS ? "NVIDIA_API_KEYS" : "NVIDIA_API_KEY"
  );
}

function nvidiaClient(key: string) {
  return new OpenAI({ apiKey: key, baseURL: "https://integrate.api.nvidia.com/v1" });
}

async function withErrorLogging<T>(promise: Promise<T>, context: string): Promise<T> {
  try {
    return await promise;
  } catch (err) {
    const error = err as any;
    const status = error?.status || error?.statusCode;
    const message = error?.message || String(err);
    const response = error?.response;
    
    console.error(`[NVIDIA API Error] ${context}`);
    console.error(`  Status: ${status}`);
    console.error(`  Message: ${message}`);
    console.error(`  Response body: ${response?.data ? JSON.stringify(response.data) : 'N/A'}`);
    
    if (status === 404) {
      console.error(`  ⚠️ 404 Error: Model may be unavailable. Check NVIDIA NIM catalog for available models.`);
    }
    
    throw err;
  }
}

export async function summarizeTranscript(transcript: string) {
  validateTranscriptLength(transcript);

  const prompt = `
    You are an expert content analyzer. Your task is to provide a comprehensive, structured summary of a video transcript.

    Transcript:
    """
    ${transcript}
    """

    Please provide the output in the following Markdown format:

    # Overview
    (A brief 2-3 sentence overview of the video)

    # Key Points
    - (Point 1)
    - (Point 2)
    ...

    # Detailed Breakdown
    ## (Section Name)
    (Details)

    # Important Quotes
    - "(Quote)" - (Context)

    # Conclusion / Takeaways
    (Final summary)

    Also, identify 3-5 "Key Moments" with their approximate start times in the format:
    [TIMESTAMP_JSON_START]
    [
      {"time": 0, "label": "Introduction"},
      {"time": 60, "label": "Deep Dive into Topic X"},
      ...
    ]
    [TIMESTAMP_JSON_END]

    IMPORTANT: Base everything strictly on the transcript. Do not hallucinate.
  `;

  const response = await getNvidiaPool().run((key) =>
    withErrorLogging(
      nvidiaClient(key).chat.completions.create({
        model: "nvidia/llama-3.3-nemotron-super-49b-v1",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2,
      }),
      "summarizeTranscript"
    )
  );

  const content = response.choices[0].message.content || "";

  const jsonMatch = content.match(/\[TIMESTAMP_JSON_START\]([\s\S]*?)\[TIMESTAMP_JSON_END\]/);
  let highlights = [];
  let summary = content;

  if (jsonMatch) {
    try {
      highlights = JSON.parse(jsonMatch[1].trim());
      summary = content.replace(/\[TIMESTAMP_JSON_START\][\s\S]*?\[TIMESTAMP_JSON_END\]/, "").trim();
    } catch (e) {
      console.error("Failed to parse highlights JSON", e);
    }
  }

  return { summary, highlights };
}

export async function chatWithTranscript(
  transcript: string,
  question: string,
  history: ChatCompletionMessageParam[] = []
) {
  validateTranscriptLength(transcript);
  const sanitizedQuestion = sanitizeInput(question);

  const systemPrompt = `
    You are a helpful assistant answering questions about a video.
    Base your answers STRICTLY on the provided transcript.
    If the answer is not in the transcript, say "I'm sorry, but that information is not mentioned in the video."

    Transcript:
    """
    ${transcript}
    """
  `;

  const response = await getNvidiaPool().run((key) =>
    withErrorLogging(
      nvidiaClient(key).chat.completions.create({
        model: "nvidia/llama-3.3-nemotron-super-49b-v1",
        messages: [
          { role: "system", content: systemPrompt },
          ...history,
          { role: "user", content: sanitizedQuestion },
        ],
        temperature: 0.1,
      }),
      "chatWithTranscript"
    )
  );

  return response.choices[0].message.content;
}

export interface QuizQuestion {
  id: string;
  type: "multiple_choice" | "true_false";
  question: string;
  options?: string[];
  correctAnswer: number;
  explanation: string;
}

export async function generateQuiz(transcript: string): Promise<QuizQuestion[]> {
  validateTranscriptLength(transcript);

  const prompt = `
You are an expert at creating educational quizzes. Your task is to generate quiz questions based on a video transcript.

Transcript:
"""
${transcript}
"""

Generate 5-7 quiz questions that test understanding of the core concepts from the video. Include a mix of:
- Multiple choice questions (4 options each)
- True/False questions

Important guidelines:
1. Questions should test comprehension, NOT just recall
2. Include questions that require understanding of relationships between concepts
3. Focus on the most important/key concepts from the video
4. Explanations should reference specific parts of the transcript when possible

Output your response in the following EXACT JSON format:

[QUIZ_JSON_START]
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "question": "Your question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explain why this answer is correct and reference the transcript if possible"
  },
  {
    "id": "q2", 
    "type": "true_false",
    "question": "Your statement here?",
    "correctAnswer": 0,
    "explanation": "Explain why this is True (0) or False (1)"
  }
]
[QUIZ_JSON_END]

IMPORTANT: For true_false questions, use correctAnswer: 0 for True, correctAnswer: 1 for False.

Generate only the JSON array, no additional text or markdown.
`;

  const response = await getNvidiaPool().run((key) =>
    withErrorLogging(
      nvidiaClient(key).chat.completions.create({
        model: "nvidia/llama-3.3-nemotron-super-49b-v1",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
      "generateQuiz"
    )
  );

  const content = response.choices[0].message.content || "";
  const jsonMatch = content.match(/\[QUIZ_JSON_START\]([\s\S]*?)\[QUIZ_JSON_END\]/);

  if (!jsonMatch) {
    throw new Error("Failed to parse quiz JSON from response");
  }

  try {
    const questions = JSON.parse(jsonMatch[1].trim());
    return questions;
  } catch (e) {
    console.error("Failed to parse quiz JSON", e);
    throw new Error("Invalid quiz JSON format");
  }
}
