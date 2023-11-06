import { INoteToken, TNoteName, TRhythmOperator, IRestToken, TToken, ISlurMarkerToken, isInstanceOfRhythmicToken, isInstanceOfNoteName } from "./types";
import { notesIndex, MAX_ALLOWED_OCTAVE_INDEX, MIN_ALLOWED_OCTAVE_INDEX, topLevelRe, accidentalsRe } from "./constants";

export const getNoteNumericValue = ({noteName, octaveInd} : INoteToken) => {
    const octaveIndAmt = (octaveInd - 1) * 7;
    // only support whole notes; accidentals have no effect on vertical spacing
    const noteNameIndAmt = notesIndex.indexOf(noteName.charAt(0) as TNoteName) + 1;
    return octaveIndAmt + noteNameIndAmt;
  };
  
  export const getBeatNumFromOperators = (rhythmOperators: TRhythmOperator[]) => rhythmOperators.reduce((acc, curr) => {
    if (curr === '_') return acc * 2;
    if (curr === '/') return acc / 2;
    return acc * 1.5;
  }, 1);
  
  const toSafeOctaveInd = (octaveInd: number) => Math.min(
    MAX_ALLOWED_OCTAVE_INDEX,
      Math.max(MIN_ALLOWED_OCTAVE_INDEX, octaveInd),
  );
  const getSafeOctaveIndFromPrev = (noteName: TNoteName, prevNoteToken = defaultToken) => toSafeOctaveInd(
    Math.abs(notesIndex.indexOf(noteName.charAt(0) as TNoteName) - notesIndex.indexOf(prevNoteToken.noteName.charAt(0) as TNoteName)) >= 4
    ? prevNoteToken.octaveInd - Math.sign(notesIndex.indexOf(noteName.charAt(0) as TNoteName) - notesIndex.indexOf(prevNoteToken.noteName.charAt(0) as TNoteName))
    : prevNoteToken.octaveInd,
  );
  const defaultToken: INoteToken = {
    noteName: 'C',
    octaveInd: 5,
    rhythmOperators: ['_', '.'],
    accents: ['>'],
    beatIndex: 1,
    accidentals: ['#'],
  };

const toToken = (
  regexpMatch: RegExpMatchArray,
  beatIndex: number,
  prevNoteToken = defaultToken): IRestToken | INoteToken | ISlurMarkerToken => {
    const [
      _, // givenStr,
      slurMarkers,
      rests,
      restsRhythmOperatorsStr,
      accentsStr,
      noteName,
      octaveIndStr,
      rhythmOperatorsStr,
    ] = regexpMatch;
    if (slurMarkers && slurMarkers.length > 0) return {
      slur_id: 0, // TODO
      beatIndex,
    } as ISlurMarkerToken;
    if (rests && rests.length > 0) return {
      rhythmOperators: restsRhythmOperatorsStr?.split('') ?? [],
      beatIndex,
    } as IRestToken;
    const octaveInd = octaveIndStr ? toSafeOctaveInd(parseInt(octaveIndStr, 10)) : getSafeOctaveIndFromPrev(noteName as TNoteName, prevNoteToken);
    return {
      accents: accentsStr?.split(''),
      octaveInd,
      rhythmOperators: rhythmOperatorsStr?.split(''),
      noteName,
      beatIndex,
      accidentals: noteName.match(accidentalsRe) ?? [],
    } as INoteToken;
  };
  // TODO: split using regex instead of passing separate params
  export const toNoteTokenFromString = (noteNameStr: string, octaveInd: number) => toToken(['', '', '', undefined, '', noteNameStr, octaveInd.toString(), ''] as RegExpMatchArray, 0) as INoteToken;
  export const toTokens = (markupStr: string) => {
    let prevNoteToken: INoteToken = defaultToken;
    let beatIndex = 1, rightPointer = 1, tmpIndex = -1;
    return Array.from(markupStr.matchAll(topLevelRe)).reduce((arr, curr) => {
      
      // TODO: update
      if (curr.index! > tmpIndex) {
        beatIndex = rightPointer;
        tmpIndex = curr[0].length + curr.index!;
      }
      
      const currToken = toToken(curr, beatIndex, prevNoteToken);
      rightPointer = Math.max(rightPointer, beatIndex + (isInstanceOfRhythmicToken(currToken) ? getBeatNumFromOperators(currToken.rhythmOperators) : 0));
      if (isInstanceOfNoteName(currToken)) prevNoteToken = currToken;
      return arr.concat(currToken);
    }, [] as TToken[]);
  };
  