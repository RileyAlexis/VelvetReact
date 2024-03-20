export interface AppOptions {
    averageTicks: number,
    plotHorizAxis: number,
    showSpectral: boolean,
    colorSpectral: string,
    showRms: boolean,
    colorRms: string,
    showPerceptual: boolean,
    colorPerceptual: string,
    dataLength: number,
}

export interface AudioData {
    time: number,
    rms: number,
    spectralCentroid: number,
    perceptualSpread: number,
}