import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string;
  hoverImage?: string;
  category: string;
  condition: string;
  conditionDescription: string;
  sizes: string[];
  color: string;
  material: string;
  measurements: { length: string; width: string };
  description: string;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Wool Blend Tuxedo Jacket",
    brand: "Saint Laurent",
    price: 1850,
    image: product1,
    category: "Clothing",
    condition: "Pristine",
    conditionDescription: "New without tags.",
    sizes: ["S", "M", "L"],
    color: "Black",
    material: "100% Virgin Wool",
    measurements: { length: "28\"", width: "19\"" },
    description: "Single-breasted tuxedo jacket in black wool blend with satin peak lapels.",
  },
  {
    id: "2",
    name: "City Leather Tote",
    brand: "Bottega Veneta",
    price: 2400,
    image: product2,
    category: "Accessories",
    condition: "Excellent",
    conditionDescription: "Minimal signs of wear. Carried once.",
    sizes: ["OS"],
    color: "Black",
    material: "Calfskin Leather",
    measurements: { length: "12\"", width: "14\"" },
    description: "Smooth calfskin leather tote with detachable shoulder strap.",
  },
  {
    id: "3",
    name: "Runner Sneakers",
    brand: "Balenciaga",
    price: 650,
    image: product3,
    category: "Footwear",
    condition: "Great",
    conditionDescription: "Light wear on soles. Uppers in excellent condition.",
    sizes: ["40", "42", "43", "44"],
    color: "Black/White",
    material: "Mesh & Leather",
    measurements: { length: "12\"", width: "4.5\"" },
    description: "Technical mesh and leather runner sneakers with chunky sole.",
  },
  {
    id: "4",
    name: "Clubmaster Sunglasses",
    brand: "Tom Ford",
    price: 320,
    image: product4,
    category: "Accessories",
    condition: "Pristine",
    conditionDescription: "Brand new with case and cloth.",
    sizes: ["OS"],
    color: "Black/Silver",
    material: "Acetate & Metal",
    measurements: { length: "5.5\"", width: "2\"" },
    description: "Clubmaster style sunglasses in black acetate with metal bridge.",
  },
];
