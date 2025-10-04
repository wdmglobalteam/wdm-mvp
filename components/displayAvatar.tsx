// displayAvatar.tsx (util)
export function avatarSrc(profileAvatar: string | undefined | null, authPicture?: string | null): string | null {
  if (profileAvatar) return profileAvatar;
  if (authPicture) return authPicture;
  return null;
}
