export function rewriteGalleryUrlForExhentai(galleryUrl: string, useExhentaiGalleryLinks: boolean): string {
  if (!useExhentaiGalleryLinks) {
    return galleryUrl
  }

  try {
    const parsedUrl = new URL(galleryUrl)

    if (parsedUrl.host !== 'e-hentai.org') {
      return galleryUrl
    }

    parsedUrl.host = 'exhentai.org'
    return parsedUrl.toString()
  }
  catch {
    return galleryUrl
  }
}
