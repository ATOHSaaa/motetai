import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { siteConfig } from '../config/site';

const require = createRequire(import.meta.url);

export interface OgImageInput {
  title: string;
  description: string;
  label?: string;
}

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const REGULAR_FONT_PATH = require.resolve(
  '@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-400-normal.woff'
);
const BOLD_FONT_PATH = require.resolve(
  '@fontsource/noto-sans-jp/files/noto-sans-jp-japanese-700-normal.woff'
);

let fontsPromise: Promise<satori.Font[]> | null = null;

async function loadFonts(): Promise<satori.Font[]> {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      readFile(REGULAR_FONT_PATH),
      readFile(BOLD_FONT_PATH),
    ]).then(([regular, bold]) => [
      {
        name: 'Noto Sans JP',
        data: regular,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'Noto Sans JP',
        data: bold,
        weight: 700,
        style: 'normal',
      },
    ]);
  }

  return fontsPromise;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function titleFontSize(title: string): number {
  if (title.length > 48) return 40;
  if (title.length > 32) return 48;
  return 56;
}

function OgImageTemplate({ title, description, label }: OgImageInput) {
  const isHome = title === siteConfig.name;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 52%, #1e3a8a 100%)',
        color: '#ffffff',
        padding: '64px',
        fontFamily: 'Noto Sans JP',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '56px',
            height: '56px',
            borderRadius: '12px',
            background: '#2563eb',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: 700,
          }}
        >
          m
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.2 }}>motetai</div>
          <div style={{ fontSize: '18px', opacity: 0.82, marginTop: '4px' }}>
            モテるための婚活・恋愛メディア
          </div>
        </div>
      </div>

      {label && (
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            background: 'rgba(255, 255, 255, 0.16)',
            borderRadius: '9999px',
            padding: '8px 20px',
            fontSize: '20px',
            fontWeight: 700,
            marginBottom: '24px',
          }}
        >
          {label}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: `${titleFontSize(title)}px`,
            fontWeight: 700,
            lineHeight: 1.35,
            letterSpacing: '-0.02em',
          }}
        >
          {truncate(title, 72)}
        </div>
        {!isHome && (
          <div
            style={{
              marginTop: '24px',
              fontSize: '24px',
              lineHeight: 1.5,
              opacity: 0.86,
            }}
          >
            {truncate(description, 96)}
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateOgImage(input: OgImageInput): Promise<Uint8Array> {
  const fonts = await loadFonts();
  const svg = await satori(<OgImageTemplate {...input} />, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  });

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: OG_WIDTH,
    },
  });

  return resvg.render().asPng();
}
