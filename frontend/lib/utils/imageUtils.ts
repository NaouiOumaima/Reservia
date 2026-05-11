// frontend/lib/utils/imageUtils.ts
export const getImageUrl = (path: string | undefined | null): string | null => {
  if (!path) return null;
  
  // Si c'est déjà une URL absolue
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Si c'est une data URL (base64)
  if (path.startsWith('data:')) {
    return path;
  }
  
  // Si c'est une URL relative du backend
  if (path.startsWith('/uploads/')) {
    return `http://localhost:3001${path}`;
  }
  
  // Fallback
  return path;
};