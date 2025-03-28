
using System.Text.Json.Serialization;
using ClaimRequest.DAL.Data.Entities;

namespace ClaimRequest.DAL.Data.Requests.Claim;

public class ClaimExportRequest
{
    public List<Guid>? SelectedClaimIds { get; set; }
}