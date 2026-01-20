/**
 * Creates an HTMLImageElement from a URL
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
        image.src = url;
    });

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function getRotatedRect(w: number, h: number, rotation: number) {
    const rad = (rotation * Math.PI) / 180;
    return {
        w: Math.abs(Math.cos(rad) * w) + Math.abs(Math.sin(rad) * h),
        h: Math.abs(Math.sin(rad) * w) + Math.abs(Math.cos(rad) * h),
    };
}

/**
 * This function takes an image source and a crop area,
 * and returns the cropped image as a Blob.
 */
export default async function getCroppedImg(
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    rotation = 0,
    flip = { horizontal: false, vertical: false }
): Promise<Blob | null> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        return null;
    }

    const rotRad = (rotation * Math.PI) / 180;

    // calculate bounding box of the rotated image
    const { w: bBoxWidth, h: bBoxHeight } = getRotatedRect(
        image.width,
        image.height,
        rotation
    );

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    // draw rotated image
    ctx.drawImage(image, 0, 0);

    // croppedAreaPixels values are bounding box relative
    // extract the cropped image using these values
    const data = ctx.getImageData(
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height
    );

    // set canvas width to final desired crop size - this will clear existing context
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // paste generated rotate image to the top left corner
    ctx.putImageData(data, 0, 0);

    // As Blob
    return new Promise((resolve, reject) => {
        canvas.toBlob((file) => {
            if (file) {
                resolve(file);
            } else {
                reject(new Error('Canvas is empty'));
            }
        }, 'image/jpeg');
    });
}
