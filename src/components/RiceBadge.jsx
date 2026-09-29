import lspdLogo from '../../wybe-lspd.png'

export default function RiceBadge({ className = '', style }) {
  return (
    <img
      src={lspdLogo}
      alt="WYBE-LSPD"
      className={`block object-contain ${className}`}
      style={style}
    />
  )
}
