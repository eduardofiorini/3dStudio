export async function compressImage(file: File, maxSize: number): Promise<ArrayBuffer> {
  try {
    const img = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Calculate dimensions maintaining aspect ratio
    let { width, height } = img;
    if (width > maxSize || height > maxSize) {
      if (width > height) {
        height = (height / width) * maxSize;
        width = maxSize;
      } else {
        width = (width / height) * maxSize;
        height = maxSize;
      }
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        blob => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
        'image/jpeg',
        0.85
      );
    });

    return blob.arrayBuffer();
  } catch (error) {
    throw new Error(`Failed to compress image: ${error.message}`);
  }
}