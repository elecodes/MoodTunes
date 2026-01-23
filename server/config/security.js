import helmet from 'helmet';

/**
 * Global Security Headers Configuration
 * using Helmet to set Content-Security-Policy, HSTS, etc.
 */
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://*.voiceflow.com", "https://cdn.voiceflow.com"], 
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.voiceflow.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.voiceflow.com"],
      imgSrc: ["'self'", "data:", "https://is1-ssl.mzstatic.com", "https://cdn.voiceflow.com", "https://*.voiceflow.com"], 
      connectSrc: ["'self'", "https://itunes.apple.com", "https://*.voiceflow.com"],
      mediaSrc: ["'self'", "https://*.voiceflow.com"], 
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow resource loading
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
});
