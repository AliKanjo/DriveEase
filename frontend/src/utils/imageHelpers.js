export const getVehicleImage = (vehicle) => {
  if (vehicle?.images && vehicle.images.trim() !== '') {
    const firstImg = vehicle.images.split(',')[0];
    if (firstImg.startsWith('/uploads')) {
      return `http://localhost:8080${firstImg}`;
    }
    return firstImg;
  }
  
  if (!vehicle || !vehicle.brand) return '/default-car.png';

  const brand = vehicle.brand.toLowerCase();
  const type = (vehicle.transmission || '').toLowerCase();
  
  if (brand.includes('mercedes') || brand.includes('benz')) {
    return 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80';
  }
  if (brand.includes('bmw')) {
    return 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80';
  }
  if (brand.includes('audi')) {
    return 'https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&q=80';
  }
  if (brand.includes('tesla')) {
    return 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80';
  }
  if (brand.includes('porsche')) {
    return 'https://images.unsplash.com/photo-1503376760388-12c85e2b02e7?w=800&q=80';
  }
  if (brand.includes('toyota') || brand.includes('honda')) {
    return 'https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800&q=80';
  }
  
  if (type.includes('suv')) {
    return 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&q=80';
  }

  return '/default-car.png';
};

export const getAllVehicleImages = (vehicle) => {
  if (vehicle?.images && vehicle.images.trim() !== '') {
    return vehicle.images.split(',').filter(Boolean).map(img => {
      if (img.startsWith('/uploads')) {
        return `http://localhost:8080${img}`;
      }
      return img;
    });
  }
  return [getVehicleImage(vehicle)];
};
