'use client';

import { useComponentProps, useSitecore } from '@sitecore-content-sdk/nextjs';
import type { FC } from 'react';
import { memo, useMemo } from 'react';

import type {
  LandingPageTableColumn,
  LandingPageTableProps,
  LandingPageTableRow,
} from './LandingPageTable.props';

const FONT_REGULAR = 'suisse_intlregular, sans-serif';

interface LandingPageTableData {
  ariaLabel: string;
  columns: LandingPageTableColumn[];
  rows: LandingPageTableRow[];
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;
}

function unwrapItemFields(value: unknown): Record<string, unknown> {
  const item = asRecord(value);
  if (!item) return {};
  const nestedFields = asRecord(item.fields);
  return nestedFields ?? item;
}

function getPrimitiveValue(field: unknown): string | number | boolean | undefined {
  if (typeof field === 'string' || typeof field === 'number' || typeof field === 'boolean') {
    return field;
  }

  const obj = asRecord(field);
  if (!obj) return undefined;

  if (
    typeof obj.value === 'string' ||
    typeof obj.value === 'number' ||
    typeof obj.value === 'boolean'
  ) {
    return obj.value;
  }

  if (
    typeof obj.jsonValue === 'string' ||
    typeof obj.jsonValue === 'number' ||
    typeof obj.jsonValue === 'boolean'
  ) {
    return obj.jsonValue;
  }

  const jsonValue = asRecord(obj.jsonValue);
  if (
    jsonValue &&
    (typeof jsonValue.value === 'string' ||
      typeof jsonValue.value === 'number' ||
      typeof jsonValue.value === 'boolean')
  ) {
    return jsonValue.value;
  }

  return undefined;
}

function getTextValue(field: unknown): string {
  const value = getPrimitiveValue(field);
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

function getTargetItems(field: unknown): Record<string, unknown>[] {
  if (Array.isArray(field)) {
    return field.filter((item): item is Record<string, unknown> => !!asRecord(item));
  }

  const obj = asRecord(field);
  if (!obj) return [];

  const candidates = [obj.targetItems, obj.results, obj.children];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item): item is Record<string, unknown> => !!asRecord(item));
    }
  }

  return [];
}

function resolveTableData(datasource: Record<string, unknown> | undefined): LandingPageTableData {
  const ds = unwrapItemFields(datasource);

  const ariaLabel = getTextValue(ds.ariaLabel ?? ds.AriaLabel);

  const columns = getTargetItems(ds.columns ?? ds.Columns)
    .map((rawColumn) => {
      const column = unwrapItemFields(rawColumn);
      return {
        label: getTextValue(column.label ?? column.Label),
      };
    })
    .filter((column) => Boolean(column.label));

  const rows = getTargetItems(ds.rows ?? ds.Rows)
    .map((rawRow) => {
      const row = unwrapItemFields(rawRow);
      const cells = [
        getTextValue(row.cell1 ?? row.Cell1),
        getTextValue(row.cell2 ?? row.Cell2),
        getTextValue(row.cell3 ?? row.Cell3),
      ];

      return {
        icon: getTextValue(row.icon ?? row.Icon),
        cells,
      };
    })
    .filter((row) => row.cells.some(Boolean));

  return {
    ariaLabel,
    columns,
    rows,
  };
}

const LandingPageTableLayout = memo(function LandingPageTableLayout(props: LandingPageTableProps) {
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;

  const componentUid = props.rendering?.uid;
  const serverProps = useComponentProps<{ fields?: { data?: { datasource?: Record<string, unknown> } } }>(
    componentUid,
  );
  const fieldsOrRendering = props.fields ?? serverProps?.fields ?? props.rendering?.fields;
  const fieldsObj = fieldsOrRendering as Record<string, unknown> | null | undefined;
  const renderingObj = props.rendering as unknown as Record<string, unknown> | null | undefined;
  const datasource = (
    (fieldsObj?.data as Record<string, unknown> | undefined)?.datasource ??
    fieldsObj?.datasource ??
    fieldsObj ??
    (typeof renderingObj?.dataSource === 'object' && renderingObj?.dataSource
      ? (renderingObj.dataSource as Record<string, unknown>)
      : undefined)
  ) as Record<string, unknown> | undefined;

  const { ariaLabel, columns, rows } = useMemo(() => resolveTableData(datasource), [datasource]);
  const resolvedColumns = columns.length > 0 ? columns : [{ label: '' }, { label: '' }, { label: '' }];

  const hasSitecoreData = Boolean(datasource && (ariaLabel || columns.length > 0 || rows.length > 0));

  if (isPageEditing && !hasSitecoreData) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center text-gray-500">
        <p className="text-lg font-semibold">Landing Page Table</p>
        <p className="text-sm">Component placeholder — configure in Sitecore</p>
      </div>
    );
  }

  if (!isPageEditing && rows.length === 0) {
    return null;
  }

  return (
    <section data-component="LandingPageTable">
      <div className="cws-container mx-auto w-full max-w-[1360px] px-[8px] py-[5px] lg:px-[16px] xl:px-[10px]">
        <div className="overflow-x-hidden sm:overflow-x-auto">
          <table
            className="w-full table-fixed border-collapse text-[13px] leading-[18px] text-[#333] sm:text-[17px] sm:leading-[28px]"
            style={{ fontFamily: FONT_REGULAR }}
            role="table"
            aria-label={ariaLabel}
          >
            <thead>
              <tr className="bg-[#f9e244] text-[#333]">
                {resolvedColumns.map((col, idx) => (
                  <th
                    key={idx}
                    className="border-b-[2px] border-black px-2 py-2 text-left align-middle text-[13px] font-bold leading-[18px] sm:px-[20px] sm:py-[14px] sm:text-[17px] sm:leading-[28px]"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className="border-b border-black transition-colors hover:bg-[#fdf2a0] odd:bg-white even:bg-[#fff8cc]"
                >
                  {resolvedColumns.map((_, cellIdx) => {
                    const cell = row.cells[cellIdx] ?? '';
                    return (
                    <td
                      key={cellIdx}
                      className="px-2 py-2 text-left align-middle whitespace-normal break-words sm:px-[20px] sm:py-[14px]"
                    >
                      {cellIdx === 0 ? (
                        <span className="flex items-center">
                          <span className="mr-2 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-[#f9e244] bg-[#f9e244] text-[12px] sm:mr-[12px] sm:h-[32px] sm:w-[32px] sm:text-[18px]">
                            {row.icon}
                          </span>
                          <span className="min-w-0 break-words">{cell}</span>
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
});

export const Default: FC<LandingPageTableProps> = (props) => <LandingPageTableLayout {...props} />;

export async function getComponentServerProps(
  rendering: { fields?: Record<string, unknown> },
): Promise<{ fields?: Record<string, unknown> }> {
  const fields = rendering?.fields;
  if (!fields) return {};
  return { fields };
}

export default Default;
