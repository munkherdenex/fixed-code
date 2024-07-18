import * as yup from "yup";

export const createChannelSchema = yup
  .object({
    channel_type: yup.string().required(),
    name: yup.string().required(),
    data: yup
      .object({
        url: yup.string().notRequired().default(undefined),
        headers: yup
          .array()
          .of(
            yup
              .object()
              .shape({
                key: yup.string().notRequired().default(undefined),
                value: yup.string().notRequired().default(undefined),
              })
              .notRequired()
              .default(undefined),
          )
          .notRequired()
          .default(undefined),
        rate_limit: yup.number().notRequired().default(undefined),
      })
      .when("channel_type", (channel_type, schema) => {
        if (channel_type[0] === "api") {
          return schema.shape({
            url: yup.string().url().required(),
            headers: yup.array().of(
              yup.object().shape({
                key: yup.string().required("Key is required"),
                value: yup.string().required("Value is required"),
              }),
            ),
            rate_limit: yup.number().positive().integer(),
          });
        }
        if (channel_type[0] === "email") {
          return schema.shape({
            email: yup.string().email().required(),
          });
        }
        return schema.shape({
          url: yup.string().notRequired().default(undefined),
        });
      }),
  })
  .required();
