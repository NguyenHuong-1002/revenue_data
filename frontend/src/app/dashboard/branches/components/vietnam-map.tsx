'use client';

import { Info, Map as MapIcon, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import * as React from 'react';
import type { IBranch } from '@/lib/types/branch';
import { VIETNAM_PATHS } from './vietnam-paths';

interface VietnamMapProps {
  branches: IBranch[];
  selectedCity: string;
  onCitySelect: (city: string) => void;
}

interface MapCity {
  id: string;
  name: string;
  displayName: string;
  x: number;
  y: number;
}

// =============================================
// Thành phố – SVG Vector fallback (Khớp với tọa độ SVG mới)
// =============================================
const SVG_CITIES: MapCity[] = [
  { id: 'hanoi', name: 'Hà Nội', displayName: 'Hà Nội', x: 188.9, y: 135.7 },
  { id: 'haiphong', name: 'Hải Phòng', displayName: 'Hải Phòng', x: 241.1, y: 137.7 },
  { id: 'danang', name: 'Đà Nẵng', displayName: 'Đà Nẵng', x: 295.1, y: 403.2 },
  { id: 'hcm', name: 'TP. Hồ Chí Minh', displayName: 'TP.HCM', x: 245.8, y: 700.6 },
  { id: 'cantho', name: 'Cần Thơ', displayName: 'Cần Thơ', x: 174.2, y: 707.7 },
  { id: 'langson', name: 'Lạng Sơn', displayName: 'Lạng Sơn', x: 210.1, y: 56.3 },
  { id: 'vinh', name: 'Vinh', displayName: 'Vinh', x: 143.6, y: 188.9 },
  { id: 'hue', name: 'Huế', displayName: 'Huế', x: 280.4, y: 371.8 },
  { id: 'nhatrang', name: 'Nha Trang', displayName: 'Nha Trang', x: 364.8, y: 594.7 },
  { id: 'dalat', name: 'Đà Lạt', displayName: 'Đà Lạt', x: 340.0, y: 602.8 },
  { id: 'vungtau', name: 'Vũng Tàu', displayName: 'Vũng Tàu', x: 248.2, y: 744.7 },
  { id: 'camau', name: 'Cà Mau', displayName: 'Cà Mau', x: 144.5, y: 793.1 },
  { id: 'binhduong', name: 'Bình Dương', displayName: 'Bình Dương', x: 238.1, y: 650.0 },
  { id: 'dongnai', name: 'Đồng Nai', displayName: 'Đồng Nai', x: 248.5, y: 692.7 },
];

function removeDiacritics(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/tp\.\s*/g, '')
    .replace(/tinh\s*/g, '')
    .replace(/thanh\s*pho\s*/g, '')
    .replace(/[\s–-]/g, '')
    .trim();
}

function resolveProvinceId(city: string): string | null {
  const c = removeDiacritics(city);
  if (c.includes('hanoi')) return 'hanoi';
  if (c.includes('haiphong')) return 'haiphong';
  if (c.includes('danang')) return 'danang';
  if (c.includes('hcm') || c.includes('hochiminh') || c.includes('saigon')) return 'hcm';
  if (c.includes('cantho')) return 'cantho';
  if (c.includes('langson')) return 'langson';
  if (c.includes('vinh') || c.includes('nghean')) return 'nghean';
  if (c.includes('hue') || c.includes('tthue')) return 'tthue';
  if (c.includes('nhatrang') || c.includes('khanhhoa')) return 'khanhhoa';
  if (c.includes('dalat') || c.includes('lamdong')) return 'lamdong';
  if (c.includes('vungtau') || c.includes('baria')) return 'baria';
  if (c.includes('camau')) return 'camau';
  if (c.includes('binhduong')) return 'binhduong';
  if (c.includes('dongnai')) return 'dongnai';
  return null;
}

function projectCoords(lng: number, lat: number): { x: number; y: number } {
  // Công thức phép chiếu 2D đã được tối ưu hóa dựa trên tọa độ thực tế & tọa độ SVG của Hà Nội, Đà Nẵng, TP.HCM
  const x = 40.13 * lng - 2.376 * lat - 4008.9;
  const y = -3.173 * lng - 55.277 * lat + 1633.92;
  return { x: parseFloat(x.toFixed(1)), y: parseFloat(y.toFixed(1)) };
}

type HoveredItem =
  | { type: 'branch'; data: IBranch }
  | { type: 'province'; label: string; count: number }
  | null;

export function VietnamMap({ branches, selectedCity, onCitySelect }: VietnamMapProps) {
  // Zoom và Pan cho bản đồ Vector SVG
  const [zoomScale, setZoomScale] = React.useState(1);
  const [panOffset, setPanOffset] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const [hoveredItem, setHoveredItem] = React.useState<HoveredItem>(null);
  const [tipPos, setTipPos] = React.useState({ x: 0, y: 0 });

  // Phân nhóm chi nhánh theo tỉnh/thành phố để đếm và hiển thị
  const byCity = React.useMemo<Record<string, IBranch[]>>(() => {
    const m: Record<string, IBranch[]> = {};
    branches.forEach((b) => {
      const k = b.city.trim();
      (m[k] = m[k] ?? []).push(b);
    });
    return m;
  }, [branches]);

  // Trình xử lý kéo bản đồ
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale((prev) => Math.min(prev + 0.25, 4));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  const handleZoomReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomFactor = 0.1;
    const direction = e.deltaY < 0 ? 1 : -1;
    setZoomScale((prev) => {
      const next = prev + direction * zoomFactor;
      return Math.min(Math.max(next, 0.5), 4);
    });
  };

  return (
    <div
      className="relative w-full bg-card border border-border rounded-xl p-5 shadow-md flex flex-col select-none"
      style={{ height: 600 }}
    >
      {/* Global styles: custom map styles & hover transitions */}
      <style>{`
        path.province-path:hover {
          fill: rgba(var(--primary-rgb), 0.25) !important;
          stroke: rgba(var(--primary-rgb), 0.8) !important;
        }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-border/50 pb-3 shrink-0">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <MapIcon className="size-4 text-blue-500" />
            Bản đồ cơ sở
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Định vị chi nhánh trực tuyến trên bản đồ Vector
          </p>
        </div>

        <div className="flex items-center gap-2 bg-muted/65 p-1 px-2.5 rounded-lg border border-border/50 text-[10px] font-semibold text-muted-foreground">
          <span>{branches.length} chi nhánh</span>
          {selectedCity && (
            <span className="ml-1 bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md animate-pulse">
              Lọc: {selectedCity}
            </span>
          )}
        </div>
      </div>

      {/* Map area */}
      <div
        className="relative rounded-xl border border-border/40 bg-muted/20 shrink-0 overflow-hidden"
        style={{ height: 440 }}
      >
        {/* Control buttons */}
        <div className="absolute bottom-4 left-4 z-20 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-700/50 p-1.5 rounded-lg shadow-lg">
          <button
            onClick={handleZoomIn}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 text-white rounded cursor-pointer transition-colors"
            title="Phóng to"
          >
            <ZoomIn className="size-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 text-white rounded cursor-pointer transition-colors"
            title="Thu nhỏ"
          >
            <ZoomOut className="size-4" />
          </button>
          <button
            onClick={handleZoomReset}
            className="w-7 h-7 flex items-center justify-center hover:bg-slate-800 text-white rounded cursor-pointer transition-colors"
            title="Reset"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>

        {/* Draggable & Zoomable SVG container */}
        <div
          className={`w-full h-full flex items-center justify-center cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          style={{ overflow: 'hidden' }}
        >
          <svg
            viewBox="0 0 812 873"
            className="max-h-full transition-transform duration-75 ease-out select-none"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomScale})`,
              transformOrigin: 'center center',
              width: '100%',
              height: '100%',
            }}
          >
            <defs>
              <linearGradient id="vmap-g" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity=".85" />
                <stop offset="50%" stopColor="var(--chart-4)" stopOpacity=".85" />
                <stop offset="100%" stopColor="var(--chart-4)" stopOpacity=".85" />
              </linearGradient>
            </defs>

            {/* Bản vẽ chi tiết tỉnh thành Việt Nam */}
            <g id="provinces">
              {VIETNAM_PATHS.map((province) => {
                const isCitySelected =
                  selectedCity && resolveProvinceId(selectedCity) === province.id;

                // Đếm số chi nhánh của tỉnh này (sử dụng đối sánh không dấu)
                let branchCount = 0;
                const normalizedProvLabel = removeDiacritics(province.label);
                for (const key of Object.keys(byCity)) {
                  const normalizedCityKey = removeDiacritics(key);
                  if (
                    normalizedCityKey.includes(normalizedProvLabel) ||
                    normalizedProvLabel.includes(normalizedCityKey)
                  ) {
                    branchCount += byCity[key].length;
                  }
                }

                return (
                  <path
                    key={province.id}
                    id={province.id}
                    d={province.d}
                    aria-label={province.label}
                    className="province-path transition-all duration-150"
                    fill={isCitySelected ? 'rgba(var(--primary-rgb), 0.45)' : 'rgba(30, 41, 59, 0.65)'}
                    stroke={isCitySelected ? 'var(--primary)' : 'rgba(255, 255, 255, 0.08)'}
                    strokeWidth={isCitySelected ? 1.5 : 0.6}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Tìm thành phố tương ứng trong SVG_CITIES hoặc dùng label trực tiếp
                      const matchedCity = SVG_CITIES.find(
                        (c) => c.id === province.id || (province.id === 'hcm' && c.id === 'hcm')
                      );
                      const targetCityName = matchedCity ? matchedCity.name : province.label;
                      onCitySelect(selectedCity === targetCityName ? '' : targetCityName);
                    }}
                    onMouseEnter={(e) => {
                      setHoveredItem({
                        type: 'province',
                        label: province.label,
                        count: branchCount,
                      });
                      const pr =
                        e.currentTarget.ownerSVGElement?.parentElement?.getBoundingClientRect();
                      if (pr) {
                        setTipPos({ x: e.clientX - pr.left, y: e.clientY - pr.top - 12 });
                      }
                    }}
                    onMouseMove={(e) => {
                      const pr =
                        e.currentTarget.ownerSVGElement?.parentElement?.getBoundingClientRect();
                      if (pr) {
                        setTipPos({ x: e.clientX - pr.left, y: e.clientY - pr.top - 12 });
                      }
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                  />
                );
              })}
            </g>

            {/* Chú thích Quần đảo */}
            <text
              x="574"
              y="440"
              fontSize="12"
              fontWeight="700"
              opacity=".6"
              className="fill-muted-foreground"
            >
              Hoàng Sa
            </text>
            <text
              x="589"
              y="795"
              fontSize="12"
              fontWeight="700"
              opacity=".6"
              className="fill-muted-foreground"
            >
              Trường Sa
            </text>

            {/* Markers các chi nhánh đặt tại các tỉnh */}
            <g id="markers">
              {branches.map((b) => {
                let cx = 0,
                  cy = 0;
                if (b.latitude && b.longitude) {
                  const proj = projectCoords(b.longitude, b.latitude);
                  cx = proj.x;
                  cy = proj.y;
                } else {
                  // Fallback to city center with a deterministic offset
                  const cityObj = SVG_CITIES.find((c) => c.name === b.city);
                  if (cityObj) {
                    const idx = branches.indexOf(b);
                    const angle = idx * 0.5;
                    const radius = 12; // 12 pixels offset in SVG space
                    cx = cityObj.x + Math.cos(angle) * radius;
                    cy = cityObj.y + Math.sin(angle) * radius;
                  }
                }
                if (cx === 0 && cy === 0) return null;

                const sel = selectedCity === b.city;

                return (
                  <g
                    key={b.store_id}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCitySelect(selectedCity === b.city ? '' : b.city);
                    }}
                    onMouseEnter={(e) => {
                      e.stopPropagation();
                      setHoveredItem({
                        type: 'branch',
                        data: b,
                      });
                      const pr =
                        e.currentTarget.ownerSVGElement?.parentElement?.getBoundingClientRect();
                      const r = e.currentTarget.getBoundingClientRect();
                      if (pr) {
                        setTipPos({ x: r.left - pr.left + r.width / 2, y: r.top - pr.top - 8 });
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.stopPropagation();
                      setHoveredItem(null);
                    }}
                  >
                    {/* Glowing outer aura */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={sel ? 12 : 7}
                      fill={sel ? 'rgba(239, 68, 68, 0.25)' : 'rgba(var(--primary-rgb), 0.2)'}
                      className={sel ? 'animate-pulse' : ''}
                    />

                    {/* Ring border */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={sel ? 7 : 4.5}
                      fill="none"
                      stroke={sel ? 'var(--destructive)' : 'var(--primary)'}
                      strokeWidth={sel ? 2 : 1.2}
                    />

                    {/* Core center dot */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={sel ? 3.5 : 2}
                      fill={sel ? '#ffffff' : 'var(--primary)'}
                      stroke={sel ? 'var(--destructive)' : '#ffffff'}
                      strokeWidth={sel ? 0 : 0.8}
                    />
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Absolute HTML Tooltip */}
          {hoveredItem && (
            <div
              className="absolute z-30 pointer-events-none bg-slate-950/90 text-white p-3.5 rounded-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] text-xs flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-150"
              style={{
                left: tipPos.x,
                top: tipPos.y,
                transform: 'translate(-50%,-100%)',
                whiteSpace: 'nowrap',
                backdropFilter: 'blur(8px)',
              }}
            >
              {hoveredItem.type === 'branch' ? (
                <>
                  <div className="font-extrabold text-[13.5px] text-white flex items-center gap-1.5">
                    <span className="text-blue-400 text-sm">🏬</span>
                    <span>{hoveredItem.data.name}</span>
                  </div>
                  <div className="text-indigo-300 font-semibold text-[11px] flex items-center gap-1">
                    <span className="text-indigo-400">📍</span>
                    <span>Thành phố: {hoveredItem.data.city}</span>
                  </div>
                  {hoveredItem.data.address && (
                    <div className="text-slate-300 text-[11px] whitespace-normal max-w-[220px] leading-relaxed bg-white/5 p-2 rounded-lg border border-white/5 mt-0.5">
                      <span className="text-slate-400 font-medium">Địa chỉ:</span>{' '}
                      {hoveredItem.data.address}
                    </div>
                  )}
                  <div className="text-slate-500 font-mono text-[9px] mt-1 pt-1.5 border-t border-white/5 flex justify-between items-center gap-4">
                    <span>ID cửa hàng:</span>
                    <span className="text-slate-400">{hoveredItem.data.store_id}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="font-extrabold text-white text-[13px] flex items-center gap-1.5">
                    <span className="text-blue-400 text-sm">🗺️</span>
                    <span>{hoveredItem.label}</span>
                  </div>
                  <div className="text-blue-300 font-semibold text-[11px] flex items-center gap-1">
                    <span className="text-blue-400">📍</span>
                    <span>{hoveredItem.count} chi nhánh hoạt động</span>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Info */}
      <div className="mt-3 pt-3 border-t border-border/50 text-[11px] text-muted-foreground space-y-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <Info className="size-3.5 text-blue-500 shrink-0" />
          <span>
            Bản đồ hỗ trợ kéo để di chuyển, cuộn chuột hoặc sử dụng các nút điều khiển để phóng
            to/thu nhỏ. Nhấp chuột vào tỉnh thành hoặc điểm định vị để lọc chi nhánh theo vùng.
          </span>
        </div>
      </div>
    </div>
  );
}
