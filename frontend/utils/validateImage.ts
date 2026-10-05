export const validateImageMagicBytes = async (file: File): Promise<boolean> => {
  const buffer = await file.slice(0, 12).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (file.type === 'image/jpeg')
    return (
      bytes.length >= 3 &&
      bytes[0] === 0xff &&
      bytes[1] === 0xd8 &&
      bytes[2] === 0xff
    );

  if (file.type === 'image/png')
    return (
      bytes.length >= 4 &&
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    );

  if (file.type === 'image/webp')
    return (
      bytes.length >= 12 &&
      bytes[0] === 0x52 &&
      bytes[1] === 0x49 &&
      bytes[2] === 0x46 &&
      bytes[3] === 0x46 &&
      bytes[8] === 0x57 &&
      bytes[9] === 0x45 &&
      bytes[10] === 0x42 &&
      bytes[11] === 0x50   
    );

  return false;
};


export const isValidImage = async ( t: (key: string) => string, file: File ): Promise<string | null> => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    return t('profile.imageMimeTypeError');

  if (!(await validateImageMagicBytes(file)))
    return t('profile.imageCorruptError');

  if (file.size > 1024 * 1024 * 10)
    return t('profile.imageSizeError');

  return null;
};