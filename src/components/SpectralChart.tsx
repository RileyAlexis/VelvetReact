import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";

interface SpectralChartProps {
    spectral: number[]
}

export const SpectralChart: React.FC<SpectralChartProps> = () => {

    const [data, setData] = useState({
        labels: [],
        datasets: [
            {
                label: 'Data',
                data: [],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const newData = {
                labels: [...data.labels.slice(-10), new Date().toISOString().substring(17, 8)],
                datasets: [
                    {
                        ...data.datasets[0],
                        data: [...data.datasets[0].data.slice(-10), Math.floor(Math.random() * 100)],
                    },
                ],
            };
            setData(newData);
        }, 100);

        return () => clearInterval(interval);
    }, [data])

    return (
        <Line data={data} />
    )
}