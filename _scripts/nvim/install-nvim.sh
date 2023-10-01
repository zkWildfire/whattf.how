#!/usr/bin/env bash
# Usage: ./init-nvim.sh
# Helper script that installs and sets up Neovim.
set -e
readonly NVIM_VERSION="0.9.2"
readonly NVIM_VERSION_NUMERIC="092"

# Download neovim
echo "Downloading Neovim..."
wget -O /tmp/nvim.tar.gz \
	https://github.com/neovim/neovim/releases/download/v$NVIM_VERSION/nvim-linux64.tar.gz
mkdir -p "$HOME/neovim"
tar -xf /tmp/nvim.tar.gz -C "$HOME/neovim"
mv "$HOME/neovim/nvim-linux64" "$HOME/neovim/$NVIM_VERSION"
sudo update-alternatives --install \
	/usr/bin/nvim nvim "$HOME/neovim/$NVIM_VERSION/bin/nvim" $NVIM_VERSION_NUMERIC

echo "Installation complete!"
