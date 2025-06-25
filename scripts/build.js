const fs = require('fs');
const path = require('path');
const UglifyJS = require('uglify-js');
const CleanCSS = require('clean-css');

console.log('🚀 Starting build process...\n');

// Ensure dist directory exists
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    console.log('📁 Created dist/ directory');
}

// Build JavaScript files
const jsFiles = [
    {
        src: 'src/yt-feed-carousel.js',
        dist: 'dist/yt-feed-carousel.min.js'
    },
    {
        src: 'src/yt-feed-grid.js',
        dist: 'dist/yt-feed-grid.min.js'
    }
];

console.log('📦 Minifying JavaScript files...');
jsFiles.forEach(file => {
    try {
        const srcPath = path.join(__dirname, '..', file.src);
        const distPath = path.join(__dirname, '..', file.dist);

        if (fs.existsSync(srcPath)) {
            const source = fs.readFileSync(srcPath, 'utf8');
            const minified = UglifyJS.minify(source, {
                compress: {
                    drop_console: false,
                    drop_debugger: true,
                    pure_funcs: ['console.info', 'console.debug', 'console.warn']
                },
                mangle: true,
                output: {
                    comments: false
                }
            });

            if (minified.error) {
                console.error(`❌ Error minifying ${file.src}:`, minified.error);
                process.exit(1);
            }

            fs.writeFileSync(distPath, minified.code);

            const originalSize = fs.statSync(srcPath).size;
            const minifiedSize = fs.statSync(distPath).size;
            const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);

            console.log(`   ✅ ${file.src} → ${file.dist} (${savings}% smaller)`);
        } else {
            console.log(`   ⚠️  ${file.src} not found, skipping...`);
        }
    } catch (error) {
        console.error(`❌ Error processing ${file.src}:`, error.message);
        process.exit(1);
    }
});

// Build CSS files
const cssFiles = [
    {
        src: 'src/yt-feed-carousel.css',
        dist: 'dist/yt-feed-carousel.min.css'
    },
    {
        src: 'src/yt-feed-grid.css',
        dist: 'dist/yt-feed-grid.min.css'
    }
];

console.log('\n🎨 Minifying CSS files...');
const cleanCSS = new CleanCSS({
    level: 2,
    returnPromise: false
});

cssFiles.forEach(file => {
    try {
        const srcPath = path.join(__dirname, '..', file.src);
        const distPath = path.join(__dirname, '..', file.dist);

        if (fs.existsSync(srcPath)) {
            const source = fs.readFileSync(srcPath, 'utf8');
            const minified = cleanCSS.minify(source);

            if (minified.errors.length > 0) {
                console.error(`❌ Error minifying ${file.src}:`, minified.errors);
                process.exit(1);
            }

            fs.writeFileSync(distPath, minified.styles);

            const originalSize = fs.statSync(srcPath).size;
            const minifiedSize = fs.statSync(distPath).size;
            const savings = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);

            console.log(`   ✅ ${file.src} → ${file.dist} (${savings}% smaller)`);
        } else {
            console.log(`   ⚠️  ${file.src} not found, skipping...`);
        }
    } catch (error) {
        console.error(`❌ Error processing ${file.src}:`, error.message);
        process.exit(1);
    }
});

// Create combined files
console.log('\n📦 Creating combined files...');

try {
    // Combined JavaScript
    const carouselJS = fs.existsSync('dist/yt-feed-carousel.min.js') ?
        fs.readFileSync('dist/yt-feed-carousel.min.js', 'utf8') : '';
    const gridJS = fs.existsSync('dist/yt-feed-grid.min.js') ?
        fs.readFileSync('dist/yt-feed-grid.min.js', 'utf8') : '';

    if (carouselJS || gridJS) {
        const combinedJS = `${carouselJS}\n${gridJS}`;
        fs.writeFileSync('dist/yt-feed-all.min.js', combinedJS);
        console.log('   ✅ Created yt-feed-all.min.js (carousel + grid)');
    }

    // Combined CSS
    const carouselCSS = fs.existsSync('dist/yt-feed-carousel.min.css') ?
        fs.readFileSync('dist/yt-feed-carousel.min.css', 'utf8') : '';
    const gridCSS = fs.existsSync('dist/yt-feed-grid.min.css') ?
        fs.readFileSync('dist/yt-feed-grid.min.css', 'utf8') : '';

    if (carouselCSS || gridCSS) {
        const combinedCSS = `${carouselCSS}\n${gridCSS}`;
        fs.writeFileSync('dist/yt-feed-all.min.css', combinedCSS);
        console.log('   ✅ Created yt-feed-all.min.css (carousel + grid)');
    }
} catch (error) {
    console.error('❌ Error creating combined files:', error.message);
}

console.log('\n🎉 Build complete! Files ready in dist/ directory');
console.log('\n📊 Available files:');
console.log('   • yt-feed-carousel.min.js & .css (carousel only)');
console.log('   • yt-feed-grid.min.js & .css (grid only)');
console.log('   • yt-feed-all.min.js & .css (both layouts)');