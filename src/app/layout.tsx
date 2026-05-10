import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import React from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme';
import { Shell } from '../components/Shell';
import "./globals.css";

export const metadata = {
  title: 'Villa Hvitfelt',
  description: 'Mökin hallinta helposti.',
  icons: {
    icon: '/spruce.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fi" suppressHydrationWarning>
      <body>
        <MantineProvider theme={theme} defaultColorScheme="auto">
          <Notifications />
          <Shell>
            {children}
          </Shell>
        </MantineProvider>
      </body>
    </html>
  );
}
