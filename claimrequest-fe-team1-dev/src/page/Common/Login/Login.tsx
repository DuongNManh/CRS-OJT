import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import ForgotPassword from "@/page/Common/ForgotPassword/ForgotPassword";
import { loginFormValidationSchema } from "@/validations/authform.validations";
import { useFormik } from "formik";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { authLogin } = useAuth(); // Access authLogin from AuthContext
  const navigate = useNavigate();
  const { t } = useTranslation();

  const validationSchema = loginFormValidationSchema(t);

  // Define formik and use its values for email and password
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const user = await authLogin(values.email, values.password); // Passing formik values

      console.log("User:", JSON.stringify(user, null, 2));

      if (user) {
        navigate("/home"); // Navigate only if login is successful
      }
    },
  });

  return (
    <div className="flex flex-col items-center md:flex-row min-h-screen bg-gray-100 dark:bg-[#121212]">
      <div className="flex items-center justify-center w-[80%] md:w-1/2">
        {isForgotPassword ? (
          <ForgotPassword setIsForgotPassword={setIsForgotPassword} />
        ) : (
          <div className="w-full max-w-md p-8 rounded-xl shadow-2xl dark:bg-[#2f3136] dark:text-gray-50">
            <h2 className="text-3xl text-[#1169B0] font-bold text-center mb-5">
              {t("login_page.greeting")}
            </h2>
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium">
                  {t("login_page.form.email")}
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.email && formik.errors.email ? (
                  <div className="text-red-500">{formik.errors.email}</div>
                ) : null}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium">
                  {t("login_page.form.password")}
                </label>
                <Input
                  id="password"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  required
                />
                {formik.touched.password && formik.errors.password ? (
                  <div className="text-red-500">{formik.errors.password}</div>
                ) : null}
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
    </div>
  );
}
