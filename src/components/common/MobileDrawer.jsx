export default function MobileDrawer({ open, onClose, sidebar }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      <button type="button" className="absolute inset-0 bg-black/70" onClick={onClose} aria-label="Close menu" />
      <div className="absolute left-0 top-0 h-full w-[290px]">{sidebar}</div>
    </div>
  );
}
