import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IAuthUser } from "@/interfaces/auth.interface";
import ForgotPassword from "@/page/Common/ForgotPassword/ForgotPassword";
import { authService } from "@/services/features/auth.service";
import { setUser } from "@/services/store/authSlice";
import { useAppDispatch } from "@/services/store/store";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.login({ email, password });
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
          avatarUrl: user.avatarUrl, // Add this line to store avatarUrl
        };

        dispatch(setUser(userData)); // Dispatching setUser action
        console.log("User data saved in Redux:", userData); // Log the userData object
        navigate("/");
        toast.success(response.message || "Login successful!");
      } else {
        toast.error(response.message || "Login failed");
      }
    } catch (error: unknown) {
      const errorMessage = (error as Error).message || "An error occurred";
      toast.error(errorMessage);
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center md:flex-row min-h-screen bg-gray-100 dark:bg-[#121212]">
      <div className="flex items-center justify-center w-[80%] md:w-1/2">
        {isForgotPassword ? (
          <ForgotPassword setIsForgotPassword={setIsForgotPassword} />
        ) : (
          <div className="w-full max-w-md p-8 rounded-xl shadow-2xl dark:bg-[#2f3136] dark:text-gray-50">
            <h2 className="text-3xl text-[#1169B0] font-bold text-center mb-5">
              Welcome Back
            </h2>
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[#F27227] text-xl rounded-[5px] dark:bg-[#F27227] dark:text-white"
              >
                Sign in
              </Button>
              <p className="text-sm text-center">
                <Button
                  variant="link"
                  className="text-blue-400"
                  onClick={() => setIsForgotPassword(true)}
                >
                  Forgot Password?
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
        <div className="flex flex-row items-center justify-center gap-2">
          <p className="mt-4 text-2xl text-[#1169B0] text-center">Fast.</p>
          <p className="mt-4 text-2xl text-[#F27227] text-center">Simple.</p>
          <p className="mt-4 text-2xl text-[#16B14B] text-center">Secure.</p>
          <p className="mt-4 text-2xl text-center dark:text-white">
            Submit Your Claim with Ease
          </p>
        </div>
      </div>
    </div>
  );
}
