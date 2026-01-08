import { AddProduct } from "./AddProduct";
import "./styles.css";

export default function App() {
  return (
    <div className="App">
      <div
        style={{
          display: "flex",
          gap: "20px",
          borderBottom: "2px solid black",
          paddingBottom: "10px",
          borderColor: "gainsboro",
          color: "grey",
          alignItems: "center",
        }}
      >
        <img
          src="https://i.tracxn.com/logo/company/monkcommerce.com_Logo_28981f33-a48e-41cf-8323-9600b63b2835.jpg"
          width={"35px"}
          height={"35px"}
        />
        <h3 style={{ fontSize: "20px" }}>Monk Upsell & Cross-sell</h3>
      </div>

      <div style={{ width: "80%", margin: "auto", textAlign: "left" }}>
        <AddProduct />
      </div>
    </div>
  );
}
