import React, { useRef, useEffect } from 'react';
import * as Plot from '@observablehq/plot';

interface SpectralChartProps {
    spectral: number[]
}


export const SpectralPlot: React.FC = ({ spectralArray, rms }) => {
    const plotRef = useRef();
    const width = window.innerWidth - 50;

    useEffect(() => {
        if (spectralArray === undefined) return;
        const plot = Plot.plot({
            marks: [
                Plot.frame(),
                Plot.ruleY([0, 25, 50, 75, 100], { stroke: "lightgreen" }),
                Plot.lineY(spectralArray, {
                    // x: [0, 1200],
                    domain: [0, 25, 50, 75, 100]
                }),
                // Plot.lineY(rms)
            ],
            width: width,
        })



        plotRef.current.append(plot);
        return () => plot.remove();
    }, [spectralArray]);

    return <div ref={plotRef} />;
}