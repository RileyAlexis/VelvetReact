import React, { useRef, useEffect } from 'react';
import * as Plot from '@observablehq/plot';
import { AppOptions } from '../interfaces';

interface SpectralChartProps {
    appOptions: AppOptions,
    spectralArray: number[],
    rmsArray: number[],
    amplitudeSpectrum: Float32Array[],
    perceptualSpread: number,
}


export const SpectralPlot: React.FC<SpectralChartProps> = ({ appOptions, spectralArray, rmsArray, perceptualSpreadArray }) => {
    const plotRef = useRef<HTMLDivElement | null>(null);
    const width: number = window.innerWidth - 50;
    const height: number = window.innerHeight * .5;

    useEffect(() => {
        // console.log(rmsArray);
    }, [rmsArray])

    // let audioData = {
    //     rms: rmsArray,
    //     amplitudeSpectrum: amplitudeSpectrum,
    //     spectralArray: spectralArray,
    //     perceptualSpread: perceptualSpread
    // }

    useEffect(() => {
        if (spectralArray === undefined) return;
        // console.log(audioData.amplitudeSpectrum);
        // console.log(perceptualSpread);

        const plot = Plot.plot({
            marginTop: 15,
            marginLeft: 30,
            marginBottom: 20,
            marginRight: 15,
            y: {
                grid: true,
                domain: [0, 150],
                // type: 'log',
                // tickFormat: ((f) => (x) => f((x - 1) * 100))(d3.format("+d"))
            },
            x: {
                domain: [0, 1000]
            },
            marks: [
                Plot.frame(),
                // Plot.lineY(amplitudeSpectrum, {
                //     // fill: "teal",
                //     stroke: "teal",
                //     opacity: 0.2,
                // }),

                // Plot.lineY(perceptualSpread, {
                //     curve: "natural",
                //     stroke: "white",
                // }),

                appOptions.showSpectral ?
                    Plot.lineY(spectralArray, {
                        curve: "natural",
                        stroke: appOptions.colorSpectral,
                    }) : null,

                appOptions.showRms ?
                    Plot.lineY(perceptualSpreadArray, {
                        curve: "natural",
                        stroke: appOptions.colorRms,
                    }) : null,

            ],
            width: width,
            height: height,

        })

        plotRef.current.append(plot);

        return () => plot.remove();
    }, [spectralArray]);

    return <div ref={plotRef} style={{ background: 'linear-gradient(to right, #2c8daa, #cb3487)', color: 'white' }} />;
}