
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import Container from '@mui/material/Container';
import { User, Text, useTheme, Popover, Link as GeistLink } from '@geist-ui/core'
import { ServiceContext } from '../Service/Firebase';
import { useContext, useState } from 'react';
import { Button as GButton } from '@geist-ui/core'
import { LogIn, LogOut } from '@geist-ui/icons'
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

function Navbar() {
    const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
    const { service, getCurrentUser } = useContext(ServiceContext)
    const theme = useTheme()

    const currentUser = getCurrentUser()
    const isLoggedIn = service.isLoggedIn()
    const navigate = useNavigate();

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogOut = () => {
        handleCloseUserMenu()
        service.logOut()
    }
    const content = () => (
        <div style={{ padding: '0 10px' }}>

        </div>
    )
    return (
        <AppBar position="static" sx={{ backgroundColor: '#303030' }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>

                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        <Link to="/" style={{ color: theme.palette.foreground }}>VIBES STREAMIN'</Link>
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>

                    </Box>

                    {
                        isLoggedIn &&
                        <Box sx={{}} >
                            {/* <Tooltip title="Open settings">

                            </Tooltip> */}
                            {/* <Menu
                                sx={{ mt: '45px' }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                <MenuItem onClick={() => {
                                    handleCloseNavMenu()
                                    navigate("/channel")
                                }}>
                                    <Typography textAlign="center" style={{ color: theme.palette.foreground }}>My Channel</Typography>
                                </MenuItem>

                                <MenuItem onClick={handleLogOut}>
                                    <Typography textAlign="center" style={{ color: theme.palette.foreground }} >Logout</Typography>
                                </MenuItem>
                            </Menu> */}
                            <Popover content={<>

                                <Popover.Item>
                                    <Link to="/channel" style={{ color: theme.palette.foreground }}>My Channel</Link>
                                </Popover.Item>
                                <Popover.Item>
                                    <Link to="/" style={{ color: theme.palette.foreground }}>Home</Link>
                                </Popover.Item>
                                <Popover.Item line />
                                <Popover.Item>
                                    <GButton icon={<LogOut />} style={{ color: theme.palette.foreground }} onClick={handleLogOut}>Logout</GButton>
                                </Popover.Item>
                            </> as any} >
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <User src={currentUser.photoURL} name={""} style={{ color: "white" }}>
                                    </User>
                                    <Text font="1rem" style={{ color: "white" }}>
                                        {currentUser.displayName}
                                    </Text>
                                </IconButton>
                            </Popover>
                        </Box>
                    }

                    {
                        !isLoggedIn &&
                        <GButton icon={<LogIn />} style={{ color: theme.palette.foreground }} auto onClick={() => {
                            handleCloseNavMenu()
                            navigate("/login")
                        }} >Log In</GButton>
                    }
                </Toolbar>
            </Container>
        </AppBar >
    );
}
export default Navbar;