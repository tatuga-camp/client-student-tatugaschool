import React, { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import { MdOutlineRotate90DegreesCcw } from "react-icons/md";
import { profileLanguage } from "../../data/languages";
import { useGetLanguage } from "../../react-query";
import { createCroppedPhotoFile } from "../../utils";
import LoadingBar from "./LoadingBar";

type Area = { x: number; y: number; width: number; height: number };

type Props = {
  file: File;
  onClose: () => void;
  onSave: (file: File) => Promise<void> | void;
};

// Crop and rotate a student photo before upload. Renders only the body; the
// caller hosts it in a Sheet.
function PhotoEditor({ file, onClose, onSave }: Props) {
  const lang = useGetLanguage().data ?? "en";
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [quarterTurns, setQuarterTurns] = useState(0);
  const [fineRotation, setFineRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const rotation = quarterTurns * 90 + fineRotation;
  // Create and revoke the object URL in the same effect so every mount owns
  // its own URL — StrictMode's mount/cleanup/mount cycle would otherwise
  // revoke a URL that is still in use.
  const [imageSrc, setImageSrc] = useState("");
  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleSave = async () => {
    try {
      if (!croppedAreaPixels || !imageSrc) return;
      setSaving(true);
      const croppedFile = await createCroppedPhotoFile({
        imageSrc,
        pixelCrop: croppedAreaPixels,
        rotation,
        fileName: file.name,
      });
      await onSave(croppedFile);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-3 pb-2 font-Anuphan">
      {saving && <LoadingBar />}
      <h2 className="text-base font-bold text-[#383767]">
        {profileLanguage.adjustPhoto(lang)}
      </h2>
      <div className="mx-auto flex w-full max-w-md flex-col gap-3">
        <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-gray-900">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, areaPixels) =>
                setCroppedAreaPixels(areaPixels)
              }
            />
          )}
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">
            {profileLanguage.zoom(lang)}
          </span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            disabled={saving}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="accent-primary-color"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-500">
            {profileLanguage.straighten(lang)}
          </span>
          <input
            type="range"
            min={-45}
            max={45}
            step={1}
            value={fineRotation}
            disabled={saving}
            onChange={(e) => setFineRotation(Number(e.target.value))}
            className="accent-primary-color"
          />
        </label>
        <button
          type="button"
          disabled={saving}
          onClick={() => setQuarterTurns((prev) => (prev + 3) % 4)}
          className="second-button flex w-max items-center justify-center gap-1 border"
        >
          <MdOutlineRotate90DegreesCcw />
          {profileLanguage.rotate90(lang)}
        </button>
        <div className="flex justify-end gap-3 border-t pt-3">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="second-button flex items-center justify-center gap-1 border"
          >
            {profileLanguage.cancel(lang)}
          </button>
          <button
            type="button"
            disabled={saving || !croppedAreaPixels}
            onClick={handleSave}
            className="main-button flex items-center justify-center gap-1"
          >
            {profileLanguage.savePhoto(lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PhotoEditor;
