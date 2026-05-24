import type { Metadata } from 'next';
import { ComingSoon } from 'components/ui/coming-soon';

export const metadata: Metadata = {
  title: 'Gramáticas',
};

export default function GramaticasPage() {
  return (
    <ComingSoon
      title="Gramáticas formales"
      description="Edita producciones, valida el tipo según la jerarquía de Chomsky y genera gramáticas regulares equivalentes desde autómatas."
    />
  );
}
