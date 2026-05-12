# Student Marketplace Presentation Guide

This file explains what the main files in the project do so you can present the app clearly.

## 1. Big Picture

This project is a **React Native mobile app** built with:

- `Expo`
- `Expo Router`
- `Firebase Authentication`
- `Firebase Firestore`

The app lets students:

- create an account
- log in
- browse listings posted by other students
- claim a listing
- create their own listings
- edit or delete their own listings

## 2. How the App Is Organized

The app is mainly split into these folders:

- `app/`
- `app/(tabs)/`
- `components/`
- `constants/`
- `firebase/`

### What each folder is for

`app/`
- Holds the main screens and navigation structure for Expo Router.

`app/(tabs)/`
- Holds the bottom-tab part of the app after login.

`components/`
- Reusable UI helper components like tab buttons and icons.

`constants/`
- Shared styling values like colors, spacing, and radius.

`firebase/`
- Firebase setup for auth and database access.

## 3. Main Navigation Files

### `app/_layout.tsx`

This is the **root navigation layout** for the whole app.

What it does:

- creates the top-level stack navigator
- checks if the user is logged in with Firebase
- redirects logged-out users to `login`
- redirects logged-in users away from auth screens
- defines custom back buttons for detail/create screens

What to say:

"This file controls the main navigation flow of the whole app. It also protects routes by checking Firebase auth state before letting the user into the app."

### `app/(tabs)/_layout.tsx`

This is the **bottom tab navigator** that appears after login.

Tabs:

- `Browse`
- `Profile`
- `Logout`

What it does:

- creates the bottom navigation bar
- styles the tab bar
- uses custom icons
- uses haptic feedback on iPhone through the tab button component

What to say:

"This file is the tab navigation shell for the main logged-in experience. Once a user enters the app, they use these tabs to browse listings, manage their own listings, or log out."

## 4. Auth Screens

### `app/login.tsx`

This is the login screen.

What it does:

- collects email and password
- validates empty fields
- signs in with Firebase Auth
- shows loading state and error messages
- uses keyboard-safe layout on mobile

What to say:

"This file handles user login with Firebase Authentication. It also includes keyboard handling so the form works better on phones."

### `app/register.tsx`

This is the sign-up screen.

What it does:

- collects email and password
- validates missing fields
- checks password length
- creates a Firebase account
- shows loading and error states

What to say:

"This file is the registration flow. It creates a new Firebase Auth user and sends them into the app once the account is created."

## 5. Main Logged-In Screens

### `app/(tabs)/index.tsx`

This is the **Browse screen**.

What it does:

- loads all listings from Firestore
- filters out the current user's own listings
- shows only other students' listings
- opens a listing detail screen when tapped
- shows a success banner after claiming an item

What to say:

"This is the main landing screen after login. It shows other students' listings by loading data from Firestore and filtering out the current user's own items."

### `app/(tabs)/profile.tsx`

This is the **Profile / My Listings** screen.

What it does:

- loads only the current user's listings
- shows a button to create a new listing
- opens listing detail for editing or deleting
- shows success messages after posting

What to say:

"This screen is where users manage their own marketplace activity. It shows only the listings that belong to the logged-in user."

### `app/(tabs)/logout.tsx`

This is a simple logout screen.

What it does:

- signs the user out as soon as the tab opens
- redirects to the login screen

What to say:

"This file is a lightweight route used just for logging out. Opening the tab triggers Firebase sign-out and sends the user back to login."

## 6. Listing Screens

### `app/create-listing.tsx`

This is the create listing form.

What it does:

- collects title, price, and description
- validates user input
- creates a Firestore document
- builds a custom listing ID using the user ID and time
- redirects back to profile with a success message

Important detail:

The listing ID is created like this:

- `user.uid + timestamp`

That makes it easy to tell which user owns which listing.

What to say:

"This screen creates new marketplace posts. It saves the listing into Firestore and uses a custom ID format so ownership can be tracked without adding more advanced backend logic."

### `app/listing-detail.tsx`

This is one of the most important files in the app.

What it does:

- loads one specific listing from Firestore
- checks whether the current user owns that listing
- if the user owns it:
  - they can edit title, price, and description
  - they can delete it
  - delete shows a confirmation alert first
- if the user does not own it:
  - they can claim it
- shows success and error messages

What to say:

"This screen changes behavior depending on who opened it. Owners can edit or delete their own listing, while other users can claim it. That makes this file responsible for both viewing and conditional actions."

## 7. Firebase File

### `firebase/firebaseConfig.js`

This file connects the app to Firebase.

What it does:

- initializes Firebase
- exports `auth`
- exports `db`

Why it matters:

Every file that needs login or Firestore imports from here.

What to say:

"This file is the backend connection layer. It initializes Firebase once and exposes authentication and database access to the rest of the app."

## 8. Styling / Theme Files

### `constants/marketplace-theme.ts`

This is the custom theme file for the app.

What it stores:

- colors
- spacing
- border radiuses
- shadow settings

Why it matters:

Instead of repeating design values in every screen, the app reuses shared theme values.

What to say:

"This file keeps the visual design consistent. It acts like a mini design system for spacing, colors, and reusable styling values."

### `constants/theme.ts`

This is mostly leftover Expo starter theme code.

It is less important now because the app mainly uses:

- `constants/marketplace-theme.ts`

What to say:

"This came from the Expo starter template. The main custom styling for this app now lives in `marketplace-theme.ts`."

## 9. Reusable Component Files

### `components/haptic-tab.tsx`

This is the custom tab button component.

What it does:

- adds light haptic feedback when users tap a tab on iPhone

What to say:

"This is a small UX improvement. It makes tab presses feel more native on iOS by adding haptic feedback."

### `components/ui/icon-symbol.tsx`

This file maps icon names to Material Icons.

What it does:

- provides a reusable icon component
- lets the app use icon names consistently across screens
- helps the tab navigator show icons like Browse, Profile, and Logout

What to say:

"This file is basically an icon translation layer. It maps the icon names we want to use to actual icons supported on Android and web."

### `components/ui/icon-symbol.ios.tsx`

This is the iOS-specific version of the icon component.

What to say:

"This is part of the cross-platform icon setup. It helps the app use native-style icons on iOS."

## 10. Files That Are Less Important for the Presentation

These are mostly starter/template/helper files and probably do not need much presentation time unless your professor asks:

- `components/external-link.tsx`
- `components/hello-wave.tsx`
- `components/parallax-scroll-view.tsx`
- `components/themed-text.tsx`
- `components/themed-view.tsx`
- `components/ui/collapsible.tsx`
- `app/modal.tsx`

What to say if asked:

"Those are mostly Expo starter or helper components. They are not central to the marketplace flow."

## 11. Data Flow Summary

Here is the easiest way to explain how data moves through the app:

1. User signs up or logs in with Firebase Auth.
2. Root layout checks authentication state.
3. Logged-in users enter the tab-based app.
4. Browse screen reads all listings and filters out the current user's own items.
5. Profile screen reads only the current user's listings.
6. Create Listing writes a new document into Firestore.
7. Listing Detail reads one document and decides whether the user can edit/delete or claim.

## 12. Simple Explanation of Ownership

The app identifies ownership using the document ID format.

Example:

- `USER_UID_1715520000000`

Why this was done:

- simpler than building a more advanced backend rule system for this class project
- easy to filter "my listings" vs "other listings"

What to say:

"I used a simple ownership system where the Firebase user ID is part of the listing document ID. That let me separate the current user's listings from everyone else's without adding more complicated backend structure."

## 13. Features You Can Mention as Strengths

- protected routes with Firebase auth
- bottom tab navigation
- form validation
- keyboard handling on auth screens
- success and error messages
- description field for listings
- edit flow for owners
- delete confirmation
- claim flow for other users
- shared theme for consistent styling

## 14. Honest Limitations You Can Mention If Asked

These are good to mention if someone asks what could be improved:

- claiming a listing currently removes it instead of marking it as claimed
- there are no listing images yet
- there is no category system yet
- the app uses a simple ownership strategy based on document IDs
- some Expo starter files are still in the repo

This is actually good presentation material, because it shows you understand both what works and what could be improved.

## 15. 30-Second Presentation Summary

If you need a short overview, you can say this:

"This is a student marketplace mobile app built with Expo Router, React Native, and Firebase. Users can register and log in, browse listings from other students, claim items, and manage their own listings through a separate profile tab. Firebase Authentication handles login, Firestore stores the listing data, and the app uses protected routing plus a shared theme system to keep the user experience consistent."

## 16. Best Files To Focus On During the Presentation

If you only have time to explain the most important files, focus on these:

- `app/_layout.tsx`
- `app/(tabs)/_layout.tsx`
- `app/login.tsx`
- `app/register.tsx`
- `app/(tabs)/index.tsx`
- `app/(tabs)/profile.tsx`
- `app/create-listing.tsx`
- `app/listing-detail.tsx`
- `firebase/firebaseConfig.js`
- `constants/marketplace-theme.ts`

Those files explain almost the entire app.
