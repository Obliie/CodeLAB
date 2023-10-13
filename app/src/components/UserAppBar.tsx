import CodeIcon from '@mui/icons-material/Code';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export default function UserAppBar({ title }: { title: string }) {
    return (
        <AppBar position="fixed" sx={{ zIndex: 2000 }}>
            <Toolbar sx={{ backgroundColor: 'background.paper' }}>
                <CodeIcon sx={{ color: '#fff', mr: 2 }} />
                <Typography variant="h6" noWrap component="div" color="white">
                    {title}
                </Typography>
            </Toolbar>
        </AppBar>
    );
}
