export type TNoteName = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  | 'A#' | 'B#' | 'C#' | 'D#' | 'E#' | 'F#' | 'G#'
  | 'Ab' | 'Bb' | 'Cb' | 'Db' | 'Eb' | 'Fb' | 'Gb';

export type TRhythmOperator = '/' | '_' | '.';

interface IToken {
  beatIndex: number;
}

export interface ISlurMarkerToken extends IToken {
  slur_id: number; // disambiguation
}

export const isInstanceOfSlurMarkerToken = (obj: any): obj is IRhythmicToken => {
  return 'slur_id' in obj;
};

interface IRhythmicToken extends IToken {
  rhythmOperators: TRhythmOperator[];
}

export interface INoteToken extends IRhythmicToken {
    noteName: TNoteName;
    octaveInd: number;
    accents: string[];
    accidentals: string[];
}

export const isInstanceOfRhythmicToken = (obj: any): obj is IRhythmicToken => {
  return 'rhythmOperators' in obj;
};

export const isInstanceOfNoteName = (obj: any): obj is INoteToken => {
  return 'noteName' in obj;
};

export interface IRestToken extends IRhythmicToken {
}

// TODO: evaluate (this is cyclic; interface above IToken is extended by interfaces listed below)
export type TToken = INoteToken | IRestToken | ISlurMarkerToken;

// (\-){1,}               ->  rests
// ([_|\/]{0,2}\.{0,2})   ->  rest rhythmOperators
// ([>|\^|'|_]{0,3})      ->  accents
// ([A-G]{1}[#|b]{0,1})   ->  noteName
// (\d{0,1})              ->  octaveInd
// ([_|\/]{0,2}\.{0,2})   ->  note rhythmOperators
export type TMarkupMatch = [
    string,
    undefined | string,
    undefined | string,
    undefined | string,
    undefined | string,
    undefined | string,
    undefined | string,
];
  
export type TLineDirection = 'UP' | 'DOWN';
export interface IDrawNoteOptions {
  isOpen?: boolean;
  lineDirection?: TLineDirection;
}

export interface IStaffCanvasOptions {
    title?: string;
    includeNoteNames?: boolean;
}
