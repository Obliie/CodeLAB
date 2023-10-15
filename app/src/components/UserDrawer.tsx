import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewHeadlineIcon from '@mui/icons-material/ViewHeadline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Link from 'next/link';
import * as React from 'react';

const LINKS = [
    { text: 'Home', href: '/', icon: HomeIcon },
    { text: 'Problems', href: '/problem/list', icon: ViewHeadlineIcon },
];

const PLACEHOLDER_LINKS = [
    { text: 'Settings', icon: SettingsIcon },
    { text: 'Logout', icon: LogoutIcon },
];

export default function UserDrawer({ width }: { width: number }) {
    return (
        <Drawer
            sx={{
                width: width,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: width,
                    boxSizing: 'border-box',
                    top: ['48px', '56px', '64px'],
                    height: 'auto',
                    bottom: 0,
                },
            }}
            variant="permanent"
            anchor="left">
            <Divider />
            <List>
                {LINKS.map(({ text, href, icon: Icon }) => (
                    <ListItem key={href} disablePadding>
                        <ListItemButton component={Link} href={href}>
                            <ListItemIcon>
                                <Icon />
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Divider sx={{ mt: 'auto' }} />
            <List>
                {PLACEHOLDER_LINKS.map(({ text, icon: Icon }) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton>
                            <ListItemIcon>
                                <Icon />
                            </ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );
}
