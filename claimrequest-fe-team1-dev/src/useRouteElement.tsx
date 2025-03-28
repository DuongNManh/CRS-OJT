import { lazy } from "react";
import { useRoutes } from "react-router-dom";
import { ProtectedRoute, RejectedRoute } from "./guards/AuthGuard";
import { SystemRole } from "./interfaces/auth.interface";

// Lazy-loading components
const Home = lazy(() => import("./page/Common/Home/Home"));
const Login = lazy(() => import("./page/Common/Login/Login"));
const ForgotPassword = lazy(
  () => import("./page/Common/ForgotPassword/ForgotPassword"),
);
const CreateClaim = lazy(() => import("./page/Common/CreateClaim/CreateClaim"));
const UserDetail = lazy(() => import("./page/Common/UserDetail/UserDetail"));
const ViewClaims = lazy(() => import("./page/Common/ViewClaims/ViewClaims"));
const ApproveRequestDetail = lazy(
  () => import("./page/Approver/ApproveRequestDetail"),
);
const ApproveRequestList = lazy(
  () => import("./page/Approver/ApproveRequestList"),
);
const ProjectList = lazy(() => import("./page/Admin/Project/ProjectList"));
const StaffList = lazy(() => import("./page/Admin/StaffList/StaffList"));
const FinanceRequestList = lazy(
  () => import("./page/Finance/FinanceRequestList"),
);
const FinanceRequestDetail = lazy(
  () => import("./page/Finance/FinanceRequestDetail"),
);

export default function useRouteElement() {
  const routeElements = useRoutes([
    // Public Routes
    { path: "/geo", element: <Home /> },
    {
      element: <RejectedRoute />, // Prevent logged-in users from accessing the login page
      children: [
        { path: "/", element: <Login /> },
        { path: "/login", element: <Login /> },
      ],
    },
    { path: "/forgotpassword", element: <ForgotPassword /> },

    // Protected routes for common roles
    {
      element: <ProtectedRoute allowedRoles={[SystemRole.STAFF]} />,
      children: [
        { path: "/create-claim", element: <CreateClaim /> },
        { path: "/profile", element: <UserDetail /> },
        { path: "/claims", element: <ViewClaims /> },
      ],
    },

    // Approver routes
    {
      element: <ProtectedRoute allowedRoles={[SystemRole.APPROVER]} />,
      children: [
        { path: "/approver/claims", element: <ApproveRequestList /> },
        {
          path: "/approver/claim-detail/:id",
          element: <ApproveRequestDetail />,
        },
      ],
    },

    // Admin routes
    {
      element: <ProtectedRoute allowedRoles={[SystemRole.ADMIN]} />,
      children: [
        {
          path: "/admin",
          children: [
            { path: "projects", element: <ProjectList /> },
            { path: "staffs", element: <StaffList /> },
          ],
        },
      ],
    },

    // Finance routes
    {
      element: <ProtectedRoute allowedRoles={[SystemRole.FINANCE]} />,
      children: [
        {
          path: "/finance",
          children: [
            { path: "claims", element: <FinanceRequestList /> },
            { path: "claim-detail/:id", element: <FinanceRequestDetail /> },
          ],
        },
      ],
    },
  ]);

  return routeElements;
}
