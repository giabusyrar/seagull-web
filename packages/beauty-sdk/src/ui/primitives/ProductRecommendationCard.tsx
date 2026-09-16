import React from 'react';

export interface ProductRecommendationCardProps {
  sku: string;
  name: string;
  brand?: string;
  category?: string;
  matchReason?: string;
  scoreConfidence?: number;
  imageURL?: string;
  activeIngredients?: string[];
  onAddToCart?: (sku: string) => void;
  className?: string;
}

export const ProductRecommendationCard: React.FC<ProductRecommendationCardProps> = ({
  sku,
  name,
  brand,
  category,
  matchReason,
  scoreConfidence,
  imageURL,
  activeIngredients,
  onAddToCart,
  className = '',
}) => {
  return (
    <div
      className={`product-card p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${className}`}
      data-sku={sku}
    >
      <div className="space-y-3">
        {imageURL && (
          <div className="w-full h-40 rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center">
            <img src={imageURL} alt={name} className="h-full object-contain p-2" />
          </div>
        )}

        <div>
          <div className="flex items-center justify-between text-xs text-gray-500 font-medium mb-1">
            {brand && <span className="uppercase tracking-wider text-emerald-700 font-semibold">{brand}</span>}
            {category && <span>{category}</span>}
          </div>
          <h4 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{name}</h4>
        </div>

        {matchReason && (
          <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
            <span className="font-semibold">Kenapa cocok: </span>
            {matchReason}
          </div>
        )}

        {activeIngredients && activeIngredients.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {activeIngredients.map((active) => (
              <span
                key={active}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700"
              >
                {active}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
        {scoreConfidence !== undefined && (
          <span className="text-xs font-semibold text-emerald-600">
            {Math.round(scoreConfidence * 100)}% Match
          </span>
        )}
        {onAddToCart && (
          <button
            type="button"
            onClick={() => onAddToCart(sku)}
            className="ml-auto text-xs font-medium px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
          >
            Pilih Produk
          </button>
        )}
      </div>
    </div>
  );
};
