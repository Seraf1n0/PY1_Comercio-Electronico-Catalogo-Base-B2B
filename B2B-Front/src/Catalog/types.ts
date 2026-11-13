export interface Product {
  objectID: string;
  title: string;
  description: string;
  brand: string;
  model: string;
  engine: string;
  color: string;
  cc: number;
  fuel_type: string;
  transmission: string;
  power: string;
  torque: string;
  fuel_capacity: string;
  drivetrain: string;
  traction: string;
  max_speed: string;
  doors: number;
  year: number;
  price: number;
  prices?: { // Precios del 3er proyecto de negocio a consumidor y negocio a negoco(mayorista)
    B2C: number;
    B2B: number;
  };
  currency: string;
  categories: string[];
  in_stock: boolean;
  stock: StockByHeadquarter;
  rating: number;
  images_urls: string[];
  facets: ProductFacets;
}

export interface StockByHeadquarter {
  headquarterLimon: number;
  headquarterSanJose: number;
  headquarterGuanacaste: number;
}

export interface ProductFacets {
  brand: string;
  model: string;
  engine: string;
  color: string;
  fuel_type: string;
  transmission: string;
  power: string;
  torque: string;
  fuel_capacity: string;
  drivetrain: string;
  traction: string;
  max_speed: string;
  doors: number;
  year: number;
}
