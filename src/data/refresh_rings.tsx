import { TCMSResponse } from "@/api/types/CMSTypes";

export interface RefreshRingsData {
  refreshRingsHeader: string;
  refreshRingContent: string;
  refresh_ring_serial_chiller_header: string;
  refresh_ring_serial_chiller_sub_title: string;
  refresh_ring_serial_chiller_sub_title2: string;
}

export const mapRefreshRingsData = (
  cmsData: TCMSResponse["data"] | null
): RefreshRingsData => {
  const refreshRingsCMS = cmsData?.refresh_ring;

  return {
    refreshRingsHeader:
      refreshRingsCMS?.refresh_rings_header ?? "Refresh Rings",
    refreshRingContent:
      refreshRingsCMS?.refresh_ring_content ??
      "Get fresh content with refresh rings",
    refresh_ring_serial_chiller_header:
      refreshRingsCMS?.refresh_ring_serial_chiller_header ?? "Whoops!",
    refresh_ring_serial_chiller_sub_title:
      refreshRingsCMS?.refresh_ring_serial_chiller_sub_title ??
      "You've binge-watched all the exclusive content! ",
    refresh_ring_serial_chiller_sub_title2: 
      refreshRingsCMS?.refresh_ring_serial_chiller_sub_title2 ??
      "Scan the Refresh Rings QR code and come back tomorrow or explore our comedy hub.",
    };
};

// Default data for SSR/hydration
export const defaultRefreshRingsData: RefreshRingsData = {
  refreshRingsHeader: "Refresh Rings",
  refreshRingContent: "Get fresh content with refresh rings",
  refresh_ring_serial_chiller_header: "Whoops!",
  refresh_ring_serial_chiller_sub_title:
    "You've binge-watched all the exclusive content! ",
  refresh_ring_serial_chiller_sub_title2:
    "Scan the Refresh Rings QR code and come back tomorrow or explore our comedy hub.",
};
