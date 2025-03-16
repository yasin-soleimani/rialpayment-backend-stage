import { Inject } from '@vision/common';

import { EVENT_EMITTER_TOKEN } from './constants';

export const InjectEventEmitter = () => Inject(EVENT_EMITTER_TOKEN);
