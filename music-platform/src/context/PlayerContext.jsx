import { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

const PlayerContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL;

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(new Audio());
  const queueRef = useRef([]);
  const loadingRef = useRef(false);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [playMode, setPlayMode] = useState('normal');
  const [streamError, setStreamError] = useState(null);

  const handleTrackEndRef = useRef(() => {});

  const updateMediaSession = useCallback((track) => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.metadata = new window.MediaMetadata({
      title: track.title,
      artist: track.artist,
      artwork: track.thumbnail_url
        ? [{ src: track.thumbnail_url, sizes: '512x512', type: 'image/jpeg' }]
        : [],
    });

    navigator.mediaSession.setActionHandler('play', () => playAudio());
    navigator.mediaSession.setActionHandler('pause', () => pauseAudio());
    navigator.mediaSession.setActionHandler('previoustrack', () => handlePrev());
    navigator.mediaSession.setActionHandler('nexttrack', () => handleNext());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) seekTo(details.seekTime);
    });
  }, []);

  const fetchStreamUrl = async (externalId) => {
    const res = await fetch(`${API_URL}/search/stream/${externalId}/`);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Stream error ${res.status}`);
    }
    return res.json();
  };

  const playTrack = useCallback(async (track, queue = null) => {
    if (!track || loadingRef.current) return;

    if (queue) queueRef.current = queue;

    const audio = audioRef.current;

    if (currentTrack?.external_id === track.external_id) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      return;
    }

    loadingRef.current = true;
    setStreamError(null);
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(0);

    try {
      const data = await fetchStreamUrl(track.external_id);
      audio.src = data.audio_url;
      audio.playbackRate = playbackRate;
      await audio.play();
      setIsPlaying(true);
      updateMediaSession(track);
    } catch (e) {
      console.error('Failed to play track', e);
      setStreamError('Не удалось воспроизвести трек');
      setIsPlaying(false);
      handleTrackEndRef.current();
    } finally {
      loadingRef.current = false;
    }
  }, [currentTrack, isPlaying, playbackRate, updateMediaSession]);

  const playAudio = () => {
    audioRef.current.play();
    setIsPlaying(true);
  };

  const pauseAudio = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const seekTo = (time) => {
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const changeSpeed = () => {
    const rates = [1, 1.25, 1.5, 2];
    const nextIndex = (rates.indexOf(playbackRate) + 1) % rates.length;
    const newRate = rates[nextIndex];
    audioRef.current.playbackRate = newRate;
    setPlaybackRate(newRate);
  };

  const togglePlayMode = () =>
    setPlayMode((prev) => (prev === 'normal' ? 'repeat' : prev === 'repeat' ? 'shuffle' : 'normal'));

  const getQueueIndex = (track) =>
    queueRef.current.findIndex((t) => t.external_id === track.external_id);

  const handleNext = useCallback(() => {
    const queue = queueRef.current;
    if (!currentTrack || queue.length === 0) return;
    let idx = getQueueIndex(currentTrack);
    if (idx === -1) idx = 0;
    const nextIdx =
      playMode === 'shuffle'
        ? Math.floor(Math.random() * queue.length)
        : (idx + 1) % queue.length;
    playTrack(queue[nextIdx]);
  }, [currentTrack, playMode, playTrack]);

  const handlePrev = useCallback(() => {
    const queue = queueRef.current;
    if (!currentTrack || queue.length === 0) return;
    let idx = getQueueIndex(currentTrack);
    if (idx === -1) idx = 0;
    const prevIdx =
      playMode === 'shuffle'
        ? Math.floor(Math.random() * queue.length)
        : idx > 0 ? idx - 1 : queue.length - 1;
    playTrack(queue[prevIdx]);
  }, [currentTrack, playMode, playTrack]);

  useEffect(() => {
    handleTrackEndRef.current = () => {
      const audio = audioRef.current;
      if (playMode === 'repeat') {
        audio.currentTime = 0;
        audio.play();
        return;
      }
      handleNext();
    };
  }, [playMode, handleNext]);

  useEffect(() => {
    const audio = audioRef.current;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      handleTrackEndRef.current();
    };
    const onError = () => {
      console.error('Audio playback error');
      setStreamError('Ошибка воспроизведения');
      handleTrackEndRef.current();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const formatTime = (sec) => {
    if (!sec || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        playbackRate,
        playMode,
        progressPercent,
        streamError,
        playTrack,
        playAudio,
        pauseAudio,
        seekTo,
        handleNext,
        handlePrev,
        changeSpeed,
        togglePlayMode,
        formatTime,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);