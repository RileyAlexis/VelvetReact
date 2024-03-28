# Velvet
## A Voice Resonance Analyzer

### About

Velvet grew out of a need for a more accurate, free and open source voice analysis
application that could also be trustworthy. This application is intended to assist
trans feminine people in voice training by providing data driven feedback in real time. 
This application is free as in speech and as in beer and always will be. It collects no data and does not communicate with any other services. 

### Technical

#### Frequencies
Velvet isolates the [Fundamental Frequency](https://en.wikipedia.org/wiki/Fundamental_frequency) and the [First Formant Frequency](https://en.wikipedia.org/wiki/Formant) from an audio stream. This information should give an accurate estimate of the range
of frequencies in a human voice. 

#### Filters
Currently a lowpass filter is applied at 300hz and a highpass filter at 30hz. This assists
in filtering out background noise and sounds not in the standard vocal range. These settings may be updatable in a future version. 

#### Other Values
The app currently provides the [Root Mean Square](https://en.wikipedia.org/wiki/Root_mean_square), or loudness, the [Spectral Centroid](https://en.wikipedia.org/wiki/Spectral_centroid), and the [Perceptual Spread](https://meyda.js.org/audio-features). These are primarily testing features while the application is in development and may be removed from future versions. Spectral Centroid in particular may provide misleading feedback to users as it accentuates [plosives](https://en.wikipedia.org/wiki/Plosive) and [fricatives](https://en.wikipedia.org/wiki/Fricative).

### FAQ

Velvet is not currently capable of recording(saving) the audio signal. In the future the option for saving audio locally may be implemented. This application will not be hosting any data via a database. 

The file upload functionality is not yet implemented. This will create the capability to upload audio samples for analysis. The samples will not be saved and must be re-uploaded with each analysis. 

### Deployed Application

The current deployed version of Velvet can be found at https://velvet.rileyalexis.com.