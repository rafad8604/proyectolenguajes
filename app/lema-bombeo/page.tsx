import type { Metadata } from 'next';
import { ComingSoon } from 'components/ui/coming-soon';

export const metadata: Metadata = {
  title: 'Lema de bombeo',
};

export default function LemaBombeoPage() {
  return (
    <ComingSoon
      title="Lema de bombeo"
      description="Asistente guiado para demostrar que un lenguaje no es regular: define p, elige w, divide en xyz y verifica las condiciones de bombeo."
    />
  );
}
