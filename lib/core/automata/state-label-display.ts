/** Presentación compacta de etiquetas largas (p. ej. subconjuntos del AFD). */
export interface StateLabelDisplay {
  displayText: string;
  fullText: string;
  fontSizeClass: string;
  lines: string[];
}

function splitSubsetParts(label: string): string[] | null {
  if (!label.startsWith('{') || !label.endsWith('}')) return null;
  const inner = label.slice(1, -1).trim();
  if (!inner) return [];
  return inner.split(',').map((part) => part.trim());
}

/** Reduce fuente y abrevia conjuntos largos manteniendo el texto completo para tooltip. */
export function getStateLabelDisplay(label: string): StateLabelDisplay {
  const fullText = label;
  const parts = splitSubsetParts(label);

  if (!parts || parts.length <= 1) {
    const compact = label.length > 10;
    return {
      displayText: label,
      fullText,
      fontSizeClass: compact ? 'text-[10px]' : 'text-sm',
      lines: [label],
    };
  }

  if (label.length <= 14) {
    return {
      displayText: label,
      fullText,
      fontSizeClass: 'text-[10px] leading-tight',
      lines: [label],
    };
  }

  if (parts.length >= 3 && label.length > 16) {
    const abbreviated = `{${parts[0]},…,${parts[parts.length - 1]}}`;
    return {
      displayText: abbreviated,
      fullText,
      fontSizeClass: 'text-[9px] leading-tight',
      lines: [abbreviated],
    };
  }

  if (parts.length >= 2 && label.length > 14) {
    const mid = Math.ceil(parts.length / 2);
    const line1 = `{${parts.slice(0, mid).join(',')}}`;
    const line2 =
      mid < parts.length
        ? `{${parts.slice(mid).join(',')}}`
        : '';
    const lines = line2 ? [line1, line2] : [line1];
    return {
      displayText: lines.join('\n'),
      fullText,
      fontSizeClass: 'text-[8px] leading-[1.1]',
      lines,
    };
  }

  return {
    displayText: label,
    fullText,
    fontSizeClass: 'text-[10px] leading-tight',
    lines: [label],
  };
}
