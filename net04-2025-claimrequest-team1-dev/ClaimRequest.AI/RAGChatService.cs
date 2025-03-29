#pragma warning disable SKEXP0001

using Microsoft.Extensions.VectorData;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Embeddings;
using System.Text;
using System.Text.RegularExpressions;

namespace ClaimRequest.AI;

public class RAGChatService(
    IVectorStore vectorStore,
    IChatCompletionService chatCompletionService,
    ITextEmbeddingGenerationService textEmbeddingGenerationService)
    : IRAGChatService
{
    private ICollection<string> ExtractKeywords(string query)
    {
        // Remove common words (stop words)
        string[] stopWords = { "what", "are", "the", "in", "on", "of", "is", "how" };
        string[] words = query.Split(' ');

        var keywords = words
            .Where(word => !stopWords.Contains(word.ToLower()))
            .Select(word => Regex.Replace(word, @"[^\w\s]", "")) // Remove punctuation
            .ToList();

        return keywords;
    }

    private async Task<VectorSearchResults<DataModel>> HybridSearchData(string collectionName, string question)
    {
        // Generate embeddings
        var embeddings = await textEmbeddingGenerationService.GenerateEmbeddingsAsync([question]);

        ReadOnlyMemory<float> searchVector = embeddings.FirstOrDefault();

        if (searchVector.IsEmpty)
            throw new InvalidOperationException("Generated embedding is empty or invalid.");

        // Perform hybrid search
        var collection = (IKeywordHybridSearch<DataModel>)vectorStore.GetCollection<string, DataModel>(collectionName);
        ; var options = new HybridSearchOptions<DataModel>
        {
            VectorProperty = r => r.TextEmbedding,
            AdditionalProperty = r => r.Text,
            Top = 3
        };

        var keywords = ExtractKeywords(question);
        var searchResult = await collection.HybridSearchAsync(
            searchVector,
            keywords,
            options);

        return searchResult;
    }

    public async Task<string> Answer(string question)
    {
        var collectionName = "ojt.docx";
        var chatHistory = new ChatHistory("You are an AI assistant that helps people find information about Claim Request System. Don't answer out of scope. No need to hightlight keywords.");
        var stringBuilder = new StringBuilder();

        // Find related Information
        var searchResult = await HybridSearchData(collectionName, question);

        await foreach (var result in searchResult.Results)
        {
            stringBuilder.AppendLine(result.Record.Text);
        }

        // Add related information to chat history
        chatHistory.AddUserMessage(question);
        if (stringBuilder.Length > 0)
        {
            stringBuilder.Insert(0, "Here are the top 3 related information:");
            chatHistory.AddUserMessage(stringBuilder.ToString());
        }
        stringBuilder.Clear();

        // Generate response
        var response = await chatCompletionService.GetChatMessageContentsAsync(chatHistory);
        foreach (var message in response)
        {
            stringBuilder.Append(message);
        }

        return stringBuilder.ToString();
    }
}