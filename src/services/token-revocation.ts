const revokedTokenJtis = new Set<string>();

const revokeTokenJti = (jti: string): void => {
  revokedTokenJtis.add(jti);
};

const isTokenJtiRevoked = (jti: string): boolean => {
  return revokedTokenJtis.has(jti);
};

export { revokeTokenJti, isTokenJtiRevoked };
