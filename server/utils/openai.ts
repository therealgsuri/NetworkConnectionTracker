import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function summarizeConversation(text: string): Promise<string> {
  try {
    // the newest OpenAI model is "gpt-4" which was released May 13, 2024
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a conversation summarizer. Given a conversation transcript, create a concise 3-6 word summary that captures the key topic or purpose. Include the main action or decision if applicable. Example summaries: 'Product Launch Strategy Discussion', 'Sales Pipeline Review Meeting', 'Technical Interview Feedback Session'. Respond with only the summary text."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 20,
      temperature: 0.7
    });

    const summary = response.choices[0].message.content?.trim();
    return summary || "Meeting Discussion";
  } catch (error) {
    console.error('Error summarizing conversation:', error);
    // Provide a more descriptive fallback based on text length
    return text.length > 100 ? "Detailed Discussion" : "Brief Meeting";
  }
}

export async function generateConversationTitle(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Generate a brief, descriptive title (2-5 words) for this conversation that captures its main topic or purpose. Focus on concrete subjects and actions. Examples: 'Q4 Marketing Strategy', 'Cloud Migration Planning', 'Client Onboarding Process'. Respond with only the title."
        },
        {
          role: "user",
          content: text
        }
      ],
      max_tokens: 15,
      temperature: 0.7
    });

    const title = response.choices[0].message.content?.trim();
    return title || "Meeting Notes";
  } catch (error) {
    console.error('Error generating conversation title:', error);
    return "Meeting Notes";
  }
}