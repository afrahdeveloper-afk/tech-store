"use client";

import * as React from "react";

import type { DailyActivityPoint } from "@/lib/admin-data";
import { useLanguage } from "@/components/providers/language-provider";
import { EmptyState } from "@/components/shared/empty-state";
import { Small } from "@/components/ui/typography";
import { Inbox } from "lucide-react";

const BAR_MAX_THICKNESS = 20; // px — dataviz skill mark spec: bars <=24px thick
const CHART_HEIGHT = 96; // px, plotting area only

/**
 * Dashboard Overview's activity chart — three single-series bar charts
 * (Orders count, Bookings count, Revenue) sharing one date axis, per the
 * dataviz skill's "never dual-axis" rule (measures of different scale get
 * separate charts, not multiple y-scales on one). Each is a single series,
 * so none needs a legend box (`references/marks-and-anatomy.md`) — the
 * heading above each one names it. Bookings uses `fill-warning` (amber)
 * rather than another green — Orders/Revenue already use the brand's two
 * greens (`primary`/`accent`), and reusing either for a third, unrelated
 * series would make the two green bars hard to tell apart at a glance;
 * amber is an existing token (`--warning`, also the PENDING status-badge
 * color), not a new one invented for this chart.
 *
 * Deliberately kept LTR-oriented (`dir="ltr"` on the chart itself) even when
 * the page is RTL: a chronological axis read right-to-left would put the
 * newest day on the left, which is confusing regardless of UI direction —
 * this matches common practice for BI/analytics charts embedded in RTL apps.
 * Date labels are still locale-formatted for the active language.
 */
export function OrdersChart({ data }: { data: DailyActivityPoint[] }) {
  const { t, lang } = useLanguage();
  const locale = lang === "ar" ? "ar-SA" : "en-US";
  const [hovered, setHovered] = React.useState<number | null>(null);

  const hasActivity = data.some((point) => point.orders > 0 || point.bookings > 0 || point.revenue > 0);
  if (!hasActivity) {
    return (
      <EmptyState icon={Inbox} title={t.adminDashboard.chartEmptyTitle} description={t.adminDashboard.chartEmptyDescription} />
    );
  }

  const dateFormatter = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" });
  const formatDate = (iso: string) => dateFormatter.format(new Date(`${iso}T00:00:00`));

  return (
    <div className="flex flex-col gap-6" dir="ltr">
      <MiniBarChart
        label={t.adminDashboard.chartOrdersLegend}
        points={data.map((point) => ({ date: point.date, value: point.orders }))}
        colorClassName="fill-primary"
        formatValue={(value) => value.toLocaleString(locale)}
        formatDate={formatDate}
        hovered={hovered}
        onHover={setHovered}
      />
      <MiniBarChart
        label={t.adminDashboard.chartBookingsLegend}
        points={data.map((point) => ({ date: point.date, value: point.bookings }))}
        colorClassName="fill-warning"
        formatValue={(value) => value.toLocaleString(locale)}
        formatDate={formatDate}
        hovered={hovered}
        onHover={setHovered}
      />
      <MiniBarChart
        label={t.adminDashboard.chartRevenueLegend}
        points={data.map((point) => ({ date: point.date, value: point.revenue }))}
        colorClassName="fill-accent"
        formatValue={(value) => `${Math.round(value).toLocaleString(locale)} IQD`}
        formatDate={formatDate}
        hovered={hovered}
        onHover={setHovered}
      />
    </div>
  );
}

function MiniBarChart({
  label,
  points,
  colorClassName,
  formatValue,
  formatDate,
  hovered,
  onHover,
}: {
  label: string;
  points: { date: string; value: number }[];
  colorClassName: string;
  formatValue: (value: number) => string;
  formatDate: (iso: string) => string;
  hovered: number | null;
  onHover: (index: number | null) => void;
}) {
  const max = Math.max(...points.map((point) => point.value), 1);
  const barSlot = 100 / points.length;
  const barWidth = Math.min(BAR_MAX_THICKNESS, barSlot * 0.62);
  const activeIndex = hovered !== null && hovered < points.length ? hovered : null;
  const active = activeIndex !== null ? points[activeIndex] : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <Small className="font-medium text-foreground">{label}</Small>
        <Small className="font-mono text-muted-foreground" aria-live="polite">
          {active ? `${formatDate(active.date)} · ${formatValue(active.value)}` : formatValue(points[points.length - 1].value)}
        </Small>
      </div>
      <svg
        viewBox={`0 0 100 ${CHART_HEIGHT}`}
        preserveAspectRatio="none"
        className="h-24 w-full"
        role="img"
        aria-label={`${label}: ${points.map((point) => `${formatDate(point.date)} ${formatValue(point.value)}`).join(", ")}`}
      >
        {/* Baseline — hairline, recessive, one step off the surface. */}
        <line x1={0} y1={CHART_HEIGHT - 1} x2={100} y2={CHART_HEIGHT - 1} className="stroke-border" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
        {points.map((point, index) => {
          const height = (point.value / max) * (CHART_HEIGHT - 8);
          const x = index * barSlot + (barSlot - barWidth) / 2;
          const y = CHART_HEIGHT - 1 - height;
          const isActive = activeIndex === index;
          return (
            <rect
              key={point.date}
              x={x}
              y={height > 0 ? y : CHART_HEIGHT - 2}
              width={barWidth}
              height={height > 0 ? height : 1}
              rx={2}
              className={`${colorClassName} transition-opacity duration-150 ease-out-strong`}
              opacity={isActive || activeIndex === null ? 1 : 0.45}
              onMouseEnter={() => onHover(index)}
              onMouseLeave={() => onHover(null)}
            />
          );
        })}
      </svg>
      <div className="flex justify-between text-[0.6875rem] text-muted-foreground">
        <span>{formatDate(points[0].date)}</span>
        <span>{formatDate(points[points.length - 1].date)}</span>
      </div>
    </div>
  );
}
