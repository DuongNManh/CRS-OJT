using System.Net;

namespace ClaimRequest.DAL.Data.Exceptions
{
    public class ApiException : Exception
    {
        public HttpStatusCode StatusCode { get; }

        public ApiException(string message, HttpStatusCode statusCode = HttpStatusCode.InternalServerError)
            : base(message)
        {
            StatusCode = statusCode;
        }
    }

    public class NotFoundException : ApiException
    {
        public NotFoundException(string message)
            : base(message, HttpStatusCode.NotFound)
        {
        }
    }

    public class BadRequestException : ApiException
    {
        public BadRequestException(string message)
            : base(message, HttpStatusCode.BadRequest)
        {
        }
    }

    public class UnauthorizedException : ApiException
    {
        public UnauthorizedException(string message)
            : base(message, HttpStatusCode.Unauthorized)
        {
        }
    }
    public class BusinessException : ApiException
    {
        public BusinessException(string message)
            : base(message, HttpStatusCode.BadRequest) // or another appropriate status code
        {
        }
    }

    public class ValidationException : ApiException
    {
        public ValidationException(string message)
            : base(message, HttpStatusCode.UnprocessableEntity) // or another appropriate status code
        {
        }
    }

    public class ForbiddenException : ApiException
    {
        public ForbiddenException(string message)
            : base(message, HttpStatusCode.Forbidden)
        {
        }
    }

public class ClaimConfigurationException : BusinessException
{
    public ClaimConfigurationException() 
        : base("Cannot create a new Claim Request as there is no Claim Request Configuration in the system.")
    {
    }
}

public class DuplicateClaimException : BusinessException
{
    public DuplicateClaimException(string claimId) 
        : base($"Duplicated Claim. Claim ID: {claimId}")
    {
    }
}

public class AppointmentLetterException : BusinessException
{
    public AppointmentLetterException() 
        : base("Please accept your Letter of Appointment in selected Run Details/Course Schedule first.")
    {
    }
}

public class DuplicateClaimTypeException : BusinessException
{
    public DuplicateClaimTypeException() 
        : base("Claim Type entered already exists. Please enter a new claim type")
    {
    }
}

public class DeveloperRecordNotFoundException : BusinessException
{
    public DeveloperRecordNotFoundException() 
        : base("Cannot submit as you do not have any developer record in the selected run.")
    {
    }
}
}