
const sharp = require('sharp');
const fs = require('fs');

const rootPath = `./uploads/maps`

module.exports = {
    parse: async (imagePath, folderName) => {

        const dir = `${rootPath}/${folderName}`;
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true})

        await sharp(imagePath)
            .jpeg({ quality: 80, progressive: true, force: false })
            .png({ compressionLevel: 8, progressive: true, force: false })
            .toFile(`${dir}/base.png`);

        const metadata = await sharp(imagePath).metadata();
        let imageWidth = metadata.width;
        let imageHeight = metadata.height;

        let defaultTileSize = 256;
        let maxZoom = 0;

        for(maxZoom; imageWidth !== 1 || imageHeight !== 1; maxZoom++){
            const ratio = maxZoom === 0 ? 1 : 0.5;
            imageWidth = Math.round(imageWidth * ratio);
            imageHeight = Math.round(imageHeight * ratio);
        }

        imageWidth = metadata.width;
        imageHeight = metadata.height;

        maxZoom--;

        for(let zoom = maxZoom; zoom >= 0; zoom--) {
            const ratio = zoom === maxZoom ? 1 : 0.5;
            imageWidth = Math.round(imageWidth * ratio);
            imageHeight = Math.round(imageHeight * ratio);

            const maxColumns = Math.ceil(imageWidth / defaultTileSize);
            const maxRows = Math.ceil(imageHeight / defaultTileSize);

            const resizedImage = await sharp(imagePath)
                .resize(imageWidth, imageHeight)
                .toBuffer();

            for(let col = 0; col < maxColumns; col++) {
                const tileWidth = col !== maxColumns - 1 ? defaultTileSize : imageWidth - (col * defaultTileSize);

                for(let row = 0; row < maxRows; row++) {
                    const tileHeight = row !== maxRows - 1 ? defaultTileSize : imageHeight - (row * defaultTileSize);

                    await sharp(resizedImage)
                        .resize(imageWidth, imageHeight)
                        .jpeg({ quality: 80, progressive: true, force: false })
                        .png({ compressionLevel: 8, progressive: true, force: false })
                        .extract({
                            left: col * defaultTileSize,
                            top: row * defaultTileSize,
                            width: tileWidth,
                            height: tileHeight
                        })
                        .toFile(`${dir}/${zoom}-${col}-${row}.png`);
                }
            }
        }

        // while(pixelSize < maxPixelSize) {
        //
        //     console.log(`Processing zoom level ${zoom}...`);
        //
        //     const rows = 2**zoom;
        //     const cols = 2**zoom;
        //
        //     // const _cols = Math.floor(metadata.width / pixelSize) + (metadata.width % pixelSize > 0 ? 1 : 0)
        //     // const _cols = Math.floor(metadata.height / pixelSize) + (metadata.height % pixelSize > 0 ? 1 : 0)
        //     // console.log(_rows, _cols);
        //
        //     for(let row = 0; row < rows; row++) {
        //         for(let col = 0; col < cols; col++) {
        //
        //             await sharp(imagePath)
        //                 .flatten({ background: { r: 255, g: 255, b: 255 } })
        //                 .resize(pixelSize, pixelSize, { fit: "contain" })
        //                 .extract({
        //                     left: col*minTileSize,
        //                     top: row*minTileSize,
        //                     width: minTileSize,
        //                     height: minTileSize,
        //                     // width: pixelSize > (col+1)*minTileSize ? pixelSize : (col+1)*minTileSize - pixelSize,
        //                     // height: pixelSize > (row+1)*minTileSize ? pixelSize : (row+1)*minTileSize - pixelSize,
        //                 })
        //                 .toFile(`${dir}/${zoom}-${col}-${row}.png`);
        //         }
        //     }
        //
        //     zoom++;
        //     // double size for each consecutive zoom level, starting at min size:
        //     pixelSize = minTileSize * 2**zoom;
        // }

        return {
            path: `/uploads/maps/${folderName}`,
            width: metadata.width,
            height: metadata.height,
            maxZoom: maxZoom
        }
    }
}