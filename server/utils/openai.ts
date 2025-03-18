import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function summarizeConversation(text: string): Promise<string> {
  try {
    // Keep using GPT-4 for summaries as they need to be high quality
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
    // Use GPT-3.5-turbo for titles as it's more cost-effective
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a career conversation title generator. Create a specific, detailed title (3-7 words) that captures the key career insights or advice from the conversation. Focus on:
- Job roles and responsibilities (e.g. 'Product Ops Supply Chain Role Overview')
- Application strategies (e.g. 'Resume Tailoring for Tech Applications')
- Interview preparation (e.g. 'Apple Behavioral Interview Process Guide')
- Career development (e.g. 'Engineering to Product Management Transition')
- Company culture and structure (e.g. 'Silicon Valley Workaholic Culture Insights')

Respond only with the title. Make it specific to the company or role discussed if mentioned.`
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
    return title || "Career Discussion Notes";
  } catch (error) {
    console.error('Error generating conversation title:', error);
    return "Career Discussion Notes";
  }
}