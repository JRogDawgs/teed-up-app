import { Audio } from 'expo-av';
import { ScoreType } from '../types/game';

let soundEnabled = true;

export const toggleSound = () => {
  soundEnabled = !soundEnabled;
  return soundEnabled;
};

export const isSoundEnabled = () => soundEnabled;

const playSound = async (soundFile: any) => {
  if (!soundEnabled) return;

  try {
    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate(async (status) => {
      if (status.didJustFinish) {
        await sound.unloadAsync();
      }
    });
  } catch (error) {
    console.error('Error playing sound:', error);
  }
};

export const playScoreSound = async (scoreType: ScoreType) => {
  switch (scoreType) {
    case 'Birdie':
      // TODO: Add actual sound files
      await playSound(require('../assets/sounds/birdie.mp3'));
      break;
    case 'Eagle':
      await playSound(require('../assets/sounds/eagle.mp3'));
      break;
    case 'Par':
      await playSound(require('../assets/sounds/par.mp3'));
      break;
    case 'Bogey':
    case 'Double Bogey':
    case 'Triple Bogey':
      await playSound(require('../assets/sounds/bogey.mp3'));
      break;
  }
}; 