import { assets } from "@/assets/assets";
import { useAppContext } from "@/context/AppContext";
import axios from "axios";
import Image from "next/image";
import React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const PromptBox = ({ setIsLoading, isLoading }) => {
  const [prompt, setPrompt] = useState("");
  const { user, chats, setChats, selectedChats, setselectedChats } =
    useAppContext();

  const router = useRouter();

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrompt();
    }
  };

  const sendPrompt = async () => {
    const promptCopy = prompt;
    try {
      if (!user)
        if (!user) {
          toast.error("Please login to continue");
          router.push("/sign-in");
          return;
        }

      if (isLoading)
        return toast.error("Please wait for the previous prompt response");

      setIsLoading(true);
      setPrompt("");

      const userPrompt = {
        role: "user",
        content: prompt,
        timestamp: Date.now(),
      };

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat._id === selectedChats._id
            ? { ...chat, messages: [...chat.messages, userPrompt] }
            : chat
        )
      );

      setselectedChats((prev) => ({
        ...prev,
        messages: [...prev.messages, userPrompt],
      }));

      const response = await axios.post("/api/chat/ai", {
        chatId: selectedChats._id,
        prompt: promptCopy,
      });

      const data = response.data;

      if (data.success) {
        const message = data.data.content;
        const messageTokens = message.split(" ");

        let assistantMessage = {
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };
        y;

        setselectedChats((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
        }));

        for (let i = 0; i < messageTokens.length; i++) {
          setTimeout(() => {
            assistantMessage.content = messageTokens.slice(0, i + 1).join(" ");
            setselectedChats((prev) => {
              const updatedMessages = [
                ...prev.messages.slice(0, -1),
                assistantMessage,
              ];
              return {
                ...prev,
                messages: updatedMessages,
              };
            });
          }, i * 100);
        }
      } else {
        toast.error(data.message);
        setPrompt(promptCopy);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
      setPrompt(promptCopy);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={sendPrompt}
      className={`w-full ${
        false ? "max-w-3xl" : "max-w-2xl"
      } bg-[#404045] p-4 rounded-3xl mt-4 transition-all`}
    >
      <textarea
        onKeyDown={handleKeyDown}
        className="outline-none w-full resize-none overflow-hidden break-words bg-transparent"
        rows={2}
        placeholder="Message DeepSeek"
        required
        onChange={(e) => setPrompt(e.target.value)}
        value={prompt}
      />

      <div className="flex items-center justify-between text-sm mt-2">
        <div className="flex items-center gap-2">
          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5" src={assets.deepthink_icon} alt="" />
            DeepThink (R1)
          </p>

          <p className="flex items-center gap-2 text-xs border border-gray-300/40 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500/20 transition">
            <Image className="h-5" src={assets.search_icon} alt="" />
            Search
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Image className="w-4 cursor-pointer" src={assets.pin_icon} alt="" />
          <button
            className={`${
              prompt ? "bg-primary" : "bg-[#71717a]"
            } rounded-full p-2 cursor-pointer`}
          >
            <Image
              className="w-3.5 aspect-square"
              src={prompt ? assets.arrow_icon : assets.arrow_icon_dull}
              alt=""
            ></Image>
          </button>
        </div>
      </div>
    </form>
  );
};

export default PromptBox;
