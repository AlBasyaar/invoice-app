declare module '@vercel/analytics/next' {
  import * as React from 'react';
  export const Analytics: React.ComponentType<Record<string, any>>;
  export default Analytics;
}
