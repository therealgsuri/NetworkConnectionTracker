import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function summarizeConversation(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a conversation summarizer. Create a concise 3-6 word summary of the conversation that captures its main topic or purpose. Respond with only the summary text."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 20,
    });

    return response.choices[0].message.content || "Conversation";
  } catch (error) {
    console.error('Error summarizing conversation:', error);
    return "Conversation";
  }
}
