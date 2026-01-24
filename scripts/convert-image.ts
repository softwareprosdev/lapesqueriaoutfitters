import sharp from 'sharp';
import path from 'path';

async function convertAvifToJpg() {
  const inputPath = path.join(process.cwd(), 'public', 'images', 'fishing.avif');
  const outputPath = path.join(process.cwd(), 'public', 'images', 'fishing.jpg');

  console.log('Converting fishing.avif to fishing.jpg...');

  try {
    await sharp(inputPath)
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    console.log('✅ Conversion complete!');
    console.log(`   Input:  ${inputPath}`);
    console.log(`   Output: ${outputPath}`);
  } catch (error) {
    console.error('❌ Conversion failed:', error.message);
    process.exit(1);
  }
}

convertAvifToJpg();
