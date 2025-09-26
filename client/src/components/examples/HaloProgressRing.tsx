import HaloProgressRing from '../HaloProgressRing';

export default function HaloProgressRingExample() {
  return (
    <div className="flex flex-col items-center gap-8 p-8">
      <div className="flex gap-8">
        <HaloProgressRing phase="expansion" progress={75} size="lg" />
        <HaloProgressRing phase="contraction" progress={45} size="lg" />
        <HaloProgressRing phase="renewal" progress={90} size="lg" />
      </div>
      <div className="flex gap-4">
        <HaloProgressRing phase="expansion" progress={60} size="md" />
        <HaloProgressRing phase="contraction" progress={30} size="sm" showLabel={false} />
      </div>
    </div>
  );
}