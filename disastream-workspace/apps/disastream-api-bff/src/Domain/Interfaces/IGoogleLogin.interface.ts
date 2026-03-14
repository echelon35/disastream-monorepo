export interface IGoogleLogin {
  mail: string;
  firstname: string;
  lastname: string;
  username: string;
  accessToken: string;
  providerId: string;
  avatar: string;
  provider: 'GOOGLE';
  last_connexion: Date;
  rgpdConsent?: boolean;
  allowMarketing?: boolean;
}
