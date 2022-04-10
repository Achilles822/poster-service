import { EggAppConfig, EggAppInfo, PowerPartial } from "egg";

export default (appInfo: EggAppInfo) => {
  const config = {} as PowerPartial<EggAppConfig>;

  config.keys = appInfo.name + "_1649570217033_1894";

  config.middleware = [];

  config.security = {
    csrf: {
      enable: false,
    },
  };

  return {
    ...config
  };
};
