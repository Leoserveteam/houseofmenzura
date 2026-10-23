/* eslint-disable @next/next/no-img-element */
export default function Wordmark({ width = 132 }: { width?: number }) {
  return <img src="/icons/wordmark.svg" alt="Menzura" width={width} height={Math.round((width * 18.27) / 132)} />;
}
