import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, PackagePlus } from "lucide-react";
import { useAddFoodMutation } from "../store/hooks";
import { showSuccess, showError } from "../utils/toast";

const categories = [
  "Income Tax",
  "Sales Tax",
  "PRA Laws",
  "Customs Laws",
  "Corporate Laws",
  "Labour Laws",
  "Banking",
  "Other",
];

const initialForm = {
  name: "",
  description: "",
  price: "",
  category: "",
};

const AddProduct = () => {
  const navigate = useNavigate();
  const [addFood, { isLoading }] = useAddFoodMutation();
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) {
      showError("Please select a product image.");
      return;
    }

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("price", form.price);
    formData.append("category", form.category);
    formData.append("image", image);

    try {
      const result = await addFood(formData).unwrap();

      if (result?.success === false) {
        showError(result?.message || "Failed to add product.");
        return;
      }

      showSuccess(result?.message || "Product added successfully!");
      setForm(initialForm);
      setImage(null);
      setPreview("");
      navigate("/admin/products");
    } catch (err) {
      showError(err?.data?.message || err?.message || "Failed to add product.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
          <PackagePlus size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Add New Product</h1>
          <p className="text-sm text-gray-500">
            Submit via form-data to <code>/api/food/add</code>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm text-gray-600 mb-1">Product Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. PRA Provincial Sales Tax"
            className="w-full border px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
            placeholder="Enter product details..."
            className="w-full border px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Price</label>
            <input
              type="number"
              name="price"
              min="0"
              step="1"
              value={form.price}
              onChange={handleChange}
              placeholder="e.g. 3800"
              className="w-full border px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border px-4 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Image</label>
          <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-amber-500 hover:bg-amber-50/40 transition">
            <Upload size={24} className="text-amber-600" />
            <span className="text-sm text-gray-600">
              {image ? image.name : "Click to select image file"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              required={!image}
            />
          </label>

          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-4 w-40 h-40 object-cover rounded-xl border"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold py-3 rounded-xl transition"
        >
          {isLoading ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
