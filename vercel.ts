import { routes, type VercelConfig } from '@vercel/config/v1';

export const config: VercelConfig = {
  framework: 'nextjs',
  buildCommand: 'npm run build',
  crons: [
    {
      path: '/api/update-knockout',
      schedule: '0 */4 * * *', // Elke 4 uur
    },
    {
      path: '/api/calculate-daily-winner',
      schedule: '0 2 * * *', // Elke dag om 02:00 UTC
    },
  ],
};
