/**
 * Loads an image.
 *
 * @param {string} imageUrl The path to the image.
 */
export async function loadImage(imageUrl) {
  let img;
  const imageLoadPromise = new Promise(resolve => {
    img = new Image();
    img.onload = resolve;
    img.src = imageUrl;
  });

  await imageLoadPromise;
  return img;
}

/**
 * Loads multiple images.
 *
 * @param {string} imageUrl The path to the image.
 */
export async function loadImages(imageUrlArray) {
  const promiseArray = [];
  const imageArray = [];

  for (let imageUrl of imageUrlArray) {
    promiseArray.push(new Promise(resolve => {
      const img = new Image();
      img.onload = resolve;
      img.src = imageUrl;
      imageArray.push(img);
    }));
  }

  await Promise.all(promiseArray);
  return imageArray;
}

/**
 * Casts a float/decimal number to a string using binary magic.
 *
 * @param {number} value The float to convert to an integer.
 */
export function castToInt(value) { // Originally parseInt(), but it was very slow and affected performance considerably
  return ~~value; 
}

/**
 * Casts a integer number to a string.
 *
 * @param {number} value The integer to convert to a float.
 */
export function castToFloat(value) { 
  return parseFloat(value); 
}

/**
 * Converts a RGB color to a Hex color string.
 *
 * @param {number} red The red value of the RGB color.
 * @param {number} green The green value of the RGB color.
 * @param {number} blue The blue value of the RGB color.
 */
export function RGBToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/**
 * Converts a RGB color to a 32 bit integer.
 *
 * @param {number} red The red value of the RGB color.
 * @param {number} green The green value of the RGB color.
 * @param {number} blue The blue value of the RGB color.
 */
export function RGBToInt(red, green, blue) {
  var r = red & 0xFF;
  var g = green & 0xFF;
  var b = blue & 0xFF;

  return (r << 24) + (g << 16) + (b << 8) + 255;
}

/**
 * Converts a 32 bit integer to a RGB Color.
 *
 * @param {number} integer The 32 bit integer representing a color.
 */
export function intToRGB(integer) {
  return {
    red: integer >> 24 & 0xFF,
    green: integer >> 16 & 0xFF,
    blue: integer >> 8 & 0xFF,
  }
}

/**
 * Map a value in a certain range to another range.
 *
 * @param {number} value The value.
 * @param {number} leftMin The minimum of the original range.
 * @param {number} leftMax The maximum of the original range.
 * @param {number} leftMax The maximum of the original range.
 */
export function mapValue(value, leftMin, leftMax, rightMin, rightMax)
{
  var leftSpan = leftMax - leftMin;
  var rightSpan = rightMax - rightMin;
  var valueScaled = float(value - leftMin) / float(leftSpan);
  return rightMin + (valueScaled * rightSpan);
}

/**
 * Function to swap the x and y positions of two points.
 * 
 * @param {Vector2} point1 The first point.
 * @param {Vector2} point2 The second point.
 */
export function swapPoints(point1, point2) {
  let temp = point1.x;
  point1.x = point2.x;
  point2.x = temp;

  temp = point1.y;
  point1.y = point2.y;
  point2.y = temp;
}

export function interpolate(i0, d0, i1, d1) {
  let values = [];
  let a = (d1 - d0) / (i1 - i0);
  let d = d0;
  for (let i = i0; i < i1; i++) {
    values.push(d);
    d += a;
  }

  return values;
}

/**
 * Vector2 representing A two value vector object/structure.
 * 
 * @param {number} x The x value of the vector.
 * @param {number} y The y value of the vector.
 */
export function Vector2(x, y) {
  this.x = x;
  this.y = y;
}