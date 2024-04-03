export const calculateFirstFormantFrequency = (dataArray: Float32Array, sampleRate: number) => {
    let peakIndex = 0;
    let peakValue = -Infinity;
    for (let i = 0; i < dataArray.length; i++) {
        if (dataArray[i] > peakValue) {
            peakValue = dataArray[i];
            peakIndex = i;
        }

        // console.log("First formant frequency:", firstFormantFrequency.toFixed(2), "Hz");
    }
    const firstFormantFrequency = (peakIndex * sampleRate) / dataArray.length;
    return firstFormantFrequency;
}

export const movingWindowFilter = (data: number[], averageTicks: number) => {
    const dataSum = [0];
    for (let i = 0; i < data.length; i++) {
        dataSum[i + 1] = dataSum[i] + data[i];
    }

    return dataSum.slice(30).map((value, index) =>
        (value - dataSum[index]) / averageTicks);
}