import { rm } from 'fs/promises';
import { join } from 'path';

async function clean() {
  try {
    // Clean dist directory
    await rm('./dist', { recursive: true, force: true });
    
    // Clean cache directory
    await rm(join('node_modules', '.cache'), { recursive: true, force: true });
    
    console.log('✓ Successfully cleaned dist and cache directories');
  } catch (error) {
    console.error('Error cleaning directories:', error.message);
    process.exit(1);
  }
}

clean();