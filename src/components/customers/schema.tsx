import * as yup from "yup";

export const createCustomerSchema = yup
  .object()
  .shape(
    {
      email: yup
        .string()
        .email()
        .test("len", "Must be less than 254 characters", (val) => {
          if (!val) return true;
          return val?.length <= 254;
        })
        .when(["phone", "rid"], ([phone, rid], schema) => {
          if (phone || rid) return schema.notRequired();
          return schema.required("One of the fields is required");
        })
        .label("Email address"),
      phone: yup
        .string()
        .test("len", "Must be less than 20 characters", (val) => {
          if (!val) return true;
          return val?.toString().length <= 20;
        })
        .when(["email", "rid"], ([email, rid], schema) => {
          if (email || rid) return schema.notRequired();
          return schema.required("One of the fields is required");
        })
        .matches(/^[0-9]+$|^$/, "Phone number must be a number")
        .label("Phone number"),
      rid: yup
        .string()
        .test("len", "Must be less than 100 characters", (val) => {
          if (!val) return true;
          return val?.length <= 100;
        })
        .when(["phone", "email"], ([phone, email], schema) => {
          if (phone || email) return schema.notRequired();
          return schema.required("One of the fields is required");
        })
        .label("Reference ID"),
      customer_data: yup
        .array(
          yup
            .object({
              name: yup.string().notRequired(),
              value: yup.mixed().notRequired(),
            })
            .notRequired(),
        )
        .notRequired(),
    },
    [
      ["email", "phone"],
      ["email", "rid"],
      ["phone", "rid"],
    ],
  )
  .required();
