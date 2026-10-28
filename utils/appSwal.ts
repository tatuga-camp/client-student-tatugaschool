import Swal from "sweetalert2";
import { OVERLAY_ROOT_ID } from "./frameRoutes";

// SweetAlert renders inside the phone screen, never over the desktop stage.
const AppSwal: typeof Swal = Swal.mixin({ target: `#${OVERLAY_ROOT_ID}` });

export default AppSwal;
