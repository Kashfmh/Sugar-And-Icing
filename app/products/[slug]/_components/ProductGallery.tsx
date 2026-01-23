import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
    return (
        <div className="mb-6">
            <Carousel className="w-full">
                <CarouselContent>
                    {images.length > 0 ? (
                        images.map((img, index) => (
                            <CarouselItem key={index}>
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
                                    <Image
                                        src={img}
                                        alt={`${productName} - Image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </CarouselItem>
                        ))
                    ) : (
                        <CarouselItem>
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg flex items-center justify-center">
                                <span className="text-gray-400">No image</span>
                            </div>
                        </CarouselItem>
                    )}
                </CarouselContent>
                {images.length > 1 && (
                    <>
                        <CarouselPrevious className="left-3" />
                        <CarouselNext className="right-3" />
                    </>
                )}
            </Carousel>
        </div>
    );
}
