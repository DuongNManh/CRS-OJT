import LanguageSelector from "@/components/common/LanguageSelector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IAuthUser } from "@/interfaces/auth.interface";
import ForgotPassword from "@/page/Common/ForgotPassword/ForgotPassword";
import { authService } from "@/services/features/auth.service";
import { setUser } from "@/services/store/authSlice";
import { useAppDispatch } from "@/services/store/store";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useApi } from "@/hooks/useApi";
import { useTheme } from "@/hooks/use-theme";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { withLoading } = useApi();
  const { theme } = useTheme();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await withLoading(
        authService.login({ email, password }),
        {
          maxRetries: 3, // Will retry login 3 times
          delayMs: 1000, // 1 second between retries
          timeoutMs: 10000, // 10 second timeout
        },
      );
      if (response.is_success && response.data) {
        const { token, user, expiration } = response.data;
        authService.setToken(token);
        localStorage.setItem("tokenExpiration", expiration);

        const userData: IAuthUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          systemRole: user.systemRole,
          department: user.department,
          avatarUrl: user.avatarUrl,
        };

        dispatch(setUser(userData)); // Dispatching setUser action
        navigate("/");
        toast.success(response.message || t("login_page.toast.login_success"));
      } else {
        toast.error(response.message || t("login_page.toast.login_failed"));
      }
    } catch (error: unknown) {
      const errorMessage =
        (error as Error).message || t("login_page.toast.error_general");
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center md:flex-row min-h-screen bg-gray-50 dark:bg-[#121212]">
      <div className="flex items-center justify-center w-[80%] md:w-1/2">
        {isForgotPassword ? (
          <ForgotPassword setIsForgotPassword={setIsForgotPassword} />
        ) : (
          <div className="w-full max-w-md p-8 rounded-xl shadow-2xl bg-gray-100 dark:bg-[#2f3136] dark:text-gray-50 border border-gray-300">
            <h2 className="text-3xl text-[#1169B0] font-bold text-center mb-5">
              {t("login_page.greeting")}
            </h2>
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  {t("login_page.form.email")}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-50 dark:bg-gray-600 dark:text-gray-50 rounded-[5px]"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  {t("login_page.form.password")}
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-50 dark:bg-gray-600 dark:text-gray-50 rounded-[5px]"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#F27227] text-xl rounded-[5px] dark:bg-[#F27227] dark:text-white"
              >
                {t("login_page.form.sign_in")}
              </Button>
              <p className="text-sm text-center">
                <Button
                  variant="link"
                  className="text-blue-400"
                  onClick={() => setIsForgotPassword(true)}
                >
                  {t("login_page.form.forgot_password")}
                </Button>
              </p>
            </form>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center justify-center w-[80%] md:w-1/2 p-5">
        <div className="flex items-center justify-center gap-2">
          <img
            src="/icon.png"
            alt="Claim Request System"
            className="h-12 w-24 md:h-24 md:w-36"
          />
          <p className="text-6xl font-semibold text-[#1169B0]">C</p>
          <p className="text-6xl font-semibold text-[#F27227]">R</p>
          <p className="text-6xl font-semibold text-[#16B14B]">S</p>
        </div>
        <div className="flex flex-row items-center justify-center gap-2 pb-3">
          <p className="mt-4 text-2xl text-[#1169B0] text-center">
            {t("login_page.sologan.f.fast")}
          </p>
          <p className="mt-4 text-2xl text-[#F27227] text-center">
            {t("login_page.sologan.f.simple")}
          </p>
          <p className="mt-4 text-2xl text-[#16B14B] text-center">
            {t("login_page.sologan.f.secure")}
          </p>
          <p className="mt-4 text-2xl text-center dark:text-white">
            {t("login_page.sologan.s")}
          </p>
        </div>

        <LanguageSelector isDarkMode={theme === "dark"} />
      </div>
    </div>
  );
}
