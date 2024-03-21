import React, { useState } from 'react';
import {
    BottomNavigation, BottomNavigationAction, Dialog,
    DialogActions, DialogTitle, Divider, Modal, Slider, Switch
} from '@mui/material';
import { Mic, MicOff, Menu, Info } from '@mui/icons-material';
import { AppOptions } from '../interfaces';
import { AboutText } from './AboutText';

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

        const setDataLength = (event: Event, value: number) => {
            event.preventDefault();
            setAppOptions(prevOptions => ({
                ...prevOptions,
                dataLength: value,
            }))
        }

        const toggleSpectral = () => {
            setAppOptions(prevOptions => ({
                ...prevOptions,
                showSpectral: !appOptions.showSpectral
            }))
        }

        const toggleRms = () => {
            setAppOptions(prevOptions => ({
                ...prevOptions,
                showRms: !appOptions.showRms
            }))
        }

        const togglePerceptual = () => {
            setAppOptions(prevOptions => ({
                ...prevOptions,
                showPerceptual: !appOptions.showPerceptual
            }))
        }

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

                <Dialog open={menuOpen} onClose={handleMenuClose}>
                    <DialogTitle>Options</DialogTitle>
                    <Divider />
                    <DialogActions>
                        <Switch size='large' checked={appOptions.showSpectral} onChange={toggleSpectral} />Show Spectral Centroid
                        <Switch size='large' checked={appOptions.showRms} onChange={toggleRms} />Show RMS
                        <Switch size='large' checked={appOptions.showPerceptual} onChange={togglePerceptual} />Show Perceptual Spread
                    </DialogActions>
                    <DialogActions>
                        <Divider />
                        <Slider
                            value={appOptions.dataLength}
                            onChange={setDataLength}
                            min={100}
                            max={5000}
                            step={100}
                            marks={[
                                { value: 100, label: '100' },
                                { value: 5000, label: '5000' },
                            ]}
                            aria-labelledby="range-slider"
                        />
                    </DialogActions>
                </Dialog>

                <Modal open={aboutModalOpen} onClose={handleAboutModalClose}>
                    <div className='aboutModalMobile' style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400 }}>
                        <AboutText />
                    </div>
                </Modal>
            </div>
        );
    }
