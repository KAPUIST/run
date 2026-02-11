"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { track } from "@vercel/analytics";
import Link from "next/link";

const STYLE_NAMES: Record<string, string> = {
  manhwa: "한국 만화",
  crayon: "유치원 느낌",
  catface: "고양이 변신",
  gta: "GTA",
  pixel: "픽셀아트",
  magazine: "잡지",
  receipt: "영수증",
  film: "필름카메라",
};

const WATERMARK = "run-sand.vercel.app";

/** canvas에 워터마크 그리기 */
function drawWatermark(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const fontSize = Math.max(12, Math.round(h * 0.018));
  ctx.font = `500 ${fontSize}px -apple-system, "Helvetica Neue", sans-serif`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.fillText(WATERMARK, w - fontSize * 0.6, h - fontSize * 0.5);
}

/** data URI → 워터마크 찍힌 data URI + blob */
function stampWatermark(
  dataUri: string,
  quality = 0.92,
): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      drawWatermark(ctx, img.naturalWidth, img.naturalHeight);

      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve({ dataUrl, blob })
            : reject(new Error("toBlob failed")),
        "image/jpeg",
        quality,
      );
    };
    img.onerror = reject;
    img.src = dataUri;
  });
}

function ResultContent() {
  const searchParams = useSearchParams();
  const style = searchParams.get("style");
  const styleName = style ? STYLE_NAMES[style] || style : "AI 스타일";

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  // blob URL for long-press save on mobile
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("generated-image");
    if (!stored) return;

    // 워터마크를 먼저 찍고 표시 — 어떤 방법으로 저장해도 워터마크 포함
    stampWatermark(stored).then(({ dataUrl, blob }) => {
      setImageUrl(dataUrl);
      setBlobUrl(URL.createObjectURL(blob));
    });
  }, []);

  const isMobile =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|Android/i.test(navigator.userAgent);

  // 데스크톱 다운로드
  const handleDesktopDownload = useCallback(async () => {
    if (!imageUrl) return;
    setSaving(true);
    try {
      const res = await fetch(imageUrl);
      const jpegBlob = await res.blob();
      const url = URL.createObjectURL(jpegBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `뛰어_${style || "ai"}_${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      track("image_downloaded", { style: style || "unknown" });
    } catch (e) {
      console.error("Download failed:", e);
    }
    setSaving(false);
  }, [imageUrl, style]);

  if (!imageUrl) {
    return (
      <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--text-secondary)] mb-4">
            결과 이미지가 없습니다.
          </p>
          <Link href="/create" className="btn-primary">
            새로 만들기
          </Link>
        </div>
      </div>
    );
  }

  // 모바일에서 표시할 이미지 src: blob URL 우선 (길게 눌러서 저장 가능)
  const displaySrc = blobUrl || imageUrl;

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-[rgba(7,7,11,0.8)] backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-screen-sm mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="nav-logo text-base">
            <span className="logo-accent">뛰</span>어
            <span className="logo-dot"></span>
          </Link>
          <span className="font-mono text-xs text-[var(--accent-primary)]">
            {styleName}
          </span>
        </div>
      </div>

      {/* Result */}
      <div className="flex-1 flex items-start justify-center px-5 py-8">
        <div className="w-full max-w-sm flex flex-col items-center gap-5">
          {/* 이미지 — 모바일에서 길게 누르면 "사진에 추가" 가능 */}
          <div className="relative w-full rounded-2xl overflow-hidden border-2 border-[rgba(255,77,0,0.2)] shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displaySrc}
              alt={`${styleName} AI 결과`}
              className="w-full h-auto block"
            />
          </div>

          {/* 모바일: 길게 눌러서 저장 안내 */}
          {isMobile && (
            <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl px-4 py-3 w-full">
              <span className="text-lg">👆</span>
              <p className="text-sm text-[var(--text-secondary)]">
                사진을{" "}
                <strong className="text-[var(--text-primary)]">
                  길게 누르면
                </strong>{" "}
                &quot;사진에 추가&quot;로 저장할 수 있어요
              </p>
            </div>
          )}

          {/* 데스크톱: 다운로드 버튼 */}
          {!isMobile && (
            <button
              onClick={handleDesktopDownload}
              disabled={saving}
              className="btn-primary w-full justify-center text-base py-4 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  저장 중...
                </>
              ) : (
                <>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  사진 다운로드
                </>
              )}
            </button>
          )}

          <Link
            href="/create"
            className="btn-secondary w-full justify-center text-base py-4 text-center"
          >
            다른 스타일로 다시 만들기
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center">
          <div className="text-[var(--text-secondary)]">로딩 중...</div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
