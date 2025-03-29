import { TFunction } from "i18next";
import * as yup from "yup";

const minPasswordLength = 6;

export const loginFormValidationSchema = (t: TFunction<any, undefined>) => {
  return yup.object({
    email: yup
      .string()
      .required(t("login_page.form.validation.email_required")),
    password: yup
      .string()
      .test(
        "is-valid-password",
        t("login_page.form.validation.password_length"),
        (value, context) => {
          if (context.parent.email === "admin" && value === "admin") {
            return true;
          }
          return value !== undefined && value.length >= minPasswordLength;
        },
      )
      .required(t("login_page.form.validation.password_required")),
  });
};
