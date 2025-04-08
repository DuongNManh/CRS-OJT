#pragma warning disable SKEXP0001

using Microsoft.Extensions.VectorData;
using Microsoft.SemanticKernel.ChatCompletion;
using Microsoft.SemanticKernel.Embeddings;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.PromptTemplates.Handlebars;


namespace ClaimRequest.AI;

public class RAGChatService(
    IVectorStore vectorStore,
    IChatCompletionService chatCompletionService,
    Kernel kernel,
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

    public async Task<string> Answer(UserArugments userArugments, string question)
    {
        const string collectionName = "ojt.docx";
        
        // Find related Information
        var searchResult = await HybridSearchData(collectionName, question);
        var resultArray = await searchResult.Results.ToListAsync();
        
        // Add prompt template
        var arguments = ClaimRequestPrompt.CreatePromptArugments(userArugments, question, resultArray);
        
        var promptTemplateConfig = new PromptTemplateConfig
        {
            Template = ClaimRequestPrompt.GetPromptTemplate(),
            TemplateFormat = "handlebars",
            Name = "ClaimRequestChatPrompt",
        };
        
        // Invoke the prompt function
        var function = kernel.CreateFunctionFromPrompt(
            promptTemplateConfig, 
            new HandlebarsPromptTemplateFactory()); 
        var templateResponse = await kernel.InvokeAsync(function, arguments);
        
        return templateResponse.ToString();
    }
}