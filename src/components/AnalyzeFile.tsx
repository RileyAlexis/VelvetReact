import React, { useState, useRef } from "react";
import meyda from "meyda";
import { MeydaAnalyzer } from "meyda/dist/esm/meyda-wa";

export const AnalyzeFile: React.FC = ({ setRms, setSpectral }) => {

    const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
    const [mediaStreamSource, setMediaStreamSource] = useState<MediaStreamSourceNode | null>(null);
    const [meydaAnalyzer, setMeydaAnalyzer] = useState<MeydaAnalyzer | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
            setAudioContext(audioContextRef.current);
        }

        try {
            let source: AudioBufferSourceNode | null = null;


            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

            source = audioContextRef.current.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioContextRef.current.destination);
            source.start();
            setMediaStreamSource(source);

            const analyzer = meyda.createMeydaAnalyzer({
                audioContext: audioContextRef.current,
                source: source,
                bufferSize: 512,
                featureExtractors: ['rms', 'spectralCentroid'],
                callback: (features: Meyda.MeydaFeaturesObject) => {
                    setRms(features.rms);
                    setSpectral(features.spectralCentroid);
                }
            });
            analyzer.start();
            setMeydaAnalyzer(analyzer);
            // onAnalysisStart();
        } catch (error) {
            console.error('Error decoding audio file', error);
        }
    };

    return (
        <div>
            <input type='file' accept="audio/*" onChange={handleFileChange} />
        </div>
    )
}