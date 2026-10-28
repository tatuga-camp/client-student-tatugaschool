import { useRouter } from "next/router";
import { useEffect } from "react";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { queryString } from "../../../components/common/RouteParamsGate";
import { safeGet } from "../../../utils/safeStorage";

/** The subject list is the shell's Subjects tab now. */
function Page() {
  const router = useRouter();
  useEffect(() => {
    if (!router.isReady) return;
    const sid = queryString(router.query.subject_id) ?? safeGet("subject_id");
    router.replace(sid ? `/subject/${sid}?tab=subjects` : "/welcome");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady]);
  return (
    <div className="flex h-full w-full items-center justify-center">
      <LoadingSpinner width="40px" />
    </div>
  );
}

export default Page;
