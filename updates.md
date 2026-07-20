# Kingdom 808: Artist Upload & Dashboard Workflow Architecture

## System Overview
This specification details the implementation workflow for the artist upload and file management ecosystem within Kingdom 808. The objective is to replicate the seamless, multi-step ingestion and track management experience of SoundCloud, utilizing the project's dedicated serverless architecture: **Vite, React 18, and Google Firebase SDKs**.

---

## 1. Firebase Infrastructure Setup

### Storage (Firebase Cloud Storage)
Audio files and cover art need strictly structured bucket paths to ensure scalability and secure access rules.
*   **Audio Bucket Path:** `/audio/artists/{artistId}/tracks/{trackId}.mp3` (or `.wav`)
*   **Artwork Bucket Path:** `/images/artists/{artistId}/artwork/{trackId}_cover.jpg`

### Database (Cloud Firestore)
The track document schema will map directly to the CSS micro-interactions and interface requirements of the playlist details and dashboard views.

**Collection:** `tracks`
```json
{
  "trackId": "auto-generated-id",
  "artistId": "user-uid",
  "title": "Track Title",
  "genre": "Genre String",
  "description": "Track description...",
  "audioUrl": "gs://... or https://... firebase storage link",
  "artworkUrl": "gs://... or https://... firebase storage link",
  "duration": 214, // in seconds
  "isPublic": true,
  "playCount": 0,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## 2. The Upload Workflow (SoundCloud Parity)

### Phase A: Drag-and-Drop Ingestion (React 18 Interface)
The initial interaction focuses entirely on capturing the audio file.
1.  **Component:** `<UploadDropzone />`
    *   Implement an HTML5/React drag-and-drop zone using `react-dropzone` or native API.
    *   Acceptable formats: `.mp3`, `.wav`, `.flac`, `.m4a`.
2.  **Action:** File selection triggers an immediate, asynchronous background upload to Firebase Storage to minimize perceived waiting time.
3.  **State:** Display an upload progress bar bound to the Firebase Storage `uploadTask.on('state_changed')` listener.

### Phase B: Metadata Capture Form
While the file uploads in the background, transition the user to the metadata entry view.
1.  **Component:** `<TrackMetadataForm />`
2.  **Inputs:**
    *   Title (auto-filled from filename, editable)
    *   Permalink URL string
    *   Genre (Dropdown/autocomplete)
    *   Tags/Moods
    *   Description (Markdown or plain text)
    *   Privacy Toggle (Public vs. Private)
3.  **Artwork:** Secondary dropzone specifically for the cover image. Uploads to the `/images/` path in Firebase Storage.
4.  **Submission:** When "Save" is clicked:
    *   Ensure the background audio upload is complete (await the promise).
    *   Construct the track object.
    *   Write the document to the Firestore `tracks` collection using `addDoc()` or `setDoc()`.
    *   Route the user automatically to the Artist Dashboard.

---

## 3. Artist Dashboard Implementation

### View 1: Track Library / Management Hub
This is the central control panel for the artist.
1.  **Data Fetching:** Query Firestore where `artistId == currentUser.uid`, ordered by `createdAt` descending.
2.  **List UI Component:** `<DashboardTrackList />`
    *   Display a condensed, tabular or list-item view of uploaded tracks.
    *   Include mini cover art, title, privacy status indicator, and high-level stats (Plays, Likes).
3.  **Micro-interactions:** 
    *   Hovering over a track row reveals action buttons (Edit, Share, Delete, Analytics).
    *   Clicking "Play" on a row pushes the track to the global Kingdom 808 persistent audio player state.

### View 2: Track Editing Modal
1.  **Action:** Clicking "Edit" opens a modal populated with the track's current Firestore data.
2.  **Capabilities:** Update title, description, tags, or replace artwork. Audio file replacement should generally be discouraged (force a new upload) to preserve play counts and analytics consistency, similar to standard streaming platform rules.
3.  **Commit:** Updates the existing Firestore document via `updateDoc()`.

### View 3: Deletion Workflow
1.  **Warning:** Require user confirmation before deletion.
2.  **Execution (Cloud Function Recommended):** 
    *   While you can delete from the client, a Firebase Cloud Function (`onTrackDelete`) is safer.
    *   **Client:** Deletes the Firestore document.
    *   **Function:** Triggers on document deletion, locates the associated audio and image files in Firebase Storage via the URLs/paths, and deletes the raw files to prevent orphaned data and reduce storage costs.

---

## 4. Security Rules (Firebase)

Ensure proper gatekeeping at the infrastructure level.

**Storage Rules:**
```javascript
match /audio/artists/{artistId}/tracks/{fileName} {
  // Only the authenticated artist can upload/modify their own folders
  allow write: if request.auth != null && request.auth.uid == artistId;
  // Anyone can read public tracks (or logic based on custom claims)
  allow read: if true; 
}
```

**Firestore Rules:**
```javascript
match /tracks/{trackId} {
  // Anyone can read public tracks
  allow read: if resource.data.isPublic == true;
  // Artists can read all their own tracks, public or private
  allow read: if request.auth != null && request.auth.uid == resource.data.artistId;
  // Only the owning artist can create, update, or delete
  allow create: if request.auth != null && request.auth.uid == request.resource.data.artistId;
  allow update, delete: if request.auth != null && request.auth.uid == resource.data.artistId;
}
```
