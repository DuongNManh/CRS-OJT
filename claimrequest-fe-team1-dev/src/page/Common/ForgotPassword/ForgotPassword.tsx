import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/services/features/auth.service";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    try {
      await authService.requestOtp({ email });
      toast.success("OTP sent to your email");
      setIsVerifyOtp(true);
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "An error occurred";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await authService.resetPassword({ email, newPassword, otpCode: otp });
      toast.success("Password reset successful");
      navigate("/login");
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "An error occurred";
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleResendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.requestOtp({ email });
      toast.success("OTP sent to your email");
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "An error occurred";
      toast.error(errorMessage);
      console.error(error);
    }
  };

  const handleReEnterEmail = () => {
    setIsVerifyOtp(false);
    setEmail("");
  };

  return (
    <div className="w-full max-w-md p-8 rounded-xl shadow-2xl dark:bg-[#2f3136] dark:text-gray-50">
      <h2 className="text-3xl text-[#1169B0] font-bold text-center mb-5">
        {isVerifyOtp ? "Reset Password" : "Forgot Password"}
      </h2>
      <form
        onSubmit={isVerifyOtp ? handlePasswordReset : handleSendOtp}
        className="space-y-6"
      >
        <div>
          <div className="flex items-end justify-between">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <Button
              variant="link"
              className="text-blue-400 mt-1"
              onClick={handleReEnterEmail}
            >
              Re-enter Email
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
                  OTP
                </label>
                <Button
                  variant="link"
                  className="text-blue-400 mt-1"
                  onClick={handleResendOtp}
                >
                  Resend OTP
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
                New Password
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
                Confirm Password
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
          {isVerifyOtp ? "Reset Password" : "Send OTP"}
        </Button>
        <Button
          variant="link"
          className="text-blue-400 mt-4"
          onClick={() => setIsForgotPassword && setIsForgotPassword(false)}
        >
          &larr; Back to Login
        </Button>
      </form>
    </div>
  );
}
