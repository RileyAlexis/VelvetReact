import React, { useEffect, useState } from "react";
import { Switch, Slider } from "@mui/material";
import { AppOptions } from "../interfaces";

interface MenuModalProps {
    appOptions: AppOptions,
    setAppOptions: Function
}

export const MenuModal: React.FC<MenuModalProps> = ({ appOptions, setAppOptions }) => {

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

    const setDataLength = (event: Event, value: number) => {
        event.preventDefault();
        setAppOptions(prevOptions => ({
            ...prevOptions,
            dataLength: value,
        }))
    }

    // const toggleSpectral = () => {
    //     setAppOptions(prevOptions => ({
    //         ...prevOptions,
    //         showSpectral: !appOptions.showSpectral
    //     }))
    // }

    // const toggleRms = () => {
    //     setAppOptions(prevOptions => ({
    //         ...prevOptions,
    //         showRms: !appOptions.showRms
    //     }))
    // }

    // const togglePerceptual = () => {
    //     setAppOptions(prevOptions => ({
    //         ...prevOptions,
    //         showPerceptual: !appOptions.showPerceptual
    //     }))
    // }

    const toggleYin = () => {
        setAppOptions(prevOptions => ({
            ...prevOptions,
            showYin: !appOptions.showYin
        }));
    }

    const toggleFirstFormant = () => {
        setAppOptions(prevOptions => ({
            ...prevOptions,
            showFirstFormant: !appOptions.showFirstFormant
        }));
    }

    const toggleIOS = () => {
        setAppOptions(prevOptions => ({
            ...prevOptions,
            iOSInstall: !appOptions.iOSInstall
        }))
    }


    return (
        <div className="optionsModal">
            <center>
                <h3>Options:</h3>
            </center>
            <div>
                <Switch checked={appOptions.showFirstFormant} onChange={toggleFirstFormant} /><span>Show First Formant</span>
            </div>
            {/* <div>
                <Switch checked={appOptions.showSpectral} onChange={toggleSpectral} /><span>Show Spectral Centroid</span>
            </div>
            <div>
                <Switch checked={appOptions.showRms} onChange={toggleRms} />Show RMS
            </div>
            <div>
                <Switch checked={appOptions.showPerceptual} onChange={togglePerceptual} />Show Perceptual Spread
            </div> */}
            <div>
                <Switch checked={appOptions.showYin} onChange={toggleYin} />Show Base Frequency
            </div>
            {isIOS && !isStandalone &&
                <div>
                    <Switch checked={appOptions.iOSInstall} onChange={toggleIOS} />Show Install Button
                </div>
            }
            <div className="zoomSlider">
                <Slider
                    value={appOptions.dataLength}
                    onChange={setDataLength}
                    min={100}
                    max={2000}
                    step={100}
                    valueLabelDisplay="auto"
                    marks
                    aria-labelledby="range-slider"
                />
                <center>
                    <span>Chart Zoom</span>
                </center>
            </div>
        </div>
    )
}