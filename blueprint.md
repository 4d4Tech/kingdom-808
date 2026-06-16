# Kingdom 808: Architectural Blueprint & Antigravity Instructions
**Project Entity:** Developed with 4D4 Star Technology.  
**Objective:** To build "Kingdom 808", a unified Christian music ecosystem merging the independent artist empowerment of SoundCloud with the curated discovery, playlisting, and chart features of Spotify.

---
## IMPORTANT
The look, feel, and code samples of this app can be found in the mock-examples folder. the subdirectories contains an image and code samples for some of the important views in the application. 


## 1. Core Platform Synthesis (SoundCloud x Spotify)

### The SoundCloud DNA (Creator-First)
* **The Ingestion Ritual:** Direct-to-platform audio uploads (WAV/FLAC) via chunked Firebase Storage uploads.
* **The Waveform Witness:** Interactive HTML5 Canvas/Three.js audio waveforms generated from amplitude JSON arrays.
* **Social Resonance (The Feed):** Real-time, fan-out architecture pushing new track releases directly to followers' feeds under 2 seconds.
* **Direct Support:** Integrated tipping/donations and virtual show hosting capabilities for independent artists.

### The Spotify DNA (Listener-First)
* **Algorithmic & Curated Discovery:** "New Releases" radar and Billboard-style Top Charts based on "Manifestation Math" (streams/likes).
* **Deep Playlisting:** Users can create, share, and follow custom playlists. 
* **The Persistent Pulse:** A seamless, globally persistent audio player anchored to the UI footer that never unmounts during navigation.
* **Categorical Sovereignty:** Strict structural organization by the Seven Pillars (Genres) rather than lumping all into "Christian".

---

## 2. Technical Scaffolding (The Stack)

* **Front End:** React JS, Vanilla Javascript, CSS3
* **3D / Visual Integration:** Three.js, React Three Fiber, GSAP (Animations for 3D genre atmospheres and Waveform Witness).
* **Infrastructure & Backend:** Google Firebase
    * *Firestore:* Database for user profiles, track metadata, sharded play counters, and followers.
    * *Storage:* Asset bucket for raw `.wav` uploads and transcoded `.mp3` / `.m3u8` (HLS) segments.
    * *Hosting:* Deployment of the React SPA.
    * *Authentication:* User and Artist secure logins.
    * *Functions (Node.js):* Serverless logic for transcoding (using `fluent-ffmpeg`), fan-out feed population, and sharded counter aggregation.
* **AI Integration:** Google Gemini Products (For intelligent search routing, smart playlist generation, and dynamic metadata tagging).

---

## 3. Core Component Architecture

### A. Sanctuary Tagging Zone (Upload UI)
* **UX:** Drag-and-drop zone using React. 
* **Logic:** Forces users to tag uploads with one of the Seven Pillars: *Glowstep, Antha, Heirwave, ZionSoul, Rhema&B, ZionDrill, Upperground*.
* **Upload:** Direct client-to-storage via Firebase SDK.

### B. Refinery Cloud Function (Media Pipeline)
* **Trigger:** `google.storage.object.finalize`.
* **Execution:** Node.js downloads raw file to `/tmp`, processes via `fluent-ffmpeg` to create HLS streams and a JSON array of amplitude data for the Waveform Witness, uploads to Storage, and clears memory.

### C. The Persistent Pulse (Global Audio Engine)
* **Context:** `AudioProvider` wraps the React application.
* **State:** Holds `isPlaying`, `currentTrack`, and `queue`.
* **UI:** Fixed footer. GSAP handles smooth transitions when tracks change.

### D. 3D Genre Visualizer (Three.js + GSAP)
* **Implementation:** React Three Fiber renders dynamic visual backgrounds based on the active genre (e.g., high-energy particle physics for *Glowstep*, smooth shifting ambient planes for *Heirwave*). This will only be used when implementing the 3D Genre full immersive Visualizer feature.

### E. Manifestation Math (Sharded Counters)
* **Logic:** To prevent Firestore write bottlenecks on viral tracks, plays increment a random shard ($Total Plays = \sum_{i=1}^{n} shard_i$).

---

## 4. Execution Directives for Google Antigravity

**INITIATE DIRECTIVE: KINGDOM_808_MVP**
*Antigravity Agent, execute the following build sequence in order:*

### Phase 1: Environment & Firebase Scaffolding (The firebase web app config can be found in the firebase.js file located in the root project directory)
1.  **Initialize React Environment:** Create a new React application with Vite. Install dependencies: `firebase`, `three`, `@react-three/fiber`, `gsap`, `zustand` (for lightweight local state if needed alongside Context), and `uuid`.
2.  **Firebase Initialization:** Scaffold the Firebase project configuration (Auth, Firestore, Storage).
3.  **Define Security Rules:** Write Firestore rules restricting track document writes to `request.auth.uid == resource.data.userId`.
4.  **Set Up Cloud Functions:** Initialize the Node.js functions directory. Install `fluent-ffmpeg` and `@google-cloud/storage`.

### Phase 2: Media Pipeline & The Persistent Pulse
1.  **Construct `AudioProvider.jsx`:** Build the global context that maintains audio state. Implement the hidden `<audio>` element that persists across route changes.
2.  **Develop the Cloud Transcoder:** Write the `google.storage.object.finalize` function. Extract an 1800-point JSON array for waveform data and chunk the audio for streaming.
3.  **Build the Waveform Witness:** Create a React component that takes the JSON amplitude array and renders it via HTML5 Canvas. Bind mouse clicks to seek functionality: `$timestamp = (clickX / totalWidth) * totalDuration`.

### Phase 3: Social Fan-Out & Spotify Features
1.  **Fan-Out Trigger:** Write an `onCreate` Firestore function that listens to the `tracks/{trackId}` collection and writes a reference into `users/{followerId}/feed`.
2.  **Implement Manifestation Math:** Build the `FieldValue.increment(1)` sharded counter function for track plays.
3.  **Build Billboard Charts Logic:** Create a Firebase function that aggregates the sharded counters weekly to generate top lists per Genre Pillar.
4.  **Develop Playlisting Components:** Create UI for users to group track IDs into a `playlists` Firestore collection.

### Phase 4: UI/UX & 3D Integration
1.  **Construct the UI:** Build the fixed footer player, the infinite-scroll feed (using Firebase pagination and `onSnapshot` listeners), and the Sanctuary Tagging Zone.
2.  **Integrate React Three Fiber:** Map the current playing track's Genre Pillar to specific 3D environmental components to give each track a distinct, immersive visual identity. Animate state transitions using GSAP.

**Awaiting Code Execution.**
 