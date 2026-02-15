# Pac-Rat

**Pac-Rat** is a modern, high-performance package manager for Arch-based Linux distributions, built with Electron and React. It features a quirky "hungry blob" aesthetic and provides a seamless one-click experience for managing your system's software.

## Why Pac-Rat?

As a frontend engineer and gamer, I eventually got fed up with Windows and decided to make the jump to Linux. I installed **CachyOS** and absolutely fell in love with the speed and flexibility!

I wanted my non-technical friends to experience the same thing, but I knew the learning curve for installing apps could be intimidating. On Windows, they're used to just opening an `.exe` file; on Linux, the "pacman" CLI can be scary for beginners. 

I built Pac-Rat to bridge that gap—a utility UI that lets anyone search, discover, install, and launch apps all from one place. It's the hungriest package hoarder on the block, making Linux app management as easy as it should be.

![App Screenshot](src/assets/pacRat_preview.png)

## Features

- **🚀 One-Click Installation**: Search and install packages directly through a visual interface using `pacman`.
- **🛠️ Integrated Terminal**: Real-time feedback and logs during installation and removal processes.
- **📁 Organized Library**: Manage your installed system packages and GUI applications in one place.
- **🎨 Cyber-HUD UI**: A deep dark-mode aesthetic with glassmorphism, neon accents, and smooth view transitions.
- **🖼️ Smart Favicons**: Automatically fetches high-resolution favicons for packages with official URLs.
- **🔄 Update Tracking**: Stay notified about available system updates.
- **🖥️ Native App Launching**: Launch GUI applications directly from the manager.

## Installation

### Option 1: AUR (Recommended for Arch Users)
Since you're on Arch, the best way to install Pac-Rat is via the AUR (Arch User Repository). This ensures it's managed by `pacman` like any other system app.

```bash
# Using an AUR helper like yay
yay -S pac-rat

# Or manually
git clone https://aur.archlinux.org/pac-rat.git
cd pac-rat
makepkg -si
```

### Option 2: One-Line Install Script
For a quick setup without AUR helpers, you can use our installation script. It clones, builds, and sets up the desktop shortcut for you.

```bash
curl -fsSL https://raw.githubusercontent.com/yourusername/pac-rat/main/install.sh | bash
```

### Prerequisites
Regardless of the method, ensure you have these installed:
- **Arch Linux** or an Arch-based distribution (CachyOS, EndeavourOS, etc).
- **Bun** (recommended for speed)
- **Git**

## Usage

- **Search**: Use the search bar on the Home tab to find packages in the official repositories.
- **Manage**: Switch to the Library tab to see your installed applications, uninstall packages, or launch GUI apps.
- **Terminal**: Monitor installation progress in the slide-up terminal overlay.

## Development

The project uses a modern stack:
- **Frontend**: React, Vite, Vanilla CSS
- **Backend**: Electron (Main process handles `pacman` and `pkexec` operations)
- **Icons**: Fetched via Google Favicon V2 API and local `.desktop` files.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

- **Dishant Kaushik**
