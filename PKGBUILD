# Maintainer: Dishant Kaushik <your-email@example.com>
pkgname=pacman-manager
pkgver=1.0.0
pkgrel=1
pkgdesc="A modern, open-source package manager for Arch Linux using Electron and React."
arch=('any')
url="https://github.com/yourusername/pacman-manager"
license=('MIT')
depends=('electron' 'npm')
makedepends=('bun') # Using bun as seen in project
source=("pacman-manager::local://"
        "pacman-manager.desktop"
        "pacman-manager.sh")
sha256sums=('SKIP'
            'SKIP'
            'SKIP')

build() {
  cd "$pkgname"
  bun install
  bun run build
}

package() {
  cd "$pkgname"
  
  # Install application files
  install -dm755 "$pkgdir/usr/lib/$pkgname"
  cp -r dist electron package.json "$pkgdir/usr/lib/$pkgname/"
  
  # Install the wrapper script
  install -Dm755 "../$pkgname.sh" "$pkgdir/usr/bin/$pkgname"
  
  # Install desktop entry
  install -Dm644 "../$pkgname.desktop" "$pkgdir/usr/share/applications/$pkgname.desktop"
  
  # Install icon (assuming there's an icon, or using a placeholder)
  # install -Dm644 "assets/icon.png" "$pkgdir/usr/share/icons/hicolor/512x512/apps/$pkgname.png"
}
