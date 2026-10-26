export type TimelineImage = {
  src: string;
  alt: string;
};

export type TimelineEventView = {
  id: string;
  date: string;
  title: string;
  description?: string;
  images: TimelineImage[];
};

type TimelineSourceEvent = {
  id: string;
  dateLabel: string;
  title: string;
  description?: string | null;
  mediaAssetId?: string | null;
};

type TimelineSourcePhoto = {
  id: string;
  dataUrl?: string | null;
  altText: string;
};

function imagesForEvent(
  event: TimelineSourceEvent,
  index: number,
  photos: TimelineSourcePhoto[],
  pairByIndex: boolean
): TimelineImage[] {
  if (event.mediaAssetId) {
    const linked = photos.filter((photo) => photo.id === event.mediaAssetId && photo.dataUrl);
    if (linked.length > 0) {
      return linked.map((photo) => ({
        src: photo.dataUrl as string,
        alt: photo.altText || event.title,
      }));
    }
  }

  if (!pairByIndex || photos.length === 0) return [];

  const photo = photos[index % photos.length];
  if (!photo?.dataUrl) return [];
  return [{ src: photo.dataUrl, alt: photo.altText || event.title }];
}

export function toTimelineEvents(
  events: TimelineSourceEvent[],
  photos: TimelineSourcePhoto[],
  options?: { pairByIndex?: boolean }
): TimelineEventView[] {
  const pairByIndex = options?.pairByIndex ?? false;
  return events.map((event, index) => {
    const description = event.description?.trim();
    return {
      id: event.id,
      date: event.dateLabel,
      title: event.title,
      description: description || undefined,
      images: imagesForEvent(event, index, photos, pairByIndex),
    };
  });
}
