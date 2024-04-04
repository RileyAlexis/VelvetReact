export interface AppOptions {
    averageTicks: number,
    plotHorizAxis: number,
    showSpectral: boolean,
    colorSpectral: string,
    showRms: boolean,
    colorRms: string,
    showPerceptual: boolean,
    colorPerceptual: string,
    showYin: boolean,
    colorYin: string,
    showFirstFormant: boolean,
    colorFirstFormant: string,
    dataLength: number,
}

export interface AudioData {
    formantFrequency: number[],
    yinFrequency: number[],
}