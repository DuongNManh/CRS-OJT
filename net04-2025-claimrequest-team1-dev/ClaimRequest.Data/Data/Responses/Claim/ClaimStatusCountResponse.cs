namespace ClaimRequest.DAL.Data.Responses.Claim
{
    public class ClaimStatusCountResponse
    {
        public int Total { get; set; }
        public int Draft { get; set; }
        public int Pending { get; set; }
        public int Approved { get; set; }
        public int Paid { get; set; }
        public int Rejected { get; set; }
        public int Cancelled { get; set; }
    }
}
