# Kingdom-808: Playlist Details Functionality & UX Guide

**Prepared for the Development Team by the Principal UX Researcher & UI Architect**

This document outlines the programmatic logic, Firebase integration, and sensory (UI/UX) interactions required for each functional element on the `PlaylistDetail.jsx` page. Every interaction must feel "alive" and phase-lock with the user's intent.

## 1. "Play All" Button

**UI Element:**
```jsx
<button className="btn btn-pill btn-primary with-icon">Play All</button>
```

**Firebase Integration:**
*   **Firestore (History):** When clicked, trigger a background write to the user's document in the `users/{userId}/listening_history` subcollection, logging the playlist ID and a timestamp.
*   **Analytics:** Trigger a Firebase Analytics event: `logEvent(analytics, 'playlist_play_all', { playlist_id: id })`.

**UI/UX Character (The Skin):**
*   **Hover State:** The button should emit a soft glow using `box-shadow: 0 0 15px var(--color-primary)`.
*   **Active/Click State:** Implement a micro-interaction where the button scales down slightly (`transform: scale(0.95)`) mimicking a tactile physical button press, followed by a ripple effect originating from the click coordinates.
*   **Audio Execution:** Upon clicking, immediately dispatch to the global `AudioProvider` to begin playback. Specifically, load and play the designated audio stream: [Will Smith - Rave In The Wasteland](https://youtu.be/A8n0AckJRmU?si=fZzwHApt7Q9iTlqi). The play icon should smoothly morph into a pause icon.

---

## 2. "Follow" Button

**UI Element:**
```jsx
<button className="btn btn-pill outline with-icon">Follow</button>
```

**Firebase Integration:**
*   **Firestore (Mutations):** On click, execute a Firestore batch write or transaction:
    *   Add the current `playlistId` to the user's `users/{userId}/followed_playlists` array (or subcollection).
    *   Increment the `follower_count` field on the global `playlists/{playlistId}` document by 1.

**UI/UX Character (The Skin):**
*   **State Change:** The interaction must feel instantly rewarding. When clicked, transition the button's background from transparent (outline) to a solid, muted secondary color.
*   **Microcopy & Iconography:** Smoothly crossfade the text from "Follow" to "Following" and animate the `person_add` icon turning into a check icon with a satisfying little "pop" (a quick `scale(1.2)` to `scale(1)` animation).

---

## 3. Share Button

**UI Element:**
```jsx
<button className="icon-btn-circle outline">share</button>
```

**Firebase Integration:**
*   **Firebase Dynamic Links** (or standard link generation): Generate a unique tracking link for the playlist.
*   **Analytics:** Log a share event with the playlist ID to track viral coefficient.

**UI/UX Character (The Skin):**
*   **Hover:** The circular border should rotate slowly (15 degrees) to invite interaction.
*   **Click State:** Triggers a bottom-sheet (on mobile) or a sleek, glassmorphism modal (on desktop). The items inside the modal (Twitter, Copy Link, etc.) must not appear instantly; they should stagger-fade in from the bottom up (`transform: translateY(10px); opacity: 1` with a `0.1s` delay per item) to keep the user's eye engaged.

---

## 4. Ellipsis (More Options) Button

**UI Element:**
```jsx
<button className="icon-btn-circle outline">more_horiz</button>
```

**Firebase Integration:**
*   No direct Firebase read/write on the button click itself, but it opens a menu containing actions that will (e.g., "Report Playlist", "Add to Queue").

**UI/UX Character (The Skin):**
*   **Click State:** The `more_horiz` icon must rotate exactly 90 degrees (`transform: rotate(90deg)`) using a snappy easing curve (`cubic-bezier(0.25, 0.8, 0.25, 1)`).
*   **Menu Reveal:** The dropdown menu should expand outwards from the button's origin point, blurring the background slightly (`backdrop-filter: blur(4px)`) to establish visual hierarchy and focus.

---

## 5. Individual Track Rows

**UI Element:**
```jsx
<div className="table-row">...</div>
```

**Firebase Integration:**
*   **Firestore:** Clicking a specific row logs that specific `trackId` to the user's `listening_history` and updates the track's global `play_count`.

**UI/UX Character (The Skin):**
*   **Hover State:** The row background transitions to a very subtle, transparent white (`rgba(255,255,255,0.05)`). Crucially, the track number (e.g., "01") must smoothly fade out, replaced by a primary-colored play icon to indicate it is an interactive hit target.
*   **Active State (Currently Playing):** If the track is currently playing, the track number/play icon is replaced by a mini, CSS-animated equalizer (3 pulsing vertical bars) to provide constant sensory feedback. The track title text turns to `var(--color-primary)`.

---

## 6. "See all" Button (More Like This)

**UI Element:**
```jsx
<span className="text-primary text-xs font-bold uppercase tracking-wider cursor-pointer">See all</span>
```

**Firebase Integration:**
*   **Firestore (Query):** When clicked, navigate to a new view that executes a compound query: `collection('playlists').where('genre', '==', currentGenre).orderBy('popularity', 'desc').limit(20)`.

**UI/UX Character (The Skin):**
*   **Hover:** Add a micro-interaction where a small right-pointing arrow (`→`) fades in and slides slightly to the right next to the text, encouraging the user to push forward in the application flow.

---

## 7. Album Cards ("More Like This" Grid)

**UI Element:**
```jsx
<div className="album-card">...</div>
```

**Firebase Integration:**
*   **Navigation:** Navigates to a new `/playlist/:id` route, triggering a fresh read from Firestore for the new playlist's details.

**UI/UX Character (The Skin):**
*   **Hover:** The album cover image must slowly zoom in (`transform: scale(1.05)`) over 0.4 seconds while the card itself lifts slightly (`transform: translateY(-4px)`) with a drop shadow. This creates depth and makes the content feel tactile.
*   **Transition:** Upon clicking, utilize a framework like Framer Motion to perform a "Hero Animation". The album cover from the card should smoothly fly across the screen and expand to become the main header image of the new playlist detail page, completely eliminating jarring page loads.
