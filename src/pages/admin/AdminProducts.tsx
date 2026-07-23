import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "./AdminLayout";
import { Plus, Pencil, Trash2, Search, RefreshCw, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  status: string;
  vendor: string;
  productType: string;
  totalInventory: number;
  priceRangeV2: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  featuredImage: { url: string } | null;
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        price: string;
        inventoryQuantity: number;
      };
    }>;
  };
}

interface ProductFormData {
  title: string;
  vendor: string;
  productType: string;
  descriptionHtml: string;
  status: string;
  variants: Array<{
    price: string;
    inventoryQuantity: number;
    options: string[];
  }>;
}

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          title
          handle
          status
          vendor
          productType
          totalInventory
          priceRangeV2 {
            minVariantPrice { amount currencyCode }
            maxVariantPrice { amount currencyCode }
          }
          featuredImage { url }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price
                inventoryQuantity
              }
            }
          }
        }
      }
    }
  }
`;

const PRODUCT_QUERY = `
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      handle
      status
      vendor
      productType
      descriptionHtml
      totalInventory
      options {
        name
        values
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            price
            inventoryQuantity
            selectedOptions {
              name
              value
            }
          }
        }
      }
      images(first: 10) {
        edges {
          node {
            id
            url
            altText
          }
        }
      }
    }
  }
`;

const CREATE_PRODUCT_MUTATION = `
  mutation CreateProduct($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = `
  mutation UpdateProduct($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const DELETE_PRODUCT_MUTATION = `
  mutation DeleteProduct($input: ProductDeleteInput!) {
    productDelete(input: $input) {
      deletedProductId
      userErrors {
        field
        message
      }
    }
  }
`;

const AdminProducts = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState<ProductFormData>({
    title: "",
    vendor: "FlthyMrkt",
    productType: "Tops",
    descriptionHtml: "",
    status: "DRAFT",
    variants: [{ price: "", inventoryQuantity: 1, options: ["Default Title"] }],
  });

  const categories = ["Tops", "Bottoms", "Accessories", "Outerwear", "Bags", "Jewelry"];

  useEffect(() => {
    fetchProducts();
  }, []);

  const shopifyAdminRequest = async (operation: string, variables: Record<string, unknown> = {}) => {
    const { data, error } = await supabase.functions.invoke('shopify-admin', {
      body: { operation, variables },
    });

    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const fetchProducts = async (query?: string) => {
    setLoading(true);
    try {
      const data = await shopifyAdminRequest(PRODUCTS_QUERY, {
        first: 50,
        query: query || null,
      });
      setProducts(data.data.products.edges.map((e: { node: ShopifyProduct }) => e.node));
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error loading products",
        description: error instanceof Error ? error.message : "Failed to load products from Shopify",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product from Shopify? This cannot be undone.")) return;

    try {
      const data = await shopifyAdminRequest(DELETE_PRODUCT_MUTATION, {
        input: { id },
      });

      if (data.data.productDelete.userErrors?.length > 0) {
        throw new Error(data.data.productDelete.userErrors[0].message);
      }

      toast({ title: "Product deleted from Shopify" });
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error deleting product",
        description: error instanceof Error ? error.message : "Failed to delete product",
        variant: "destructive",
      });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const input: Record<string, unknown> = {
        title: form.title,
        vendor: form.vendor,
        productType: form.productType,
        descriptionHtml: form.descriptionHtml,
        status: form.status,
      };

      if (editing) {
        input.id = editing;
        const data = await shopifyAdminRequest(UPDATE_PRODUCT_MUTATION, { input });

        if (data.data.productUpdate.userErrors?.length > 0) {
          throw new Error(data.data.productUpdate.userErrors[0].message);
        }

        toast({ title: "Product updated in Shopify" });
      } else {
        input.variants = form.variants.map(v => ({
          price: v.price,
          inventoryQuantities: {
            availableQuantity: v.inventoryQuantity,
            locationId: "gid://shopify/Location/1", // Default location
          },
        }));

        const data = await shopifyAdminRequest(CREATE_PRODUCT_MUTATION, { input });

        if (data.data.productCreate.userErrors?.length > 0) {
          throw new Error(data.data.productCreate.userErrors[0].message);
        }

        toast({ title: "Product created in Shopify" });
      }

      resetForm();
      fetchProducts();
    } catch (error) {
      toast({
        title: "Error saving product",
        description: error instanceof Error ? error.message : "Failed to save product",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const startEdit = async (id: string) => {
    try {
      const data = await shopifyAdminRequest(PRODUCT_QUERY, { id });
      const product = data.data.product;

      if (product) {
        setForm({
          title: product.title,
          vendor: product.vendor || "FlthyMrkt",
          productType: product.productType || "Tops",
          descriptionHtml: product.descriptionHtml || "",
          status: product.status,
          variants: product.variants.edges.map((e: { node: { price: string; inventoryQuantity: number; selectedOptions: Array<{ value: string }> } }) => ({
            price: e.node.price,
            inventoryQuantity: e.node.inventoryQuantity,
            options: e.node.selectedOptions.map((o: { value: string }) => o.value),
          })),
        });
        setEditing(id);
        setShowForm(true);
      }
    } catch (error) {
      toast({
        title: "Error loading product",
        description: error instanceof Error ? error.message : "Failed to load product details",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      vendor: "FlthyMrkt",
      productType: "Tops",
      descriptionHtml: "",
      status: "DRAFT",
      variants: [{ price: "", inventoryQuantity: 1, options: ["Default Title"] }],
    });
    setEditing(null);
    setShowForm(false);
  };

  const handleSearch = () => {
    fetchProducts(search ? `title:*${search}*` : undefined);
  };

  const formatPrice = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(parseFloat(amount));
  };

  const inputCls = "w-full border border-border bg-transparent px-4 py-3 text-sm outline-none focus:border-foreground transition-colors duration-150";
  const labelCls = "text-xs tracking-widest uppercase text-muted-foreground block mb-2";

  if (showForm) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-base tracking-[0.3em] uppercase font-extralight">
            {editing ? "Edit Product" : "Add Product"}
          </h1>
          <button onClick={resetForm} className="text-xs tracking-[0.15em] uppercase text-muted-foreground hover:opacity-50 transition-opacity">
            ← Back
          </button>
        </div>

        <form onSubmit={handleSave} className="max-w-2xl space-y-8">
          <div className="border border-border p-6 space-y-4">
            <h3 className="text-sm tracking-[0.2em] uppercase font-light mb-4">Product Details</h3>

            <div>
              <label className={labelCls}>Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className={inputCls}
                placeholder="Product name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Vendor</label>
                <input
                  value={form.vendor}
                  onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Product Type</label>
                <select
                  value={form.productType}
                  onChange={(e) => setForm({ ...form, productType: e.target.value })}
                  className={inputCls}
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className={inputCls}
              >
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>

            <div>
              <label className={labelCls}>Description</label>
              <textarea
                value={form.descriptionHtml}
                onChange={(e) => setForm({ ...form, descriptionHtml: e.target.value })}
                className={`${inputCls} min-h-[120px] resize-none`}
                placeholder="Product description (supports HTML)"
              />
            </div>
          </div>

          {!editing && (
            <div className="border border-border p-6 space-y-4">
              <h3 className="text-sm tracking-[0.2em] uppercase font-light mb-4">Pricing</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.variants[0]?.price || ""}
                    onChange={(e) => {
                      const newVariants = [...form.variants];
                      newVariants[0] = { ...newVariants[0], price: e.target.value };
                      setForm({ ...form, variants: newVariants });
                    }}
                    required
                    className={inputCls}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={labelCls}>Inventory Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={form.variants[0]?.inventoryQuantity || 0}
                    onChange={(e) => {
                      const newVariants = [...form.variants];
                      newVariants[0] = { ...newVariants[0], inventoryQuantity: parseInt(e.target.value) || 0 };
                      setForm({ ...form, variants: newVariants });
                    }}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-primary-foreground px-10 py-4 text-sm tracking-[0.15em] uppercase font-light hover:opacity-80 transition-opacity duration-150 min-h-[52px] disabled:opacity-50"
            >
              {saving ? "Saving..." : editing ? "Update in Shopify" : "Create in Shopify"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="border border-border px-10 py-4 text-sm tracking-[0.15em] uppercase font-light hover:border-foreground transition-all duration-150 min-h-[52px]"
            >
              Cancel
            </button>
          </div>
        </form>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-base tracking-[0.3em] uppercase font-extralight">Products</h1>
        <div className="flex gap-3">
          <button
            onClick={() => fetchProducts()}
            className="border border-border px-4 py-2 text-xs tracking-[0.15em] uppercase font-light flex items-center gap-2 hover:border-foreground transition-all min-h-[40px]"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-primary text-primary-foreground px-6 py-2 text-xs tracking-[0.15em] uppercase font-light flex items-center gap-2 hover:opacity-80 min-h-[40px]"
          >
            <Plus className="w-3 h-3" /> Add Product
          </button>
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full border border-border bg-transparent pl-11 pr-4 py-3 text-sm outline-none focus:border-foreground"
          />
        </div>
        <button
          onClick={handleSearch}
          className="border border-border px-6 py-3 text-xs tracking-[0.15em] uppercase font-light hover:border-foreground transition-all"
        >
          Search
        </button>
      </div>

      <div className="bg-muted/30 border border-border px-4 py-3 mb-6">
        <p className="text-xs text-muted-foreground">
          Products sync directly with your Shopify store. For full product management including images, variants, and inventory, 
          <a href="https://archive-curated-space-3cl85.myshopify.com/admin/products" target="_blank" rel="noopener noreferrer" className="underline ml-1">
            use the Shopify Admin
          </a>.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground text-sm tracking-widest uppercase">Loading from Shopify...</p>
        </div>
      ) : (
        <div className="border border-border">
          <div className="hidden md:grid grid-cols-[80px_1fr_120px_100px_80px_100px] gap-4 px-6 py-3 border-b border-border bg-muted">
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground">Image</span>
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground">Product</span>
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground">Type</span>
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground">Price</span>
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground">Stock</span>
            <span className="text-[10px] tracking-widest uppercase text-muted-foreground">Actions</span>
          </div>

          {products.map((p) => (
            <div key={p.id} className="grid md:grid-cols-[80px_1fr_120px_100px_80px_100px] gap-4 px-6 py-4 border-b border-border last:border-b-0 items-center">
              <div className="w-16 h-16 bg-secondary overflow-hidden hidden md:block">
                {p.featuredImage ? (
                  <img src={p.featuredImage.url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">No image</div>
                )}
              </div>

              <div className="md:col-span-1">
                <p className="text-sm font-light truncate">{p.title}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{p.vendor}</p>
                <span className={`text-[9px] uppercase tracking-wider px-2 py-0.5 inline-block mt-1 ${
                  p.status === 'ACTIVE' ? 'bg-green-500/10 text-green-600' :
                  p.status === 'DRAFT' ? 'bg-yellow-500/10 text-yellow-600' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {p.status}
                </span>
              </div>

              <span className="text-xs text-muted-foreground hidden md:block">{p.productType || '—'}</span>

              <span className="text-sm font-light hidden md:block">
                {formatPrice(p.priceRangeV2.minVariantPrice.amount)}
              </span>

              <span className="text-sm font-light hidden md:block">{p.totalInventory}</span>

              <div className="flex gap-3">
                <button onClick={() => startEdit(p.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {products.length === 0 && !loading && (
            <p className="px-6 py-12 text-center text-muted-foreground text-xs tracking-widest uppercase">
              No products found
            </p>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProducts;
