import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const nvidia = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export async function summarizeTranscript(transcript: string) {
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

  const response = await nvidia.chat.completions.create({
    model: "meta/llama-3.1-405b-instruct", // or "mistralai/mixtral-8x7b-instruct-v0.1"
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const content = response.choices[0].message.content || "";
  
  // Extract JSON highlights
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

export async function chatWithTranscript(transcript: string, question: string, history: ChatCompletionMessageParam[] = []) {
  const systemPrompt = `
    You are a helpful assistant answering questions about a video. 
    Base your answers STRICTLY on the provided transcript.
    If the answer is not in the transcript, say "I'm sorry, but that information is not mentioned in the video."
    
    Transcript:
    """
    ${transcript}
    """
  `;

  const response = await nvidia.chat.completions.create({
    model: "meta/llama-3.1-70b-instruct",
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: question },
    ],
    temperature: 0.1,
  });

  return response.choices[0].message.content;
}
