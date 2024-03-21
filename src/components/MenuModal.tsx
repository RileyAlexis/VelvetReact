import React from "react";
import { Switch, Slider } from "@mui/material";

export const MenuModal: React.FC = () => {
    return (
        <div className="optionsModal">
            <Switch checked={appOptions.showSpectral} onChange={toggleSpectral} />Show Spectral Centroid
            <Switch checked={appOptions.showRms} onChange={toggleRms} />Show RMS
            <Switch checked={appOptions.showPerceptual} onChange={togglePerceptual} />Show Perceptual Spread

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
        </div>
    )
}