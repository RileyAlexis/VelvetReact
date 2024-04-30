import React, { useState, useRef, useEffect, useCallback } from 'react';

import {
    Alert,
    BottomNavigation, BottomNavigationAction,
    Modal, Snackbar, Dialog,
    DialogContent, Slide
} from '@mui/material';
import { Mic, MicOff, Menu, Info } from '@mui/icons-material';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import InstallMobileIcon from '@mui/icons-material/InstallMobile';
import PauseIcon from '@mui/icons-material/Pause';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { AboutText } from './AboutText';
import { MenuModal } from './MenuModal';
import { FadeLoader } from 'react-spinners';

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
        const [error, setError] = useState<string>('');
        const [openSnack, setOpenSnack] = useState<boolean>(false);
        const [showLoader, setShowLoader] = useState<boolean>(false);
        const [deferredPrompt, setDeferredPrompt] = useState<any | null>(null);
        const fileForReplayRef = useRef(null);
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const [isStandalone, setIsStandalone] = useState<boolean>(false);


        //Detects standalone mode on iOS
        useEffect(() => {
            const checkStandalone = () => {
                setIsStandalone(Boolean((window.navigator as any)?.standalone))
            }
            checkStandalone();
            window.addEventListener('appinstalled', checkStandalone);
            return () => {
                window.removeEventListener('appinstalled', checkStandalone);
            }
        }, []);

        useEffect(() => {
            if (isStandalone) {
                setAppOptions(prevOptions => ({
                    ...prevOptions,
                    iOSInstall: false
                }))
            }
        })

        //Detects chrome only event
        useEffect(() => {
            console.log('standalone', isStandalone);
            const handleBeforeInstallPrompt = (event: Event) => {
                event.preventDefault();
                setDeferredPrompt(event);
            }
            console.log(deferredPrompt);

            window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

            return () => {
                window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            }
        }, []);

        const installApp = () => {
            console.log(deferredPrompt);
            if (deferredPrompt) {
                deferredPrompt.prompt();
                deferredPrompt.userChoice.then((choiceResult: any) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('Accepted');
                    } else {
                        console.log('Rejected');
                    }
                    setDeferredPrompt(null);
                })
            }
        };

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

        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
            setShowLoader(true);
            await delayFunction();
            try {
                const file = e.target.files?.[0];
                if (file && file.size < 10 * 1024 * 1024) {
                    console.log('File Uploaded');
                    fileForReplayRef.current = file;
                    setShowPlayPause(true);
                    setIsPlaying(true);
                    setIsEnded(false);
                    startFileAnalyzing(file);
                } else {
                    setOpenSnack(true);
                    setError('File size is limited to 10mb');
                }
            } catch (error) {
                setOpenSnack(true);
                setError('Error uploading file');
            } finally {
                setShowLoader(false);
            }
        }

        const delayFunction = (): Promise<void> => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 200); // Simulate a 1 second async operation
            });
        };

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


        const handleCloseSnack = () => {
            setOpenSnack(false);
            setError('');
        }

        useEffect(() => {
            console.log('isPlaying', isPlaying);
        }, [isPlaying]);

        const installIOS = () => {
            alert(`To install this app on iOS tap the share icon and select "Add to Home Screen"`);
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
                <Snackbar anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                    open={openSnack}
                    onClose={handleCloseSnack}
                    autoHideDuration={3000}
                >
                    <Alert onClose={handleCloseSnack} variant='filled' severity='error'
                        sx={{ width: '100%' }}
                    >
                        {error}
                    </Alert>
                </Snackbar>
                {showLoader &&
                    <div className='fadeLoader'>
                        <FadeLoader color="#cb3487" />
                    </div>
                }
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
                    {deferredPrompt && !isIOS &&
                        < BottomNavigationAction
                            style={buttonStyle}
                            label='Install App'
                            icon={<InstallMobileIcon />}
                            onClick={installApp}
                        />
                    }

                    {isIOS && appOptions.iOSInstall && isStandalone &&
                        <BottomNavigationAction
                            style={buttonStyle}
                            label='Install App'
                            icon={<InstallMobileIcon />}
                            onClick={installIOS}
                        />
                    }

                    <BottomNavigationAction
                        style={buttonStyle}
                        label="About"
                        icon={<Info />}
                        onClick={handleAboutModalOpen}
                    />
                </BottomNavigation>

                {menuOpen &&
                    <div className="optionsContainer">
                        <Modal open={menuOpen} onClose={handleMenuClose}>
                            <MenuModal appOptions={appOptions} setAppOptions={setAppOptions} />
                        </Modal>
                    </div>
                }

                <Dialog
                    open={aboutModalOpen}
                    onClose={handleAboutModalClose}
                    TransitionComponent={Slide}
                    transitionDuration={500}
                    maxWidth="md"
                    className="aboutContainer"
                    PaperProps={{
                        sx: {
                            backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark background
                            color: '#fff', // White text color
                            boxShadow: 'none', // Remove box shadow
                        },
                    }}
                    sx={{
                        position: 'fixed',
                        bottom: 56,
                        left: 0,
                        right: 0,

                    }}

                >
                    <DialogContent dividers className={"aboutContent"}>
                        <AboutText />
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
