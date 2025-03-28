import { chatbotService } from "@/services/features/chatbot.service";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, SetStateAction } from "react";
import { FaFacebookMessenger } from "react-icons/fa";
import { toast } from "react-toastify";
import "/icon.png"

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! How can I help?", sender: "bot" },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const toggleChat = () => setIsOpen(!isOpen);

    function highlightBoldText(text: string) {
        return text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
            part.match(/^\*\*(.+)\*\*$/) ? (
                <strong key={index}>{part.replace(/\*\*/g, "")}</strong>
            ) : (
                part
            )
        );
    }

    const sendMessage = () => {
        if (!input.trim() || loading) return; // Prevent sending when loading
        setMessages([...messages, { text: input, sender: "user" }]);
        setInput("");
        setLoading(true); // ✅ Set loading when waiting for response

        chatbotService.answer(input)
            .then((response) => {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { text: response.data, sender: "bot" },
                ]);
            })
            .catch((error) => {
                toast.error(error.message || "Error processing chatbot");
            })
            .finally(() => {
                setLoading(false); // ✅ Reset loading after response
                if (inputRef.current) inputRef.current.style.height = "40px"; // Reset input height
            });
    };

    const handleInputChange = (e: { target: { value: SetStateAction<string>; style: { height: string; }; scrollHeight: number; }; }) => {
        setInput(e.target.value);
        e.target.style.height = "40px"; // Min height (1 row)
        const maxHeight = 90;
        e.target.style.height = `${Math.min(e.target.scrollHeight, maxHeight)}px`;
    };

    return (
        <div className="fixed bottom-5 right-5">
            {/* Chat Button */}
            <button
                className="bg-white-600 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition"
                onClick={toggleChat}
            >
                <img src="/icon.png" alt="Chat Icon" className="w-12 h-12 object-contain" />
            </button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute bottom-20 right-0 w-96 bg-white shadow-lg rounded-2xl border border-gray-300 overflow-hidden"
                    >
                        <div className="p-4 bg-orange-500 text-white font-semibold rounded-t-2xl flex justify-between">
                            <span>Chatbot Assistance</span>
                            <button onClick={toggleChat} className="text-white">⨉</button>
                        </div>

                        {/* Messages Container */}
                        <div className="p-4 h-80 overflow-y-auto space-y-3 flex flex-col">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`p-3 rounded-2xl max-w-[75%] break-words whitespace-pre-wrap ${
                                        msg.sender === "user"
                                            ? "bg-orange-500 text-white self-end"
                                            : "bg-gray-200 text-black self-start"
                                    }`}
                                >
                                    {msg.sender === "user" ? msg.text : highlightBoldText(msg.text)}
                                </div>
                            ))}

                            {/* ✅ Show "Typing..." while waiting */}
                            {loading && (
                                <div className="p-3 rounded-2xl max-w-[75%] bg-gray-200 text-black self-start italic">
                                    Typing...
                                </div>
                            )}
                        </div>

                        {/* Multi-line Input Box (Max 3 rows) */}
                        <div className="flex items-center p-4 border-t">
                            <textarea
                                ref={inputRef}
                                rows={1}
                                className="flex-1 p-3 border rounded-full focus:outline-none bg-gray-100 resize-none overflow-y-auto max-h-[90px]"
                                placeholder="Type a message..."
                                value={input}
                                onChange={handleInputChange}
                                disabled={loading} // ✅ Disable input while loading
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={loading} // ✅ Disable send button while loading
                                className={`px-5 py-3 rounded-full ml-3 ${
                                    loading
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-orange-600 text-white hover:bg-blue-700"
                                }`}
                            >
                                {loading ? "..." : "Send"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
