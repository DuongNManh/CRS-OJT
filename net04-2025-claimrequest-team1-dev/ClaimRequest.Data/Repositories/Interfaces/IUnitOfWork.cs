using Microsoft.EntityFrameworkCore;

namespace ClaimRequest.DAL.Repositories.Interfaces
{
    public interface IUnitOfWork : IGenericRepositoryFactory, IDisposable
    {
        Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation);
        Task ExecuteInTransactionAsync(Func<Task> operation);
    }

    public interface IUnitOfWork<TContext> : IUnitOfWork where TContext : DbContext
    {
        TContext Context { get; }
    }
}
