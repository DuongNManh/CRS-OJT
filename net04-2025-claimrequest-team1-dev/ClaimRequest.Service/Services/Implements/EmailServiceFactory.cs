using ClaimRequest.BLL.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;

namespace ClaimRequest.BLL.Services.Implements
{
    public class EmailServiceFactory : IEmailServiceFactory
    {
        private readonly IServiceProvider _serviceProvider;

        public EmailServiceFactory(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public IEmailService Create()
        {
            return _serviceProvider.GetRequiredService<IEmailService>();
        }
    }
}
