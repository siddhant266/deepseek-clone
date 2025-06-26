import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Chat from "@/models/Chat";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    const { chatId, prompt } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User not Authenticated" },
        { status: 401 }
      );
    }

    // Connect to DB and find chat
    await connectDB();
    const data = await Chat.findOne({ userId, _id: chatId });

    // Push user message to chat
    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };
    data.messages.push(userPrompt);

    // Call OpenRouter API
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: 	"mistralai/mistral-7b-instruct", // You can change this
        messages: [{ role: "user", content: prompt }]
      })
    });

    const completion = await openRouterResponse.json();

    const message = {
      ...completion.choices[0].message,
      timestamp: Date.now()
    };

    data.messages.push(message);
    await data.save();

    return NextResponse.json({ success: true, data: message });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
