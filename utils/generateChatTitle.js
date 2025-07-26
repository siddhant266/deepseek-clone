// utils/generateChatTitle.js

export async function generateChatTitleAI(messages) {
  const prompt = `Given the following two chat messages, suggest a short 1-3 word lowercase title that summarizes the content for the chat's sidebar:
Message 1: "${messages[0]?.content || ''}"
Message 2: "${messages[1]?.content || ''}"
Output only the title.`;
  
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "mistralai/mistral-7b-instruct",
      messages: [{ role: "user", content: prompt }]
    })
  });
  
  const data = await response.json();
  return data.choices[0].message.content.trim();
}
