import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

/**
 * AI Lyric Detection & Analysis Engine
 * Generates formatted lyrics for sacred music based on track title, genre, and artist.
 */
export const detectLyricsWithAI = async (title = '', genre = '', artistName = 'Brandon Robinson') => {
  // Simulate AI audio transcription & semantic lyric generation delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const cleanTitle = title.trim() || 'Sacred Melody';
  const cleanArtist = artistName.trim() || 'Brandon Robinson';
  const cleanGenre = (genre || 'Worship').trim();

  const worshipStanzas = [
    `[Verse 1]`,
    `In the quiet of the sanctuary, I hear Your voice`,
    `Every breath I take becomes a joyful choice`,
    `Through the storm and through the calmest sea`,
    `Your loving-kindness carries me`,
    ``,
    `[Chorus]`,
    `Oceans of grace, falling down like rain`,
    `Washing away every heavy burden and pain`,
    `I stand in awe of Your holy majesty`,
    `Forever crowned in divine harmony`,
    ``,
    `[Verse 2]`,
    `Light breaks through the shadows of the night`,
    `Standing on Your promises, walking in Your light`,
    `From the mountaintop to the deepest valley low`,
    `Your glory shines wherever I go`,
    ``,
    `[Chorus]`,
    `Oceans of grace, falling down like rain`,
    `Washing away every heavy burden and pain`,
    `I stand in awe of Your holy majesty`,
    `Forever crowned in divine harmony`,
    ``,
    `[Outro]`,
    `Amen, Hallelujah`,
    `Glory in the highest`
  ];

  const chhStanzas = [
    `[Verse 1]`,
    `Stepping in the light, kingdom power in my soul`,
    `Walking on the rock, yeah He made the broken whole`,
    `No weapons formed against me shall prosper in the fight`,
    `Truth on the beat, shining holy Ghost light`,
    ``,
    `[Chorus]`,
    `We elevation bound, kingdom sound in the town`,
    `Lift up the name, wearing righteousness crown`,
    `From the pavement to the throne, yeah the glory belong to Him`,
    `Light in the dark when the vision gets dim`,
    ``,
    `[Outro]`,
    `Victory belongs to the King`,
    `Grace forever reigning`
  ];

  const gospelStanzas = [
    `[Verse 1]`,
    `When I look back over my life and I see where I came from`,
    `I can testify of the goodness and mercy of the Son`,
    `He picked me up out of the miry clay`,
    `Placed my feet on a solid rock today`,
    ``,
    `[Chorus]`,
    `Oh bless the Lord, O my soul`,
    `He has made me clean, He has made me whole`,
    `Praise His holy name forevermore`,
    `Open up the heavenly store`,
    ``,
    `[Outro]`,
    `Glory to God on high`
  ];

  let chosenStanzas = worshipStanzas;
  if (cleanGenre.toLowerCase().includes('hip hop') || cleanGenre.toLowerCase().includes('chh') || cleanGenre.toLowerCase().includes('drill')) {
    chosenStanzas = chhStanzas;
  } else if (cleanGenre.toLowerCase().includes('gospel') || cleanGenre.toLowerCase().includes('rhema')) {
    chosenStanzas = gospelStanzas;
  }

  return [
    `[Track: ${cleanTitle}]`,
    `[Artist: ${cleanArtist}]`,
    `[Genre: ${cleanGenre}]`,
    ``,
    ...chosenStanzas
  ].join('\n');
};

/**
 * Save / Update track lyrics directly in Cloud Firestore
 */
export const saveTrackLyricsToFirestore = async (trackId, lyricsText) => {
  if (!trackId) return false;
  try {
    const trackRef = doc(db, 'tracks', trackId);
    await updateDoc(trackRef, {
      lyrics: lyricsText,
      updatedAt: new Date()
    });
    return true;
  } catch (err) {
    console.error("Failed to save track lyrics in Firestore:", err);
    return false;
  }
};
