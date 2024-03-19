export interface AppOptions {
    averageTicks: number,
    plotHorizAxis: number,
    showSpectral: boolean,
    colorSpectral: string,
    showRms: boolean,
    colorRms: string,
}

export interface AudioData {
    rms: number[] | null,
    spectralCentroid: number[] | null,
    amplitudeSpectrum: Float32Array[] | null,
}