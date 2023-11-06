import { INoteToken, TLineDirection, TToken, isInstanceOfNoteName, isInstanceOfRhythmicToken } from "./types";
import { ELLIPSE_HEIGHT, ELLIPSE_RADIUS, STAFF_MARGIN, TOKEN_PADDING, UNIT, TOKEN_MARGIN_X, TOKEN_MARGIN_Y, ACCIDENTAL_PADDING, accidentalsRe } from "./constants";
import { getBeatNumFromOperators, getNoteNumericValue, toNoteTokenFromString } from "./token-helpers";

// TODO: update: these fns shouldn't know about configs or other things
// drawStaff should only know length of staff to draw
// move amt of beats & accidentals etc. to implementation and pass calculated length to drawStaff
const MIN_STAFF_BEATS = 8;
export const drawStaff = (ctx: CanvasRenderingContext2D, topPadding: number, staffWidth: number) => {
  // const staffWidth = ELLIPSE_RADIUS * 2 * Math.max(beatsAmt) + TOKEN_PADDING * Math.max(beatsAmt);
  for (let i = 1; i <= 5; i++) {
    const yCoord = STAFF_MARGIN + topPadding + (UNIT * i * 2);
    ctx.beginPath();
    ctx.moveTo(
      STAFF_MARGIN,
      yCoord,
    );
    ctx.lineTo(
      STAFF_MARGIN * 2 + staffWidth,
      yCoord,
    );
    ctx.stroke();
  }
};

const drawRhythmicDotAt = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
  ctx.beginPath();
  ctx.ellipse(x, y, UNIT / 4, UNIT / 4, 0, 0, 2 * Math.PI);
  ctx.fill();
};

const getHorizontalPaddingFromBeatNum = (beatNum: number, accidentalsNum = 0) => TOKEN_MARGIN_X + (beatNum * UNIT * 4) + (TOKEN_PADDING * beatNum) + (accidentalsNum * ACCIDENTAL_PADDING);


// use cases for slurs

// 0: noteheads both same direction -> slur is on opposite side
// 1: notestem directions differ -> 

export const drawSlurAtBeats = (ctx: CanvasRenderingContext2D, beatIndexInit: number, beatIndexTerm: number) => {
  const [initX, termX] = [getHorizontalPaddingFromBeatNum(beatIndexInit), getHorizontalPaddingFromBeatNum(beatIndexTerm)];

  // ctx.beginPath();
  // ctx.arc();
  // ctx.stroke();
};

const ACCIDENTAL_HEIGHT = UNIT * 2.5;
const ACCIDENTAL_WIDTH = UNIT * 2;

type TAccidental = '#' | 'b' | '##' | 'bb'; // '*'

const drawAccidentalAt = (ctx: CanvasRenderingContext2D, x: number, y: number, aType: TAccidental) => {
  if (aType === '#') {
    ctx.beginPath();
    // (min x, max y)
    ctx.moveTo(x - ACCIDENTAL_WIDTH / 2 + UNIT / 4, y + ACCIDENTAL_HEIGHT / 2);
    // (x 1, min y)
    ctx.lineTo(x - UNIT / 4, y - ACCIDENTAL_HEIGHT / 2);
    ctx.stroke();
    
    // (x 1, max y) to (max x, min y)
    ctx.beginPath();
    ctx.moveTo(x + UNIT / 4, y + ACCIDENTAL_HEIGHT / 2);
    ctx.lineTo(x + ACCIDENTAL_WIDTH / 2 - UNIT / 4, y - ACCIDENTAL_HEIGHT / 2);
    ctx.stroke();
    
    // (horz line 1)
    ctx.beginPath();
    ctx.moveTo(x - ACCIDENTAL_WIDTH / 2, y - ACCIDENTAL_HEIGHT / 4);
    ctx.lineTo(x + ACCIDENTAL_WIDTH / 2 + UNIT / 4, y - ACCIDENTAL_HEIGHT / 4);
    ctx.stroke();
    
    // (horz line 2)
    ctx.beginPath();
    ctx.moveTo(x - ACCIDENTAL_WIDTH / 2 - UNIT / 4, y + ACCIDENTAL_HEIGHT / 4);
    ctx.lineTo(x + ACCIDENTAL_WIDTH / 2 + UNIT / 4, y + ACCIDENTAL_HEIGHT / 4);
    ctx.stroke();
  }
  if (aType === 'b') {
    // left line
    ctx.beginPath();
    ctx.moveTo(x - ACCIDENTAL_WIDTH / 4, y - ACCIDENTAL_HEIGHT / 2);
    ctx.lineTo(x - ACCIDENTAL_WIDTH / 4, y + ACCIDENTAL_HEIGHT / 2);
    ctx.stroke();

    // b part
    ctx.beginPath();
    ctx.ellipse(
      //x
      x,
      //y
      y + ACCIDENTAL_HEIGHT / 4,
      //rx
      ACCIDENTAL_HEIGHT / 4,
      //ry
      ACCIDENTAL_HEIGHT / 4,
      //rot
      0,
      //sa
      0,
      //ea
      2 * Math.PI,
    );
    ctx.stroke();
  }
};

const TREBLE_MIDDLE_NOTE_VALUE = getNoteNumericValue(toNoteTokenFromString('B', 5));

// TODO: leaving this interface here for now to allow config for later
const getLineDirection = (defaultMiddleNoteValue: number) => (noteNumVal: number) => noteNumVal < defaultMiddleNoteValue ? 'UP' : 'DOWN'
const getDefaultLineDirection = getLineDirection(TREBLE_MIDDLE_NOTE_VALUE);

const drawNoteAt = (ctx: CanvasRenderingContext2D, x: number, y: number, token: INoteToken) => {
  // TODO: if necessary, draw horiz line through ellipse (for notes outside the staff)
  ctx.beginPath();
  const beatAmt = getBeatNumFromOperators(token.rhythmOperators);
  let noteHeadHeight = ELLIPSE_HEIGHT;
  const noteNumVal = getNoteNumericValue(token);
  // Treble middle (default): B5 -> 30 (TODO: configure this)
  const lineDirection: TLineDirection = getDefaultLineDirection(noteNumVal);
  if (beatAmt < 1) noteHeadHeight *= 0.6;
  ctx.ellipse(x, y, ELLIPSE_RADIUS, ELLIPSE_HEIGHT, -Math.PI / 10, 0, 2 * Math.PI);
  if (beatAmt >= 2) {
    ctx.stroke();
  }
  if (beatAmt < 2) ctx.fill();
  if (beatAmt < 4) {
    const [lineX, lineY, lineToY] = lineDirection === 'UP'
      ? [x + ELLIPSE_RADIUS, y - UNIT / 2, y + UNIT * -8]
      : [x - ELLIPSE_RADIUS, y + UNIT / 2, y + UNIT * 8];
    ctx.moveTo(lineX, lineY);
    ctx.lineTo(lineX, lineToY);
    ctx.stroke();
  }
  if (token.noteName.match(accidentalsRe)) drawAccidentalAt(ctx, x - UNIT * 2.75, y, token.noteName.match(accidentalsRe)![0] as TAccidental);
};

// TODO: accept global "combine multiple rests" setting in app
const drawRestAt = (ctx: CanvasRenderingContext2D, x: number, y: number, beatAmt: number) => {
  // eighth or sixteenth rest
  if (beatAmt < 1 || true) {
    // simple line for now
    // TODO: add 2nd line
    // TODO: angle both lines
    // TODO: add serif ending on 2nd line
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + UNIT * 4);
    ctx.stroke();
  }
  // quarter rest
  // half
  // whole
};

export const drawTokenAtBeat = (ctx: CanvasRenderingContext2D, token: TToken, beatNum: number, accidentalsNum: number, highNoteValue: number) => {
  const tokenX = getHorizontalPaddingFromBeatNum(beatNum, accidentalsNum);
  if (isInstanceOfNoteName(token)) {
    const tokenY = TOKEN_MARGIN_Y + ((highNoteValue - getNoteNumericValue(token)) * UNIT);
    drawNoteAt(ctx, tokenX, tokenY, token);
    if (token.rhythmOperators.includes('.')) drawRhythmicDotAt(ctx, tokenX + UNIT * 3, tokenY - UNIT / 2);
    return;
  }
  if (isInstanceOfRhythmicToken(token)) drawRestAt(ctx, tokenX, TOKEN_MARGIN_Y + UNIT * 8, getBeatNumFromOperators(token.rhythmOperators))
};
  