import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Chat from "@/models/Chat";
import { generateChatTitleAI } from "@/utils/generateChatTitle";

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

    if (!chatId || !prompt) {
      return NextResponse.json(
        { success: false, message: "chatId and prompt are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const data = await Chat.findOne({ userId, _id: chatId });

    if (!data) {
      return NextResponse.json(
        { success: false, message: "Chat not found." },
        { status: 404 }
      );
    }

    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };
    data.messages.push(userPrompt);

    const openRouterResponse = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/mistral-7b-instruct",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      return NextResponse.json(
        { success: false, message: `OpenRouter error: ${errorText}` },
        { status: 500 }
      );
    }

    const completion = await openRouterResponse.json();

    const message = {
      ...completion.choices[0].message,
      timestamp: Date.now(),
    };

    data.messages.push(message);

    // Generate AI chat title if this is the initial conversation (first two messages)
    if (data.messages.length === 2) {
      const title = await generateChatTitleAI(data.messages.slice(0, 2));
      if (title && title.trim().length > 0) {
        data.name = title.trim();
      }
    }

    await data.save();

    return NextResponse.json({ success: true, data: message });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
