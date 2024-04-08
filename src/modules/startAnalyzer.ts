import meyda from 'meyda';

import { calculateFirstFormantFrequency, movingWindowFilter } from './audioProcesses';
import { yin } from '../modules/yinIFFEE';

import { AppOptions, AudioData } from "../interfaces"
import { MeydaAnalyzer } from 'meyda/dist/esm/meyda-wa';

let stopMeydaAnalyzer: (() => void) | null = null;
let stopMeydaFileAnalyzer: (() => void) | null = null;



function isAudioBufferSourceNode(node: any): node is AudioBufferSourceNode {
    return node instanceof AudioBufferSourceNode;
}

//Supplies session averages displayed on the plot
function calculateAverage(numbers: number[]): number {
    if (numbers.length === 0) {
        return 0;
    }
    const sum = numbers.reduce((acc, curr) => acc + curr, 0);
    return sum / numbers.length;
}

export const startAnalyzer = async (
    audioContext: AudioContext,
    source: MediaStreamAudioSourceNode | AudioBufferSourceNode,
    setAudioData: Function,
    appOptions: AppOptions,
): Promise<void> => {


    let smallYinArray = [];
    let averageYinArray = [];
    let smallFormantArray = [];
    let averageFormantArray = [];

    //This is the meyda callback funtion that processes data from meyda festures
    const analyzeAudioSignal = (features: Meyda.MeydaFeaturesObject): void => {
        const dataArray = new Float32Array(features.buffer);
        const yinValue = yin(dataArray, audioContext.sampleRate, 0.05);

        if (yinValue) {
            smallYinArray.push(yinValue);
            averageYinArray.push(yinValue);
        }
        const formantValue = calculateFirstFormantFrequency(features.amplitudeSpectrum, audioContext.sampleRate);
        if (formantValue) {
            smallFormantArray.push(formantValue);
            averageFormantArray.push(formantValue);
        }
        if (smallYinArray.length >= appOptions.dataLength) {
            smallYinArray = smallYinArray.slice(-appOptions.dataLength);
        }
        if (smallFormantArray.length >= appOptions.dataLength) {
            smallFormantArray = smallFormantArray.slice(-appOptions.dataLength);
        }
        const newYinArray = movingWindowFilter(smallYinArray, appOptions.averageTicks);
        const newFormantArray = movingWindowFilter(smallFormantArray, appOptions.averageTicks);
        const runningYinAvg = calculateAverage(averageYinArray);
        const runningFormant = calculateAverage(averageFormantArray);

        setAudioData({
            yinFrequency: newYinArray,
            averageYin: runningYinAvg,
            formantFrequency: newFormantArray,
            averageFormant: runningFormant
        });
    }

    //if audio source is mic
    if (!isAudioBufferSourceNode(source)) {
        //Mic analysis code
        //Set low pass filter to reduce noise
        const lowpass: BiquadFilterNode = audioContext.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 300; // Set the cutoff frequency
        lowpass.Q.value = 1;

        const highpass: BiquadFilterNode = audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 60;

        //Connect high and lowpass filters to audio node
        source.connect(lowpass);
        lowpass.connect(highpass);

        //Create meyda Analyzer - provides processing and callback function
        //for audio analysis
        const analyzer: MeydaAnalyzer = meyda.createMeydaAnalyzer({
            audioContext: audioContext,
            source: highpass,
            bufferSize: 4096,
            featureExtractors: ['buffer', 'amplitudeSpectrum', 'mfcc'],
            callback: (features: Meyda.MeydaFeaturesObject) => {
                analyzeAudioSignal(features);
            }
        });

        analyzer.start();
        // analyzer.setSource()

        stopMeydaAnalyzer = () => {
            analyzer.stop();
        }

        // else if audio source is file
    } else if (isAudioBufferSourceNode(source)) {
        //File analysis code
        source.connect(audioContext.destination);

        const lowpass: BiquadFilterNode = audioContext.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 300; // Set the cutoff frequency
        lowpass.Q.value = 1;

        const highpass: BiquadFilterNode = audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 60;

        //Connect high and lowpass filters to audio node
        source.connect(lowpass);
        lowpass.connect(highpass);

        const fftAnalyzer = audioContext.createAnalyser();
        fftAnalyzer.fftSize = 4096;
        highpass.connect(fftAnalyzer);
        source.start();

        const fileMeydaAnalyzer: MeydaAnalyzer = meyda.createMeydaAnalyzer({
            audioContext: audioContext,
            source: fftAnalyzer,
            bufferSize: 4096,
            featureExtractors: ['buffer', 'amplitudeSpectrum'],
            callback: (features: Meyda.MeydaFeaturesObject) => {
                analyzeAudioSignal(features);
            }
        });

        fileMeydaAnalyzer.start();

        stopMeydaAnalyzer = () => {
            fileMeydaAnalyzer.stop();
        }

        source.addEventListener('ended', async () => {
            const handleFileEnd = () => {
                source.removeEventListener('ended', handleFileEnd);
            }
            console.log('Ended event triggered');
            callStopAnalyzer();
            await audioContext.suspend();
            fftAnalyzer.disconnect();
            lowpass.disconnect();
            highpass.disconnect();

        });


    } //end isAudioBufferSourceNode else if statement
}

export const callStopAnalyzer = () => {
    stopMeydaAnalyzer();
}

export const callStopFileAnalyzer = () => {
    stopMeydaFileAnalyzer();
}