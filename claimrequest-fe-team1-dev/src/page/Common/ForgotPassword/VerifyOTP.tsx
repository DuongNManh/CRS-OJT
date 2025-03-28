import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { authService } from '@/services/features/auth.service';

export default function VerifyOTP() {
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        try {
            await authService.resetPassword({ email, newPassword, otpCode: otp });
            toast.success('Password reset successful');
            navigate('/login');
        } catch (error: unknown) {
            const errorMessage = (error as Error).message || 'An error occurred';
            toast.error(errorMessage);
            console.error(error);
        }
    };

    const handleResendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await authService.requestOtp({ email });
            toast.success('OTP sent to your email');
        } catch (error: unknown) {
            const errorMessage = (error as Error).message || 'An error occurred';
            toast.error(errorMessage);
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl">
                <h2 className="text-3xl text-[#1169B0] font-bold text-center mb-5">Reset Password</h2>
                <form onSubmit={handlePasswordReset} className="space-y-6">
                    <div>
                        <label htmlFor="otp" className="block text-sm font-medium">
                            OTP
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
                            New Password
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
                        <label htmlFor="confirmPassword" className="block text-sm font-medium">
                            Confirm Password
                        </label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full bg-[#F27227] text-xl rounded-[5px]">
                        Reset Password
                    </Button>
                    <Button onClick={handleResendOtp} className="w-full bg-[#1169B0] text-xl rounded-[5px] mt-4">
                        Resend OTP
                    </Button>
                </form>
            </div>
        </div>
    );
}