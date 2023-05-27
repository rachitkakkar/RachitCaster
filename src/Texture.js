import { loadImage } from "./Utils.js";

export class Texture {
    constructor(imageUrl, textureWidth, textureHeight) {
        this.imageUrl = imageUrl;
        this.textureWidth = textureWidth;
        this.textureHeight = textureHeight;

        this.pixelData;
    }

    load(ctx) {
        loadImage(this.imageUrl).then(texture => {
            ctx.drawImage(texture, 0, 0);
            this.pixelData = ctx.getImageData(0, 0, this.textureWidth, this.textureHeight);
        });
    }

    getPixel(x, y) {
        let pixelindex = (y * this.textureHeight + x) * 4;
        let red = this.pixelData[pixelindex];
        let green = this.pixelData[pixelindex+1];
        let blue = this.pixelData[pixelindex+2]; 

        return { red: red, green: green, blue: blue };
    }

    getWidth() {
        return this.textureWidth;
    }

    getHeight() {
        return this.textureHeight;
    }
};