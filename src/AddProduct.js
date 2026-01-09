import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { debounce } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { fetchProducts } from "./api/products";
import { ProductListModal } from "./component/ProductListModal";

export const AddProduct = () => {
  const [openModal, setOpenModal] = useState(false);
  const [activeProductIndex, setActiveProductIndex] = useState(null);
  const [page, setPage] = useState(1);

  const [productResponse, setProductResponse] = useState([]);

  // intial sample product
  const [products, setProducts] = useState([
    {
      id: "p1",
      title: "Iphone 15",
      showVariants: false,
      showDiscount: false,
      discountValue: "",
      discountType: "PERCENT",
      variants: [
        { id: "v1", title: "Pro" },
        { id: "v2", title: "Pro Max" },
      ],
    },
    {
      id: "p2",
      title: "Iphone 14",
      showVariants: false,
      showDiscount: false,
      discountValue: "",
      discountType: "PERCENT",
      variants: [{ id: "v3", title: "Pro" }],
    },
  ]);

  const openEditModal = (index) => {
    const editingProduct = products[index];

    setActiveProductIndex(index);

    setProductResponse((prev) =>
      prev.map((modalProduct) => {
        // Match product by title (or use id mapping if available)
        const isSameProduct = modalProduct.title === editingProduct.title;

        return {
          ...modalProduct,
          isSelected: isSameProduct,
          variants: modalProduct.variants.map((variant) => ({
            ...variant,
            isSelected: isSameProduct
              ? editingProduct.variants.some((v) => v.title === variant.title)
              : false,
          })),
        };
      })
    );

    setOpenModal(true);
  };

  const closeModal = () => {
    setOpenModal(false);
    setActiveProductIndex(null);
    debouncedSearch("");
  };

  const createNewProduct = () => ({
    id: `p-${Date.now()}`,
    showVariants: false,
    showDiscount: false,
    discountValue: "",
    discountType: "PERCENT",
    variants: [],
  });

  const addProduct = () => {
    setProducts((prev) => [...prev, createNewProduct()]);
  };

  const removeProduct = (index) => {
    const updated = [...products];
    updated.splice(index, 1);
    setProducts(updated);
  };

  const removeVariant = (productIndex, variantIndex) => {
    const updated = [...products];
    updated[productIndex].variants.splice(variantIndex, 1);
    setProducts(updated);
  };

  const toggleDiscount = (index, enable) => {
    const updated = [...products];

    updated[index].showDiscount = enable;

    if (!enable) {
      updated[index].discountValue = "";
      updated[index].discountType = "PERCENT";
    }

    setProducts(updated);
  };

  const handleDiscountChange = (index, key, value) => {
    const updated = [...products];
    updated[index][key] = value;
    setProducts(updated);
  };

  const toggleVariants = (index) => {
    const updated = [...products];
    updated[index].showVariants = !updated[index].showVariants;
    setProducts(updated);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    // 🔹 Drag parent products
    if (type === "PRODUCT") {
      const items = [...products];
      const [moved] = items.splice(source.index, 1);
      items.splice(destination.index, 0, moved);
      setProducts(items);
      return;
    }

    // 🔹 Drag variants inside a product
    if (type === "VARIANT") {
      const productIndex = products.findIndex(
        (p) => `variants-${p.id}` === source.droppableId
      );

      const updated = [...products];
      const variants = [...updated[productIndex].variants];

      const [moved] = variants.splice(source.index, 1);
      variants.splice(destination.index, 0, moved);

      updated[productIndex].variants = variants;
      setProducts(updated);
    }
  };

  const handleGetProductsData = async (query = "") => {
    try {
      const data = await fetchProducts(query);
      setProductResponse(data);
    } catch {}
  };

  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreProducts = async (searchValue) => {
    try {
      // if (loading || !hasMore) return;
      if (loading) return;
      setLoading(true);

      const newData = await fetchProducts(searchValue, page + 1);

      if (!newData.length) {
        setHasMore(false);
      } else {
        setProductResponse((prev) => [...prev, ...newData]);
        setPage((p) => p + 1);
      }

      setLoading(false);
    } catch {}
  };
  
  useEffect(() => {
    handleGetProductsData();
  }, []);

  const handleProductSelect = (productId) => {
    setProductResponse((prev) =>
      prev.map((product) => {
        if (product.id !== productId) return product;

        const isSelecting = !product.isSelected;

        return {
          ...product,
          isSelected: isSelecting,
          variants: product.variants.map((v, index) => ({
            ...v,
            isSelected: isSelecting ? index === 0 : false, // first variant only
          })),
        };
      })
    );
  };

  const handleVariantSelect = (productId, variantId) => {
    setProductResponse((prev) =>
      prev.map((product) => {
        if (product.id !== productId) return product;

        const updatedVariants = product.variants.map((variant) =>
          variant.id === variantId
            ? { ...variant, isSelected: !variant.isSelected }
            : variant
        );

        const isAnyVariantSelected = updatedVariants.some((v) => v.isSelected);

        return {
          ...product,
          isSelected: isAnyVariantSelected, // sync product checkbox
          variants: updatedVariants,
        };
      })
    );
  };

  const mapModalProductToMainProduct = (modalProduct) => ({
    id: `p-${modalProduct.id}`,
    showVariants: true,
    showDiscount: false,
    discountValue: "",
    discountType: "PERCENT",
    title: modalProduct.title,
    variants: modalProduct.variants
      .filter((v) => v.isSelected)
      .map((v) => ({
        id: `v-${v.id}`,
        title: v.title,
      })),
  });

  const handleModalAdd = () => {
    const selectedProduct = productResponse.find(
      (p) => p.isSelected && p.variants.some((v) => v.isSelected)
    );

    if (!selectedProduct || activeProductIndex === null) {
      closeModal();
      return;
    }

    const mappedProduct = mapModalProductToMainProduct(selectedProduct);

    setProducts((prev) => {
      const updated = [...prev];
      updated[activeProductIndex] = mappedProduct; // ✅ REPLACE
      return updated;
    });

    closeModal();
  };

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        handleGetProductsData(value);
      }, 500),
    []
  );

  return (
    <div style={{ width: "360px" }}>
      <h4>Add Product</h4>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="products" type="PRODUCT">
          {(provided) => (
            <table ref={provided.innerRef} {...provided.droppableProps}>
              <thead>
                <tr>
                  <td width="30" />
                  <td width="140">Product</td>
                  <td width="120">Discount</td>
                  <td width="30" />
                </tr>
              </thead>

              <tbody>
                {products.map((product, index) => (
                  <Draggable
                    key={product.id}
                    draggableId={product.id}
                    index={index}
                  >
                    {(provided) => (
                      <>
                        {/* Parent Row */}
                        <tr
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                        >
                          <td {...provided.dragHandleProps}>
                            <DragIndicatorIcon />
                          </td>
                          <td>
                            {/* <input style={{ width: "100%" }} /> */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                              }}
                            >
                              <input
                                style={{ width: "100%" }}
                                placeholder="Product"
                                value={product.title || ""}
                              />

                              <EditOutlinedIcon
                                fontSize="small"
                                style={{ cursor: "pointer", color: "#1976d2" }}
                                onClick={() => openEditModal(index)}
                              />
                            </div>
                          </td>
                          <td>
                            <td>
                              {!product.showDiscount ? (
                                <button
                                  onClick={() => toggleDiscount(index, true)}
                                  style={{ padding: "5px" }}
                                >
                                  Add Discount
                                </button>
                              ) : (
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <input
                                    type="number"
                                    placeholder="Discount"
                                    value={product.discountValue}
                                    onChange={(e) =>
                                      handleDiscountChange(
                                        index,
                                        "discountValue",
                                        e.target.value
                                      )
                                    }
                                    style={{ width: "60px" }}
                                  />

                                  <select
                                    value={product.discountType}
                                    onChange={(e) =>
                                      handleDiscountChange(
                                        index,
                                        "discountType",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="PERCENT">% off</option>
                                    <option value="FLAT">Flat off</option>
                                  </select>

                                  {/* Remove / toggle back */}
                                  <CloseIcon
                                    fontSize="small"
                                    style={{
                                      cursor: "pointer",
                                      color: "#d32f2f",
                                    }}
                                    onClick={() => toggleDiscount(index, false)}
                                  />
                                </div>
                              )}
                            </td>
                          </td>
                          {/* Remove product */}
                          <td>
                            <DeleteOutlineIcon
                              style={{ cursor: "pointer", color: "#d32f2f" }}
                              onClick={() => removeProduct(index)}
                            />
                          </td>
                        </tr>

                        {/* Show Variants */}
                        <tr>
                          <td />
                          <td
                            colSpan={2}
                            style={{
                              textAlign: "right",
                              paddingRight: "20px",
                            }}
                          >
                            <span
                              style={{
                                cursor: "pointer",
                                fontSize: "12px",
                                color: "#1976d2",
                                textDecoration: "underline",
                                textUnderlineOffset: "3px",
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                              }}
                              onClick={() => toggleVariants(index)}
                            >
                              {product.showVariants
                                ? "Hide Variants"
                                : "Show Variants"}
                              <KeyboardArrowDownIcon />
                            </span>
                          </td>
                        </tr>

                        {/* Variants */}
                        {product.showVariants && (
                          <Droppable
                            droppableId={`variants-${product.id}`}
                            type="VARIANT"
                          >
                            {(provided) => (
                              <>
                                {product.variants.map((variant, vIndex) => (
                                  <Draggable
                                    key={variant.id}
                                    draggableId={variant.id}
                                    index={vIndex}
                                  >
                                    {(provided) => (
                                      <tr
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                      >
                                        <td
                                          {...provided.dragHandleProps}
                                          style={{ paddingLeft: "15px" }}
                                        >
                                          <DragIndicatorIcon fontSize="small" />
                                        </td>
                                        <td>
                                          <input
                                            placeholder="Variant"
                                            style={{ width: "100%" }}
                                            value={variant.title || ""}
                                          />
                                        </td>
                                        <td />
                                        {/* 🗑 Remove variant */}
                                        <td>
                                          <DeleteOutlineIcon
                                            fontSize="small"
                                            style={{
                                              cursor: "pointer",
                                              color: "#d32f2f",
                                            }}
                                            onClick={() =>
                                              removeVariant(index, vIndex)
                                            }
                                          />
                                        </td>
                                      </tr>
                                    )}
                                  </Draggable>
                                ))}
                                <tr ref={provided.innerRef} />
                              </>
                            )}
                          </Droppable>
                        )}
                      </>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            </table>
          )}
        </Droppable>
      </DragDropContext>

      <div
        style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}
      >
        <button onClick={addProduct}>Add Product</button>
      </div>

      {/* modal  */}
      <ProductListModal
        openModal={openModal}
        closeModal={closeModal}
        debouncedSearch={debouncedSearch}
        productResponse={productResponse}
        handleProductSelect={handleProductSelect}
        handleVariantSelect={handleVariantSelect}
        handleModalAdd={handleModalAdd}
        hasMore={hasMore}
        onLoadMore={loadMoreProducts}
      />
    </div>
  );
};

