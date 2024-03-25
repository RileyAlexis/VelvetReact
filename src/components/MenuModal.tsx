import React from "react";
import { Switch, Slider } from "@mui/material";
import { AppOptions } from "../interfaces";

interface MenuModalProps {
    appOptions: AppOptions,
    setAppOptions: Function
}

export const MenuModal: React.FC<MenuModalProps> = ({ appOptions, setAppOptions }) => {

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


    return (
        <div className="optionsModal">
            <center>
                <h3>Options:</h3>
            </center>
            <div>
                <Switch checked={appOptions.showSpectral} onChange={toggleSpectral} /><span>Show Spectral Centroid</span>
            </div>
            <div>
                <Switch checked={appOptions.showRms} onChange={toggleRms} />Show RMS
            </div>
            <div>
                <Switch checked={appOptions.showPerceptual} onChange={togglePerceptual} />Show Perceptual Spread
            </div>
            <div className="zoomSlider">
                <Slider
                    value={appOptions.dataLength}
                    onChange={setDataLength}
                    min={100}
                    max={5000}
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