export enum EnvironmentName {
  STAGING = 'staging',
  PROD = 'production',
}

export const isPubnet = () => {
  return import.meta.env.VITE_ENVIRONMENT_NAME === EnvironmentName.PROD
}
