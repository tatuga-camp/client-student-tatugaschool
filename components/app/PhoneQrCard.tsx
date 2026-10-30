import { useRouter } from "next/router";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { WIDE_STAGE_QUERY, useMediaQuery } from "./useIsFramed";
import { LuQrCode } from "react-icons/lu";
import { frameLanguage } from "../../data/languages";
import { useGetLanguage, useGetSubjectById } from "../../react-query";
import { phoneHandoffUrl } from "../../utils/phoneHandoff";
import { safeGet, safeRemove, safeSet } from "../../utils/safeStorage";
import { guideClips } from "../signin/mascotAvatars";

const HIDDEN_KEY = "frame_qr_hidden";

/** "Scan to open on your phone" card on the desktop stage. */
export function PhoneQrCard() {
  const router = useRouter();
  const language = useGetLanguage();
  const l = language.data ?? "en";
  const subjectId =
    typeof router.query.subjectId === "string" ? router.query.subjectId : "";
  const subject = useGetSubjectById({ id: subjectId });
  // Only mounted client-side (framed), so lazy reads cannot mismatch hydration.
  const [origin] = useState(() => window.location.origin);
  const [storedCode, setStoredCode] = useState<string | null>(null);
  const [hidden, setHidden] = useState(() => safeGet(HIDDEN_KEY) === "1");
  // Narrow stages have no room beside the phone: the card is a button that
  // opens it on demand instead.
  const wide = useMediaQuery(WIDE_STAGE_QUERY);
  const [open, setOpen] = useState(false);

  // The stored code can change as the student moves around.
  useEffect(() => {
    setStoredCode(safeGet("subject_code"));
  }, [router.asPath]);

  const subjectCode =
    (subjectId ? subject.data?.code : null) ?? storedCode ?? null;
  const url = origin
    ? phoneHandoffUrl({
        origin,
        pathname: router.pathname,
        asPath: router.asPath,
        subjectCode,
      })
    : "";

  const showCard = wide ? !hidden : open;

  if (!showCard) {
    return (
      <button
        type="button"
        aria-label={frameLanguage.qrShow(l)}
        onClick={() => {
          if (wide) {
            safeRemove(HIDDEN_KEY);
            setHidden(false);
          } else {
            setOpen(true);
          }
        }}
        className="absolute bottom-[14px] left-[14px] z-[3] grid h-10 w-10 place-items-center rounded-xl border-2 border-b-4 border-[#E3E8F0] bg-white text-xl text-icon-color"
      >
        <LuQrCode />
      </button>
    );
  }

  return (
    <div className="absolute bottom-[62px] left-[14px] z-[3] w-[196px] font-Anuphan min-[920px]:bottom-auto min-[920px]:left-[34px] min-[920px]:top-1/2 min-[920px]:-translate-y-[40%] rounded-[22px] border-2 border-b-[5px] border-[#E3E8F0] bg-white px-[14px] pb-3 pt-[14px] text-center shadow-[0_12px_30px_rgba(0,0,0,.12)]">
      {guideClips && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={guideClips.poster}
          alt=""
          className="pointer-events-none absolute -top-[46px] right-[10px] h-16 w-16 drop-shadow-md"
        />
      )}
      <div className="relative mx-auto box-content h-[150px] w-[150px] rounded-[14px] border-2 border-[#EEF1F6] bg-white p-2">
        {/* Level H: the "T" tile covers the middle of the code. */}
        {url && (
          <QRCodeSVG value={url} size={150} level="H" fgColor="#383767" />
        )}
        <span className="absolute left-1/2 top-1/2 -ml-[15px] -mt-[15px] grid h-[30px] w-[30px] place-items-center rounded-[9px] border-[3px] border-white bg-primary-color text-[13px] font-bold text-white">
          T
        </span>
      </div>
      <b className="mt-[10px] block text-sm text-icon-color">
        {frameLanguage.qrTitle(l)}
      </b>
      <span className="mt-0.5 block text-[10.5px] font-semibold leading-[1.45] text-[#7A80A0]">
        {frameLanguage.qrBody(l)}
      </span>
      <button
        type="button"
        onClick={() => {
          if (wide) {
            safeSet(HIDDEN_KEY, "1");
            setHidden(true);
          } else {
            setOpen(false);
          }
        }}
        className="mt-2 text-[10px] font-bold text-primary-color"
      >
        {frameLanguage.qrHide(l)}
      </button>
    </div>
  );
}
