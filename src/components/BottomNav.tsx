import React, { useState } from 'react';
import {
    BottomNavigation, BottomNavigationAction,
    Modal
} from '@mui/material';
import { Mic, MicOff, Menu, Info } from '@mui/icons-material';
import { AppOptions } from '../interfaces';
import { AboutText } from './AboutText';

import { MenuModal } from './MenuModal';

interface BottomNavProps {
    isRecording: boolean,
    startRecording: Function,
    appOptions: AppOptions,
    setAppOptions: Function,
}

export const BottomNav: React.FC<BottomNavProps> =
    ({ isRecording, startRecording, appOptions, setAppOptions }) => {

        const [menuOpen, setMenuOpen] = useState(false);
        const [aboutModalOpen, setAboutModalOpen] = useState(false);


        const handleMenuOpen = () => {
            setMenuOpen(true);
        };

        const handleMenuClose = () => {
            setMenuOpen(false);
        };

        const handleAboutModalOpen = () => {
            setAboutModalOpen(true);
        };

        const handleAboutModalClose = () => {
            setAboutModalOpen(false);
        };

        const handleMicToggle = () => {
            startRecording();
        };



        const buttonStyle = {
            color: 'white',
        }

        return (
            <div>
                <BottomNavigation showLabels
                    style={{ background: 'transparent' }}
                >
                    <BottomNavigationAction
                        style={buttonStyle}
                        label="Options"
                        icon={<Menu />}
                        onClick={handleMenuOpen}
                    />
                    <BottomNavigationAction
                        style={buttonStyle}
                        label="Mic"
                        icon={isRecording ? <MicOff style={{ color: 'red' }} /> : <Mic style={{ color: 'green' }} />}
                        onClick={handleMicToggle}
                    />
                    <BottomNavigationAction
                        style={buttonStyle}
                        label="About"
                        icon={<Info />}
                        onClick={handleAboutModalOpen}
                    />
                </BottomNavigation>

                <Modal open={menuOpen} onClose={handleMenuClose}>
                    <MenuModal appOptions={appOptions} setAppOptions={setAppOptions} />
                </Modal>

                <Modal open={aboutModalOpen} onClose={handleAboutModalClose}>
                    <div className='aboutModalMobile' style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400 }}>
                        <AboutText />
                    </div>
                </Modal>
            </div>
        );
    }
