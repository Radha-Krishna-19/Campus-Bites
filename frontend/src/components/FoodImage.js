import { useState } from 'react';
import { Utensils } from 'lucide-react';

export default function FoodImage({ src, alt, className = '', imgClassName = '', iconClassName = 'w-16 h-16' }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-orange-100 via-amber-50 to-orange-200 ${className}`}>
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`w-full h-full object-cover ${imgClassName}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center" role="img" aria-label={alt}>
          <Utensils className={`text-orange-300 ${iconClassName}`} />
        </div>
      )}
    </div>
  );
}
