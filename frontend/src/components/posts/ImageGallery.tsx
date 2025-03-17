import React from 'react';
import { Trash2 } from 'lucide-react';

interface ImageGalleryProps {
  images: string[];
  onRemove: (index: number) => void;
}

const ImageGallery = ({ images, onRemove }: ImageGalleryProps) => {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <img
            src={image}
            alt={`Upload ${index + 1}`}
            className="w-full h-32 object-cover rounded-lg"
          />
          <button
            onClick={() => onRemove(index)}
            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;