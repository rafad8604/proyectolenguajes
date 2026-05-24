import type { Metadata } from 'next';
import { ComingSoon } from 'components/ui/coming-soon';

export const metadata: Metadata = {
  title: 'Máquinas de Turing',
};

export default function TuringPage() {
  return (
    <ComingSoon
      title="Máquinas de Turing"
      description="Diseña máquinas de 1 o 2 bandas, configura alfabetos y símbolo blanco, y simula la ejecución con visualización de cinta(s) y cabezal(es)."
    />
  );
}
