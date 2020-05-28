type Env = "development" | "production";

export interface Config {
  apiEndPoint: string;
  coordinatorRESTEndPoint: string;
  securityRESTEndPoint: string;
  coinRESTEndPoint: string;
  env: Env;
}

const productionBaseURL =
  "http://cch-alb-prod-295901909.us-east-1.elb.amazonaws.com";
const localBaseURL = "http://localhost";

export const createConfig = (): Config => {
  let env: Env;
  if (process.env.NODE_ENV === "production") {
    env = "production";
  } else {
    env = "development";
  }

  const baseURL = env === "production" ? productionBaseURL : localBaseURL;

  // API server Endpoints
  const apiEndPoint = `${baseURL}:8080/api`;

  // REST Endpoints
  const coordinatorRESTEndPoint = `${baseURL}:1317`;
  const securityRESTEndPoint = `${baseURL}:1318`;
  const coinRESTEndPoint = `${baseURL}:1319`;

  return {
    env,
    apiEndPoint,
    coordinatorRESTEndPoint,
    securityRESTEndPoint,
    coinRESTEndPoint
  };
};

// const guard = (env: string | undefined, key: string): string => {
//   if (!env) {
//     throw new Error(`not exits: ENV: ${key}`);
//   }
//   return env;
// };
