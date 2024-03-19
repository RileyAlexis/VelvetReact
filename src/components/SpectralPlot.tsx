import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3_'
import * as Plot from '@observablehq/plot';
import { AppOptions } from '../interfaces';

interface SpectralChartProps {
    appOptions: AppOptions,
    spectralArray: number[],
    rmsArray: number[],
    amplitudeSpectrum: Float32Array[],

}


export const SpectralPlot: React.FC = ({ appOptions, spectralArray, rmsArray, amplitudeSpectrum }) => {
    const plotRef = useRef();
    const width = window.innerWidth - 50;

    useEffect(() => {
        // console.log(rmsArray);
    }, [rmsArray])

    useEffect(() => {
        if (spectralArray === undefined) return;

        const audioData = {
            spectral: spectralArray,
            rms: rmsArray,
            amplitudeSpectrum: amplitudeSpectrum
        }
        // console.log(amplitudeSpectrum[1]);


        const plot = Plot.plot({
            y: {
                grid: true,
                domain: [0, 150],
                // type: 'log',
                // tickFormat: ((f) => (x) => f((x - 1) * 100))(d3.format("+d"))
            },
            x: {
                domain: [0, 100]
            },
            marks: [
                Plot.frame(),
                // Plot.ruleY([256]),
                // Plot.barY(amplitudeSpectrum.map((value, index) => ({ x: index, y: value * 10000 })), {
                //     x: [0, 256],
                //     fill: 'rgba(0, 0, 255, 0.5)',
                //     strokeWidth: 0.1,
                // }),

                Plot.lineY(amplitudeSpectrum, {
                    // fill: "teal",
                    stroke: "teal",
                    opacity: 0.2,
                }),

                appOptions.showSpectral ?
                    Plot.lineY(spectralArray, {
                        curve: "natural",
                        stroke: appOptions.colorSpectral,
                    }) : null,

                appOptions.showRms ?
                    Plot.lineY(rmsArray, {
                        stroke: appOptions.colorRms,
                    }) : null,

            ],
            width: width,
        })

        plotRef.current.append(plot);
        return () => plot.remove();
    }, [spectralArray]);

    return <div ref={plotRef} />;
}