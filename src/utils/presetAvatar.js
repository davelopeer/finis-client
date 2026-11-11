const PRESET_AVATAR_SIZE = 512;

/**
 * Rasterizes a bundled (same-origin) SVG preset avatar into a PNG File so it can
 * be uploaded through the same multipart signup path as a user-chosen photo.
 *
 * The backend only accepts image/jpeg, image/png and image/webp and cross-checks
 * the file extension, so we emit a PNG named `${name}.png`. Because the SVG is a
 * same-origin bundled asset, the canvas is not tainted and `toBlob` succeeds.
 *
 * @param {string} svgUrl - URL of the bundled SVG asset.
 * @param {string} name - Base name used for the resulting file (no extension).
 * @returns {Promise<File>} a PNG File ready to append to FormData.
 */
export function loadPresetAsFile(svgUrl, name) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = PRESET_AVATAR_SIZE;
      canvas.height = PRESET_AVATAR_SIZE;

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Nao foi possivel preparar a foto selecionada."));
        return;
      }

      context.drawImage(image, 0, 0, PRESET_AVATAR_SIZE, PRESET_AVATAR_SIZE);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Nao foi possivel preparar a foto selecionada."));
          return;
        }
        resolve(new File([blob], `${name}.png`, { type: "image/png" }));
      }, "image/png");
    };

    image.onerror = () => {
      reject(new Error("Nao foi possivel carregar a foto selecionada."));
    };

    image.src = svgUrl;
  });
}
