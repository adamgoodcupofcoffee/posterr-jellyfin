# Posterr-Jellyfin 🎬

A beautiful full-screen digital poster for Jellyfin, running in Docker.

## 🌟 Features

- Live "Now Screening" poster when media is playing
- Automatic fallback to "Newly Released" posters
- Metadata: Rating, Runtime, Year, Audio
- QR code for YouTube trailer
- Admin panel (via `/admin`) to control settings
- Theme editor with live preview
- Dimming schedule and film grain toggle

## 🚀 Installation

### Docker Desktop (Quick Start)

```bash
git clone https://github.com/adamgoodcupofcoffee/posterr-jellyfin.git
cd posterr-jellyfin
docker-compose up -d
