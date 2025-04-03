interface ApiConfig {
  BASE_URL: string;
  ENDPOINTS: {
    characters: string;
  };
}

export const API_CONFIG: ApiConfig = {
  BASE_URL: 'https://ezoiv3yqz6h5sh37ytuva7ns5i0moztz.lambda-url.us-east-2.on.aws',
  ENDPOINTS: {
    characters: '/api/personaje'
  }
};