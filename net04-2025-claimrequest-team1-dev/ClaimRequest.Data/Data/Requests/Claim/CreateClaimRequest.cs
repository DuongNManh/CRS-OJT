using ClaimRequest.API.Extensions;
using ClaimRequest.DAL.Data.Entities;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ClaimRequest.DAL.Data.Requests.Claim
{
    public class CreateClaimRequest
    {
        [Required(ErrorMessage = "Claim Type is required")]
        [EnumDataType(typeof(ClaimType), ErrorMessage = "Claim Type must be one of the following: Overtime, Bonus, Salary, Other")]
        [JsonConverter(typeof(StringEnumConverter<ClaimType>))]
        public ClaimType ClaimType { get; set; }

        [Required(ErrorMessage = "Claim Name is required")]
        [Length(1, 100, ErrorMessage = "Claim Name cannot be more than 100 characters")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Remark Description is required")]
        [Length(1, 500, ErrorMessage = "Remark Description cannot be more than 500 characters")]
        public string Remark { get; set; }

        [Required(ErrorMessage = "Amount is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Required(ErrorMessage = "Total working hour is required")]
        [Range(0, double.MaxValue, ErrorMessage = "Must be greater than 0")]
        public decimal TotalWorkingHours { get; set; }

        [Required(ErrorMessage = "Start date is required")]
        [JsonConverter(typeof(DateOnlyConverter))]
        [CustomValidation(typeof(UpdateClaimRequest), nameof(ValidateStartDate))]
        public DateOnly StartDate { get; set; }

        [Required(ErrorMessage = "End date is required")]
        [JsonConverter(typeof(DateOnlyConverter))]
        [CustomValidation(typeof(UpdateClaimRequest), nameof(ValidateEndDate))]
        public DateOnly EndDate { get; set; }

        [JsonConverter(typeof(GuidNullableConveter))]
        public Guid? ProjectId { get; set; }

        public static ValidationResult ValidateEndDate(DateOnly endDate, ValidationContext context)
        {
            var instance = (UpdateClaimRequest)context.ObjectInstance;
            if (endDate < instance.StartDate)
            {
                return new ValidationResult("End date must be greater than or equal to start date");
            }
            return ValidationResult.Success;
        }

        public static ValidationResult? ValidateStartDate(DateOnly startDate)
        {
            return startDate < DateOnly.FromDateTime(DateTime.Today) ? new ValidationResult("Start date must be greater than or equal to Today") : ValidationResult.Success;
        }
    }
}