/**
 * USE CASES TO SOLVE
 * 



- Parse slurs

-- when drawing each token:
--- if token is slur marker:
---- push to arr
---- if arr.length === 2:
----- drawSlur(...arr)
----- arr = []




- Render accents



- Render flags for durations < 1
-- eighth:
--- ...
-- sixteenth:
--- eighth + ... 



- Text editor highlighting
-- When textarea is focused, and cursor is in the text editor, the corresponding beat Index in the staff is highlighted
-- Specific tokens correspond to colors
--- Note tokens are {color[0]}
--- Rest tokens are {color[1]}
--- Slur marker tokens are {color[2]}



- When rendering 2nd, attempt to alternate up/down directions for stem & position heads accordingly


- Metadata / other general formatting or configuration based data to express
-- :\[a-z]{1,} -> begin configuration closure with value
-- :treble -> treble clef only; will default to drawing tessitura instead of default (AKA drawing in the most 'convenient' clef for given note clusters)
-- :group-3 -> begin grouping bars for notes in 3s, e.g. each set of 3 consecutive eighth notes is treated as a barred group
-- :[item one, item two, ...]
-- :[treble time-sig -- 4 4]

-- :voice --> experiment with this. allow voices to be 'stacked' vertically & render tokens within same staff.

-- :config::group-rhythms -> when a note cluster has rhythmic operators applied, all notes within cluster have same rhythm


TODOS TO DOCUMENT

- support for double sharp notation (e.g. support '*' in addition to '##')

 */

import { INoteToken, TToken, isInstanceOfRhythmicToken, isInstanceOfNoteName, isInstanceOfSlurMarkerToken, TLineDirection } from "./types";
import { UNIT, STAFF_MARGIN, ELLIPSE_RADIUS, TOKEN_PADDING, accidentalsRe } from "./constants";
import { getNoteNumericValue, toNoteTokenFromString, toTokens, getBeatNumFromOperators } from "./token-helpers";
import { drawStaff, drawTokenAtBeat } from "./canvas-helpers";

// TODO: currently set to default to Treble values
const [defaultMin, defaultMax] = [getNoteNumericValue(toNoteTokenFromString('D', 4)), getNoteNumericValue(toNoteTokenFromString('G', 5))];
const getMinMaxNotes = (tokens: INoteToken[]) => {
  const values = tokens.map((t) => getNoteNumericValue(t));
  return [Math.min(defaultMin, ...values), Math.max(defaultMax, ...values)];
};

// LINE RULES
// all half notes and quarter notes draw a line on either R or L side
// all eighth notes have either a single line or are part of a line grouping
// line groupings are set to global default (TODO: allow user configure this value) (FOR NOW: POTENTIAL TODO TO UPDATE THIS FOR MORE COMPLEX NOTE GROUPINGS)

const TREBLE_TOP_NOTE = getNoteNumericValue(toNoteTokenFromString('G', 5));

interface ISlurIndex {
  index: number;
  noteheadDirection: TLineDirection;
}

class StaffCanvas {
  private root: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tokens: TToken[];
  private highNoteValue: number;
  // private lowNoteValue: number;
  private topPadding: number;
  
  constructor(root: HTMLDivElement, initTokensStr = '') {
    this.topPadding = 0;
    this.highNoteValue = getNoteNumericValue(toNoteTokenFromString('G', 5));
    this.tokens = toTokens(initTokensStr);
    this.root = root;
    this.canvas = this.root.querySelector('canvas#canvas')! as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    this.drawCanvas();
    (this.root.querySelector('textarea#markup-input')! as HTMLTextAreaElement).addEventListener('input', (e) => this.handleInputChange(e));
  }
  
  drawCanvas() {
    const [min, max] = getMinMaxNotes(this.tokens.filter(isInstanceOfNoteName));
    const rhythmicTokens = this.tokens.filter(isInstanceOfRhythmicToken);
    const staffWidth = rhythmicTokens.reduce((acc, curr, i) => {
      const currBeatsAmt = getBeatNumFromOperators(curr.rhythmOperators);
      let beatsAmtToAdd = currBeatsAmt;
      let accidentalsPadding = 0;

      if (i > 0 && rhythmicTokens[i - 1].beatIndex === curr.beatIndex) {
        const prevBeatsAmt = getBeatNumFromOperators(rhythmicTokens[i - 1].rhythmOperators);
        beatsAmtToAdd -= Math.min(prevBeatsAmt, currBeatsAmt);
      }
      if (isInstanceOfNoteName(curr) && curr.noteName.match(accidentalsRe)) accidentalsPadding += 1;

      const beatsWidth = beatsAmtToAdd * ELLIPSE_RADIUS * 2;
      const totalPadding = TOKEN_PADDING * beatsAmtToAdd;
      return acc + accidentalsPadding * UNIT / 2 + totalPadding + beatsWidth;
    }, 0);
    const minHeight = Math.max(max - min, 11);
    this.canvas.height = UNIT * 2 * minHeight + (STAFF_MARGIN * 2);
    this.canvas.width = Math.max(0, staffWidth + STAFF_MARGIN * 2);
    this.highNoteValue = max;
    // this.lowNoteValue = min;
    this.topPadding = UNIT * (
      this.highNoteValue - TREBLE_TOP_NOTE
    );
    this.ctx.reset();
    drawStaff(this.ctx, this.topPadding, staffWidth);
    
    
    // handle slurring: need startInd & endInd
    // on backtick (`): set either startInd or endInd
    // if no startInd: set startInd
    // if startInd: set endInd; drawSlur(startInd, endInd)

    // const slurIndices: ISlurIndex[] = [];

    let currAccidentalsAmt = 0;
    this.tokens.forEach((t) => {
      // TODO: eval why TS won't allow mult instanceOf or similar (shouldn't need to cast below to work)
      // TODO: avoid dupe accidentals (e.g. in note clusters of same beat index)
      if (isInstanceOfNoteName(t) && (t as INoteToken).accidentals.length > 0) currAccidentalsAmt++;
      if (isInstanceOfRhythmicToken(t)) drawTokenAtBeat(this.ctx, t, t.beatIndex, currAccidentalsAmt, this.highNoteValue);
      // if (isInstanceOfSlurMarkerToken(t)) drawSlurAtBeats(this.ctx, )
    });
  }
  
  handleInputChange(e: Event) {
    const t = <HTMLTextAreaElement>e.target;
    this.tokens = toTokens(t.value);
    this.drawCanvas();
  }
}
const appRoot = document.getElementById('app')! as HTMLDivElement;

const app = new StaffCanvas(appRoot)

  // TODO: handle errors in markup
  // allow errors in specific spots in tokens
  // mark specific missing data for token to be complete
  // bubble up to app
  // OR set markup errors in state of app
  // include specific locations of errors
  // on change of these state data:
  // render error message at location dependent on data set from location in text & its location on screen

/**
 * parsing process
 * 
 * Examples of "dotted quarter, eighth, eighth, eighth rest, sixteenth note, dotted half note"
 * 
 * potential for handling slurs using backticks:
 * - get match groups using backticks (ensure closing backtick; if not, then skip this & tokenize remainder of string)
 * - when passing the resulting match group (AKA some notes, some rests, some slurred groups):
 * - if current thing being parsed a slurred group:
 * - 
 * 
 * operators (AKA 'what follows the note name'):
 * _ -> double
 * / -> divide by 2
 * . -> add half
 * 
 * D3_ -> half note
 * D3__ -> whole
 * D3_. -> dotted half
 * D3. -> dotted quarter
 * D3/ -> eighth
 * D3// -> sixteenth
 * D3//. -> dotted sixteenth
 * 
 */

/**
 * slurring: use backticks
 * 
 * `e f e f` -> slur e to f twice
 * 
 * crescendo / diminuendo:
 * - init: << | >>
 * - term: << | >>
 * 
 * ex: crescendo from c to g, then reverse
 * << c4 d e f G << >> f e d c >> 
 * 
 * Single quarter notes
 * 
 * {[A-Z]\d} : noteName
 * ex: G4 -> half note G4
 * 
 * single spaces are ignored;
 * double spaces are treated as a quarter rest by default (?)
 * OR: add a 'rest' token before & after spaces to indicate rest amount(s)
 * 
 * To use specific rests, tokens must be used:
 * 
 * e4 _ f# -> e, quarter rest, f
 * e4 _/ f# -> e, eighth rest, f
 * e/ _// f#/_G -> eighth e, sixteenth rest, eighth f slur to g
 * 
 * D4_E4 -> d slur to e
 * 
 * D
 * 
 * D4^ Edededede -> d with accent, rest, e, quarter notes back and forth
 * 
 * e/ -> eight note e
 * e// -> 16th note e
 * 
 * _ -> quarter rest
 * 
 * -. -> dotted quarter rest
 * 
 * D4. -> dotted half note
 * d4 -> quarter note
 * 
 * d4/ -> eighth note
 * d4/. -> dotted eighth note
 * 
 * d4/ .d//_c#/d/
 * 
 */
