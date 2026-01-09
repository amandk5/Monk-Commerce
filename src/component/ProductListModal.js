import { Box, Modal } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback } from "react";

export const ProductListModal = ({
  openModal,
  closeModal,
  debouncedSearch,
  productResponse,
  handleProductSelect,
  handleVariantSelect,
  handleModalAdd,
  onLoadMore, 
  hasMore, 
}) => {
  const handleScroll = useCallback(
    (e) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      if (scrollHeight - scrollTop <= clientHeight + 30) {
        onLoadMore(debouncedSearch);
      }
    },
    [onLoadMore, hasMore]
  );
  
  return (
    <Modal open={openModal} onClose={closeModal}>
      <Box
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          height: "450px",
          transform: "translate(-50%, -50%)",
          width: 500,
          background: "#fff",
          padding: "16px",
          borderRadius: "8px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h4>Select Products</h4>
          <CloseIcon style={{ cursor: "pointer" }} onClick={closeModal} />
        </div>

        <input
          placeholder="Search Product"
          style={{
            width: "100%",
            marginBottom: "12px",
            padding: "5px 2px",
          }}
          onChange={(e) => debouncedSearch(e.target.value)}
        />

        <div
          onScroll={handleScroll}
          style={{
            overflow: "scroll",
            height: "300px",
          }}
        >
        {productResponse?.map((product) => (
          <div key={product.id} style={{ marginBottom: "10px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <input
                type="checkbox"
                checked={product.isSelected}
                onChange={() => handleProductSelect(product.id)}
              />
              <strong>{product.title}</strong>
            </div>

            {product.variants.map((variant) => (
              <div
                key={variant.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingLeft: "25px",
                  marginTop: "6px",
                }}
              >
                <div>
                  <input
                    type="checkbox"
                    checked={variant.isSelected}
                    onChange={() => handleVariantSelect(product.id, variant.id)}
                  />{" "}
                  {variant.title}
                </div>
                <div>
                  {variant.available} available &nbsp; ${variant.price}
                </div>
              </div>
            ))}
          </div>
        ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "12px",
          }}
        >
          <button
            onClick={closeModal}
            style={{
              padding: "5px 20px",
              border: "1px solid gainsboro",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleModalAdd}
            style={{
              padding: "5px 20px",
              backgroundColor: "green",
              color: "#ffffff",
              border: "none",
            }}
          >
            Add
          </button>
        </div>
      </Box>
    </Modal>
  );
};



