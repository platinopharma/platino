'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  MapPin,
  Navigation,
  Search,
  Compass,
  Crosshair,
  CheckCircle2,
  Plane,
  Train,
  Bus,
  Loader2,
  Edit2,
  Check,
  ZoomIn,
  ZoomOut,
  Layers,
  ExternalLink,
  Map as MapIcon,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type TransitMode } from '@/stores/useTransitBookingStore';

export interface LocationHub {
  name: string;
  code: string;
  mode: TransitMode;
  coords: [number, number]; // [lng, lat]
  distanceKm?: number;
  address: string;
}

export type MapProvider = 'GOOGLE' | 'SATELLITE' | 'OSM';

const DEFAULT_HUBS: Record<TransitMode, LocationHub[]> = {
  AIRPORT: [
    {
      name: 'Rajiv Gandhi International Airport (HYD)',
      code: 'HYD',
      mode: 'AIRPORT',
      coords: [78.4299, 17.2403],
      distanceKm: 4.2,
      address: 'Shamshabad, Hyderabad, Telangana 500108',
    },
    {
      name: 'Indira Gandhi International Airport (DEL)',
      code: 'DEL',
      mode: 'AIRPORT',
      coords: [77.1000, 28.5562],
      distanceKm: 14.5,
      address: 'New Delhi, Delhi 110037',
    },
    {
      name: 'Chhatrapati Shivaji Maharaj Intl (BOM)',
      code: 'BOM',
      mode: 'AIRPORT',
      coords: [72.8679, 19.0896],
      distanceKm: 22.1,
      address: 'Vile Parle East, Mumbai, Maharashtra 400099',
    },
  ],
  TRAIN: [
    {
      name: 'Secunderabad Junction Railway Station (SC)',
      code: 'SC',
      mode: 'TRAIN',
      coords: [78.5013, 17.4337],
      distanceKm: 2.4,
      address: 'Regimental Bazaar, Shivaji Nagar, Secunderabad, Telangana 500003',
    },
    {
      name: 'Hyderabad Deccan Nampally (HYB)',
      code: 'HYB',
      mode: 'TRAIN',
      coords: [78.4682, 17.3926],
      distanceKm: 5.1,
      address: 'Nampally, Hyderabad, Telangana 500001',
    },
    {
      name: 'Kacheguda Railway Station (KCG)',
      code: 'KCG',
      mode: 'TRAIN',
      coords: [78.4960, 17.3879],
      distanceKm: 6.8,
      address: 'Kacheguda, Hyderabad, Telangana 500027',
    },
  ],
  BUS: [
    {
      name: 'Mahatma Gandhi Bus Station (MGBS)',
      code: 'MGBS',
      mode: 'BUS',
      coords: [78.4842, 17.3780],
      distanceKm: 3.8,
      address: 'Gowliguda, Hyderabad, Telangana 500012',
    },
    {
      name: 'Jubilee Bus Station (JBS)',
      code: 'JBS',
      mode: 'BUS',
      coords: [78.4983, 17.4475],
      distanceKm: 4.5,
      address: 'Picket, Secunderabad, Telangana 500003',
    },
    {
      name: 'ISBT Anand Vihar Bus Terminal',
      code: 'ISBT-AV',
      mode: 'BUS',
      coords: [77.3156, 28.6469],
      distanceKm: 15.2,
      address: 'Anand Vihar, New Delhi, Delhi 110092',
    },
  ],
};

const QUICK_SELECTION_CHIPS = {
  AIRPORT: [
    'Arrival Gate 1',
    'Departure Gate 3',
    'Taxi Pickup Zone',
    'Terminal 1 Main Entrance',
  ],
  TRAIN: [
    'Platform 1 Escalator',
    'Main Station Entrance',
    'Platform 3 Handoff',
    'Reservation Counter',
  ],
  BUS: [
    'Bay 1 Main Gate',
    'Ticket Counter Handoff',
    'Bus Bay 12',
  ],
};

// NATIVE GOOGLE MAPS / OSM TILE ENGINE (NO BLOCKS, ULTRA SMOOTH)
function NativeGoogleMapTileEngine({
  lng,
  lat,
  zoomLevel,
  provider,
}: {
  lng: number;
  lat: number;
  zoomLevel: number;
  provider: MapProvider;
}) {
  const n = Math.pow(2, zoomLevel);
  const xtile = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const ytile = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);

  const tiles = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const x = xtile + dx;
      const y = ytile + dy;

      let tileUrl = `https://mt1.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${zoomLevel}`;
      if (provider === 'SATELLITE') {
        tileUrl = `https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${zoomLevel}`;
      } else if (provider === 'OSM') {
        tileUrl = `https://tile.openstreetmap.org/${zoomLevel}/${x}/${y}.png`;
      }

      tiles.push({
        key: `${x}-${y}-${provider}`,
        url: tileUrl,
      });
    }
  }

  return (
    <div className="relative h-full w-full bg-slate-950 overflow-hidden select-none">
      {/* 3x3 Google Map Tile Grid */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 transform scale-125 transition-transform duration-300">
        {tiles.map((t) => (
          <img
            key={t.key}
            src={t.url}
            alt="Google Maps Tile"
            className="w-full h-full object-cover pointer-events-none filter brightness-100 contrast-105"
            loading="eager"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" fill="%230f172a"><rect width="256" height="256"/></svg>';
            }}
          />
        ))}
      </div>

      {/* Dark/Emerald Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-slate-950/20 pointer-events-none" />

      {/* Subtle Grid Lines Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#10b98115_1px,transparent_1px),linear-gradient(to_bottom,#10b98115_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />
    </div>
  );
}

interface TransitLocationPickerProps {
  mode: TransitMode;
  onConfirmLocation: (location: {
    hub: LocationHub;
    pickupPoint: string;
    coords: [number, number];
    gateOrPlatform: string;
    flightOrTrainNo: string;
    coachOrSeat?: string;
    pnr?: string;
  }) => void;
}

export function TransitLocationPicker({ mode, onConfirmLocation }: TransitLocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<LocationHub[]>(DEFAULT_HUBS[mode]);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const [detectedGpsLabel, setDetectedGpsLabel] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(15);
  const [mapProvider, setMapProvider] = useState<MapProvider>('GOOGLE');

  const [selectedHub, setSelectedHub] = useState<LocationHub>(DEFAULT_HUBS[mode][0]);
  const [selectedChip, setSelectedChip] = useState<string>(QUICK_SELECTION_CHIPS[mode][0]);
  const [isEditingHubName, setIsEditingHubName] = useState(false);
  const [customHubName, setCustomHubName] = useState('');

  // Mode-specific extra input state
  const [gateOrPlatform, setGateOrPlatform] = useState('Gate 3 / Departure');
  const [flightOrTrainNo, setFlightOrTrainNo] = useState(mode === 'AIRPORT' ? '6E-204' : mode === 'TRAIN' ? '12723' : 'TS09-1234');
  const [coachOrSeat, setCoachOrSeat] = useState('B3 / Seat 24');
  const [pnr, setPnr] = useState('48210943');

  // Reset selected hub on mode switch
  useEffect(() => {
    const defaultList = DEFAULT_HUBS[mode];
    setSelectedHub(defaultList[0]);
    setSearchResults(defaultList);
    setSelectedChip(QUICK_SELECTION_CHIPS[mode][0]);
    setGateOrPlatform(mode === 'AIRPORT' ? 'Gate 3 / Departure' : mode === 'TRAIN' ? 'Platform 1' : 'Bay 12');
    setFlightOrTrainNo(mode === 'AIRPORT' ? '6E-204' : mode === 'TRAIN' ? '12723 Express' : 'TS09-1234');
    setSearchQuery('');
    setIsEditingHubName(false);
  }, [mode]);

  // DYNAMIC OPENSTREETMAP / GOOGLE MAPS NOMINATIM LIVE AUTOCOMPLETE SEARCH
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults(DEFAULT_HUBS[mode]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const modeKeyword = mode === 'AIRPORT' ? 'airport' : mode === 'TRAIN' ? 'railway station' : 'bus station';
        const fullQuery = `${searchQuery} ${modeKeyword}`;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullQuery)}&limit=5&addressdetails=1`
        );
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const liveHubs: LocationHub[] = data.map((item: { display_name: string; lat: string; lon: string }) => {
            const parts = item.display_name.split(',');
            const title = parts[0]?.trim() || item.display_name;
            return {
              name: `${title} (${mode})`,
              code: mode,
              mode: mode,
              coords: [parseFloat(item.lon), parseFloat(item.lat)],
              address: item.display_name,
            };
          });
          setSearchResults(liveHubs);
        } else {
          setSearchResults(DEFAULT_HUBS[mode]);
        }
      } catch (err) {
        console.warn('Google/Nominatim search failed, using default list:', err);
        setSearchResults(DEFAULT_HUBS[mode]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, mode]);

  // REVERSE GEOCODING FUNCTION
  const reverseGeocode = useCallback(async (lng: number, lat: number) => {
    setIsReverseGeocoding(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.display_name) {
        const parts = data.display_name.split(',');
        const mainTitle = parts[0]?.trim() || 'Custom Transit Point';
        setSelectedHub({
          name: `${mainTitle} (${mode})`,
          code: mode,
          mode: mode,
          coords: [lng, lat],
          address: data.display_name,
        });
      }
    } catch (e) {
      console.warn('Reverse geocoding failed:', e);
    } finally {
      setIsReverseGeocoding(false);
    }
  }, [mode]);

  // GPS DETECT BUTTON
  const handleDetectLocation = () => {
    setIsDetectingGps(true);
    setDetectedGpsLabel(null);

    if (!navigator.geolocation) {
      setIsDetectingGps(false);
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setIsDetectingGps(false);
        setDetectedGpsLabel(`GPS Snapped (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        reverseGeocode(longitude, latitude);
      },
      (err) => {
        setIsDetectingGps(false);
        console.warn('GPS location permission denied or timed out:', err);
        setDetectedGpsLabel('GPS fallback: Defaulting to nearest station');
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const ModeIcon = mode === 'AIRPORT' ? Plane : mode === 'TRAIN' ? Train : Bus;
  const googleMapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${selectedHub.coords[1]},${selectedHub.coords[0]}`;

  return (
    <div className="space-y-4">
      {/* Search-As-You-Type & Live Geocoding Bar */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search Google Maps live ${mode === 'AIRPORT' ? 'airports' : mode === 'TRAIN' ? 'railway stations' : 'bus terminals'} (e.g. Secunderabad, Delhi, Shamshabad)...`}
            className="w-full rounded-2xl border border-border bg-background pl-10 pr-9 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-emerald-600 focus:outline-hidden"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-emerald-600" />
          )}
        </div>

        {/* GPS Detect Button */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={isDetectingGps}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-emerald-600/30 bg-emerald-600/10 px-4 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600/20 transition-all cursor-pointer shrink-0"
        >
          {isDetectingGps ? (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          ) : (
            <Crosshair className="h-4 w-4 text-emerald-600" />
          )}
          Detect Live Location
        </button>
      </div>

      {/* GPS Feedback Banner */}
      {detectedGpsLabel && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-600/15 p-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 border border-emerald-600/30">
          <Navigation className="h-4 w-4 text-emerald-600 animate-bounce" />
          <span>{detectedGpsLabel}</span>
        </div>
      )}

      {/* Live Geocoding Results Dropdown List */}
      <div className="max-h-36 overflow-y-auto space-y-1.5 rounded-2xl border border-border bg-background p-2 shadow-xs">
        {searchResults.map((hub) => (
          <button
            key={hub.name}
            type="button"
            onClick={() => {
              setSelectedHub(hub);
              setIsEditingHubName(false);
            }}
            className={cn(
              'w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs transition-all cursor-pointer',
              selectedHub.name === hub.name
                ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                : 'hover:bg-muted text-foreground'
            )}
          >
            <div className="flex items-center gap-2.5 truncate">
              <ModeIcon className="h-4 w-4 shrink-0" />
              <div className="truncate">
                <span className="block truncate font-bold">{hub.name}</span>
                <span
                  className={cn(
                    'text-[11px] block truncate',
                    selectedHub.name === hub.name ? 'text-white/80' : 'text-muted-foreground'
                  )}
                >
                  {hub.address}
                </span>
              </div>
            </div>
            <span
              className={cn(
                'shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ml-2',
                selectedHub.name === hub.name
                  ? 'bg-white/20 text-white'
                  : 'bg-muted text-muted-foreground border border-border'
              )}
            >
              {hub.coords[1].toFixed(2)}, {hub.coords[0].toFixed(2)}
            </span>
          </button>
        ))}
      </div>

      {/* GOOGLE MAPS TILE ENGINE CONTAINER */}
      <div className="relative h-56 md:h-64 w-full rounded-2xl border border-border overflow-hidden bg-slate-950 shadow-inner">
        {/* Top-Right Google Maps Controls & Provider Toggle Overlay */}
        <div className="absolute top-2.5 right-2.5 z-20 flex flex-wrap items-center gap-2">
          {/* Map Layer Style Switcher */}
          <div className="flex items-center rounded-xl bg-slate-900/90 border border-slate-700/60 p-0.5 shadow-md">
            <button
              type="button"
              onClick={() => setMapProvider('GOOGLE')}
              className={cn(
                'px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all',
                mapProvider === 'GOOGLE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              )}
            >
              Google Maps
            </button>
            <button
              type="button"
              onClick={() => setMapProvider('SATELLITE')}
              className={cn(
                'px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all',
                mapProvider === 'SATELLITE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              )}
            >
              Satellite
            </button>
            <button
              type="button"
              onClick={() => setMapProvider('OSM')}
              className={cn(
                'px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all',
                mapProvider === 'OSM'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white'
              )}
            >
              OSM
            </button>
          </div>

          {/* Coordinates Badge */}
          <div className="rounded-xl bg-slate-900/90 backdrop-blur-xs px-2.5 py-1 text-[10px] font-mono text-emerald-400 border border-slate-700/60 shadow-md flex items-center gap-1.5">
            {isReverseGeocoding ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            ) : (
              <Compass className="h-3.5 w-3.5 text-emerald-400" />
            )}
            [{selectedHub.coords[1].toFixed(4)}, {selectedHub.coords[0].toFixed(4)}]
          </div>

          {/* Zoom Buttons */}
          <div className="flex items-center rounded-xl bg-slate-900/90 border border-slate-700/60 shadow-md">
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.min(18, z + 1))}
              className="p-1.5 text-slate-300 hover:text-emerald-400 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoomLevel((z) => Math.max(12, z - 1))}
              className="p-1.5 text-slate-300 hover:text-emerald-400 transition-colors border-l border-slate-700/60"
              title="Zoom Out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* NATIVE GOOGLE MAPS TILE ENGINE */}
        <NativeGoogleMapTileEngine
          lng={selectedHub.coords[0]}
          lat={selectedHub.coords[1]}
          zoomLevel={zoomLevel}
          provider={mapProvider}
        />

        {/* Zomato-Style Centered Pin Overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
          <div className="relative -mt-8 flex flex-col items-center">
            {/* Floating Label Badge */}
            <div className="flex items-center gap-1.5 rounded-full bg-slate-900/90 px-3.5 py-1 text-[11px] font-bold text-white shadow-xl border border-emerald-500/40 backdrop-blur-xs animate-bounce">
              <MapPin className="h-3.5 w-3.5 text-emerald-400" />
              {selectedHub.code || mode} Google Maps Pin
            </div>
            {/* Pin Stem */}
            <div className="h-3.5 w-3.5 rotate-45 bg-slate-900 -mt-1.5 border-r border-b border-emerald-500/40" />
            {/* Pulsing Dot */}
            <div className="mt-1 flex items-center justify-center">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-600" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Selection Pickup Chips */}
      <div>
        <label className="block text-xs font-semibold text-foreground mb-1.5">
          Quick-Select Pickup Handoff Point
        </label>
        <div className="flex flex-wrap gap-2">
          {QUICK_SELECTION_CHIPS[mode].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setSelectedChip(chip)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer',
                selectedChip === chip
                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-600/30'
                  : 'border border-border bg-background text-muted-foreground hover:border-emerald-600/50 hover:text-foreground'
              )}
            >
              <Compass className="h-3.5 w-3.5 text-emerald-600" /> {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Extra Mode Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            {mode === 'AIRPORT' ? 'Terminal & Gate No.' : mode === 'TRAIN' ? 'Train Name / Number' : 'Bus Bay Number'}
          </label>
          <input
            type="text"
            value={gateOrPlatform}
            onChange={(e) => setGateOrPlatform(e.target.value)}
            placeholder={mode === 'AIRPORT' ? 'Terminal 1 / Gate 4B' : mode === 'TRAIN' ? '12723 Telangana Exp' : 'Bay 12'}
            className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:border-emerald-600 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-foreground mb-1">
            {mode === 'AIRPORT' ? 'Flight Number' : mode === 'TRAIN' ? 'Coach & Seat Number' : 'Bus Ticket / Reg No'}
          </label>
          <input
            type="text"
            value={mode === 'TRAIN' ? coachOrSeat : flightOrTrainNo}
            onChange={(e) => (mode === 'TRAIN' ? setCoachOrSeat(e.target.value) : setFlightOrTrainNo(e.target.value))}
            placeholder={mode === 'AIRPORT' ? '6E-204' : mode === 'TRAIN' ? 'B3 / Seat 24' : 'TS09-1234'}
            className="w-full rounded-2xl border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:border-emerald-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Resolved Location Card & Direct Google Maps Navigation Trigger */}
      <div className="rounded-3xl border border-emerald-800/30 bg-emerald-800/10 p-4 space-y-3 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3 truncate">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-800 text-white shadow-sm">
              <ModeIcon className="h-5 w-5" />
            </div>
            <div className="truncate">
              {!isEditingHubName ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-foreground truncate">{selectedHub.name}</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomHubName(selectedHub.name);
                      setIsEditingHubName(true);
                    }}
                    className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-0.5 shrink-0 cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                  <a
                    href={googleMapsSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 shrink-0 ml-1"
                  >
                    <ExternalLink className="h-3 w-3 text-emerald-600" /> Open in Google Maps
                  </a>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customHubName}
                    onChange={(e) => setCustomHubName(e.target.value)}
                    className="rounded-xl border border-emerald-600 bg-background px-2.5 py-1 text-xs text-foreground focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customHubName.trim()) {
                        setSelectedHub((prev) => ({ ...prev, name: customHubName }));
                      }
                      setIsEditingHubName(false);
                    }}
                    className="rounded-xl bg-emerald-800 px-2 py-1 text-xs font-semibold text-white inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Check className="h-3.5 w-3.5" /> Save
                  </button>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground truncate">
                {selectedChip} · {gateOrPlatform}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCompleteConfirm}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-800 hover:bg-emerald-900 text-white font-semibold px-6 py-2.5 text-xs shadow-md transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shrink-0"
          >
            Confirm Location <CheckCircle2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  function handleCompleteConfirm() {
    onConfirmLocation({
      hub: selectedHub,
      pickupPoint: selectedChip,
      coords: selectedHub.coords,
      gateOrPlatform,
      flightOrTrainNo,
      coachOrSeat,
      pnr,
    });
  }
}
