import React, { useRef, useEffect, useState } from 'react';
import * as Plot from '@observablehq/plot';
import { AppOptions, AudioData } from '../interfaces';

interface SpectralChartProps {
    appOptions: AppOptions,
    audioData: AudioData
}


export const SpectralPlot: React.FC<SpectralChartProps> =
    ({ appOptions, audioData }) => {

        const plotRef = useRef<HTMLDivElement | null>(null);
        const width: number = window.innerWidth - 50;
        const [height, setHeight] = useState<number>(window.innerHeight * 0.75);

        //Sets the height of the chart dynamically for use in mobile portrait view
        useEffect(() => {
            if (plotRef.current) setHeight(plotRef.current.clientHeight);
        }, [plotRef.current])

        useEffect(() => {
            // console.log(spectralArray.length);
            // console.log(rmsArray.length);
            // console.log(perceptualSpreadArray.length);
            // console.log(powerSpectrumArray);
            // console.log(yinFrequencyArray);
        }, [])

        useEffect(() => {
            if (audioData === undefined) return;
            console.log(audioData.averageYin);
            const plot = Plot.plot({
                marginTop: 5,
                marginLeft: 30,
                marginBottom: 20,
                marginRight: 15,
                y: {
                    grid: true,
                    domain: [0, 800],
                    // type: 'log',
                    // tickFormat: ((f) => (x) => f((x - 1) * 100))(d3.format("+d"))
                },
                x: {
                    domain: [0, appOptions.dataLength]
                },
                marks: [
                    Plot.frame(),

                    appOptions.showYin ?
                        Plot.lineY(audioData.yinFrequency, {
                            curve: "natural",
                            stroke: appOptions.colorYin,
                        }) : null,

                    appOptions.showFirstFormant ?
                        Plot.lineY(audioData.formantFrequency, {
                            curve: "natural",
                            stroke: appOptions.colorFirstFormant,
                        }) : null,

                    audioData.averageYin > 0 ?
                        Plot.text([0, 0], {
                            text: ["Avg Base\n\n", audioData.averageYin],
                            dx: -50,
                            dy: 200,
                            frameAnchor: "right",
                            textAnchor: "middle",
                            lineAnchor: "middle",

                            fill: appOptions.colorYin, fontSize: 20

                        }) : null,

                    audioData.averageFormant > 0 ?
                        Plot.text([0, 0], {
                            text: ["Avg Formant\n\n", audioData.averageFormant],
                            dx: -60,
                            dy: -150,
                            frameAnchor: "right",
                            textAnchor: "middle",
                            lineAnchor: "middle",
                            fill: appOptions.colorFirstFormant, fontSize: 20,
                        }) : null,


                    // Plot.text([[-0.5, 4]], { text: ["Southbound"], textAnchor: "end", dx: -16 }),
                ],
                width: width,
                height: height,
            })

            plotRef.current.append(plot);

            return () => plot.remove();
        }, [audioData]);

        return (
            <div className='plotBox'>
                <div className='legendContainer'>
                    {appOptions.showFirstFormant &&
                        <div className='legendItem'>
                            <div
                                className='legendSwatch'
                                style={{ background: appOptions.colorFirstFormant }}></div>
                            <div className='legendText'>Formant Frequency</div>
                        </div>
                    }
                    {appOptions.showYin &&
                        <div className='legendItem'>
                            <div
                                className='legendSwatch'
                                style={{ background: appOptions.colorYin }}></div>
                            <div
                                className='legendText'>Base Frequency</div>
                        </div>
                    }
                    {appOptions.showSpectral &&
                        <div className='legendItem'>
                            <div
                                className='legendSwatch'
                                style={{ background: appOptions.colorSpectral }}></div>
                            <div className='legendText'>Spectral Centroid</div>
                        </div>
                    }
                    {appOptions.showRms &&
                        <div className='legendItem'>
                            <div
                                className='legendSwatch'
                                style={{ background: appOptions.colorRms }}></div>
                            <div className='legendText'>RMS</div>
                        </div>
                    }
                    {appOptions.showPerceptual &&
                        <div className='legendItem'>
                            <div
                                className='legendSwatch'
                                style={{ background: appOptions.colorPerceptual }}></div>
                            <div
                                className='legendText'>Perceptual Spread</div>
                        </div>
                    }

                </div>

                <div ref={plotRef} />
            </div>
        )
    }