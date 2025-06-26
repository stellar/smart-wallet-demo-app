#!/bin/bash

stellar_version="22.8.1"

# checks if stellar is installed using which
# if not, installs stellar
# if it is, checks if it is up to date
# if it is not, updates it
# if it is, prints a message

# checks if stellar is installed using which


if ! which cargo >/dev/null; then
  echo "Cargo is not installed. Please install Rust and Cargo first."
  exit 1
fi

rustup target add wasm32v1-none
rustup target add wasm32-unknown-unknown


if ! which stellar >/dev/null; then
  # installs stellar
  cargo install stellar-cli --locked
else
  # checks if stellar is up to date
  if ! stellar --version | grep -q "$stellar_version"; then
    # updates stellar
    echo "Updating Stellar"
    cargo install stellar-cli --locked
  else
    echo "Stellar and Soroban already installed"
  fi
fi
