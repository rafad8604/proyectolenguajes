import type { Metadata } from 'next';
import { ComingSoon } from 'components/ui/coming-soon';

export const metadata: Metadata = {
  title: 'Thompson',
};

export default function ThompsonPage() {
  return (
    <ComingSoon
      title="Construcción de Thompson"
      description="Ingresa una expresión regular y obtén el AFND equivalente mediante el algoritmo de Thompson, con explicación paso a paso."
    />
  );
}
