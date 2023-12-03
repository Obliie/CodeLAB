import { NextAuthProvider } from '@/components/NextAuthProvider';
import ThemeRegistry from '@/components/ThemeRegistry/ThemeRegistry';
import UserAppBar from '@/components/UserAppBar';
import UserDrawer from '@/components/UserDrawer';
import Box from '@mui/material/Box';
import { SessionProvider } from 'next-auth/react';
import * as React from 'react';

export const metadata = {
    title: 'CodeLAB',
    description: 'A web application for evaluating solutions to code problems in various languages',
};

const DRAWER_WIDTH = 240;

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <ThemeRegistry>
                    <NextAuthProvider>
                        <UserAppBar title="CodeLAB" />
                        <UserDrawer width={DRAWER_WIDTH} />
                        <Box
                            component="main"
                            sx={{
                                flexGrow: 1,
                                bgcolor: 'background.default',
                                ml: `${DRAWER_WIDTH}px`,
                                mt: ['48px', '56px', '64px'],
                                p: 3,
                            }}>
                            {children}
                        </Box>
                    </NextAuthProvider>
                </ThemeRegistry>
            </body>
        </html>
    );
}
