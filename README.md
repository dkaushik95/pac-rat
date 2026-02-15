# Pacman Manager

Vibe coded application made with antigravity. A modern, high-performance package manager for Arch-based Linux distributions, built with Electron and React. Featuring a "Cyber-HUD" aesthetic inspired by modern gaming interfaces and Discord, it provides a seamless one-click experience for managing your system's software.

![App Screenshot](https://via.placeholder.com/1200x800.png?text=Pacman+Manager+Preview) *Replace with actual screenshot*

## Features

- **🚀 One-Click Installation**: Search and install packages directly through a visual interface using `pacman`.
- **🛠️ Integrated Terminal**: Real-time feedback and logs during installation and removal processes.
- **📁 Organized Library**: Manage your installed system packages and GUI applications in one place.
- **🎨 Cyber-HUD UI**: A deep dark-mode aesthetic with glassmorphism, neon accents, and smooth view transitions.
- **🖼️ Smart Favicons**: Automatically fetches high-resolution favicons for packages with official URLs.
- **🔄 Update Tracking**: Stay notified about available system updates.
- **🖥️ Native App Launching**: Launch GUI applications directly from the manager.

## Installation

### Prerequisites

- **Arch Linux** or an Arch-based distribution (e.g., CachyOS, EndeavourOS, Manjaro).
- **Node.js** (v18 or higher)
- **Bun** (recommended for speed)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/pacman-manager.git
   cd pacman-manager
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Run in development mode:
   ```bash
   bun run electron:dev
   ```

4. Build for production:
   ```bash
   bun run build
   ```

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
