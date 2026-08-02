/**
 * Tells this Convex deployment to trust your AuthOwl project's JWTs.
 *
 * Convex verifies them **statelessly** against the project's published JWKS —
 * it never calls AuthOwl at request time, and there is no shared secret.
 *
 * Both values come from your project's public config `jwtIssuer` block
 * (enable Settings → JWT issuer first). Convex reads env vars from the
 * *deployment*, not from Vite:
 *
 *   npx convex env set AUTHOWL_ISSUER_URL <jwtIssuer.issuer>
 *   npx convex env set AUTHOWL_PROJECT_ID <jwtIssuer.aud>
 */
export default {
  providers: [
    {
      type: 'customJwt',
      issuer: process.env.AUTHOWL_ISSUER_URL!,
      jwks: `${process.env.AUTHOWL_ISSUER_URL!}/jwks`,
      applicationID: process.env.AUTHOWL_PROJECT_ID!,
      algorithm: 'ES256',
    },
  ],
};
