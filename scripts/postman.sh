#!/bin/bash

# 1. Create the target directories in goinfre
if [ ! -d ~/goinfre/flatpak ]; then
    mkdir -p ~/goinfre/flatpak
fi

if [ ! -d $HOME/goinfre/.config/Postman ]; then
    mkdir -p $HOME/goinfre/.config/Postman
fi

if [ ! -d $HOME/goinfre/.cache/Postman ]; then
    mkdir -p $HOME/goinfre/.cache/Postman
fi

if [ ! -d $HOME/goinfre/.cache/com.getpostman.Postman ]; then
    mkdir -p $HOME/goinfre/.cache/com.getpostman.Postman
fi

# 2. Add repo and install Postman via Flatpak
flatpak remote-add --user --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install --user -y flathub com.getpostman.Postman

# 3. Redirect directories using Symbolic Links
echo "Redirecting Postman cache and data to goinfre..."

# Link the standard host directories
rm -rf $HOME/.config/Postman
ln -s $HOME/goinfre/.config/Postman $HOME/.config/Postman

rm -rf $HOME/.cache/Postman
ln -s $HOME/goinfre/.cache/Postman $HOME/.cache/Postman

# Link the Flatpak-specific sandboxed directories
# Flatpak creates its own isolated config/cache folders in ~/.var/app/
mkdir -p $HOME/.var/app/com.getpostman.Postman/config
mkdir -p $HOME/.var/app/com.getpostman.Postman/cache

# Remove default Flatpak Postman folders if they exist
rm -rf $HOME/.var/app/com.getpostman.Postman/config/Postman
rm -rf $HOME/.var/app/com.getpostman.Postman/cache/Postman

# Symlink the Flatpak folders to your goinfre folders
ln -s $HOME/goinfre/.config/Postman $HOME/.var/app/com.getpostman.Postman/config/Postman
ln -s $HOME/goinfre/.cache/com.getpostman.Postman $HOME/.var/app/com.getpostman.Postman/cache/Postman

echo "Setup complete! Postman is installed and data is routing to goinfre."