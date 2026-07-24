export function KarnatakaPoliceLogo() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute inset-0 rounded-full border-2 border-blue-400/40 opacity-60" />
        
        {/* Inner ring */}
        <div className="absolute inset-2 rounded-full border border-blue-300/30 opacity-40" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/10 to-transparent opacity-50" />
        
        {/* Logo image with glow */}
        <div className="relative z-10">
          <img 
            src="/ksp-logo.png" 
            alt="Karnataka State Police Logo" 
            className="w-20 h-20 object-contain filter drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  )
}
