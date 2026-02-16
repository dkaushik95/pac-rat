#!/bin/bash

# Pac-Rat Installer Script 🐀
# "The hungriest package hoarder for Arch Linux"

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐀 Starting Pac-Rat Installation...${NC}"

# 1. Check for dependencies
echo -e "${BLUE}🔍 Checking dependencies...${NC}"

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Error: git is not installed. Please install git and try again.${NC}"
    exit 1
fi

if ! command -v bun &> /dev/null; then
    echo -e "${RED}❌ Error: bun is not installed.${NC}"
    echo -e "Install bun with: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

# 2. Setup directory
INSTALL_DIR="$HOME/.local/share/pac-rat"
echo -e "${BLUE}📁 Setting up installation directory at $INSTALL_DIR...${NC}"

if [ -d "$INSTALL_DIR" ]; then
    echo -e "${BLUE}♻️  Existing installation found. Updating...${NC}"
    cd "$INSTALL_DIR"
    git pull
else
    git clone https://github.com/dkaushik95/pac-rat.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# 3. Install and Build
echo -e "${BLUE}🏗️  Installing dependencies and building...${NC}"
bun install
bun run build

# 4. System Integration
echo -e "${BLUE}🔧 Integrating with system...${NC}"

# Create bin directory if it doesn't exist
mkdir -p "$HOME/.local/bin"

# Create/Update the wrapper script
cat <<EOF > "$HOME/.local/bin/pac-rat"
#!/bin/bash
cd "$INSTALL_DIR" && bun run electron . "\$@"
EOF
chmod +x "$HOME/.local/bin/pac-rat"

# Install Desktop Entry
mkdir -p "$HOME/.local/share/applications"
cp pac-rat.desktop "$HOME/.local/share/applications/"
# Update the Icon path in the desktop entry to point to the installed location
sed -i "s|Icon=pac-rat-icon|Icon=$INSTALL_DIR/public/pac-rat-icon.png|" "$HOME/.local/share/applications/pac-rat.desktop"
sed -i "s|Exec=pac-rat|Exec=$HOME/.local/bin/pac-rat|" "$HOME/.local/share/applications/pac-rat.desktop"

echo -e "${GREEN}✅ Pac-Rat successfully installed!${NC}"
echo -e "${BLUE}🚀 You can now launch it by typing 'pac-rat' in your terminal or finding it in your application menu.${NC}"
echo -e "${BLUE}💡 Note: Make sure $HOME/.local/bin is in your PATH.${NC}"
