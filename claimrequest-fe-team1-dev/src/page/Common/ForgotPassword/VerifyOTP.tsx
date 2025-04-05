import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { authService } from "@/services/features/auth.service";
import { useTranslation } from "react-i18next";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const { t } = useTranslation();

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("forgot_password.toast.passwords_not_match"));
      return;
    }
    try {
      await authService.resetPassword({ email, newPassword, otpCode: otp });
      toast.success(t("forgot_password.toast.reset_success"));
      navigate("/login");
    } catch (error: unknown) {
      const errorMessage =
        (error as Error).message || t("forgot_password.toast.error_general");
      toast.error(errorMessage);
    }
  };

  const handleResendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.requestOtp({ email });
      toast.success(t("forgot_password.toast.otp_sent"));
    } catch (error: unknown) {
      const errorMessage =
        (error as Error).message || t("forgot_password.toast.error_general");
      toast.error(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-200 dark:bg-[#1C1F26]">
      <div className="w-full max-w-md p-8 bg-white dark:bg-[#2f3136] rounded-xl shadow-2xl dark:text-gray-50">
        <h2 className="text-3xl text-[#1169B0] font-bold text-center mb-5">
          {t("forgot_password.reset_title")}
        </h2>
        <form onSubmit={handlePasswordReset} className="space-y-6">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium">
              {t("forgot_password.otp")}
            </label>
            <Input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium">
              {t("forgot_password.new_password")}
            </label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium"
            >
              {t("forgot_password.confirm_password")}
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-[#F27227] text-xl rounded-[5px]"
          >
            {t("forgot_password.reset_password")}
          </Button>
          <Button
            onClick={handleResendOtp}
            className="w-full bg-[#1169B0] text-xl rounded-[5px] mt-4"
          >
            {t("forgot_password.resend_otp")}
          </Button>
        </form>
      </div>
    </div>
  );
}
