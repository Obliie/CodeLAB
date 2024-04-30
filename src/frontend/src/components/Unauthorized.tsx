import { Typography } from '@mui/material';
import Box from '@mui/material/Box';

export default function Unauthorized() {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
            }}>
            <Typography variant="h2" sx={{ fontWeight: 'bold' }}>
                ERROR: UNAUTHORIZED
            </Typography>
        </Box>
    );
}
