namespace ClaimRequest.DAL.Data.Responses.Staff
{
    public class RemoveStaffResponse
    {
        public Guid StaffId { get; set; }
        public bool IsDeleted { get; set; }
        public string Message { get; set; }

        public RemoveStaffResponse(Guid staffId, bool isDeleted, string message)
        {
            StaffId = staffId;
            IsDeleted = isDeleted;
            Message = message;
        }
    }
}