import { chatbotService } from "@/services/features/chatbot.service";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, SetStateAction } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function Chatbot() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: t("chatbot.welcome_message"), sender: "bot" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false); // ✅ Loading state
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  function highlightBoldText(text: string) {
    return text
      .split(/(\*\*[^*]+\*\*)/g)
      .map((part, index) =>
        part.match(/^\*\*(.+)\*\*$/) ? (
          <strong key={index}>{part.replace(/\*\*/g, "")}</strong>
        ) : (
          part
        ),
      );
  }

  const sendMessage = () => {
    const inputTrim = input.trim();
    if (!inputTrim || loading) return; // Prevent sending when loading
    setMessages([...messages, { text: inputTrim, sender: "user" }]);
    setInput("");
    setLoading(true); // ✅ Set loading when waiting for response

    chatbotService
      .answer(inputTrim)
      .then((response) => {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: response.data.trim(), sender: "bot" },
        ]);
      })
      .catch((error) => {
        toast.error(error.message || t("chatbot.error_message"));
      })
      .finally(() => {
        setLoading(false); // ✅ Reset loading after response
        if (inputRef.current) inputRef.current.style.height = "40px"; // Reset input height
      });
  };

  const handleInputChange = (e: {
    target: {
      value: SetStateAction<string>;
      style: { height: string };
      scrollHeight: number;
    };
  }) => {
    setInput(e.target.value);
    e.target.style.height = "40px"; // Min height (1 row)
    const maxHeight = 90;
    e.target.style.height = `${Math.min(e.target.scrollHeight, maxHeight)}px`;
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Chat Button */}
      <button
        className="bg-orange-600 text-white p-3 rounded-full shadow-lg hover:bg-orange-700 transition"
        onClick={toggleChat}
        aria-label={t("chatbot.toggle_button")}
      >
        <img
          src="/icon.png"
          alt={t("chatbot.icon_alt")}
          className="w-12 h-12 object-contain"
        />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute bottom-20 right-0 w-96 bg-white dark:bg-[#1C1F26] shadow-lg rounded-2xl border border-gray-300 dark:border-gray-700 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-orange-500 text-white font-semibold rounded-t-2xl flex justify-between">
              <span>{t("chatbot.header")}</span>
              <button onClick={toggleChat} className="text-white">
                ⨉
              </button>
            </div>

            {/* Messages Container */}
            <div className="p-4 h-80 overflow-y-auto space-y-3 flex flex-col bg-gray-100 dark:bg-[#272B34]">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-2xl max-w-[75%] break-words whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-orange-500 text-white self-end"
                      : "bg-gray-300 text-black dark:bg-gray-700 dark:text-white self-start"
                  }`}
                >
                  {msg.sender === "user"
                    ? msg.text
                    : highlightBoldText(msg.text)}
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="p-3 rounded-2xl max-w-[75%] bg-gray-300 text-black dark:bg-gray-700 dark:text-white self-start italic">
                  {t("chatbot.typing")}
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="flex items-center p-4 border-t bg-gray-200 dark:bg-[#1C1F26] dark:border-gray-700">
              <textarea
                ref={inputRef}
                rows={1}
                className="flex-1 p-3 border rounded-full focus:outline-none bg-gray-100 dark:bg-gray-700 text-black dark:text-white resize-none overflow-y-auto max-h-[90px]"
                placeholder={t("chatbot.input_placeholder")}
                value={input}
                onChange={handleInputChange}
                disabled={loading} // Disable input while loading
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading} // Disable send button while loading
                className={`px-5 py-3 rounded-full ml-3 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-600 text-white hover:bg-orange-700"
                }`}
              >
                {loading ? t("chatbot.sending") : t("chatbot.send_button")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
