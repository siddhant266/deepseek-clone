"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { useState } from "react";
import { toFormData } from "axios";
import axios from "axios";

import { createContext, useContext, useEffect } from "react";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const { user } = useUser();
  const { getToken } = useAuth();

  const [chats, setChats] = useState([]);
  const [selectedChats, setselectedChats] = useState(null);

  const createNewChat = async () => {
    try {
      if (!user) return null;
      const token = await getToken();

      await axios.post(
        "/api/chat/create",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchUsersChats();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUsersChats = async () => {
    try {
      if (!user) return null;
      const token = await getToken();
      const { data } = await axios.get("/api/chat/get", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (data.success) {
        console.log(data.data);
        setChats(data.data);

        // if the user had no chats, create a new chat
        if (data.data.length === 0) {
          await createNewChat();
          return fetchUsersChats();
        } else {
          //short chats by updated date time

          data.data.sort((a, b) => {
            return new Date(b.updatedAt) - new Date(a.updatedAt);
          });
        }

        //set recetly updated chat as selected chat
        setselectedChats(data?.data[0]);
        console.log(data?.data[0]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (user) fetchUsersChats();
  }, [user]);

  const value = {
    user,
    chats,
    setChats,
    selectedChats,
    setselectedChats,
    fetchUsersChats,
    createNewChat,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
