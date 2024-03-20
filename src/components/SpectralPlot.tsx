import React, { useRef, useEffect } from 'react';
import * as Plot from '@observablehq/plot';
import { AppOptions } from '../interfaces';

interface SpectralChartProps {
    appOptions: AppOptions,
    spectralArray: number[],
    rmsArray: number[],
    perceptualSpreadArray: number[],
}


export const SpectralPlot: React.FC<SpectralChartProps> = ({ appOptions, spectralArray, rmsArray, perceptualSpreadArray }) => {
    const plotRef = useRef<HTMLDivElement | null>(null);
    const width: number = window.innerWidth - 50;
    const height: number = window.innerHeight * .5;

    useEffect(() => {
        // console.log(audioObject);
    }, [spectralArray])

    useEffect(() => {
        if (spectralArray === undefined) return;

        const plot = Plot.plot({
            marginTop: 15,
            marginLeft: 30,
            marginBottom: 20,
            marginRight: 15,
            y: {
                grid: true,
                domain: [0, 100],
                // type: 'log',
                // tickFormat: ((f) => (x) => f((x - 1) * 100))(d3.format("+d"))
            },
            x: {
                domain: [0, appOptions.dataLength]
            },
            marks: [
                Plot.frame(),
                appOptions.showPerceptual ?
                    Plot.lineY(perceptualSpreadArray, {
                        curve: "natural",
                        stroke: appOptions.colorPerceptual,
                    }) : null,

                appOptions.showSpectral ?
                    Plot.lineY(spectralArray, {
                        curve: "natural",
                        stroke: appOptions.colorSpectral,
                    }) : null,

                appOptions.showRms ?
                    Plot.lineY(rmsArray, {
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

    return (
        <div>
            <div className='legendContainer'>
                <div className='legendItem'>
                    <div className='legendSwatch' style={{ background: appOptions.colorSpectral }}></div>
                    <div className='legendText'>Spectral Centroid</div>
                </div>
                <div className='legendItem'>
                    <div className='legendSwatch' style={{ background: appOptions.colorRms }}></div>
                    <div className='legendText'>Root Mean Square</div>
                </div>
                <div className='legendItem'>
                    <div className='legendSwatch' style={{ background: appOptions.colorPerceptual }}></div>
                    <div className='legendText'>Perceptual Spread</div>
                </div>
            </div>
            <div ref={plotRef} style={{ background: 'linear-gradient(to right, #2c8daa, #cb3487)', color: 'white' }} />
        </div>
    )
}