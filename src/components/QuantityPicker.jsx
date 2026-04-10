export default function QuantityPicker({ value, onDec, onInc }) {
  return (
    <div className="qty" aria-label="Quantity picker">
      <button onClick={onDec} aria-label="Decrease quantity">−</button>
      <span>{value}</span>
      <button onClick={onInc} aria-label="Increase quantity">+</button>
    </div>
  );
}
