import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function summarizeConversation(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4", 
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

export async function generateConversationTitle(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4", 
      messages: [
        {
          role: "system",
          content: "Generate a brief, engaging title (2-5 words) for this conversation that captures its essence. Be specific but concise. Respond with only the title."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 15,
    });

    return response.choices[0].message.content || "Untitled Conversation";
  } catch (error) {
    console.error('Error generating conversation title:', error);
    return "Untitled Conversation";
  }
}