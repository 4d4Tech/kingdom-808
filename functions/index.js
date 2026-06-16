const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { getStorage } = require("firebase-admin/storage");
const { FieldValue } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");
const path = require("path");
const os = require("os");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

// Initialize admin app if not already initialized
const admin = require("firebase-admin");
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * Phase 2: The Refinery Pipeline
 */
exports.refineryPipeline = onObjectFinalized(async (event) => {
  const fileBucket = event.data.bucket;
  const filePath = event.data.name;
  const contentType = event.data.contentType;

  if (!filePath.startsWith("raw_audio/")) return;
  if (!contentType.startsWith("audio/")) return logger.log("Not an audio file.");

  const fileName = path.basename(filePath);
  const userId = filePath.split("/")[1]; 
  const bucket = getStorage().bucket(fileBucket);
  
  const tempFilePath = path.join(os.tmpdir(), fileName);
  const outputFileName = `${path.parse(fileName).name}.mp3`;
  const outputFilePath = path.join(os.tmpdir(), outputFileName);
  
  await bucket.file(filePath).download({ destination: tempFilePath });

  return new Promise((resolve, reject) => {
    const waveformData = Array.from({ length: 100 }, () => Math.max(0.1, Math.random()));
    
    ffmpeg(tempFilePath)
      .audioCodec('libmp3lame')
      .audioBitrate('128k')
      .on('end', async () => {
        const destination = `processed_audio/${userId}/${outputFileName}`;
        await bucket.upload(outputFilePath, {
          destination: destination,
          metadata: { contentType: 'audio/mpeg', metadata: { waveform: JSON.stringify(waveformData) } }
        });
        
        fs.unlinkSync(tempFilePath);
        fs.unlinkSync(outputFilePath);
        resolve();
      })
      .on('error', (err) => {
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        if (fs.existsSync(outputFilePath)) fs.unlinkSync(outputFilePath);
        reject(err);
      })
      .save(outputFilePath);
  });
});

/**
 * Phase 3: Social Fan-Out (Push new releases to followers' feeds)
 */
exports.fanOutRelease = onDocumentCreated("tracks/{trackId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;

  const trackData = snapshot.data();
  const artistId = trackData.userId;
  
  const followersSnap = await db.collection("users").doc(artistId).collection("followers").get();
  const batch = db.batch();
  
  followersSnap.forEach(doc => {
    const followerId = doc.id;
    const feedRef = db.collection("users").doc(followerId).collection("feed").doc(event.params.trackId);
    batch.set(feedRef, {
      trackId: event.params.trackId,
      artistId: artistId,
      timestamp: FieldValue.serverTimestamp(),
      genre: trackData.genre || "Unknown"
    });
  });
  
  await batch.commit();
  logger.log(`Fanned out track ${event.params.trackId} to ${followersSnap.size} followers.`);
});

/**
 * Phase 3: Manifestation Math (Sharded Counters increment)
 */
const NUM_SHARDS = 10;
exports.incrementPlayCount = onCall(async (request) => {
  const trackId = request.data?.trackId;
  if (!trackId) throw new HttpsError('invalid-argument', 'The function must be called with a trackId.');

  const shardId = Math.floor(Math.random() * NUM_SHARDS).toString();
  const shardRef = db.collection("tracks").doc(trackId).collection("shards").doc(shardId);

  await shardRef.set({ playCount: FieldValue.increment(1) }, { merge: true });
  return { success: true, shardId };
});

/**
 * Phase 3: Billboard Charts Aggregation
 */
exports.aggregateBillboardCharts = onSchedule("every sunday 00:00", async () => {
  const tracksSnap = await db.collection("tracks").get();
  const genreCharts = {};

  for (const trackDoc of tracksSnap.docs) {
    const track = trackDoc.data();
    const shardsSnap = await trackDoc.ref.collection("shards").get();
    let totalPlays = 0;
    shardsSnap.forEach(shard => {
      totalPlays += shard.data().playCount || 0;
    });

    const genre = track.genre || 'Unknown';
    if (!genreCharts[genre]) genreCharts[genre] = [];
    
    genreCharts[genre].push({
      trackId: trackDoc.id,
      plays: totalPlays,
      title: track.title,
      artistId: track.userId
    });
  }

  const batch = db.batch();
  for (const [genre, tracks] of Object.entries(genreCharts)) {
    tracks.sort((a, b) => b.plays - a.plays);
    const top50 = tracks.slice(0, 50);
    
    const chartRef = db.collection("charts").doc(genre);
    batch.set(chartRef, {
      updatedAt: FieldValue.serverTimestamp(),
      rankings: top50
    });
  }

  await batch.commit();
  logger.log("Billboard charts aggregated successfully.");
});
