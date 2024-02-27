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
                        <Box sx={{display: 'block', width: '100%'}}>
                            <UserAppBar title="CodeLAB" />
                            <Box
                                sx={{
                                    display: 'flex',
                                    bgcolor: 'background.default',
                                    mt: ['48px', '56px', '64px'],
                                }}>
                                <UserDrawer width={DRAWER_WIDTH} />
                                <Box
                                    sx={{
                                        width: `calc(100% - ${DRAWER_WIDTH}px)`,
                                        mt: ['24px', '28px', '32px'],
                                        mb: ['24px', '28px', '32px'],
                                    }}    
                                >
                                    {children}
                                </Box>
                            </Box>
                        </Box>
                    </NextAuthProvider>
                </ThemeRegistry>
            </body>
        </html>
    );
}
