import meyda from 'meyda';

import { calculateFirstFormantFrequency, movingWindowFilter } from './audioProcesses';
import { yin } from '../modules/yinIFFEE';

import { AudioData } from "../interfaces"

function isAudioBufferSourceNode(node: any): node is AudioBufferSourceNode {
    return node instanceof AudioBufferSourceNode;
}

export const startAnalyzer = async (
    audioContext: AudioContext,
    source: MediaStreamAudioSourceNode | AudioBufferSourceNode,
    setAudioData: Function
): Promise<void> => {

    let smallYinArray = [];
    let smallFormantArray = [];

    //if audio source is mic
    if (!isAudioBufferSourceNode(source)) {
        //Mic analysis code
        //Set low pass filter to reduce noise
        const lowpass = audioContext.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 300; // Set the cutoff frequency
        lowpass.Q.value = 1;

        const highpass = audioContext.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 60;

        //Connect high and lowpass filters to audio node
        source.connect(lowpass);
        lowpass.connect(highpass);

        //Create meyda Analyzer - provides processing and callback function
        //for audio analysis
        const analyzer = meyda.createMeydaAnalyzer({
            audioContext: audioContext,
            source: highpass,
            bufferSize: 4096,
            featureExtractors: ['buffer', 'amplitudeSpectrum', 'mfcc'],
            callback: (features: Meyda.MeydaFeaturesObject) => {

                const dataArray = new Float32Array(features.buffer);
                smallYinArray.push(yin(dataArray, audioContext.sampleRate, 0.05));
                smallFormantArray.push(calculateFirstFormantFrequency(features.amplitudeSpectrum, audioContext.sampleRate));

                if (smallYinArray.length >= 500) {
                    smallYinArray = smallYinArray.slice(-500);
                }
                if (smallFormantArray.length >= 500) {
                    smallFormantArray = smallFormantArray.slice(-500);
                }

                const newYinArray = movingWindowFilter(smallYinArray, 30);
                const newFormantArray = movingWindowFilter(smallFormantArray, 30);
                setAudioData({ yinFrequency: newYinArray, formantFrequency: newFormantArray });
            }
        });

        analyzer.start();

        // else if audio source is file
    } else if (isAudioBufferSourceNode(source)) {
        //File analysis code
    } //end isAudioBufferSourceNode else if statement



}