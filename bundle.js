const { build } = require('esbuild');
const fs = require('fs');
const path = require('path');

// Create or clear dist directory
if (fs.existsSync('dist')) {
  // Remove all files in dist directory
  const files = fs.readdirSync('dist');
  for (const file of files) {
    fs.unlinkSync(path.join('dist', file));
  }
} else {
  fs.mkdirSync('dist');
}

// Get all JS files from src directory
const srcDir = path.join(__dirname, 'src');
const files = fs.readdirSync(srcDir).filter(file => file.endsWith('.js'));

// Bundle each Lambda function
async function bundleLambdas() {
  console.log(`Found ${files.length} Lambda functions to bundle`);
  
  for (const file of files) {
    const entryPoint = path.join(srcDir, file);
    const outputFile = path.join('dist', file);
    
    console.log(`Bundling ${file}...`);
    
    try {
      await build({
        entryPoints: [entryPoint],
        bundle: true,
        minify: true,
        platform: 'node',
        target: 'node18',
        outfile: outputFile,
        external: [],
      });
      console.log(`Successfully bundled ${file}`);
    } catch (error) {
      console.error(`Error bundling ${file}:`, error);
      process.exit(1);
    }
  }
  
  console.log('All Lambda functions bundled successfully!');
}

bundleLambdas().catch(err => {
  console.error('Bundling failed:', err);
  process.exit(1);
}); 