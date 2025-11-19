"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  HelpCircle,
  Save,
  X,
  MousePointer,
  Stamp,
  Trash2,
} from "lucide-react";
import { PresepeFolderModal } from "@/components/presepe-folder-modal";
import { useToast } from "@/components/ui/use-toast";
import { Layer, Stage, Image as KonvaImage, Transformer } from "react-konva";
import { toPng } from "html-to-image";
import type { KonvaEventObject, Node as KonvaNode } from "konva/lib/Node";
import type { Transformer as KonvaTransformer } from "konva/lib/shapes/Transformer";
import type { Image as KonvaImageNode } from "konva/lib/shapes/Image";

type StampPlacement = {
  id: string;
  asset: string;
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
};

type StageDimensions = {
  width: number;
  height: number;
};

type NavigatorWithCapabilities = Navigator & {
  vibrate?: (pattern?: number | number[]) => boolean;
  share?: (data?: ShareData) => Promise<void>;
  canShare?: (data?: ShareData) => boolean;
};

export default function Presepe() {
  const [infoOpen, setInfoOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [stamps, setStamps] = useState<StampPlacement[]>([]);
  const [stageSize, setStageSize] = useState<StageDimensions>({
    width: 0,
    height: 0,
  });
  const [isStampMode, setIsStampMode] = useState(true);
  const stampAreaRef = useRef<HTMLDivElement>(null);
  const presepeSectionRef = useRef<HTMLElement | null>(null);
  const suppressMouseStampRef = useRef(false);
  const suppressResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const transformerRef = useRef<KonvaTransformer | null>(null);
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return false;
    }
    return window.matchMedia("(pointer: coarse)").matches;
  });
  const [isSaving, setIsSaving] = useState(false);
  const activeAsset = selectedAsset;
  const isStampActive = Boolean(activeAsset && isStampMode);
  const { toast } = useToast();

  const triggerHapticFeedback = () => {
    if (typeof window === "undefined") return;
    const navigatorRef = window.navigator as NavigatorWithCapabilities;
    if (typeof navigatorRef?.vibrate === "function") {
      navigatorRef.vibrate(150);
    }
  };

  const showModeToast = (mode: "stamp" | "cursor") => {
    toast({
      description: mode === "stamp" ? "Stamp mode enabled" : "Cursor mode enabled",
      duration: 1500,
    });
  };

  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSavePresepe = async () => {
    if (!presepeSectionRef.current || isSaving) return;
    try {
      setIsSaving(true);
      const node = presepeSectionRef.current;
      const pixelRatio = Math.min(Math.max(window.devicePixelRatio || 1.5, 1), 3);
      const dataUrl = await toPng(node, {
        cacheBust: true,
        pixelRatio,
        skipAutoScale: false,
      });
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const filename = `MyPresepe<${day}/${month}/2025>.png`;
      const navigatorRef = window.navigator as NavigatorWithCapabilities;
      const shareSupported =
        isTouchDevice &&
        typeof navigatorRef?.share === "function" &&
        typeof navigatorRef?.canShare === "function";

      if (shareSupported) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], filename, { type: "image/png" });
        if (navigatorRef.canShare?.({ files: [file] })) {
          await navigatorRef.share?.({
            files: [file],
            title: "My Presepe",
            text: "Sharing my presepe creation!",
          });
          toast({ description: "Saved through share", duration: 1500 });
          return;
        }
      }

      downloadDataUrl(dataUrl, filename);
      toast({ description: "Presepe downloaded", duration: 1500 });
    } catch (error) {
      console.error("Failed to save presepe", error);
      toast({
        variant: "destructive",
        description: "Save failed, please try again",
        duration: 2000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const enableStampMode = () => {
    if (!isStampMode) {
      showModeToast("stamp");
      triggerHapticFeedback();
    }
    setIsStampMode(true);
  };

  const enableCursorMode = () => {
    if (isStampMode) {
      showModeToast("cursor");
      triggerHapticFeedback();
    }
    setIsStampMode(false);
  };

  const handleAssetSelected = (asset: string) => {
    setSelectedAsset(asset);
    setCursorPosition(null);
    enableStampMode();
    setSelectedStampId(null);
  };

  useEffect(() => {
    const element = stampAreaRef.current;
    if (!element) return;

    const updateSize = () => {
      const { width, height } = element.getBoundingClientRect();
      setStageSize({ width, height });
    };

    updateSize();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          setStageSize({ width, height });
        }
      });
      observer.observe(element);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    return () => {
      if (suppressResetTimeoutRef.current) {
        clearTimeout(suppressResetTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const query = window.matchMedia("(pointer: coarse)");
    const handleChange = (event: MediaQueryListEvent) =>
      setIsTouchDevice(event.matches);

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handleChange);
      return () => query.removeEventListener("change", handleChange);
    }

    const legacyQuery = query as MediaQueryListLegacy;
    if (legacyQuery.addListener) {
      legacyQuery.addListener(handleChange);
      return () => legacyQuery.removeListener?.(handleChange);
    }

    return;
  }, []);

  useEffect(() => {
    const transformer = transformerRef.current;
    if (!transformer) return;
    if (isStampMode || !selectedStampId) {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
      return;
    }
    const stage = transformer.getStage();
    if (!stage) return;
    const selectedNode = stage.findOne(`#stamp-${selectedStampId}`);
    if (selectedNode) {
      transformer.nodes([selectedNode as KonvaNode]);
      transformer.getLayer()?.batchDraw();
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [isStampMode, selectedStampId, stamps]);

  const updateStampPlacement = (
    id: string,
    updater: (stamp: StampPlacement) => StampPlacement
  ) => {
    setStamps((prev) => prev.map((stamp) => (stamp.id === id ? updater(stamp) : stamp)));
  };

  const clampPercent = (value: number) => Math.min(Math.max(value, 0), 100);

  const handleStampPositionChange = (
    id: string,
    xPercent: number,
    yPercent: number
  ) => {
    updateStampPlacement(id, (stamp) => ({
      ...stamp,
      x: clampPercent(xPercent),
      y: clampPercent(yPercent),
    }));
  };

  const handleStampTransformChange = (
    id: string,
    transform: { scaleX: number; scaleY: number; rotation: number }
  ) => {
    updateStampPlacement(id, (stamp) => ({
      ...stamp,
      scaleX: transform.scaleX,
      scaleY: transform.scaleY,
      rotation: transform.rotation,
    }));
  };

  const handleDeleteSelectedStamp = () => {
    if (!selectedStampId) return;
    setStamps((prev) => prev.filter((stamp) => stamp.id !== selectedStampId));
    setSelectedStampId(null);
  };

  const handleStagePointerDown = (
    event: KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    if (!isStampMode) {
      setCursorPosition(null);
      const stage = event.target.getStage();
      if (stage && event.target === stage) {
        setSelectedStampId(null);
      }
      return;
    }

    const eventType = event.evt?.type ?? "";

    if (eventType === "touchstart") {
      suppressMouseStampRef.current = true;
      if (suppressResetTimeoutRef.current) {
        clearTimeout(suppressResetTimeoutRef.current);
      }
      suppressResetTimeoutRef.current = setTimeout(() => {
        suppressMouseStampRef.current = false;
        suppressResetTimeoutRef.current = null;
      }, 400);
    } else if (eventType === "mousedown" && suppressMouseStampRef.current) {
      return;
    }

    if (
      !isStampActive ||
      stageSize.width === 0 ||
      stageSize.height === 0 ||
      !activeAsset
    )
      return;
    const stage = event.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    setCursorPosition(pointer);

    const relativeX = (pointer.x / stageSize.width) * 100;
    const relativeY = (pointer.y / stageSize.height) * 100;

    setStamps((prev) => [
      ...prev,
      {
        id:
          typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID()
            : `${Date.now()}-${prev.length}`,
        asset: activeAsset,
        x: relativeX,
        y: relativeY,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
    ]);
  };

  const handleStagePointerMove = (
    event: KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    if (!isStampActive || !activeAsset) {
      setCursorPosition(null);
      return;
    }
    const stage = event.target.getStage();
    if (!stage) return;
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    setCursorPosition(pointer);
  };

  return (
    <section
      ref={presepeSectionRef}
      className="banner-section min-h-[100vh] relative p-[6vw]"
    >
      <div className="absolute right-[6%] top-[2%] z-20 flex gap-3">
        <PresepeFolderModal onAssetSelected={handleAssetSelected} />
        <button
          type="button"
          aria-label="Switch to cursor mode"
          onClick={() => {
            enableCursorMode();
            setCursorPosition(null);
            setSelectedStampId(null);
          }}
          className={`rounded-full border border-white/60 p-3 text-white backdrop-blur transition ${
            !isStampMode ? "bg-white/40" : "bg-white/10"
          } hover:bg-white/30`}
        >
          <MousePointer className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Enable stamp mode"
          onClick={() => {
            enableStampMode();
            setSelectedStampId(null);
            setCursorPosition(null);
          }}
          disabled={!selectedAsset}
          className={`rounded-full border border-white/60 p-3 text-white backdrop-blur transition ${
            isStampMode ? "bg-white/40" : "bg-white/10"
          } hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <Stamp className="h-5 w-5" />
        </button>
        {!isStampMode && (
          <button
            type="button"
            aria-label="Delete selected stamp"
            onClick={handleDeleteSelectedStamp}
            disabled={!selectedStampId}
            className="rounded-full border border-rose-200/80 bg-rose-200/20 p-3 text-white backdrop-blur transition hover:bg-rose-200/40 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        )}
        <button
          type="button"
          aria-label="What is presepe"
          onClick={() => setInfoOpen(true)}
          className="rounded-full border border-white/60 bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/30"
        >
          <HelpCircle className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Save presepe"
          onClick={handleSavePresepe}
          disabled={isSaving}
          className="rounded-full border border-white/60 bg-white/10 p-3 text-white backdrop-blur transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-5 w-5" />
        </button>
      </div>
      <h2
        className="absolute top-[7%] left-0 z-10 w-full text-center text-[13vw] uppercase md:text-[14vw] lg:left-[-20%] lg:text-[7vw]"
        data-text="MY PRESEPE"
      >
        <span className="layered-text banner-title" data-text="MY PRESEPE">
          MY PRESEPE
        </span>
      </h2>
      <Image
        src="/graphs/presepe/frame.svg"
        alt="frame"
        width={1240}
        height={1180}
        className="pointer-events-none absolute left-1/2 top-[52%] z-[4] w-full max-w-[52rem] -translate-x-1/2 -translate-y-1/2 md:top-[50%] md:w-[80vw] md:max-w-[66rem] lg:top-[48%] lg:w-[65vw] lg:max-w-[76rem] select-none"
      />
      <div
        ref={stampAreaRef}
        className={`pointer-events-none absolute inset-0 z-[5] ${
          isStampActive ? "cursor-crosshair" : "cursor-auto"
        }`}
      >
        {stageSize.width > 0 && stageSize.height > 0 && (
          <>
            <Stage
              width={stageSize.width}
              height={stageSize.height}
              className="absolute inset-0 pointer-events-auto"
              onMouseDown={handleStagePointerDown}
              onTouchStart={handleStagePointerDown}
              onMouseMove={handleStagePointerMove}
              onTouchMove={handleStagePointerMove}
              onMouseLeave={() => setCursorPosition(null)}
              onTouchEnd={() => setCursorPosition(null)}
            >
              <Layer listening={!isStampMode}>
                {stamps.map((stamp) => (
                  <StampSprite
                    key={stamp.id}
                    stamp={stamp}
                    stageSize={stageSize}
                    isEditable={!isStampMode}
                    isSelected={!isStampMode && selectedStampId === stamp.id}
                    onSelect={() => setSelectedStampId(stamp.id)}
                    onPositionChange={(xPercent, yPercent) =>
                      handleStampPositionChange(stamp.id, xPercent, yPercent)
                    }
                    onTransformChange={(transform) =>
                      handleStampTransformChange(stamp.id, transform)
                    }
                  />
                ))}
                {!isStampMode && (
                  <Transformer
                    ref={transformerRef}
                    rotateEnabled
                    anchorSize={12}
                    borderStroke="#ffffff"
                    borderStrokeWidth={1}
                    anchorFill="#ffffff"
                    anchorStroke="#1c274c"
                  />
                )}
              </Layer>
            </Stage>
            {isStampActive &&
              selectedAsset &&
              cursorPosition &&
              !isTouchDevice && (
              <div
                className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${cursorPosition.x}px`,
                  top: `${cursorPosition.y}px`,
                }}
              >
                <Image
                  src={`/graphs/presepe/${selectedAsset}`}
                  alt={selectedAsset
                    .replace(/\.svg$/i, "")
                    .replace(/([A-Z])/g, " $1")}
                  width={120}
                  height={120}
                  className="h-20 w-20 object-contain opacity-80 drop-shadow-lg"
                />
              </div>
            )}
          </>
        )}
      </div>
      {infoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-5 py-10"
          onClick={() => setInfoOpen(false)}
        >
          <div
            className="rounded-3xl border border-white/20 bg-[#072642] p-6 text-white shadow-2xl max-w-lg w-full"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-lg font-semibold uppercase tracking-wide">
                What is a Presepe?
              </p>
              <button
                type="button"
                aria-label="Close presepe info"
                onClick={() => setInfoOpen(false)}
                className="rounded-full border border-white/40 p-2 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
              A presepe is the Italian word for a nativity scene, which is a
              special display representing the birth of Jesus Christ. The
              tradition of the presepe dates back to 1223 with St. Francis of
              Assisi&apos;s first living nativity scene.
              <br />
              <br />
              Browse the stamps in the folder and click any to start assembling
              your own presepe story.
            </p>
            <br />
            <div className="relative mt-4 w-full overflow-hidden rounded-2xl border border-white/10 aspect-video">
              <Image
                src="/graphs/DEMO-PC/60.jpg"
                alt="frame preview"
                fill
                sizes="(max-width: 768px) 90vw, 640px"
                className="object-cover"
                priority={false}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const stampImageCache = new Map<string, HTMLImageElement>();
type MediaQueryListLegacy = MediaQueryList & {
  addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
  removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
};

function useStampAssetImage(asset: string) {
  const src = asset ? `/graphs/presepe/${asset}` : null;
  const [cacheVersion, setCacheVersion] = useState(0);

  useEffect(() => {
    if (!src || stampImageCache.has(src)) {
      return;
    }

    let isMounted = true;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      stampImageCache.set(src, img);
      if (isMounted) {
        setCacheVersion((version) => version + 1);
      }
    };

    return () => {
      isMounted = false;
    };
  }, [src]);

  return useMemo(() => {
    if (!src) return null;
    void cacheVersion; // depend on cache busting updates
    return stampImageCache.get(src) ?? null;
  }, [src, cacheVersion]);
}

type StampSpriteProps = {
  stamp: StampPlacement;
  stageSize: StageDimensions;
  isEditable: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onPositionChange: (xPercent: number, yPercent: number) => void;
  onTransformChange: (transform: {
    scaleX: number;
    scaleY: number;
    rotation: number;
  }) => void;
};

function StampSprite({
  stamp,
  stageSize,
  isEditable,
  isSelected,
  onSelect,
  onPositionChange,
  onTransformChange,
}: StampSpriteProps) {
  const image = useStampAssetImage(stamp.asset);
  if (!image || stageSize.width === 0 || stageSize.height === 0) {
    return null;
  }

  const x = (stamp.x / 100) * stageSize.width;
  const y = (stamp.y / 100) * stageSize.height;
  const baseSize = Math.max(stageSize.width * 0.12, 60);
  const stampSize = Math.min(baseSize, 160);
  const maxDimension = Math.max(image.width || 1, image.height || 1);
  const scale = stampSize / maxDimension;
  const width = (image.width || stampSize) * scale;
  const height = (image.height || stampSize) * scale;

  const notifyPosition = (node: KonvaImageNode) => {
    const newXPercent = (node.x() / stageSize.width) * 100;
    const newYPercent = (node.y() / stageSize.height) * 100;
    onPositionChange(newXPercent, newYPercent);
  };

  const handleSelect = (
    event: KonvaEventObject<MouseEvent | TouchEvent>
  ) => {
    event.cancelBubble = true;
    onSelect();
  };

  const handleDragEnd = (
    event: KonvaEventObject<DragEvent | MouseEvent | TouchEvent>
  ) => {
    event.cancelBubble = true;
    notifyPosition(event.target as KonvaImageNode);
  };

  const handleTransformEnd = (
    event: KonvaEventObject<Event>
  ) => {
    event.cancelBubble = true;
    const node = event.target as KonvaImageNode;
    onTransformChange({
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
      rotation: node.rotation(),
    });
    notifyPosition(node);
  };

  return (
    <KonvaImage
      id={`stamp-${stamp.id}`}
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      offsetX={width / 2}
      offsetY={height / 2}
      draggable={isEditable && isSelected}
      listening={isEditable}
      scaleX={stamp.scaleX}
      scaleY={stamp.scaleY}
      rotation={stamp.rotation}
      shadowBlur={isSelected ? 15 : 0}
      shadowColor={isSelected ? "#ffffff" : undefined}
      onMouseDown={isEditable ? handleSelect : undefined}
      onTap={isEditable ? handleSelect : undefined}
      onDragEnd={isEditable ? handleDragEnd : undefined}
      onTransformEnd={isEditable ? handleTransformEnd : undefined}
    />
  );
}
