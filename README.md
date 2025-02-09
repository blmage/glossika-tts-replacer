# Glossika TTS Replacer

A userscript that replaces [Glossika](https://ai.glossika.com/)'s built-in text-to-speech (TTS) with high-quality voices from the [ElevenLabs](https://elevenlabs.io/) API.

## Requirements

Before installing, ensure you have:

- An [ElevenLabs](https://elevenlabs.io/) account (the free plan should be sufficient).
- [Node.js](https://nodejs.org/) and either [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) installed.
- A [userscript manager](https://en.wikipedia.org/wiki/Userscript_manager), such as:
    - [Greasemonkey](https://www.greasespot.net/)
    - [Tampermonkey](https://www.tampermonkey.net/)
    - [Violentmonkey](https://violentmonkey.github.io/)

---

## Installation

### 1. Get the repository

#### Option A: Clone via Git

```sh
git clone https://github.com/blmage/glossika-tts-replacer.git
cd glossika-tts-replacer
```

#### Option B: Download manually

Download the repository as a ZIP archive and extract it to a local directory.

---

### 2. Install Dependencies

Run:

```sh
npm install
# or
yarn install
```

---

### 3. Configure the script

Create a `settings.json` file in the root directory, using [`settings.json.sample`](settings.json.sample) as a template. Adjust the settings to match your preferences.

#### `settings.json` Configuration

Refer to the [ElevenLabs API documentation](https://elevenlabs.io/docs/api-reference/text-to-speech/convert#request) for details on available options.

- **`api_key`**: Your ElevenLabs API key (required).
- **`languages`**: A mapping of language keys to TTS configurations.
    - **Language key (e.g., `fra-sd`)**: Defines settings for a specific language. See the [list of languages](#list-of-languages) below.
    - **`modelId`**: The TTS model to use (e.g., `eleven_flash_v2_5`).
    - **`voice`**: The voice ID (check your [ElevenLabs account](https://elevenlabs.io/app/voice-lab) for available voices).
    - **`languageCode`** (for **Turbo v2.5** and **Flash v2.5** models only): Specifies the enforced language.
    - **`voiceSettings`**: Fine-tuning parameters:
        - **`stability`**: Controls speech consistency (`0.0` to `1.0`).
        - **`similarityBoost`**: Adjusts speech resemblance to the reference voice.
        - **`style`**: Affects expressiveness.
        - **`useSpeakerBoost`**: Enhances clarity and presence.

---

### 4. Build the Userscript

Run:

```sh
npm run build
# or
yarn build
```

The compiled userscript will be generated in the `dist/` directory.

---

### 5. Install the Userscript

1. Locate `dist/gtr.user.js`.
2. Open your userscript manager and manually add the script.

⚠️ **Security Warning:**  
Your ElevenLabs API key is stored in plain text within the userscript. **Do not share your script with others unless you have removed or obfuscated the key.**

---

## List of Languages

The list is out of date? Please open an [issue](https://github.com/blmage/glossika-tts-replacer/issues/new?template=Blank+issue) to let me know!

| Language | Key (Glossika) | Code (ElevenLabs) |
| --- |----------------|------------------ |
| Arabic (Egyptian) | arz-sd | Not Supported |
| Arabic (Standard) | arb-sd | Not Supported |
| Armenian (Eastern) | hye-sd | Not Supported |
| Azerbaijani | azj-sd | Not Supported |
| Belarusian | bel-sd | Not Supported |
| Bengali (India) | ben-in | Not Supported |
| Bulgarian | bul-sd | bul |
| Cantonese (HK) | yue-hk | Not Supported |
| Catalan | cat-sd | Not Supported |
| Chinese (Beijing) | cmn-cn | zh |
| Chinese (Taiwan) | cmn-tw | zh |
| Croatian | hrv-sd | hr |
| Czech | ces-sd | cs |
| Danish | dan-sd | da |
| Dutch | nld-sd | nl |
| English (UK) | eng-gb | en-gb |
| English (US) | eng-us | en-us |
| Estonian | ekk-sd | Not Supported |
| Finnish (SW dialect) | fin-sout2677 | fi |
| French | fra-sd | fr |
| Gaelic | gla-sd | Not Supported |
| Georgian | kat-sd | Not Supported |
| German | deu-sd | de |
| Greek (Modern) | ell-sd | el |
| Hakka (Hailu) | hak-hl | Not Supported |
| Hakka (Sixian) | hak-sx | Not Supported |
| Hebrew | heb-sd | Not Supported |
| Hindi | hin-sd | hi |
| Hungarian | hun-sd | hu |
| Icelandic | isl-sd | Not Supported |
| Indonesian | ind-sd | id |
| Irish | gle-co | Not Supported |
| Italian | ita-sd | it |
| Japanese | jpn-sd | ja |
| Kazakh | kaz-sd | Not Supported |
| Korean | kor-sd | ko |
| Kurdish (Sorani) | ckb-sd | Not Supported |
| Latvian | lav-sd | Not Supported |
| Lithuanian | lit-sd | Not Supported |
| Manx | glv-sd | Not Supported |
| Mongolian | khk-sd | Not Supported |
| Moroccan Arabic | ary-sd | Not Supported |
| Norwegian (Nynorsk) | nno-sd | no |
| Persian | pes-sd | Not Supported |
| Polish | pol-sd | pl |
| Portuguese (Brazil) | por-br | pt-br |
| Portuguese (European) | por-pt | pt |
| Russian | rus-sd | ru |
| Serbian (Ekavian) | srp-ek | Not Supported |
| Slovak | slk-sd | sk |
| Slovene | slv-sd | Not Supported |
| Spanish (Mexico) | spa-mx | es-mx |
| Spanish (Spain) | spa-es | es |
| Swahili | swa-sd | Not Supported |
| Swedish | swe-sd | sv |
| Tagalog | tgl-sd | fil |
| Taiwanese Hokkien | nan-tw | Not Supported |
| Thai | tha-sd | th |
| Turkish | tur-sd | tr |
| Ukrainian | ukr-sd | uk |
| Uzbek | uzn-sd | Not Supported |
| Vietnamese (Northern) | vie-hn | vi |
| Vietnamese (Southern) | vie-sg | vi |
| Welsh | cym-sd | Not Supported |
| Wenzhounese (Wu) | wuu-wz | Not Supported |

---

## Usage

Once installed, the script automatically replaces Glossika’s TTS with custom voices from ElevenLabs.

To change voices or adjust settings, modify `settings.json` and rebuild the script.

---

## Contributing

Contributions are welcome!

- Open an [issue](https://github.com/blmage/glossika-tts-replacer/issues/new?template=Blank+issue) for bug reports or suggestions.
- Submit a [pull request](https://github.com/blmage/glossika-tts-replacer/compare) for code contributions.

---

## License

This project is licensed under the [MIT License](LICENSE).

**Glossika is a registered trademark of Glossika Pte. Ltd. This extension is not affiliated with Glossika in any way.**  

