import React, { useState, useRef, useEffect } from 'react';

import {
    BottomNavigation, BottomNavigationAction,
    Modal
} from '@mui/material';
import { Mic, MicOff, Menu, Info } from '@mui/icons-material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { AboutText } from './AboutText';
import { MenuModal } from './MenuModal';

//Types
import { AppOptions } from '../interfaces';

interface BottomNavProps {
    isRecording: boolean,
    startRecording: Function,
    startFileAnalyzing: Function,
    appOptions: AppOptions,
    setAppOptions: Function,
    micOn: boolean,
    fileOnRef: boolean,
}

export const BottomNav: React.FC<BottomNavProps> =
    ({ isRecording, startRecording, startFileAnalyzing, appOptions, setAppOptions, micOn, fileOnRef }) => {

        const [menuOpen, setMenuOpen] = useState(false);
        const [aboutModalOpen, setAboutModalOpen] = useState(false);
        const fileInputRef = useRef(null);

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

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                console.log('File Uploaded');
                startFileAnalyzing(file);
            }
        }

        const handleUploadClick = () => {
            fileInputRef.current.click();
        };


        const buttonStyle = {
            color: 'white',
        }



        return (
            <div>
                <input
                    type="file"
                    accept="audio/*"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
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
                        icon={micOn ? <MicOff style={{ color: 'red' }} /> : <Mic style={{ color: 'green' }} />}
                        onClick={handleMicToggle}
                    />

                    <BottomNavigationAction
                        style={buttonStyle}
                        label="File"
                        icon={fileOnRef ? <FileUploadIcon style={{ color: 'red' }} /> : <FileUploadIcon style={{ color: 'green' }} />}
                        onClick={handleUploadClick}
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
