export const validateImageMagicBytes = async (file: File): Promise<boolean> => {
  const buffer = await file.slice(0, 4).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  if (file.type === 'image/jpeg')
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;

  if (file.type === 'image/png')
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;

  return false;
};

export const isValidImage = async ( t: (key: string) => string, file: File ): Promise<string | null> => {
  if (!['image/jpeg', 'image/png'].includes(file.type))
    return t('profile.imageMimeTypeError');

  if (!(await validateImageMagicBytes(file)))
    return t('profile.imageCorruptError');

  if (file.size > 1024 * 1024 * 10)
    return t('profile.imageSizeError');

  return null;
};