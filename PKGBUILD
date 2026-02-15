# Maintainer: Dishant Kaushik <your-email@example.com>
pkgname=pac-rat
pkgver=1.0.0
pkgrel=1
pkgdesc="The hungriest package hoarder for Arch Linux."
arch=('any')
url="https://github.com/yourusername/pac-rat"
license=('MIT')
depends=('electron' 'npm')
makedepends=('bun') # Using bun as seen in project
source=("pac-rat::local://"
        "pac-rat.desktop"
        "pac-rat.sh")
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
  
  # Install icon
  install -Dm644 "public/pac-rat-icon.png" "$pkgdir/usr/share/icons/hicolor/512x512/apps/$pkgname.png"
}
