Create a modern interactive personal profile website inspired by Spotify, Apple Music, and iOS glassmorphism. Use the uploaded wireframe as the basic layout structure, but make the final design much more polished, premium, and responsive.

OVERALL STYLE
- Dark, elegant, minimalist music-player aesthetic.
- Strong iPhone/iOS glassmorphism influence.
- Use translucent frosted-glass cards with backdrop blur.
- Subtle borders, soft shadows, reflections, and gradients.
- Rounded corners throughout, but avoid excessive bubbly UI.
- Background should be a very dark charcoal/black with a subtle animated ambient gradient.
- Typography should feel similar to Apple's SF Pro / modern system typography.
- Use generous spacing and clean alignment.
- Desktop-first but fully responsive for tablet and mobile.
- Do NOT make it look like a generic dashboard. It should feel like a personal music profile.

PAGE STRUCTURE

1. TOP PROFILE / HERO SECTION

Create a large horizontal glassmorphism profile card at the top.

Left side:
- Small profile/name area.
- Display the user's name prominently.
- Display a short description/status.
- Include small social buttons underneath:
  - GitHub
  - Discord
  - YouTube
  - X/Twitter
  - Other customizable socials
- Social buttons should be translucent glass pills with simple icons.

Center:
- Large circular profile picture.
- Add a subtle glass ring around the avatar.
- The avatar should feel like an iOS contact/profile card.
- Under or beside the avatar show:
  - Username
  - Discord status
  - Currently playing activity when available.

Right side:
- Create a compact statistics panel.
- Show:
  - Visitors
  - Current local time
  - Discord status
  - Optional location/timezone
- Visitors should have a small eye icon.
- Time should update live.
- Make these look like small glass information cards.

2. MUSIC SECTION

Below the profile section, create a large "Music" section.

Display albums as large glass cards in a responsive grid.

Each album card contains:
- Album artwork
- Album title
- Artist name
- Number of tracks
- Small play button
- Subtle hover animation
- Glass reflection/highlight

Example albums:
- "My Favorites"
- "Late Night"
- "Chill"
- "Gaming"
- "Favorites"

Use realistic placeholder album artwork, but structure the design so artwork can easily be replaced.

3. ALBUM INTERACTION

This is VERY IMPORTANT:

When a visitor clicks an album, do not simply navigate to another page.

Instead, open an immersive album/player interface.

The selected album should expand into a large glassmorphism player.

Show:
- Large square album artwork on the left
- Album name
- Artist
- Track list on the right
- Play/pause button
- Previous/next buttons
- Progress bar
- Current time / duration
- Volume control
- Shuffle
- Repeat

Make the album artwork behave like a physical vinyl record.

When music is playing:
- A vinyl disc should appear behind/next to the album artwork.
- The disc rotates continuously while music is playing.
- When paused, the disc smoothly stops.
- The rotation should feel like an actual turntable/vinyl record.
- Add a subtle center label and realistic grooves.
- Add a small shine/reflection moving across the disc.
- The album artwork should slide slightly aside to reveal the spinning record.

When changing tracks:
- Animate the transition smoothly.
- Update the disc/album artwork.
- Keep the player state persistent.

The interaction should feel similar to opening an album in a premium music app.

4. MINI MUSIC PLAYER

When an album/player is open, also create a persistent mini-player at the bottom of the screen.

The mini-player contains:
- Tiny album artwork
- Track name
- Artist
- Play/pause
- Progress bar
- Next button

Use a floating translucent iOS-style glass container.

The mini-player should remain visible while browsing the profile.

5. DISCORD LANYARD INTEGRATION

Design the profile so it is connected to Discord through Lanyard.

Use Lanyard/WebSocket data conceptually for the Discord profile.

The interface should dynamically display:
- Discord username
- Discord avatar
- Online / idle / do-not-disturb / offline status
- Current Discord activity
- Spotify activity when available
- Currently playing song
- Artist
- Album artwork
- Track progress

If Spotify is being listened to through Discord Rich Presence, automatically use that information in the music/player area.

Create realistic loading and fallback states:
- "Connecting to Discord..."
- "Discord offline"
- "No current activity"
- "Listening to Spotify"

Do not expose Discord tokens, bot tokens, or private credentials in the frontend.

6. LEFT SIDEBAR / SOCIALS

Following the uploaded wireframe, create a left-side glass panel.

The panel contains:
- Social links
- About
- GitHub
- Discord
- YouTube
- Other links

Use vertical glass buttons with icons.

On desktop this should stay visually connected to the main profile content.

On mobile, transform this into a horizontal scrollable social bar.

7. RIGHT SIDEBAR

Following the wireframe, create a right-side glass panel.

Display:
- Visitor count
- Current time
- Discord presence
- Current activity
- Optional profile statistics

Make the time large and elegant.

Example:

12:48 AM
UTC+08:00

Visitors
1,284

Discord
Online

8. VISITOR COUNTER

Implement a visitor counter concept.

Display:
- Total visitors
- Optional today's visitors
- Small animated counter

Make it subtle rather than looking like an analytics dashboard.

9. ANIMATIONS

Use high-quality micro-interactions throughout:

- Glass cards slightly lift on hover.
- Album artwork gently scales on hover.
- Buttons have subtle spring animations.
- Vinyl rotates only while music is playing.
- Player opens with a smooth expansion animation.
- Album artwork transitions smoothly.
- Background ambient gradient slowly moves.
- Discord status indicator subtly animates.
- Music progress bar smoothly updates.
- Avoid excessive animations that make the page distracting.

10. RESPONSIVE DESIGN

Desktop:
- Large hero card across the top.
- Social panel on the left.
- Music content in the center.
- Visitor/time panel on the right.

Tablet:
- Reduce side panels.
- Keep music grid responsive.

Mobile:
- Stack the profile vertically.
- Move socials underneath the profile.
- Move visitor/time information below the profile.
- Music albums become 2-column or 1-column cards.
- Player becomes a full-screen glass modal.
- Mini-player remains fixed at the bottom.

11. VISUAL DETAILS

Use:
- backdrop-filter blur
- translucent white borders
- subtle noise/grain texture
- soft shadows
- subtle inner highlights
- dark gradients
- large rounded corners
- thin separators
- elegant monochrome icons

Avoid:
- bright neon cyberpunk styling
- excessive gradients
- generic Bootstrap styling
- overly colorful UI
- clutter
- excessive rounded cards

The final result should feel like:

"Spotify profile page + Apple Music + iOS Control Center glassmorphism + Discord presence"

It should look like a premium personal portfolio/music profile rather than a normal website.

IMPORTANT FUNCTIONAL REQUIREMENTS
- Make album cards clickable.
- Clicking an album opens the interactive album player.
- The vinyl disc visibly spins while audio is playing.
- Pausing stops the vinyl.
- Track changes update the artwork and player.
- Include functional audio-player state management.
- Include Lanyard/Discord integration placeholders and clearly separated configuration variables.
- Never put secrets or Discord tokens directly in client-side code.
- Use mock data when Lanyard data is unavailable so the design remains visually complete.
- Make all major components reusable and easy to customize.

Use the uploaded wireframe as the structural reference for the placement of the top profile, left socials, right visitor/time panel, and album grid, but significantly improve the visual quality and interaction design.