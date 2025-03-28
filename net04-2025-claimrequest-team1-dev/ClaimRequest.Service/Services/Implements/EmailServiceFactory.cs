using ClaimRequest.BLL.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
