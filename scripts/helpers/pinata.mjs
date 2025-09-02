#!/usr/bin/env node

import { execSync } from 'child_process';
import { runCommand } from './run-command.mjs';
import { logStep, logSuccess, logError, logInfo } from './logs.mjs';
import { DIRECTORIES } from '../nft/config.mjs';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

const isPinataInstalled = () => {
  try {
    return execSync(`which pinata`, { stdio: 'pipe' });
  } catch (error) {
    return false;
  }
};

const _getGatewayUrl = (cid) => {
  try {
    return execSync(`pinata gateways link ${cid}`, { stdio: 'pipe' });
  } catch (error) {
    logError('failed to get gateway url');

    return false;
  }
};

const install = () => {
  logStep('installing pinata cli', 'checking if pinata cli is installed...');

  if (isPinataInstalled()) {
    logSuccess('pinata cli is already installed');

    return true;
  }

  logInfo('pinata cli not found. installing...');

  const result = runCommand('curl -fsSL https://cli.pinata.cloud/install | bash');

  if (!result.success) {
    logError('failed to install pinata cli');

    return false;
  }

  logSuccess('pinata cli installed');

  return true;
};

const authenticate = () => {
  logStep('pinata authentication', 'setting up pinata cli authentication...');

  try {
    const isAuthenticated = execSync(`pinata groups list`, { stdio: 'pipe' });

    if (isAuthenticated) {
      logSuccess('pinata cli is already authenticated');

      return true;
    }

    const result = runCommand('pinata auth');

    logSuccess('pinata cli authenticated');

    return result.success;
  } catch (error) {
    const result = runCommand('pinata auth');

    if (!result.success) {
      logError('failed to authenticate pinata cli');

      return false;
    }

    return true;
  }
};

const uploadImagesFolderToIPFS = async (imagesDir) => {
  logStep('uploading images to ipfs', 'uploading images to ipfs via pinata...');

  const result = runCommand(`pinata upload "${imagesDir}"`, { stdio: 'pipe' });

  if (!result.success) {
    logError('failed to upload images folder to ipfs');

    return false;
  }

  return _getGatewayUrl(JSON.parse(result.output).cid);
};

const _createMetadataFiles = (imageUrl) => {
  const contractName = process.env.STELLAR_NFT_CONTRACT_NAME;
  const contractSymbol = process.env.STELLAR_NFT_CONTRACT_SYMBOL;

  for (let i = 0; i < process.env.STELLAR_NFT_CONTRACT_MAX_SUPPLY; i++) {
    if (!existsSync(`${DIRECTORIES.IMAGES_DIR}/${i}.png`)) {
      logError(`image ${i} not found in ${DIRECTORIES.IMAGES_DIR}`);

      return false;
    }

    const tokenMetadata = {
      name: `${contractSymbol} #${i}`,
      description: `${contractName} NFT #${i}`,
      image: `${imageUrl}/${i}.png`,
      external_url: imageUrl, // ! todo: change to the actual url
      attributes: [
        {
          trait_type: "Token ID",
          value: i
        },
        {
          trait_type: "Collection",
          value: contractSymbol
        }
      ]
    };

    const tokenMetadataPath = join(DIRECTORIES.METADATA_DIR, `${contractSymbol}-${i}.json`);

    writeFileSync(tokenMetadataPath, JSON.stringify(tokenMetadata, null, 2));
    logSuccess(`token ${i} metadata created: ${tokenMetadataPath}`);
  }

  return true;
};

const createAssets = () => {
  logStep('creating', 'creating nft images and metadata files...');

  if (!existsSync(DIRECTORIES.IMAGES_DIR)) {
    mkdirSync(DIRECTORIES.IMAGES_DIR, { recursive: true });
  }

  if (!existsSync(DIRECTORIES.METADATA_DIR)) {
    mkdirSync(DIRECTORIES.METADATA_DIR, { recursive: true });
  }

  return true;
};

const uploadMetadataFilesToIPFS = async (imageUrl) => {
  logStep('uploading to ipfs', 'uploading images and metadata to ipfs via pinata...');

  _createMetadataFiles(imageUrl);

  const result = runCommand(`pinata upload ${DIRECTORIES.METADATA_DIR} --name "${process.env.STELLAR_NFT_CONTRACT_NAME}-metadata"`, { stdio: 'pipe' });

  if (!result.success) {
    logError('failed to upload metadata files to ipfs');

    return false;
  }

  return _getGatewayUrl(JSON.parse(result.output).cid);
};

export {
  createAssets,
  uploadImagesFolderToIPFS,
  uploadMetadataFilesToIPFS,
  authenticate,
  install
};