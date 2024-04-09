import React, { useState, useRef, useEffect, useCallback } from 'react';

import {
    BottomNavigation, BottomNavigationAction,
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

//Audio Process
import { callStopOnNewFileLoad } from '../modules/startAnalyzer';

interface BottomNavProps {
    isRecording: boolean,
    startRecording: Function,
    startFileAnalyzing: Function,
    appOptions: AppOptions,
    setAppOptions: Function,
    isMicOn: boolean,
    handleMicPause: Function,
    handleFilePause: Function,
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
        handleMicPause,
        handleFilePause,
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
            if (isPlaying || isFilePlaying) callStopOnNewFileLoad();
            if (!isMicOn) {
                setShowPlayPause(false);
                startRecording();
            } else {
                handleMicPause();
            }
        };

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {

            const file = e.target.files?.[0];
            if (file) {
                console.log('File Uploaded');
                fileForReplayRef.current = file;
                setShowPlayPause(true);
                setIsPlaying(true);
                setIsEnded(false);
                startFileAnalyzing(file);
            }
        }

        const handleUploadClick = () => {
            if (isPlaying || isFilePlaying) {
                handleFilePause();
                callStopOnNewFileLoad();
            }
            fileInputRef.current.click();
        };

        const buttonStyle = {
            color: 'white',
        }

        const togglePlayPause = useCallback(() => {
            if (isPlaying && isFilePlaying) {
                console.log("Pause called");
                setIsPlaying(false);
                handleFilePause();
            } else if (!isPlaying && !isFilePlaying) {
                console.log("Resume called");
                setIsPlaying(true);
                handleResume();
            } else if (isEnded) {
                console.log("Start playing called");
                setIsEnded(false);
                setIsPlaying(true);
                startFileAnalyzing(fileForReplayRef.current);
            }
        }, [isPlaying, isEnded, isFilePlaying]);

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
