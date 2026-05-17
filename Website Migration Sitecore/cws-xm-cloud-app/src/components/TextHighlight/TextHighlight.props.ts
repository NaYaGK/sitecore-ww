export type TextHighlightTheme = 'light' | 'grey' | 'red' | 'yellow';

export interface TextHighlightProps {
  title: string;
  content: string;
  eyebrowLabel?: string;
  theme?: TextHighlightTheme;
  className?: string;
}
