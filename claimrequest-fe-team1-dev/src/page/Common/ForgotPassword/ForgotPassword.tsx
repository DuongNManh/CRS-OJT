import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/features/auth.service";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useApi } from "@/hooks/useApi";
import { useTranslation } from "react-i18next";

interface Props {
  setIsForgotPassword?: (value: boolean) => void;
}

export default function ForgotPassword({ setIsForgotPassword }: Props) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVerifyOtp, setIsVerifyOtp] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const navigate = useNavigate();
  const { withLoading } = useApi();
  const { t } = useTranslation();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await withLoading(authService.requestOtp({ email }));
      toast.success(t("forgot_password.toast.otp_sent"));
      setIsVerifyOtp(true);
    } catch (error: unknown) {
      const errorMessage =
        (error as Error).message || t("forgot_password.toast.error_general");
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error(t("forgot_password.toast.passwords_not_match"));
      return;
    }
    try {
      await withLoading(
        authService.resetPassword({ email, newPassword, otpCode: otp }),
      );
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
      await withLoading(authService.requestOtp({ email }));
      toast.success(t("forgot_password.toast.otp_sent"));
    } catch (error: unknown) {
      const errorMessage =
        (error as Error).message || t("forgot_password.toast.error_general");
      toast.error(errorMessage);
    }
  };

  const handleReEnterEmail = () => {
    setIsVerifyOtp(false);
    setEmail("");
  };

  return (
    <div className="w-full max-w-md p-8 rounded-xl shadow-2xl dark:bg-[#2f3136] dark:text-gray-50">
      <h2 className="text-3xl text-[#1169B0] font-bold text-center mb-5">
        {isVerifyOtp
          ? t("forgot_password.reset_title")
          : t("forgot_password.title")}
      </h2>
      <form
        onSubmit={isVerifyOtp ? handlePasswordReset : handleSendOtp}
        className="space-y-6"
      >
        <div>
          <div className="flex items-end justify-between">
            <label htmlFor="email" className="block text-sm font-medium">
              {t("forgot_password.email")}
            </label>
            <Button
              variant="link"
              className="text-blue-400 mt-1"
              onClick={handleReEnterEmail}
            >
              {t("forgot_password.re_enter_email")}
            </Button>
          </div>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isVerifyOtp}
          />
        </div>
        {isVerifyOtp && (
          <>
            <div>
              <div className="flex items-end justify-between">
                <label htmlFor="otp" className="block text-sm font-medium">
                  {t("forgot_password.otp")}
                </label>
                <Button
                  variant="link"
                  className="text-blue-400 mt-1"
                  onClick={handleResendOtp}
                >
                  {t("forgot_password.resend_otp")}
                </Button>
              </div>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium"
              >
                {t("forgot_password.new_password")}
              </label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="mt-1"
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
                className="mt-1"
              />
            </div>
          </>
        )}
        <Button
          type="submit"
          className="w-full bg-[#F27227] text-xl rounded-[5px]"
          disabled={isSending}
        >
          {isVerifyOtp
            ? t("forgot_password.reset_password")
            : t("forgot_password.send_otp")}
        </Button>
        <Button
          variant="link"
          className="text-blue-400 mt-4"
          onClick={() => setIsForgotPassword && setIsForgotPassword(false)}
        >
          {t("forgot_password.back_to_login")}
        </Button>
      </form>
    </div>
  );
}
