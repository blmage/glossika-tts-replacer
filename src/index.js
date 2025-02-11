import Dexie from 'dexie';
import { createElvenLabsClient } from 'elevenlabs-client';
import isString from 'lodash.isstring';
import isFunction from 'lodash.isfunction';

const API_KEY = __api_key__;

const LANGUAGE_BASE_API_PAYLOADS = __language_base_api_payloads__;

const LANGUAGE_SENTENCE_NORMALIZERS = {
  // [Northern Vietnamese]
  // Remove unwanted dashes.
  vie: (sentence) => sentence.replace(/\p{Pd}/u, ' '),
};

const SESSION_MAIN_CONTAINER_SELECTOR = 'main.glossika-main';

const TARGET_SENTENCE_WRAPPER_SELECTORS = [
  '#session-new-sentence-tar',
  '#session-review-sentence-tar',
];

const CURRENT_TARGET_AUDIO_SELECTORS = [
  '#session-new-media-tar audio',
  '#session-review-media-tar audio',
];

// eslint-disable-next-line no-undef
const db = new Dexie('GlossikaTtsReplacer');

db.version(1).stores({
  sentences: '[sentence+language],creationTs'
});

const ttsClient = createElvenLabsClient({ apiKey: API_KEY });

const originalAudioPlay = Audio.prototype.play;

const sentencePlaybackCounts = {};

const sentenceTtsPromises = {};

Audio.prototype.play = async function () {
  let shouldPlaySound = true;

  if (CURRENT_TARGET_AUDIO_SELECTORS.some(selector => this.matches(selector))) {
    const language = getCurrentSessionLanguageCode();
    const sentence = getCurrentSessionTargetSentence();

    if (language && sentence && LANGUAGE_BASE_API_PAYLOADS[language]) {
      const playbackIx = (sentencePlaybackCounts[sentence] ?? 0) + 1;
      sentencePlaybackCounts[sentence] = playbackIx;

      let ttsSource;
      const volume = this.volume;
      const playbackRate = this.playbackRate;

      try {
        const normalizer = LANGUAGE_SENTENCE_NORMALIZERS[language];

        if (!sentenceTtsPromises[sentence]) {
          sentenceTtsPromises[sentence] = getSentenceTtsAsBase64Mp3(
            normalizer ? normalizer(sentence) : sentence,
            language,
            LANGUAGE_BASE_API_PAYLOADS[language]
          );
        }

        ttsSource = await sentenceTtsPromises[sentence];
      } catch (error) {
        sentenceTtsPromises[sentence] = null;

        // Let Glossika app handle the error (it currently asks the user what to do, reload or skip).
        return Promise.reject();
      }

      if (ttsSource) {
        this.src = 'data:audio/mp3;base64,' + ttsSource;
        await this.load();
        this.volume = volume;
        this.playbackRate = playbackRate;

        // Only play the sound if no other playback was requested in the meantime.
        shouldPlaySound = sentencePlaybackCounts[sentence] === playbackIx;
      }
    }
  }

  return shouldPlaySound ? originalAudioPlay.call(this) : Promise.resolve();
};

function getCurrentSessionLanguageCode() {
  const sessionContainer = document.querySelector(SESSION_MAIN_CONTAINER_SELECTOR);

  if (sessionContainer) {
    const { store } = getReactElementDescendantPropsMatching(
      sessionContainer,
      (props) => props.store && isFunction(props.store.getState)
    ) ?? {};

    if (store?.getState) {
      const { langCode, localeCode } = store.getState().languageReducer?.tarLanguage ?? {};

      if (langCode && localeCode) {
        return `${langCode}-${localeCode}`.toLowerCase();
      }
    }
  }

  return null;
}

function getCurrentSessionTargetSentence() {
  const sentenceWrapper = querySelectors(TARGET_SENTENCE_WRAPPER_SELECTORS);

  if (sentenceWrapper) {
    const { children: sentence } = getReactElementDescendantPropsMatching(
      sentenceWrapper,
      (props) => isString(props.children) && isString(props.langCode) && props.children
    ) ?? {};

    return sentence;
  }

  return null;
}

async function getSentenceTtsAsBase64Mp3(sentence, language, basePayload) {
  try {
    const row = await db.sentences
      .where('sentence')
      .equalsIgnoreCase(sentence.trim())
      .filter((row) => row.language === language)
      .first();

    return row.tts;
  } catch (error) {
    // Assume we never encountered this sentence yet.
  }

  const tts = await generateSentenceTtsAsBase64Mp3(sentence, basePayload);
  const creationTs = Date.now();

  try {
    await db.sentences.put({ sentence, language, tts, creationTs });
  } catch (error) {
    if (
      (error.name === 'QuotaExceededError')
      || (error.inner && (error.inner.name === 'QuotaExceededError'))) {
      try {
        await db.sentences
          .orderBy('creationTs')
          .limit(100)
          .delete();

        await db.sentences.put({ sentence, language, tts, creationTs });
      } catch (error) {
        // We're definitely out of luck here.
      }
    }

    // Let's play the generated TTS anyway.
  }

  return tts;
}

async function generateSentenceTtsAsBase64Mp3(sentence, basePayload) {
  const result = await ttsClient.generateTextToSpeach({
    ...basePayload,
    text: sentence,
  });

  if (result?.value?.stream instanceof ReadableStream) {
    const reader = result.value.stream.getReader();
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      chunks.push(value);
    }

    return btoa(
      chunks.map(chunk => String.fromCharCode(...chunk)).join('')
    );
  }

  return null;
}

function querySelectors(selectors) {
  for (const selector of selectors) {
    const element = document.querySelector(selector);

    if (element) {
      return element;
    }
  }

  return null;
}

function getReactPropsDescendantPropsMatching(props, predicate) {
  const children = Array.isArray(props.children) ? props.children : [ props.children ];

  for (const child of children) {
    if (child.props) {
      if (predicate(child.props)) {
        return child.props;
      }

      const matched = getReactPropsDescendantPropsMatching(child.props, predicate);

      if (matched) {
        return matched;
      }
    }
  }

  return null;
}

function getReactElementDescendantPropsMatching(element, predicate) {
  const fiber = Object
    .entries(element)
    .find(([ k, v ]) => /^__reactFiber\$/i.test(k))
    ?.[1];

  if (fiber) {
    return getReactPropsDescendantPropsMatching(
      fiber.memoizedProps ?? fiber.pendingProps ?? {},
      predicate
    );
  }

  const rootChild = Object
    .entries(element)
    .find(([ k, v ]) => /^__reactContainer\$/i.test(k))
    ?.[1]
    ?.child;

  if (rootChild) {
    return getReactPropsDescendantPropsMatching(
      rootChild.memoizedProps ?? rootChild.pendingProps ?? {},
      predicate
    );
  }

  return null;
}