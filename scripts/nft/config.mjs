import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const DIRECTORIES = {
  CONTRACTS_DIR: resolve(__dirname, '../contracts'),
  NFT_CONTRACT_DIR: resolve(__dirname, '../../contracts/nft'),
  SCRIPTS_DIR: __dirname,
  IMAGES_DIR: resolve(__dirname, '../assets/images'),
  METADATA_DIR: resolve(__dirname, '../assets/metadata')
};
