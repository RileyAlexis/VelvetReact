import React, { useState, useRef, useEffect, useCallback } from 'react';

import {
    BottomNavigation, BottomNavigationAction,
    Button,
    Modal
} from '@mui/material';
import { Mic, MicOff, Menu, Info } from '@mui/icons-material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PauseIcon from '@mui/icons-material/Pause';
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
    isMicOn: boolean,
    // fileOnRef: boolean,
    handlePause: Function,
    handleResume: Function,
    isEnded: boolean,
    setIsEnded: Function,
    isFilePlaying: boolean,
}

export const BottomNav: React.FC<BottomNavProps> =
    ({
        startRecording,
        startFileAnalyzing,
        appOptions,
        setAppOptions,
        isMicOn,
        // fileOnRef,
        handlePause,
        handleResume,
        isEnded,
        setIsEnded,
        isFilePlaying,
    }) => {

        const [menuOpen, setMenuOpen] = useState<boolean>(false);
        const [aboutModalOpen, setAboutModalOpen] = useState<boolean>(false);
        const [isPlaying, setIsPlaying] = useState<boolean>(false);
        const [showPlayPause, setShowPlayPause] = useState<boolean>(false);
        const fileInputRef = useRef(null);

        const fileForReplayRef = useRef(null);

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
            setShowPlayPause(false);
            startRecording();
        };

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) {
                console.log('File Uploaded');
                fileForReplayRef.current = file;
                setShowPlayPause(true);
                setIsPlaying(!isPlaying);
                startFileAnalyzing(file);
            }
        }

        const handleUploadClick = () => {
            fileInputRef.current.click();
        };

        const buttonStyle = {
            color: 'white',
        }

        const togglePlayPause = useCallback(() => {
            setIsPlaying(!isPlaying);

            if (isPlaying && !isEnded) {
                handlePause();
            } else if (!isPlaying && !isEnded) {
                handleResume();
            } else if (isEnded) {
                setIsEnded(false);
                startFileAnalyzing(fileForReplayRef.current);
            }
            // !isPlaying ? handlePause() : handleResume();
        }, [isPlaying, isEnded]);

        useEffect(() => {
            console.log('isPlaying', isPlaying);
        }, [isPlaying]);

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
                        icon={isMicOn ? <MicOff style={{ color: 'red' }} /> : <Mic style={{ color: 'green' }} />}
                        onClick={handleMicToggle}
                    />

                    <BottomNavigationAction
                        style={buttonStyle}
                        label="File"
                        icon={isFilePlaying ? <FileUploadIcon style={{ color: 'red' }} /> : <FileUploadIcon style={{ color: 'green' }} />}
                        onClick={handleUploadClick}
                    />
                    {showPlayPause &&
                        <BottomNavigationAction
                            style={buttonStyle}
                            label={!isFilePlaying ? 'Play' : 'Pause'}
                            icon={!isFilePlaying ? <PlayCircleOutlineIcon /> : <PauseIcon />}
                            onClick={togglePlayPause}
                        />
                    }

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
