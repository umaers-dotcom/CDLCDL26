import { X } from 'lucide-react'
export default function Modal({ open, title, onClose, children }) {
  if (!open) return null
  return <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
    <section className="modal" role="dialog" aria-modal="true" aria-label={title} onMouseDown={e => e.stopPropagation()}>
      <div className="modal-head"><h3>{title}</h3><button className="icon-button" onClick={onClose} aria-label="Close"><X size={18}/></button></div>
      {children}
    </section>
  </div>
}
