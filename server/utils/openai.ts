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
          content: `Extract the main topic from this career-related conversation and create a specific, detailed title. Follow these rules:

1. First identify if the conversation mentions:
   - Specific companies (e.g. Apple, Google)
   - Specific roles (e.g. Product Ops, Supply Chain)
   - Career processes (e.g. interviews, applications)

2. Then create a title (4-7 words) that combines these elements, like:
   - 'Apple Product Ops Interview Process Guide'
   - 'Supply Chain vs Product Ops Role Comparison'
   - 'Resume Optimization for Tech Applications'

3. Also identify and include:
   - Specific advice given about applications or interviews
   - Comparisons between different roles or career paths
   - Company culture insights
   - Required skills or qualifications discussed

4. Format should be: [Company Name] [Role/Topic] - [Key Insight]
   Examples:
   - 'Apple Engineering - Product Ops vs Supply Chain'
   - 'Tech Resume Tips - 70% Job Description Match'
   - 'Silicon Valley Culture - Work-Life Balance Insights'

Respond only with the title. Focus on the most important career advice or insight shared.`
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