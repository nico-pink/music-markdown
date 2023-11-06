import { TNoteName } from "./types";

export const UNIT = 8;
export const ELLIPSE_RADIUS = UNIT * 2;
export const ELLIPSE_PADDING_DEFAULT = UNIT * 0.5;
export const ELLIPSE_HEIGHT = UNIT * 0.8;
export const ACCIDENTAL_PADDING = UNIT / 2;
export const BEAT_WIDTH = UNIT * 4;
export const STAFF_HEIGHT = UNIT * 4;
export const STAFF_WIDTH = BEAT_WIDTH * 8;
export const STAFF_MARGIN = UNIT * 4;
export const TOKEN_PADDING = UNIT;
// used as a 1-based index
export const notesIndex: TNoteName[] = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
];
// (`)                    ->  slurMarker
// (\-){1,}               ->  rests
// ([_|\/]{0,2}\.{0,2})   ->  rest rhythmOperators
// ([>|\^|'|_]{0,3})      ->  accents
// ([A-G]{1}[#|b]{0,1})   ->  noteName
// (\d{0,1})              ->  octaveInd
// ([_|\/]{0,2}\.{0,2})   ->  note rhythmOperators
export const topLevelRe = /(`){1}|(\-{1})([_|\/]{0,2}\.{0,2})|([>|\^|'|_]{0,3})([A-G]{1}[#|b]{0,1})(\d{0,1})([_|\/]{0,2}\.{0,2})/gm;
export const accidentalsRe = /(\#|b){1,}/g;

export const MIN_ALLOWED_OCTAVE_INDEX = 1;
export const MAX_ALLOWED_OCTAVE_INDEX = 8;
export const LINE_GROUPING_DEFAULT_AMT = 4;
export const TOKEN_MARGIN_X = STAFF_MARGIN;
export const TOKEN_MARGIN_Y = STAFF_MARGIN + UNIT;
