export interface StoryPiece {
  id: string;
  titleEn: string;
  titleKn: string;
  excerptEn: string;
  excerptKn: string;
  authorEn: string;
  authorKn: string;
  genre: 'poetry' | 'essay' | 'short_story' | 'folklore' | 'art_critique';
  readingTimeMinutes: number;
}

export interface ArtPiece {
  id: string;
  titleEn: string;
  titleKn: string;
  artistEn: string;
  artistKn: string;
  medium: string;
  dimensions: string;
  imageUrl: string;
  year: number;
}

export interface CreativeEdition {
  id: string;
  editionNumber: number;
  month: string;
  year: number;
  themeTitleEn: string;
  themeTitleKn: string;
  synopsisEn: string;
  synopsisKn: string;
  coverImage: string;
  stories: StoryPiece[];
  artworks: ArtPiece[];
  isAvailable: boolean;
}

