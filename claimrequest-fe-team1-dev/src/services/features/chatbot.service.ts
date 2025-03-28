import { ApiResponse } from "@/interfaces/apiresponse.interface";
import axiosInstance from "@/apis/axiosInstance";

export const chatbotService = {
    chatbotEndpoint: '/chat-bot',
    answerEndpoint: '/answer',

    async answer(question: string): Promise<ApiResponse<any>> {
        try {
            const response = await axiosInstance.post<ApiResponse<any>>(`${this.chatbotEndpoint + this.answerEndpoint}`, {question});
            return response.data;
        } catch (error: any) {
            const apiError = error.response?.data as ApiResponse<any>;
            if (apiError) {
                throw new Error(apiError.reason || 'Error answering question');
            }
            throw new Error('There was an error processing chatbot');
        }
    },
}
