import React, { useState, useRef, useEffect } from "react";
import meyda from "meyda";
import { MeydaAnalyzer } from "meyda/dist/esm/meyda-wa";

export const AnalyzeFile: React.FC = ({ setRms, setSpectral }) => {

    const [mediaStreamSource, setMediaStreamSource] = useState<MediaStreamAudioSourceNode | null>(null);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [meydaAnalyzer, setMeydaAnalyzer] = useState<MeydaAnalyzer | null>(null);

    const audioFile = useRef<File>(null);

    // let audioFile: File;

    const audioContextRef = useRef<AudioContext | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('File Uploaded');
            audioFile.current = file;
            startRecording();
        }
    }

    const startRecording = async () => {

        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
        }

        if (!isRecording) {
            try {
                audioContextRef.current?.resume();
                let source: AudioBufferSourceNode | null = null;

                const arrayBuffer = await audioFile.current?.arrayBuffer();
                const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);

                source = audioContextRef.current.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(audioContextRef.current.destination);

                source.addEventListener('ended', () => {
                    audioContextRef.current!.suspend();
                    console.log('Ended event triggered');
                    setIsRecording(false);
                });

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
                setIsRecording(true);
            } catch (error) {
                console.error('Error decoding audio file', error);
            }
        }
    };

    const handleStopRecording = () => {
        if (mediaStreamSource) {
            mediaStreamSource.disconnect();
        }
        if (meydaAnalyzer) {
            meydaAnalyzer.stop();
        }
        setIsRecording(false);
    }

    useEffect(() => {
        console.log('Current Audio Context State', audioContextRef.current?.state);
    }, [audioContextRef.current?.state]);

    return (
        <div>
            <input type='file' accept="audio/*" onChange={handleFileUpload} />
            <button onMouseDown={() => startRecording()} disabled={isRecording}>Start Playing</button>
            <button onMouseDown={handleStopRecording} disabled={!isRecording}>Stop Playing</button>
            <span>{JSON.stringify(isRecording)}</span>
        </div>
    )
}