import React from "react";

export const AboutText: React.FC = () => {
    return (
        <div className="aboutContainer">
            <h1>Velvet</h1>
            <h2>A Voice Resonance Analyzer</h2>
            <p>
                Velvet grew out of a need for a more accurate, free and open source voice analysis
                application that could also be trustworthy. This application is intended to assist
                trans feminine people in voice training by providing data driven feedback in real time.
                This application is free and always will be. It collects no data and does not communicate with any other services.
            </p>


            <h3>Frequencies</h3>
            <p>
                Velvet isolates the
                <a target="_blank" href="https://en.wikipedia.org/wiki/Fundamental_frequency">Fundamental Frequency</a>
                and the
                <a target="_blank" href="https://en.wikipedia.org/wiki/Formant">First Formant Frequency</a>
                from an audio
                stream. This information should give an accurate estimate of the range
                of frequencies in a human voice.
            </p>
            <p>
                <a target="_blank" href="https://github.com/RileyAlexis/VelvetReact">Source Code on Github</a>
            </p>
        </div>
    )
}