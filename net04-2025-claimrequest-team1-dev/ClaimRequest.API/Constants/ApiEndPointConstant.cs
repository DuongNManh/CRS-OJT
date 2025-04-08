namespace ClaimRequest.API.Constants
{
    public class ApiEndPointConstant
    {
        static ApiEndPointConstant()
        { }

        public const string RootEndpoint = "/api";
        public const string ApiVersion = "/v1";
        public const string ApiEndpoint = RootEndpoint + ApiVersion;

        public static class Auth
        {
            public const string AuthEndpoint = ApiEndpoint + "/auth";
            public const string LoginEndpoint = AuthEndpoint + "/login";
            public const string ChangePasswordEndpoint = AuthEndpoint + "/changepassword";
            public const string RequestRevCodeEndpoint = AuthEndpoint + "/requestrevcode";
            public const string VerifyRevCodeEndpoint = AuthEndpoint + "/verifyrevcode";
            public const string RegisterEndpoint = AuthEndpoint + "/register";
            public const string RefreshTokenEndpoint = AuthEndpoint + "/refresh-token";
            public const string LogoutEndpoint = AuthEndpoint + "/logout";
        }

        public static class Claim
        {
            // Duoi co "s" danh cho nhung tac vu Create(POST) hoac GetALL (GET)
            public const string ClaimsEndpoint = ApiEndpoint + "/claims";

            // Duoi ko "s" danh cho cac tac vu chi dinh 1 doi tuong object: GetByID (GET), Update(PUT), Delete(DELETE)
            public const string ClaimEndpoint = ApiEndpoint + "/claim";

            public const string GetClaimEndpoint = ClaimEndpoint + "/{id}";
            public const string ApproveClaimEndpoint = ClaimEndpoint + "/approve";
            public const string RejectClaimEndpoint = ClaimEndpoint + "/reject";
            public const string UpdateClaimEndpoint = ClaimEndpoint + "/update";
            public const string CancelClaimEndoint = ClaimEndpoint + "/cancel";
            public const string CreateClaimEndpoint = ClaimEndpoint + "/create";
            public const string ReturnClaimEndpoint = ClaimEndpoint + "/return";
            public const string PaidClaimEndpoint = ClaimEndpoint + "/paid";
            public const string SubmitClaimsEndpoint = ClaimEndpoint + "/submit";
            public const string GetClaimStatusCountEndpoint = ClaimsEndpoint + "/status-count";
            public const string SubmitV2Endpoint = ClaimsEndpoint + "/submit-v2";
        }

        public static class Project
        {
            public const string ProjectsEndpoint = ApiEndpoint + "/projects";
            public const string ProjectEndpoint = ApiEndpoint + "/project";
            public const string GetProjectEndpoint = ProjectEndpoint + "/{id}";
            public const string GetProjectsThroughMemeberIdEndpoint = ProjectsEndpoint + "/member-id/{memberId}";
            public const string GetProjectDetailsEndpoint = ProjectEndpoint + "/{id}/details";
            public const string GetProjectsWithPaginationEndpoint = ProjectsEndpoint + "/list";
            public const string GetProjectsByFilterEndpoint = ProjectsEndpoint + "/filter";
            public const string CreateProjectEndpoint = ProjectEndpoint + "/create";
            public const string UpdateProjectEndpoint = ProjectEndpoint + "/update/{id}";
            public const string DeleteProjectEndpoint = ProjectEndpoint + "/delete/{id}";
            public const string DeleteProjectsEndpoint = ProjectEndpoint + "/delete/";
            public const string AssignStaffToProjectEndpoint = ProjectEndpoint + "/assign-staff";
            public const string RemoveStaffFromProjectEndpoint = ProjectEndpoint + "/remove-staff";
            public const string UpdateStaffFromProjectEndpoint = ProjectEndpoint + "/update-staff";
        }

        public static class Staff
        {
            public const string StaffsEndpoint = ApiEndpoint + "/staffs";
            public const string StaffsPagingEndpoint = ApiEndpoint + "/staffs/paging";
            public const string StaffEndpoint = ApiEndpoint + "/staff";
            public const string GetStaffEndpoint = StaffEndpoint + "/{id}";
            public const string CreateStaffEndpoint = StaffEndpoint + "/create";
            public const string UpdateStaffEndpoint = StaffEndpoint + "/update";
            public const string DeleteStaffEndpoint = StaffEndpoint + "/delete";
            public const string UploadAvatarEndpoint = StaffEndpoint + "/upload-avatar";
            public const string ProfileEndpoint = StaffEndpoint + "/profile";
        }

        public static class ClaimExport
        {
            public const string ClaimExportEndpoint = ApiEndpoint + "/claim-export";
            public const string ExportClaimsEndpoint = ClaimExportEndpoint + "/export";
            public const string ExportClaimsByRangeEndpoint = ClaimExportEndpoint + "/export-range";
        }
        
        public static class Chatbot
        {
            public const string ChatbotEndpoint  = ApiEndpoint + "/chat-bot";
            public const string AnswerEndpoint = ChatbotEndpoint + "/answer";
        }
    }
}
