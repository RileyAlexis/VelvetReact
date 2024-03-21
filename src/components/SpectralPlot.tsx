import React, { useRef, useEffect, useState } from 'react';
import * as Plot from '@observablehq/plot';
import { AppOptions } from '../interfaces';

interface SpectralChartProps {
    appOptions: AppOptions,
    spectralArray: number[],
    rmsArray: number[],
    perceptualSpreadArray: number[],
}


export const SpectralPlot: React.FC<SpectralChartProps> =
    ({ appOptions, spectralArray, rmsArray, perceptualSpreadArray }) => {

        const plotRef = useRef<HTMLDivElement | null>(null);
        const width: number = window.innerWidth - 50;
        const [height, setHeight] = useState<number>(window.innerHeight * 0.75);

        useEffect(() => {
            if (plotRef.current) setHeight(plotRef.current.clientHeight);
        }, [plotRef.current])

        useEffect(() => {
            // console.log(spectralArray.length);
            // console.log(rmsArray.length);
            // console.log(perceptualSpreadArray.length);
        }, [spectralArray])

        useEffect(() => {
            if (spectralArray === undefined) return;

            const plot = Plot.plot({
                marginTop: 5,
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
            <div className='plotBox'>
                <div className='legendContainer'>
                    <div className='legendItem'>
                        <div
                            className='legendSwatch'
                            style={{ background: appOptions.colorSpectral }}></div>
                        <div className='legendText'>Spectral Centroid</div>
                    </div>
                    <div className='legendItem'>
                        <div
                            className='legendSwatch'
                            style={{ background: appOptions.colorRms }}></div>
                        <div className='legendText'>Root Mean Square</div>
                    </div>
                    <div className='legendItem'>
                        <div
                            className='legendSwatch'
                            style={{ background: appOptions.colorPerceptual }}></div>
                        <div
                            className='legendText'>Perceptual Spread</div>
                    </div>
                </div>

                <div ref={plotRef} />
            </div>
        )
    }