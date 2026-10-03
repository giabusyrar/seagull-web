import type { EndpointDef } from './endpoint';
import { form, score, match, vision, colour, faceArch, assessments, flows } from './endpoints/core';
import { reference } from './endpoints/reference';
import { wColour, wFace, wSkin, wTryon } from './endpoints/workers';

export interface Group { id: string; title: string; section: 'Core' | 'Reference' | 'Workers'; endpoints: EndpointDef[] }

export const GROUPS: Group[] = [
  { id: 'form', title: 'Form', section: 'Core', endpoints: form },
  { id: 'score', title: 'Score', section: 'Core', endpoints: score },
  { id: 'match', title: 'Match', section: 'Core', endpoints: match },
  { id: 'vision', title: 'Vision', section: 'Core', endpoints: vision },
  { id: 'colour', title: 'Colour', section: 'Core', endpoints: colour },
  { id: 'face-arch', title: 'Face architecture', section: 'Core', endpoints: faceArch },
  { id: 'assessments', title: 'Assessments', section: 'Core', endpoints: assessments },
  { id: 'flows', title: 'Conversation flows', section: 'Core', endpoints: flows },
  { id: 'reference', title: 'Reference', section: 'Reference', endpoints: reference },
  { id: 'w-colour', title: 'Colour worker', section: 'Workers', endpoints: wColour },
  { id: 'w-face', title: 'Face worker', section: 'Workers', endpoints: wFace },
  { id: 'w-skin', title: 'Skin worker', section: 'Workers', endpoints: wSkin },
  { id: 'w-tryon', title: 'Try-on worker', section: 'Workers', endpoints: wTryon },
];

export const getGroup = (id: string) => GROUPS.find((g) => g.id === id);
