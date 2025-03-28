import { Route, Routes } from "react-router-dom";
import Login from "@/page/Common/Login/Login";
import AuthGuard from "@/components/auth/AuthGuard";
import UserDetail from "@/page/Common/UserDetail/UserDetail";
import AdminLayout from "@/layouts/AdminLayout";
import ApproverLayout from "@/layouts/ApproverLayout";
import FinanceLayout from "@/layouts/FinanceLayout";
import Home from "../page/Common/Home/Home";
import { useAppSelector } from "@/services/store/store";
import { SystemRole } from "@/interfaces/auth.interface";
import Footer from "@/components/Footer/Footer";
import ViewClaims from "@/page/Common/ViewClaims/ViewClaims";
import ApproveRequestList from "@/page/Approver/ApproveRequestList";
import ApproveRequestDetail from "@/page/Approver/ApproveRequestDetail";
import ProjectList from "@/page/Admin/Project/ProjectList";
import StaffList from "@/page/Admin/StaffList/StaffList";
import FinanceRequestList from "@/page/Finance/FinanceRequestList";
import FinanceRequestDetail from "@/page/Finance/FinanceRequestDetail";
import DetailClaimer from "@/page/Common/ViewClaims/DetailClaimer";
import Header from "@/components/Header/Header";
import CreateClaim from "@/page/Common/CreateClaim/CreateClaim";
import ForgotPassword from "@/page/Common/ForgotPassword/ForgotPassword";
import VerifyOTP from "@/page/Common/ForgotPassword/VerifyOTP";
import Loading from "@/components/Loading/Loading";
import CommonLayout from "@/layouts/CommonLayout";
import PageTransition from "@/components/ui/PageTransition";
import EditDetail from "@/page/Common/ViewClaims/EditDetail";
import Chatbot from "@/components/Chatbot/Chatbot";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  // const user = useAppSelector((state) => state.auth.user);

  return (
    <AuthGuard>
      {/* <SidebarProvider> */}
      {/* {userRole !== SystemRole.STAFF && <AppSidebar userRole={userRole} />} */}
      <main className="w-full">
        <Header />
        <PageTransition>{children}</PageTransition>
        <Chatbot />
        <Footer />
      </main>
      {/* </SidebarProvider> */}
    </AuthGuard>
  );
};

const AppRouter = () => {
  const user = useAppSelector((state) => state.auth.user);
  const userRole = user?.systemRole || SystemRole.STAFF;

  return (
    <Routes>
      <Route path="/geo" element=<Home /> />
      <Route path="/login" element={<Login />} />
      <Route path="/loading" element={<Loading />} />
      <Route
        path="/"
        element={
          <ProtectedLayout>
            {userRole === SystemRole.ADMIN && (
              <AdminLayout>
                <Home />
              </AdminLayout>
            )}
            {userRole === SystemRole.APPROVER && (
              <ApproverLayout>
                <Home />
              </ApproverLayout>
            )}
            {userRole === SystemRole.FINANCE && (
              <FinanceLayout>
                <Home />
              </FinanceLayout>
            )}
            {userRole === SystemRole.STAFF && (
              <CommonLayout>
                <Home />
              </CommonLayout>
            )}
          </ProtectedLayout>
        }
      />
      <Route
        path="/claims"
        element={
          <ProtectedLayout>
            <CommonLayout>
              <ViewClaims />
            </CommonLayout>
          </ProtectedLayout>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedLayout>
            <CommonLayout>
              <UserDetail />
            </CommonLayout>
          </ProtectedLayout>
        }
      />
      <Route
        path="/create-claim"
        element={
          <ProtectedLayout>
            <CommonLayout>
              <CreateClaim />
            </CommonLayout>
          </ProtectedLayout>
        }
      />

      <Route
        path="/claim-detail/:id"
        element={
          <ProtectedLayout>
            <CommonLayout>
              <DetailClaimer />
            </CommonLayout>
          </ProtectedLayout>
        }
      />

      <Route
        path="/claim-update/:id"
        element={
          <ProtectedLayout>
            <CommonLayout>
              <EditDetail />
            </CommonLayout>
          </ProtectedLayout>
        }
      />

      {userRole === SystemRole.APPROVER && (
        <>
          <Route
            path="/approver/claims"
            element={
              <ProtectedLayout>
                <ApproverLayout>
                  <ApproveRequestList />
                </ApproverLayout>
              </ProtectedLayout>
            }
          />
          <Route
            path="/approver/claim-detail/:id"
            element={
              <ProtectedLayout>
                <ApproverLayout>
                  <ApproveRequestDetail />
                </ApproverLayout>
              </ProtectedLayout>
            }
          />
        </>
      )}

      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/resetpassword" element={<VerifyOTP />} />

      {userRole === SystemRole.ADMIN && (
        <>
          <Route
            path="/admin/projects"
            element={
              <ProtectedLayout>
                <AdminLayout>
                  <ProjectList />
                </AdminLayout>
              </ProtectedLayout>
            }
          />
          <Route
            path="/admin/staffs"
            element={
              <ProtectedLayout>
                <AdminLayout>
                  <StaffList />
                </AdminLayout>
              </ProtectedLayout>
            }
          />
        </>
      )}
      {userRole === SystemRole.FINANCE && (
        <>
          <Route
            path="/finance/claims"
            element={
              <ProtectedLayout>
                <FinanceLayout>
                  <FinanceRequestList />
                </FinanceLayout>
              </ProtectedLayout>
            }
          />
          <Route
            path="/finance/claim-detail/:id"
            element={
              <ProtectedLayout>
                <FinanceLayout>
                  <FinanceRequestDetail />
                </FinanceLayout>
              </ProtectedLayout>
            }
          />
        </>
      )}
      {/* Add other protected routes here */}
    </Routes>
  );
};

export default AppRouter;
