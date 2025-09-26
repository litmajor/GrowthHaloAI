import ValuesCompass from '../ValuesCompass';

export default function ValuesCompassExample() {
  //todo: remove mock functionality
  const handleValueUpdate = (valueId: string, field: 'importance' | 'alignment', value: number) => {
    console.log(`Updated ${field} for value ${valueId} to ${value}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ValuesCompass onValueUpdate={handleValueUpdate} />
    </div>
  );
}