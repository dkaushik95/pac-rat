#!/bin/bash

# Pac-Rat Uninstaller Script 🐀
# "The hungriest package hoarder for Arch Linux"

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐀 Starting Pac-Rat Uninstallation...${NC}"

# 1. Remove Binaries
if [ -f "$HOME/.local/bin/pac-rat" ]; then
    echo -e "${BLUE}🗑️  Removing wrapper script...${NC}"
    rm "$HOME/.local/bin/pac-rat"
fi

# 2. Remove Desktop Entry
if [ -f "$HOME/.local/share/applications/pac-rat.desktop" ]; then
    echo -e "${BLUE}🗑️  Removing desktop entry...${NC}"
    rm "$HOME/.local/share/applications/pac-rat.desktop"
fi

# 3. Remove Application Data
INSTALL_DIR="$HOME/.local/share/pac-rat"
if [ -d "$INSTALL_DIR" ]; then
    echo -e "${BLUE}🗑️  Removing application files from $INSTALL_DIR...${NC}"
    rm -rf "$INSTALL_DIR"
fi

# 4. Optional: Remove Config/Cache
# We'll leave the Electron user data in ~/.config/pac-rat by default, 
# but we can mention it.
CONFIG_DIR="$HOME/.config/pac-rat"
if [ -d "$CONFIG_DIR" ]; then
    read -p "Do you want to remove application configuration and cache? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}🗑️  Removing config directory...${NC}"
        rm -rf "$CONFIG_DIR"
    fi
fi

echo -e "${GREEN}✅ Pac-Rat has been cleanly uninstalled.${NC}"
