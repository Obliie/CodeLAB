import Box from '@mui/material/Box';

export default function HomePage() {
    return (
        <Box sx={{ display: 'flex' }}>
            <div>Welcome to CodeLAB. CONN: { process.env.USERDB_CONN }</div>
        </Box>
    );
}
