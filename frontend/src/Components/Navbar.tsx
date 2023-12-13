import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';

import Container from '@mui/material/Container';
import { Avatar } from '@geist-ui/core'
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { ServiceContext } from '../Service/Firebase';
import { useContext } from 'react';
import { Button as GButton } from '@geist-ui/core'
import { LogIn, LogOut } from '@geist-ui/icons'
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const pages = [];
const settings = ['Channel', 'Logout'];

function Navbar() {
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);


    const { service } = useContext(ServiceContext)
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


    return (
        <AppBar position="static" sx={{ backgroundColor: '#303030' }}>
            <Container maxWidth="xl">
                <Toolbar disableGutters>

                    <Typography
                        variant="h6"
                        noWrap
                        component="a"
                        href="/"
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
                        VIBES STREAMIN'
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {/* {pages.map((page) => (
                            <Link to={{
                                pathname: `/${page}`
                            }}>

                                <Button
                                    key={page}
                                    onClick={handleCloseNavMenu}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    {page}
                                </Button>
                            </Link>
                        ))} */}
                    </Box>

                    {
                        isLoggedIn &&
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Open settings">
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                    <Avatar alt="Remy Sharp" src="" />
                                </IconButton>
                            </Tooltip>
                            <Menu
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
                                    <Typography textAlign="center">My Channel</Typography>
                                </MenuItem>

                                <MenuItem onClick={handleLogOut}>
                                    <Typography textAlign="center">Logout</Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    }

                    {
                        !isLoggedIn &&
                        <GButton icon={<LogIn />} auto onClick={() => {
                            handleCloseNavMenu()
                            navigate("/login")
                        }} >Log In</GButton>


                    }
                </Toolbar>
            </Container>
        </AppBar>
    );
}
export default Navbar;