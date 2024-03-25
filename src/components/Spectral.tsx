import React, { useRef, useEffect } from "react";
import AudioMotionAnalyzer from 'audiomotion-analyzer';

export const Spectral: React.FC = () => {
    const containerRef = useRef(null);
    const audioRef = useRef(null);
    let audioMotion;

    useEffect(() => {
        if (!containerRef.current || !audioRef.current) return;

        audioMotion = new AudioMotionAnalyzer(containerRef.current, {
            source: audioRef.current,
        });

        return () => {
            // Clean up the audioMotion instance
            if (audioMotion) {
                audioMotion.destroy();
                audioMotion = null;
            }
        };
    }, []);

    return (
        <div>
            <div ref={containerRef}></div>
            <audio
                ref={audioRef}
                id="audio"
                src="your_audio_file.mp3"
                controls
            ></audio>
        </div>
    );

}