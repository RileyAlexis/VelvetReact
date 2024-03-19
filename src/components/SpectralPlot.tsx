import React, { useRef, useEffect } from 'react';
import * as Plot from '@observablehq/plot';

interface SpectralChartProps {
    spectral: number[]
}


export const SpectralPlot: React.FC = ({ spectralArray, rmsArray }) => {
    const plotRef = useRef();
    const width = window.innerWidth - 50;

    useEffect(() => {
        console.log(rmsArray);
    }, [rmsArray])

    useEffect(() => {
        if (spectralArray === undefined) return;

        const audioData = {
            spectral: spectralArray,
            rms: rmsArray
        }


        const plot = Plot.plot({
            marks: [
                Plot.frame(),
                Plot.ruleY(audioData, { x: [0, 100], y: [0, 150] }),
                Plot.lineY(spectralArray, {
                    domain: [0, 100],
                    stroke: "red",
                }),
                Plot.lineY(rmsArray, {
                    domain: [0, 100],
                    stroke: "green"
                }),
            ],
            width: width,
        })

        plotRef.current.append(plot);
        return () => plot.remove();
    }, [spectralArray]);

    return <div ref={plotRef} />;
}