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
          content: "You are a career conversation summarizer. Given a conversation transcript about someone's career, job opportunity, or company discussion, create a concise 3-6 word summary that captures the key career-related topic or purpose. Examples: 'Software Engineering Career Path Discussion', 'Startup CTO Role Exploration', 'Google Product Team Interview'. Focus on the professional development or job opportunity aspect. Respond with only the summary text."
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
    return summary || "Career Discussion";
  } catch (error) {
    console.error('Error summarizing conversation:', error);
    return "Career Discussion";
  }
}

export async function generateConversationTitle(text: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Generate a brief, descriptive title (2-5 words) for this career-related conversation that captures its main focus. Examples: 'Frontend Developer Interview Prep', 'Startup Leadership Discussion', 'Tech Career Transition Strategy'. Focus on the professional or career aspect. Respond with only the title."
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
    return title || "Career Discussion";
  } catch (error) {
    console.error('Error generating conversation title:', error);
    return "Career Discussion";
  }
}