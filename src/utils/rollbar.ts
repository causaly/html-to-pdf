import RollbarClient from 'rollbar';

export const makeRollbar = (props: {
  deployEnv: string;
  name: string;
  rollbarAccessToken?: string;
}) =>
  new RollbarClient({
    environment: props.deployEnv,
    enabled: !!props.rollbarAccessToken,
    accessToken: props.rollbarAccessToken,
    payload: {
      origin: props.name,
    },
    // We are deliberately NOT capturing IP addresses to ensure user privacy
    // even in the unlikely scenario that Rollbar is completely compromised
    captureIp: false,
  });
