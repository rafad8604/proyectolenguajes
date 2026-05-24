import type { Metadata } from 'next';
import { ComingSoon } from 'components/ui/coming-soon';

export const metadata: Metadata = {
  title: 'Importar / Exportar JFLAP',
};

export default function JflapPage() {
  return (
    <ComingSoon
      title="Importar / Exportar JFLAP"
      description="Carga archivos .jff de JFLAP y exporta tus autómatas y máquinas de Turing en formato compatible."
    />
  );
}
