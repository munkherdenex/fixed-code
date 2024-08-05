import * as yup from "yup";

export const createChannelSchema = yup
  .object({
    channel_type: yup.string().required(),
    name: yup.string().required(),
    data: yup
      .object({
        host: yup.string().url().notRequired().default(undefined).label("Host"),
        port: yup.number().positive().notRequired().default(undefined).label("Port"),
        host_user: yup.string().notRequired().default(undefined).label("Host user"),
        host_password: yup.string().notRequired().default(undefined).label("Host password"),
        url: yup.string().notRequired().default(undefined).label("URL"),
        headers: yup
          .array()
          .of(
            yup
              .object()
              .shape({
                key: yup.string().notRequired().default(undefined).label("Key"),
                value: yup.string().notRequired().default(undefined).label("Value"),
              })
              .notRequired()
              .default(undefined)
              .label("Headers"),
          )
          .notRequired()
          .default(undefined)
          .label("Headers"),
        rate_limit: yup.number().notRequired().default(undefined).label("Rate limit"),
      })
      .when("channel_type", (channel_type, schema) => {
        if (channel_type[0] === "api") {
          return schema.shape({
            url: yup.string().url().required().label("URL"),
            headers: yup
              .array()
              .of(
                yup.object().shape({
                  key: yup.string().required().label("Key"),
                  value: yup.string().required().label("Value"),
                }),
              )
              .label("Headers"),
            rate_limit: yup.number().positive().integer().required(),
          });
        }
        if (channel_type[0] === "email") {
          return schema.shape({
            host: yup.string().required().label("Host"),
            port: yup.number().positive().required().label("Port"),
            host_user: yup.string().notRequired().label("Host user"),
            host_password: yup.string().notRequired().label("Host password"),
          });
        }
        return schema.shape({
          url: yup.string().notRequired().default(undefined),
        });
      }),
  })
  .required();
