import { SavedLook } from './savedLooksStorage';

export function buildShareMessage(look: SavedLook) {
  const lines = [
    'Combinia Look',
    `${look.title}`,
    `${look.occasion}`,
    '',
    look.explanation,
  ];

  return lines.join('\n');
}
